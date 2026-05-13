# 📝 AI Smart Notes Summarizer

A powerful full-stack application that uses AI to summarize PDF documents, audio files, and YouTube videos. It includes a built-in AI chat assistant to ask questions about your notes.

## 🚀 Features
- **Multi-Format Support**: Summarize PDFs, MP3s, WAVs, and YouTube videos.
- **AI Summary & Keywords**: Automatically extracts key insights and topics.
- **Interactive Chat**: Chat with your notes to get specific answers.
- **User Authentication**: Securely save and manage your private notes.
- **PDF Export**: Download your summarized notes and chat history as a PDF.
- **Premium UI**: Modern dark-mode interface built with React and Tailwind CSS.

## 🛠️ Tech Stack
- **Backend**: Django, Django REST Framework, JWT (SimpleJWT), Google Gemini API (Generative AI).
- **Frontend**: React (Vite), Tailwind CSS, Axios, Lucide React.
- **AI**: Google Gemini Pro for summarization and chat.

## ⚙️ Setup Instructions

### Backend
1. Navigate to `backend/` folder.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `.\venv\Scripts\activate`.
4. Install dependencies: `pip install -r requirements.txt`.
5. Create a `.env` file and add your `GOOGLE_API_KEY`.
6. Run migrations: `python manage.py migrate`.
7. Start server: `python manage.py runserver`.

### Frontend
1. Navigate to `frontend/` folder.
2. Install dependencies: `npm install`.
3. Start development server: `npm run dev`.

## 📄 License
MIT