# Smart Study Assistant - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                       │
│                       React + Vite + TypeScript                          │
│                                                                          │
│   ┌─────────────┐           ┌─────────────┐                             │
│   │   Landing   │           │    Study    │                             │
│   │    Page     │  ──────►  │  Workspace  │                             │
│   └─────────────┘           └─────────────┘                             │
│                                    │                                     │
│                           Axios API Client                               │
│                                    │                                     │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                                HTTP/REST (JSON)
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                       │
│                       FastAPI (Python)                                   │
│                                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│   │  /api/upload │  │/api/ai/summ- │  │ /api/ai/quiz │                 │
│   │  (PDF→Text)  │  │    arize     │  │              │                 │
│   └──────────────┘  └──────────────┘  └──────────────┘                 │
│          │                  │                 │                          │
│          │                  └────────┬────────┘                          │
│          │                           │                                   │
│          ▼                           ▼                                   │
│   ┌──────────────┐           ┌──────────────┐                           │
│   │   PyPDF2 /   │           │  Gemini API  │                           │
│   │  pdfplumber  │           │              │                           │
│   └──────────────┘           └──────────────┘                           │
│                                                                          │
│   Note: Files stored temporarily in /tmp, deleted after extraction      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Gemini Models

| Model | Model ID | Use Case |
|-------|----------|----------|
| Gemini 3 Pro | `gemini-3-pro-preview` | Summarization, Quiz generation |
| Gemini 3 Pro Image | `gemini-3-pro-image-preview` | Diagram generation |

---

## Data Flows

### Flow 1: Text → Summary

```
User pastes notes
       │
       ▼
┌─────────────────┐
│   TextInput     │
│   Component     │
└───────┬─────────┘
        │ content
        ▼
┌─────────────────┐
│  POST /api/ai/  │
│   summarize     │
│ {content,style} │
└───────┬─────────┘
        │
════════│════════════════ Network
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│    FastAPI      │────►│   Gemini 3 Pro  │
│    Handler      │◄────│                 │
└───────┬─────────┘     └─────────────────┘
        │
        │ {summary, key_points}
        ▼
════════│════════════════ Network
        │
        ▼
┌─────────────────┐
│   SummaryCard   │
│   Component     │
└─────────────────┘
```

### Flow 2: PDF Upload → Text Extraction

```
User uploads PDF
       │
       ▼
┌─────────────────┐
│   PDFUploader   │
│   Component     │
└───────┬─────────┘
        │ multipart/form-data
        ▼
┌─────────────────┐
│  POST /api/     │
│    upload       │
└───────┬─────────┘
        │
════════│════════════════ Network
        │
        ▼
┌─────────────────────────────────────────┐
│              FastAPI Handler             │
│                                          │
│  1. Save file to /tmp/{uuid}.pdf        │
│  2. Extract text with PyPDF2            │
│  3. Delete temp file                     │
│  4. Return { text, page_count }         │
│                                          │
└───────┬─────────────────────────────────┘
        │
        │ {text, page_count, word_count}
        ▼
════════│════════════════ Network
        │
        ▼
┌─────────────────┐
│  Frontend sets  │
│ state.content = │
│   extracted     │
│     text        │
└─────────────────┘

User can now click Summarize or Quiz
```

### Flow 3: Generate Diagram

```
User clicks "Diagram"
       │
       ▼
┌─────────────────┐
│  POST /api/ai/  │
│    diagram      │
│{content, type}  │
└───────┬─────────┘
        │
════════│════════════════ Network
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│    FastAPI      │────►│ Gemini 3 Pro    │
│    Handler      │◄────│    Image        │
└───────┬─────────┘     └─────────────────┘
        │
        │ {image_url: "data:image/png;base64,..."}
        ▼
════════│════════════════ Network
        │
        ▼
┌─────────────────┐
│  DiagramImage   │
│  <img src=...>  │
└─────────────────┘
```

---

## API Endpoints

### POST /api/upload

Uploads PDF, extracts text, returns content. **File is NOT persisted.**

**Request:**
```
Content-Type: multipart/form-data
Body: file (PDF)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Extracted text content...",
    "page_count": 5,
    "word_count": 1234
  }
}
```

**Errors:**
- `INVALID_FILE_TYPE` (400) - Not a PDF
- `FILE_TOO_LARGE` (400) - > 10MB
- `EXTRACTION_FAILED` (500) - PyPDF2 error

---

### POST /api/ai/summarize

**Request:**
```json
{
  "content": "Study material...",
  "style": "brief" | "detailed" | "bullet-points"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Main summary text...",
    "key_points": ["Point 1", "Point 2"],
    "topics": ["Topic A", "Topic B"],
    "word_count": 150
  }
}
```

**Errors:**
- `CONTENT_TOO_SHORT` (400) - < 50 chars
- `CONTENT_TOO_LONG` (400) - > 100k chars
- `AI_ERROR` (500) - Gemini failure
- `RATE_LIMITED` (429)

---

### POST /api/ai/quiz

**Request:**
```json
{
  "content": "Study material...",
  "question_count": 5,
  "difficulty": "easy" | "medium" | "hard"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Quiz on Topic",
    "questions": [
      {
        "id": "q1",
        "type": "multiple-choice",
        "question": "Question text?",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correct_answer": 1,
        "explanation": "Why this is correct..."
      }
    ],
    "total_questions": 5
  }
}
```

---

### POST /api/ai/diagram

**Request:**
```json
{
  "content": "Study material...",
  "diagram_type": "flowchart" | "mindmap" | "concept-map"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Diagram Title",
    "image_url": "data:image/png;base64,iVBORw0KGgo...",
    "explanation": "What this diagram shows"
  }
}
```

Frontend renders: `<img src={image_url} alt={title} />`

---

## File Storage

**PDF files are NOT persisted.** The upload flow is:

1. Frontend sends PDF via `multipart/form-data`
2. Backend saves to `/tmp/uploads/{uuid}.pdf`
3. Backend extracts text using PyPDF2/pdfplumber
4. Backend **deletes** the temp file
5. Backend returns extracted text only

This means:
- No file storage needed
- No cleanup jobs needed
- Each session is stateless
- Privacy-friendly (no files retained)

---

## Response Format

All endpoints return:

```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message"
  }
}
```

---

## CORS

Backend must allow:
- `http://localhost:5173` (Vite dev)
- Production frontend URL

---

## No Authentication

This app has **no user accounts**. Each session is one-off:
- No login/signup
- No history persistence
- No user data storage
- Completely stateless
