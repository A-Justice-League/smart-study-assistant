# Smart Study Assistant

> AI-powered study tool that transforms notes into summaries, quizzes, and diagrams using Google Gemini API.

Built for the Google Gemini API Hackathon - February 2026

## Features

- **Text Input** - Paste notes directly
- **PDF Upload** - Extract text from PDFs
- **AI Summaries** - Brief, detailed, or bullet-point summaries
- **Quiz Generation** - Auto-generated MCQ with scoring
- **Visual Diagrams** - AI-generated concept maps

## Architecture

```
Frontend (React + Vite)  ◄───►  Backend (FastAPI)
      │                              │
      │                              ├── /api/upload (PDF → Text)
      │                              ├── /api/ai/summarize
      │                              ├── /api/ai/quiz
      │                              └── /api/ai/diagram
      │                                     │
      │                              Gemini API
```

**No user auth.** Each session is one-off, stateless.

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 18 + Vite | FastAPI |
| TypeScript | google-generativeai |
| Tailwind + shadcn/ui | PyPDF2 / pdfplumber |
| React Router | Gemini 3 Pro |
| Axios | |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with CTA |
| `/study` | Main workspace |

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Environment Variables

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000/api
```

**Backend (.env)**
```
GEMINI_API_KEY=your_key
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload PDF, extract text, return content |
| `/api/ai/summarize` | POST | Generate AI summary |
| `/api/ai/quiz` | POST | Generate quiz questions |
| `/api/ai/diagram` | POST | Generate diagram image |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full API specs.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - API specs, data flows

---

Built for Google Gemini API Hackathon
