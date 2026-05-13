# AI Smart Notes Summarizer Implementation Plan

This document outlines the architecture, technology stack, and implementation steps for building the AI Smart Notes Summarizer full-stack web application.

## Goal Description
Build a full-stack web application that allows users to upload audio, video, or PDF files. The system will extract text/transcripts from these files, generate AI-powered summaries, extract key topics/keywords, and provide an interactive Q&A chatbot interface for users to query their notes.

## User Review Required
> [!IMPORTANT]
> Please review the open questions below before we begin execution, as they significantly impact the architecture and dependencies.

## Open Questions
1. **AI Services Provider:** For transcriptions (audio/video) and LLM tasks (summarization, keyword extraction, Q&A), which API provider do you prefer? 
   - *Recommendation:* OpenAI (Whisper for transcription, GPT-4o-mini for summarization/Q&A) is standard and easy to integrate, but we can also use Gemini, Anthropic, or Deepgram.
2. **Database setup:** You requested PostgreSQL. Do you already have PostgreSQL installed and running locally on your Windows machine, or would you prefer to use SQLite for initial local development to speed things up?
3. **Asynchronous Processing:** Processing large video/audio files and waiting for AI APIs can take a long time and might cause HTTP timeouts. Should we implement an asynchronous task queue (e.g., Celery + Redis) for file processing, or keep it synchronous for a simpler initial MVP?

## Proposed Architecture & Folder Structure

```text
AI_note_summarizer_project/
├── backend/                  # Django + DRF Backend
│   ├── core/                 # Main Django project folder (settings, urls)
│   ├── notes/                # Django app for notes, files, summaries, Q&A
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment variables (DB credentials, API keys)
│   └── manage.py
└── frontend/                 # React + Vite + Tailwind Frontend
    ├── src/
    │   ├── components/       # Reusable UI components (Upload, Chatbot, NoteCard)
    │   ├── pages/            # Page layouts (Dashboard, NoteDetail)
    │   ├── services/         # API integration (Axios)
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json          # Node dependencies
    ├── tailwind.config.js    # Tailwind configuration
    └── vite.config.js        # Vite configuration
```

## Implementation Phases

### Phase 1: Project Initialization & Backend Setup
- Initialize Django project and `notes` app.
- Configure PostgreSQL database connections in `settings.py`.
- Setup Django REST Framework (DRF) and CORS.
- Define Database Models:
  - `Note`: title, original_file, transcript, summary, keywords, created_at.
  - `ChatMessage`: note (Foreign Key), role (user/ai), content, timestamp.
- Generate `requirements.txt`.

### Phase 2: AI & File Processing Logic (Backend)
- Implement file parsing:
  - **PDF**: PyPDF2 or pdfplumber to extract text.
  - **Audio/Video**: OpenAI Whisper API for transcription.
- Implement AI summarization and keyword extraction using LLM prompts.
- Implement Chatbot endpoint to answer questions based on the specific Note's transcript context.
- Create RESTful API Views and Serializers for Notes, File Uploads, and Chat.

### Phase 3: Frontend Setup
- Initialize React project using Vite (`npm create vite@latest`).
- Install and configure Tailwind CSS and Lucide React (for icons).
- Setup routing (`react-router-dom`) and API client (`axios`).
- Generate `package.json`.

### Phase 4: Frontend Development
- **Dashboard Page**: View list of all notes/summaries.
- **Upload Component**: Drag-and-drop or file selection for PDF, Audio, Video.
- **Note Detail Page**: Display the summary, transcript, keywords, and original file.
- **Chatbot Interface**: A dynamic chat UI integrated into the Note Detail page for Q&A.
- Apply modern, premium, and responsive styling using Tailwind CSS.

### Phase 5: Integration & Polish
- Connect Frontend to Backend APIs.
- Handle loading states (loading spinners during file upload and AI processing).
- Error handling and user notifications.

## Verification Plan
### Automated & Manual Verification
- **Backend**: Test API endpoints using Django shell or internal HTTP requests to ensure file uploads save correctly and AI APIs respond accurately.
- **Frontend**: Run the React dev server and verify responsive UI, state management, and aesthetic quality.
- **E2E**: Upload a sample PDF and a sample Audio file from the UI, wait for processing, verify the generated summary/keywords, and ask a question in the chatbot.
