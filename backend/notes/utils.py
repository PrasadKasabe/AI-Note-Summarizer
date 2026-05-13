import os
import re
import requests
import google.generativeai as genai
from PyPDF2 import PdfReader
from youtube_transcript_api import YouTubeTranscriptApi

# Configure Gemini API globally
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

def extract_text_from_pdf(file_path):
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def transcribe_audio(file_path):
    try:
        audio_file = genai.upload_file(path=file_path)
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content([
            "Please transcribe the following audio. Output only the transcription without any extra formatting.", 
            audio_file
        ])
        return response.text
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return ""

def generate_summary_and_keywords(text):
    prompt = f"""
    Please analyze the following text and provide a concise summary, followed by a list of key topics/keywords.
    Format your response exactly as follows:
    Summary: [Your summary here]
    Keywords: [keyword1, keyword2, keyword3]

    Text:
    {text[:30000]}
    """
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        result = response.text
        
        summary = ""
        keywords = []
        for line in result.split("\n"):
            if line.startswith("Summary:"):
                summary = line.replace("Summary:", "").strip()
            elif line.startswith("Keywords:"):
                kw_str = line.replace("Keywords:", "").strip()
                keywords = [k.strip() for k in kw_str.split(",")]
        
        if not summary and not keywords:
            summary = result # fallback if formatting failed
                
        return summary, keywords
    except Exception as e:
        print(f"Error generating summary: {e}")
        return "", []

def chat_with_note(transcript, user_message):
    prompt = f"""
    You are an AI assistant helping a user with their notes. 
    Use the following transcript to answer the user's question. 
    If the answer is not in the transcript, say "I cannot answer this based on the provided notes."
    
    Transcript:
    {transcript[:30000]}
    
    User question: {user_message}
    """
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def get_youtube_video_id(url):
    """Extract the video ID from a YouTube URL."""
    video_id = None
    if "youtube.com/watch" in url:
        # e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ
        match = re.search(r"v=([a-zA-Z0-9_-]+)", url)
        if match:
            video_id = match.group(1)
    elif "youtu.be/" in url:
        # e.g. https://youtu.be/dQw4w9WgXcQ
        match = re.search(r"youtu\.be/([a-zA-Z0-9_-]+)", url)
        if match:
            video_id = match.group(1)
    elif "youtube.com/embed/" in url:
        # e.g. https://www.youtube.com/embed/dQw4w9WgXcQ
        match = re.search(r"embed/([a-zA-Z0-9_-]+)", url)
        if match:
            video_id = match.group(1)
    elif "youtube.com/shorts/" in url:
        # e.g. https://www.youtube.com/shorts/dQw4w9WgXcQ
        match = re.search(r"shorts/([a-zA-Z0-9_-]+)", url)
        if match:
            video_id = match.group(1)
    return video_id

def extract_transcript_from_youtube(video_url):
    """Fetch transcript from YouTube video URL and its title."""
    video_id = get_youtube_video_id(video_url)
    if not video_id:
        return "", "Invalid YouTube URL", "Could not extract video ID from the provided URL. Make sure it's a valid YouTube link."
        
    transcript = ""
    title = "YouTube Video Note"
    error_msg = ""
    
    # Try to fetch title
    try:
        response = requests.get(video_url)
        if response.status_code == 200:
            match = re.search(r"<title>(.*?)</title>", response.text)
            if match:
                title = match.group(1).replace(" - YouTube", "").strip()
    except Exception as e:
        print(f"Error fetching YouTube title: {e}")

    # Fetch transcript
    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)
        
        # Try to find an English transcript first
        try:
            transcript_obj = transcript_list.find_transcript(['en', 'en-US', 'en-GB'])
        except:
            # If no English transcript is found, just grab the first available transcript (any language, auto-generated or manual)
            transcript_obj = list(transcript_list)[0]
            
        transcript_data = transcript_obj.fetch()
        transcript = " ".join([t.text for t in transcript_data])
    except Exception as e:
        print(f"Error fetching YouTube transcript: {e}")
        # Return the exact error so we can debug it
        error_msg = f"Transcript error: {str(e)}"
        
    return transcript, title, error_msg
