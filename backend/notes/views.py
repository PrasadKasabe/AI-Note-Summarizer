from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Note, ChatMessage
from .serializers import NoteSerializer, ChatMessageSerializer
from .utils import extract_text_from_pdf, transcribe_audio, generate_summary_and_keywords, chat_with_note, extract_transcript_from_youtube
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from io import BytesIO

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        video_url = request.data.get('video_url')
        
        if not file_obj and not video_url:
            return Response({'error': 'No file or URL provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        transcript = ""
        title = ""
        file_type = ""
        note = None
        
        if video_url:
            # Process YouTube URL
            transcript, fetched_title, error_msg = extract_transcript_from_youtube(video_url)
            if not transcript:
                return Response({'error': error_msg or 'Failed to extract transcript from YouTube URL. It might not have captions.'}, status=status.HTTP_400_BAD_REQUEST)
                
            title = request.data.get('title') or fetched_title or "YouTube Video Note"
            file_type = 'youtube'
            note = Note.objects.create(user=self.request.user, title=title, video_url=video_url, file_type=file_type)
            
        else:
            # Process File Upload
            title = request.data.get('title', file_obj.name)
            file_type = file_obj.name.split('.')[-1].lower()
            note = Note.objects.create(user=self.request.user, title=title, original_file=file_obj, file_type=file_type)
            file_path = note.original_file.path
            
            if file_type in ['pdf']:
                transcript = extract_text_from_pdf(file_path)
            elif file_type in ['mp3', 'wav', 'm4a', 'mp4', 'webm']:
                transcript = transcribe_audio(file_path)
            else:
                return Response({'error': 'Unsupported file format'}, status=status.HTTP_400_BAD_REQUEST)

        if not transcript:
            return Response({'error': 'Failed to extract text or transcribe'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Generate summary and keywords
        summary, keywords = generate_summary_and_keywords(transcript)

        # Update note
        note.transcript = transcript
        note.summary = summary
        note.keywords = keywords
        note.save()

        serializer = self.get_serializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def chat(self, request, pk=None):
        note = self.get_object()
        user_message = request.data.get('message')
        
        if not user_message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Save user message
        ChatMessage.objects.create(note=note, role='user', content=user_message)

        # Generate AI response
        ai_response = chat_with_note(note.transcript, user_message)

        # Save AI message
        ai_msg = ChatMessage.objects.create(note=note, role='ai', content=ai_response)

        return Response(ChatMessageSerializer(ai_msg).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        note = self.get_object()
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        elements.append(Paragraph(f"Note: {note.title}", styles['Title']))
        elements.append(Spacer(1, 12))

        # Summary
        elements.append(Paragraph("Summary", styles['Heading2']))
        elements.append(Paragraph(note.summary or "No summary available", styles['Normal']))
        elements.append(Spacer(1, 12))

        # Keywords
        if note.keywords:
            elements.append(Paragraph("Keywords", styles['Heading2']))
            elements.append(Paragraph(", ".join(note.keywords), styles['Normal']))
            elements.append(Spacer(1, 12))

        # Chat History
        chat_messages = note.chat_messages.all()
        if chat_messages.exists():
            elements.append(PageBreak())
            elements.append(Paragraph("Chat History", styles['Heading2']))
            elements.append(Spacer(1, 12))
            for msg in chat_messages:
                role = "User" if msg.role == 'user' else "AI"
                elements.append(Paragraph(f"<b>{role}:</b> {msg.content}", styles['Normal']))
                elements.append(Spacer(1, 6))

        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{note.title or "note"}.pdf"'
        return response
