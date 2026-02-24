# Smart Study Assistant — Architecture & API Specification

**Version:** 1.0.0 (MVP)  
**Last Updated:** 2026-02-06  
**Status:** MVP-Ready Technical Specification

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Session Management](#session-management)
7. [API Specification](#api-specification)
8. [File Upload & Processing](#file-upload--processing)
9. [AI Integration (Gemini API)](#ai-integration-gemini-api)
10. [Security Best Practices](#security-best-practices)
11. [Error Handling](#error-handling)
12. [Deployment Architecture](#deployment-architecture)

---

## Overview

**Smart Study Assistant** is an AI-powered learning platform that helps students upload study materials (PDFs, text files), extract content, generate summaries, create quizzes, and visualize concepts through AI-generated diagrams.

### Key Features

- 📄 **File Upload & Text Extraction** (PDF, TXT, DOCX)
- 🤖 **AI-Powered Summarization** (via Google Gemini API)
- 📝 **Quiz Generation** (multiple-choice, true/false)
- 📊 **Concept Diagram Generation** (Mermaid.js syntax)
- 💾 **Session Management** (user study sessions with history)
- 🔒 **Authentication** (Supabase Auth with JWT)
- 📱 **Responsive Web Interface** (Next.js + TailwindCSS)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Next.js UI    │ (Frontend)
│  (Client Side)  │
└────────┬────────┘
         │ HTTPS
         │ REST API
         ▼
┌───��─────────────────────────────────┐
│  Backend API Layer                  │
│  - Flask (Python) OR Express (Node) │
│  - JWT Validation Middleware        │
│  - File Upload Handling             │
│  - Business Logic                   │
└────────┬───────────────┬────────────┘
         │               │
         │               │
         ▼               ▼
┌────────────────┐  ┌──────────────┐
│  Supabase DB   │  │  Gemini API  │
│  (PostgreSQL)  │  │  (Google AI) │
└────────────────┘  └──────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Next.js Frontend** | UI/UX, client-side routing, form validation, API consumption |
| **Backend API** | Business logic, authentication, file processing, AI orchestration |
| **Supabase** | Database (PostgreSQL), authentication provider, file storage |
| **Gemini API** | Text summarization, quiz generation, diagram generation |

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ (React)
- **Styling:** TailwindCSS
- **State Management:** React Context API / Zustand (optional)
- **HTTP Client:** Axios / Fetch API
- **File Upload:** React Dropzone
- **Diagram Rendering:** Mermaid.js

### Backend (Choose One)

**Option A: Python (Flask)**
```
- Flask 3.0+
- Flask-CORS
- PyPDF2 / pdfplumber (PDF extraction)
- python-docx (DOCX extraction)
- google-generativeai (Gemini SDK)
- supabase-py (Database client)
```

**Option B: Node.js (Express)**
```
- Express 4.18+
- Multer (file uploads)
- pdf-parse (PDF extraction)
- mammoth (DOCX extraction)
- @google/generative-ai (Gemini SDK)
- @supabase/supabase-js (Database client)
```

### Database
- **Supabase (PostgreSQL 15+)**
  - Managed PostgreSQL instance
  - Built-in authentication
  - Row-level security (RLS)
  - Storage buckets for file uploads

### AI Service
- **Google Gemini API** (gemini-1.5-flash or gemini-1.5-pro)

---

## Database Schema

### Overview

The database uses **Supabase Auth** for user management. All user-generated content (sessions, quizzes, summaries) is linked to `auth.users` via foreign keys.

---

### Tables

#### 1. `users` (Managed by Supabase Auth)

**Note:** This table is automatically managed by Supabase. We reference it via `auth.users.id`.

```sql
-- Supabase creates this automatically
-- We only reference auth.users(id) in our foreign keys
```

**Custom User Metadata (Optional)**

If you need additional user fields, use Supabase's `profiles` table pattern:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

#### 2. `sessions` (Study Sessions)

**Purpose:** Stores user study sessions. Each session represents a single study interaction (upload + AI processing).

```sql
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  file_name TEXT,
  file_url TEXT, -- Supabase Storage URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_created_at ON public.sessions(created_at DESC);

-- Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.sessions
  FOR DELETE USING (auth.uid() = user_id);
```

**Columns:**
- `id` — Session UUID (primary key)
- `user_id` — Owner of the session (foreign key to auth.users)
- `title` — Session title (e.g., "Chapter 5 Summary")
- `original_text` — Extracted text from uploaded file
- `file_name` — Original filename
- `file_url` — URL to stored file in Supabase Storage
- `created_at` / `updated_at` — Timestamps

---

#### 3. `summaries` (AI-Generated Summaries)

**Purpose:** Stores AI-generated summaries for each session.

```sql
CREATE TABLE public.summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  summary_type TEXT DEFAULT 'standard', -- 'standard', 'brief', 'detailed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_summaries_session_id ON public.summaries(session_id);

-- Row Level Security
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view summaries of own sessions" ON public.summaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = summaries.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert summaries for own sessions" ON public.summaries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = summaries.session_id
      AND sessions.user_id = auth.uid()
    )
  );
```

---

#### 4. `quizzes` (AI-Generated Quizzes)

**Purpose:** Stores AI-generated quizzes for each session.

```sql
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL, -- Array of question objects
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_session_id ON public.quizzes(session_id);

-- Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quizzes of own sessions" ON public.quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = quizzes.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quizzes for own sessions" ON public.quizzes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = quizzes.session_id
      AND sessions.user_id = auth.uid()
    )
  );
```

**`questions` JSONB Schema:**

```json
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "question": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "correct_answer": "Paris",
    "explanation": "Paris is the capital and largest city of France."
  },
  {
    "id": "q2",
    "type": "true-false",
    "question": "The Earth is flat.",
    "correct_answer": false,
    "explanation": "The Earth is an oblate spheroid."
  }
]
```

---

#### 5. `quiz_attempts` (ADDED — Best Practice)

**Purpose:** Tracks user quiz attempts and scores.

```sql
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- User's answers
  score INTEGER NOT NULL, -- Percentage (0-100)
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);

-- Row Level Security
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**`answers` JSONB Schema:**

```json
{
  "q1": "Paris",
  "q2": false
}
```

---

#### 6. `diagrams` (AI-Generated Concept Diagrams)

**Purpose:** Stores AI-generated Mermaid.js diagram code.

```sql
CREATE TABLE public.diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mermaid_code TEXT NOT NULL,
  diagram_type TEXT DEFAULT 'flowchart', -- 'flowchart', 'mindmap', 'sequence'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diagrams_session_id ON public.diagrams(session_id);

-- Row Level Security
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view diagrams of own sessions" ON public.diagrams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = diagrams.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert diagrams for own sessions" ON public.diagrams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = diagrams.session_id
      AND sessions.user_id = auth.uid()
    )
  );
```

---

### Relationships Diagram

```
auth.users (Supabase Auth)
    │
    ├──< sessions
    │      │
    │      ├──< summaries
    │      ├──< quizzes
    │      │      │
    │      │      └──< quiz_attempts
    │      └──< diagrams
    │
    └──< quiz_attempts
```

---

## Authentication & Authorization

**(ADDED — MVP Requirement)**

### Strategy: Supabase Auth + JWT

We use **Supabase Authentication** for user management and JWT-based session tokens.

---

### User Flow

#### 1. **Sign Up**

```
User → Frontend → POST /api/v1/auth/signup
     → Supabase Auth creates user
     → Returns JWT access token + refresh token
```

#### 2. **Login**

```
User → Frontend → POST /api/v1/auth/login
     → Supabase Auth validates credentials
     → Returns JWT access token + refresh token
```

#### 3. **Protected Requests**

```
User → Frontend → Adds "Authorization: Bearer <JWT>" header
     → Backend validates JWT using Supabase client
     → Extracts user_id from token
     → Processes request
```

#### 4. **Logout**

```
User → Frontend → Clears local token storage
     → (Optional) POST /api/v1/auth/logout to invalidate refresh token
```

---

### Token Storage (Frontend)

**Best Practice for MVP:**

- **Access Token:** Store in memory (React state/context) or `sessionStorage`
- **Refresh Token:** Store in `httpOnly` cookie (if backend supports) or `localStorage` (less secure but simpler for MVP)

**Security Note:** For production, use `httpOnly` cookies for refresh tokens.

---

### Backend Authentication Middleware

#### Flask Example (Python)

```python
# middleware/auth.py
from functools import wraps
from flask import request, jsonify
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Validate JWT token
            user = supabase.auth.get_user(token)
            request.user_id = user.user.id  # Attach user_id to request
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token'}), 401
    
    return decorated_function

# Usage in routes:
@app.route('/api/v1/sessions', methods=['GET'])
@require_auth
def get_sessions():
    user_id = request.user_id
    # ... fetch sessions for user_id
```

#### Express Example (Node.js)

```javascript
// middleware/auth.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.userId = user.id; // Attach user_id to request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { requireAuth };

// Usage in routes:
const { requireAuth } = require('./middleware/auth');

app.get('/api/v1/sessions', requireAuth, async (req, res) => {
  const userId = req.userId;
  // ... fetch sessions for userId
});
```

---

### Authorization Rules

| Resource | Rule |
|----------|------|
| **Sessions** | Users can only CRUD their own sessions |
| **Summaries** | Users can only view/create summaries for their sessions |
| **Quizzes** | Users can only view/create quizzes for their sessions |
| **Quiz Attempts** | Users can only view/create their own attempts |
| **Diagrams** | Users can only view/create diagrams for their sessions |

**Implementation:** Use Row-Level Security (RLS) in Supabase + backend validation.

---

## Session Management

### What is a Session?

A **session** represents a single study interaction:

1. User uploads a file (or pastes text)
2. Backend extracts text
3. Backend creates a session record
4. User generates summaries/quizzes/diagrams for that session
5. Session is saved to history

---

### Session Ownership

- **Logged-in users:** Sessions are linked to `user_id`
- **Guest users (Optional MVP):** Not supported in this MVP. Users must sign up/login to create sessions.

**Alternative (if guest sessions are required):**

- Allow `user_id` to be `NULL` for guest sessions
- Store guest session ID in browser `localStorage`
- Prompt guest users to sign up to save history permanently

---

### Session Lifecycle

```
1. User uploads file
   ↓
2. Backend extracts text
   ↓
3. Backend creates session (POST /api/v1/sessions)
   ↓
4. User generates summary (POST /api/v1/sessions/:id/summary)
   ↓
5. User generates quiz (POST /api/v1/sessions/:id/quiz)
   ↓
6. User generates diagram (POST /api/v1/sessions/:id/diagram)
   ↓
7. User views history (GET /api/v1/sessions)
   ↓
8. User deletes session (DELETE /api/v1/sessions/:id) [Optional]
```

---

## API Specification

**Base URL:** `http://localhost:5000/api/v1` (development)  
**Production URL:** `https://api.yourdomain.com/api/v1`

---

### General Rules

- **Content-Type:** `application/json` (except file uploads: `multipart/form-data`)
- **Authentication:** Include `Authorization: Bearer <JWT>` header for protected endpoints
- **Timestamps:** ISO 8601 format (e.g., `2026-02-06T14:30:00Z`)
- **Error Format:** See [Error Handling](#error-handling) section

---

### Endpoints

#### 1. Authentication

##### 1.1 Sign Up

**POST** `/api/v1/auth/signup`

**Purpose:** Create a new user account.

**Authentication:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe" // Optional
}
```

**Validation Rules:**
- `email`: Valid email format, max 255 chars
- `password`: Min 8 chars, must include uppercase, lowercase, number, special char
- `full_name`: Optional, max 100 chars

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2026-02-06T14:30:00Z"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,
      "token_type": "Bearer"
    }
  }
}
```

**Errors:**
- `400` — Validation error (weak password, invalid email)
- `409` — Email already registered

---

##### 1.2 Login

**POST** `/api/v1/auth/login`

**Purpose:** Authenticate existing user.

**Authentication:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,
      "token_type": "Bearer"
    }
  }
}
```

**Errors:**
- `401` — Invalid credentials

---

##### 1.3 Get Current User

**GET** `/api/v1/auth/me`

**Purpose:** Get authenticated user profile.

**Authentication:** Required (JWT)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "2026-02-06T14:30:00Z"
  }
}
```

**Errors:**
- `401` — Invalid or expired token

---

##### 1.4 Logout (ADDED — Best Practice)

**POST** `/api/v1/auth/logout`

**Purpose:** Invalidate refresh token (optional for MVP).

**Authentication:** Required (JWT)

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Implementation Note:** For MVP, frontend can simply clear tokens. Full implementation would revoke refresh tokens on backend.

---

#### 2. Sessions

##### 2.1 Create Session (Upload File)

**POST** `/api/v1/sessions`

**Purpose:** Upload a file (or text), extract content, create a new study session.

**Authentication:** Required (JWT)

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | No* | PDF, TXT, or DOCX file (max 10MB) |
| `text` | String | No* | Raw text content (max 50,000 chars) |
| `title` | String | Yes | Session title (max 200 chars) |

*At least one of `file` or `text` must be provided.

**Example Request (cURL):**

```bash
curl -X POST http://localhost:5000/api/v1/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@chapter5.pdf" \
  -F "title=Chapter 5 Summary"
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Chapter 5 Summary",
      "original_text": "Extracted text from PDF...",
      "file_name": "chapter5.pdf",
      "file_url": "https://your-supabase-project.supabase.co/storage/v1/object/public/uploads/chapter5.pdf",
      "created_at": "2026-02-06T14:30:00Z",
      "updated_at": "2026-02-06T14:30:00Z"
    }
  }
}
```

**Database Operations:**
1. Save file to Supabase Storage (if file uploaded)
2. Extract text using appropriate library (PyPDF2, pdf-parse, etc.)
3. Insert record into `sessions` table
4. Return session object

**Validation Rules:**
- File size: Max 10MB
- File types: `.pdf`, `.txt`, `.docx`
- Text length: Max 50,000 characters
- Title: Required, max 200 chars

**Errors:**
- `400` — Validation error (missing file/text, invalid format, file too large)
- `401` — Unauthorized (missing/invalid JWT)
- `500` — Text extraction failed

---

##### 2.2 Get All Sessions (History)

**GET** `/api/v1/sessions`

**Purpose:** Retrieve all sessions for authenticated user.

**Authentication:** Required (JWT)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 20 | Sessions per page (max 100) |
| `sort` | String | `created_at` | Sort field (`created_at`, `updated_at`) |
| `order` | String | `desc` | Sort order (`asc`, `desc`) |

**Example Request:**

```
GET /api/v1/sessions?page=1&limit=10&sort=created_at&order=desc
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "title": "Chapter 5 Summary",
        "file_name": "chapter5.pdf",
        "created_at": "2026-02-06T14:30:00Z",
        "summary_count": 1,
        "quiz_count": 2,
        "diagram_count": 1
      },
      {
        "id": "8d0e7680-8536-41de-945c-f08gd2g01bf8",
        "title": "Physics Notes",
        "file_name": null,
        "created_at": "2026-02-05T10:15:00Z",
        "summary_count": 0,
        "quiz_count": 0,
        "diagram_count": 0
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

**Database Operations:**
1. Query `sessions` table where `user_id = authenticated_user_id`
2. Left join with `summaries`, `quizzes`, `diagrams` to get counts
3. Apply pagination and sorting
4. Return results

**Errors:**
- `401` — Unauthorized

---

##### 2.3 Get Session by ID

**GET** `/api/v1/sessions/:id`

**Purpose:** Retrieve a single session with all related data (summaries, quizzes, diagrams).

**Authentication:** Required (JWT)

**Example Request:**

```
GET /api/v1/sessions/7c9e6679-7425-40de-944b-e07fc1f90ae7
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Chapter 5 Summary",
      "original_text": "Full extracted text...",
      "file_name": "chapter5.pdf",
      "file_url": "https://...",
      "created_at": "2026-02-06T14:30:00Z",
      "updated_at": "2026-02-06T14:30:00Z"
    },
    "summaries": [
      {
        "id": "9e1f8791-9647-42ef-a56d-g19he3h12cg9",
        "content": "This chapter covers...",
        "summary_type": "standard",
        "created_at": "2026-02-06T14:35:00Z"
      }
    ],
    "quizzes": [
      {
        "id": "af2g9802-a758-43fg-b67e-h20if4i23dh0",
        "title": "Chapter 5 Quiz",
        "questions": [...],
        "created_at": "2026-02-06T14:40:00Z"
      }
    ],
    "diagrams": [
      {
        "id": "bg3h0913-b869-44gh-c78f-i31jg5j34ei1",
        "title": "Concept Map",
        "mermaid_code": "graph TD\n  A[Start]-->B[Process]",
        "diagram_type": "flowchart",
        "created_at": "2026-02-06T14:45:00Z"
      }
    ]
  }
}
```

**Database Operations:**
1. Query `sessions` where `id = :id AND user_id = authenticated_user_id`
2. Join with `summaries`, `quizzes`, `diagrams`
3. Return full session object

**Errors:**
- `401` — Unauthorized
- `404` — Session not found or not owned by user

---

##### 2.4 Delete Session (ADDED — MVP Requirement)

**DELETE** `/api/v1/sessions/:id`

**Purpose:** Delete a session and all related data (summaries, quizzes, diagrams, attempts).

**Authentication:** Required (JWT)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

**Database Operations:**
1. Verify session ownership (`user_id = authenticated_user_id`)
2. Delete session (CASCADE will delete related records)
3. Delete file from Supabase Storage if exists

**Errors:**
- `401` — Unauthorized
- `404` — Session not found
- `403` — Forbidden (not session owner)

---

#### 3. Summaries

##### 3.1 Generate Summary

**POST** `/api/v1/sessions/:sessionId/summary`

**Purpose:** Generate AI summary for a session's text using Gemini API.

**Authentication:** Required (JWT)

**Request Body:**

```json
{
  "type": "standard" // Options: "standard", "brief", "detailed"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "id": "9e1f8791-9647-42ef-a56d-g19he3h12cg9",
      "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "content": "This chapter explores the fundamental principles of quantum mechanics, including wave-particle duality, the uncertainty principle, and quantum entanglement. Key concepts include...",
      "summary_type": "standard",
      "created_at": "2026-02-06T14:35:00Z"
    }
  }
}
```

**Database Operations:**
1. Verify session ownership
2. Fetch `original_text` from session
3. Call Gemini API with appropriate prompt (see [AI Integration](#ai-integration-gemini-api))
4. Insert summary into `summaries` table
5. Return summary object

**Gemini Prompt Template:**

```
Summarize the following study material in {type} detail:

{original_text}

Provide a clear, structured summary suitable for a student studying this topic.
```

**Errors:**
- `401` — Unauthorized
- `404` — Session not found
- `403` — Forbidden (not session owner)
- `500` — Gemini API error

---

#### 4. Quizzes

##### 4.1 Generate Quiz

**POST** `/api/v1/sessions/:sessionId/quiz`

**Purpose:** Generate AI-powered quiz based on session text.

**Authentication:** Required (JWT)

**Request Body:**

```json
{
  "num_questions": 5, // Default: 5, Max: 20
  "difficulty": "medium", // Options: "easy", "medium", "hard"
  "question_types": ["multiple-choice", "true-false"] // Optional, defaults to both
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "af2g9802-a758-43fg-b67e-h20if4i23dh0",
      "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Chapter 5 Quiz",
      "questions": [
        {
          "id": "q1",
          "type": "multiple-choice",
          "question": "What is the uncertainty principle?",
          "options": [
            "It's impossible to know both position and momentum precisely",
            "Quantum particles are always uncertain",
            "Measurements are always inaccurate",
            "Energy cannot be measured"
          ],
          "correct_answer": "It's impossible to know both position and momentum precisely",
          "explanation": "The Heisenberg uncertainty principle states that..."
        },
        {
          "id": "q2",
          "type": "true-false",
          "question": "Quantum entanglement allows faster-than-light communication.",
          "correct_answer": false,
          "explanation": "While entangled particles are correlated, no information can be transmitted faster than light."
        }
      ],
      "created_at": "2026-02-06T14:40:00Z"
    }
  }
}
```

**Database Operations:**
1. Verify session ownership
2. Fetch `original_text` from session
3. Call Gemini API with quiz generation prompt
4. Parse AI response into structured JSON
5. Insert quiz into `quizzes` table
6. Return quiz object

**Gemini Prompt Template:**

```
Based on the following study material, generate {num_questions} quiz questions at {difficulty} difficulty level.

Material:
{original_text}

Requirements:
- Include question types: {question_types}
- Provide correct answers
- Include brief explanations

Return the questions in the following JSON format:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct_answer": "...",
    "explanation": "..."
  }
]
```

**Errors:**
- `401` — Unauthorized
- `404` — Session not found
- `403` — Forbidden
- `400` — Invalid num_questions (must be 1-20)
- `500` — Gemini API error or JSON parsing error

---

##### 4.2 Submit Quiz Attempt (ADDED — Best Practice)

**POST** `/api/v1/quizzes/:quizId/attempts`

**Purpose:** Submit user's quiz answers and calculate score.

**Authentication:** Required (JWT)

**Request Body:**

```json
{
  "answers": {
    "q1": "It's impossible to know both position and momentum precisely",
    "q2": false
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "ch4i1024-c970-45hi-d89g-j42kh6k45fj2",
      "quiz_id": "af2g9802-a758-43fg-b67e-h20if4i23dh0",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "answers": {
        "q1": "It's impossible to know both position and momentum precisely",
        "q2": false
      },
      "score": 100,
      "completed_at": "2026-02-06T15:00:00Z"
    },
    "results": [
      {
        "question_id": "q1",
        "user_answer": "It's impossible to know both position and momentum precisely",
        "correct_answer": "It's impossible to know both position and momentum precisely",
        "is_correct": true,
        "explanation": "The Heisenberg uncertainty principle states that..."
      },
      {
        "question_id": "q2",
        "user_answer": false,
        "correct_answer": false,
        "is_correct": true,
        "explanation": "While entangled particles are correlated..."
      }
    ]
  }
}
```

**Database Operations:**
1. Verify quiz exists and user has access (via session ownership)
2. Calculate score by comparing answers to `correct_answer` in quiz questions
3. Insert attempt into `quiz_attempts` table
4. Return attempt with detailed results

**Scoring Logic:**
```
score = (correct_answers / total_questions) * 100
```

**Errors:**
- `401` — Unauthorized
- `404` — Quiz not found
- `400` — Missing answers or invalid format

---

##### 4.3 Get Quiz Attempts (ADDED — Best Practice)

**GET** `/api/v1/quizzes/:quizId/attempts`

**Purpose:** Retrieve all attempts for a specific quiz.

**Authentication:** Required (JWT)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "id": "ch4i1024-c970-45hi-d89g-j42kh6k45fj2",
        "quiz_id": "af2g9802-a758-43fg-b67e-h20if4i23dh0",
        "score": 100,
        "completed_at": "2026-02-06T15:00:00Z"
      },
      {
        "id": "di5j2135-d081-46ij-e90h-k53li7l56gk3",
        "quiz_id": "af2g9802-a758-43fg-b67e-h20if4i23dh0",
        "score": 80,
        "completed_at": "2026-02-05T10:30:00Z"
      }
    ],
    "stats": {
      "total_attempts": 2,
      "average_score": 90,
      "best_score": 100,
      "latest_score": 100
    }
  }
}
```

**Errors:**
- `401` — Unauthorized
- `404` — Quiz not found

---

#### 5. Diagrams

##### 5.1 Generate Diagram

**POST** `/api/v1/sessions/:sessionId/diagram`

**Purpose:** Generate Mermaid.js diagram code using Gemini API.

**Authentication:** Required (JWT)

**Request Body:**

```json
{
  "type": "flowchart", // Options: "flowchart", "mindmap", "sequence", "class"
  "title": "Quantum Mechanics Concepts" // Optional
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "diagram": {
      "id": "bg3h0913-b869-44gh-c78f-i31jg5j34ei1",
      "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Quantum Mechanics Concepts",
      "mermaid_code": "graph TD\n  A[Quantum Mechanics]-->B[Wave-Particle Duality]\n  A-->C[Uncertainty Principle]\n  A-->D[Quantum Entanglement]\n  B-->E[Photons]\n  B-->F[Electrons]",
      "diagram_type": "flowchart",
      "created_at": "2026-02-06T14:45:00Z"
    }
  }
}
```

**Database Operations:**
1. Verify session ownership
2. Fetch `original_text` from session
3. Call Gemini API with diagram generation prompt
4. Validate Mermaid.js syntax (basic validation)
5. Insert diagram into `diagrams` table
6. Return diagram object

**Gemini Prompt Template:**

```
Based on the following study material, create a {type} diagram using Mermaid.js syntax to visualize the key concepts and their relationships.

Material:
{original_text}

Requirements:
- Use valid Mermaid.js syntax
- Focus on main concepts and relationships
- Keep the diagram clear and not overly complex
- Use appropriate Mermaid diagram type for {type}

Return only the Mermaid code without any explanation.
```

**Mermaid.js Syntax Reference:**

- **Flowchart:** `graph TD` or `graph LR`
- **Mindmap:** `mindmap`
- **Sequence:** `sequenceDiagram`
- **Class:** `classDiagram`

**Errors:**
- `401` — Unauthorized
- `404` — Session not found
- `403` — Forbidden
- `400` — Invalid diagram type
- `500` — Gemini API error or invalid Mermaid syntax

---

#### 6. Health Check (ADDED — Best Practice)

##### 6.1 API Health Check

**GET** `/api/v1/health`

**Purpose:** Check if API is running and healthy.

**Authentication:** Public

**Response (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T14:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "gemini_api": "available"
  }
}
```

---

## File Upload & Processing

### Supported File Types

| Format | Extension | Library (Python) | Library (Node.js) |
|--------|-----------|------------------|-------------------|
| **PDF** | `.pdf` | PyPDF2 or pdfplumber | pdf-parse |
| **Text** | `.txt` | Built-in | Built-in (fs) |
| **Word** | `.docx` | python-docx | mammoth |

---

### File Upload Flow

```
1. User selects file in frontend
   ↓
2. Frontend sends POST /api/v1/sessions with multipart/form-data
   ↓
3. Backend validates file (size, type, content)
   ↓
4. Backend uploads to Supabase Storage
   ↓
5. Backend extracts text using appropriate library
   ↓
6. Backend creates session record in database
   ↓
7. Backend returns session object to frontend
```

---

### Text Extraction Examples

#### Python (Flask) — PDF Extraction

```python
import pdfplumber

def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.strip()
```

#### Node.js (Express) — PDF Extraction

```javascript
const pdfParse = require('pdf-parse');
const fs = require('fs');

async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}
```

---

### File Storage (Supabase Storage)

**Bucket Configuration:**

```javascript
// Create bucket: "uploads"
// Settings:
// - Public: false (requires authentication)
// - File size limit: 10 MB
// - Allowed MIME types: application/pdf, text/plain, application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

**Upload Example (Python):**

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_file(file, user_id):
    file_name = f"{user_id}/{uuid.uuid4()}_{file.filename}"
    
    response = supabase.storage.from_("uploads").upload(
        path=file_name,
        file=file.read(),
        file_options={"content-type": file.content_type}
    )
    
    # Get public URL (or signed URL for private files)
    file_url = supabase.storage.from_("uploads").get_public_url(file_name)
    
    return file_url
```

---

### File Validation (ADDED — Industry Standard)

**Server-side validation is required for:**

1. **File Size:** Max 10 MB
2. **File Type:** Check MIME type and extension
3. **Content Validation:** Ensure file is actually the claimed type (prevent MIME spoofing)
4. **Virus Scanning:** (Optional for MVP, recommended for production)

**Example Validation (Flask):**

```python
ALLOWED_EXTENSIONS = {'pdf', 'txt', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file(file):
    if not file:
        raise ValueError("No file provided")
    
    if not allowed_file(file.filename):
        raise ValueError("Invalid file type")
    
    # Check file size (requires seeking to end)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise ValueError("File too large (max 10 MB)")
    
    return True
```

---

## AI Integration (Gemini API)

### Gemini API Setup

**SDK Installation:**

```bash
# Python
pip install google-generativeai

# Node.js
npm install @google/generative-ai
```

**Configuration:**

```python
# Python
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')
```

```javascript
// Node.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

---

### Use Cases

#### 1. Text Summarization

**Prompt Template:**

```
Summarize the following study material in {detail_level} detail:

{text}

Provide a clear, structured summary suitable for a student. Use bullet points for key concepts.
```

**Python Example:**

```python
def generate_summary(text, detail_level="standard"):
    prompt = f"""
    Summarize the following study material in {detail_level} detail:
    
    {text}
    
    Provide a clear, structured summary suitable for a student. Use bullet points for key concepts.
    """
    
    response = model.generate_content(prompt)
    return response.text
```

---

#### 2. Quiz Generation

**Prompt Template:**

```
Based on the following study material, generate {num_questions} quiz questions at {difficulty} difficulty level.

Material:
{text}

Requirements:
- Include {question_types}
- Provide correct answers
- Include brief explanations for each answer

Return the response in JSON format matching this schema:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Explanation text"
  }
]
```

**Python Example:**

```python
import json

def generate_quiz(text, num_questions=5, difficulty="medium"):
    prompt = f"""
    Based on the following study material, generate {num_questions} quiz questions at {difficulty} difficulty level.
    
    Material:
    {text}
    
    Return valid JSON array matching this structure:
    [
      {{
        "id": "q1",
        "type": "multiple-choice",
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "correct_answer": "...",
        "explanation": "..."
      }}
    ]
    """
    
    response = model.generate_content(prompt)
    
    # Extract JSON from response (handle markdown code blocks)
    response_text = response.text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:-3]  # Remove ```json and ```
    
    questions = json.loads(response_text)
    return questions
```

---

#### 3. Diagram Generation

**Prompt Template:**

```
Based on the following study material, create a {diagram_type} diagram using Mermaid.js syntax.

Material:
{text}

Requirements:
- Use valid Mermaid.js syntax for {diagram_type}
- Focus on key concepts and relationships
- Keep it clear and not overly complex

Return ONLY the Mermaid code without explanation or markdown formatting.
```

**Python Example:**

```python
def generate_diagram(text, diagram_type="flowchart"):
    prompt = f"""
    Based on the following study material, create a {diagram_type} diagram using Mermaid.js syntax.
    
    Material:
    {text}
    
    Return ONLY the Mermaid code without explanation.
    """
    
    response = model.generate_content(prompt)
    
    # Clean up response
    mermaid_code = response.text.strip()
    if mermaid_code.startswith("```mermaid"):
        mermaid_code = mermaid_code[10:-3]
    
    return mermaid_code
```

---

### Error Handling for AI Calls (ADDED — Best Practice)

**Common Gemini API Errors:**

| Error | Cause | Handling |
|-------|-------|----------|
| `ResourceExhausted` | Rate limit exceeded | Implement exponential backoff, show user error |
| `InvalidArgument` | Invalid prompt or parameters | Validate input before calling API |
| `DeadlineExceeded` | Request timeout | Retry with shorter text or show timeout error |
| `PermissionDenied` | Invalid API key | Check environment variables, log error |

**Python Error Handling Example:**

```python
from google.api_core import exceptions as google_exceptions

def safe_ai_call(prompt, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            return response.text
        except google_exceptions.ResourceExhausted:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            raise Exception("AI service rate limit exceeded. Please try again later.")
        except google_exceptions.InvalidArgument as e:
            raise Exception(f"Invalid request to AI service: {str(e)}")
        except Exception as e:
            raise Exception(f"AI service error: {str(e)}")
```

---

### Prompt Injection Mitigation (ADDED — Security Best Practice)

**Risk:** Users could upload text containing malicious prompts that manipulate AI behavior.

**Mitigation Strategies:**

1. **Input Sanitization:**
   ```python
   def sanitize_input(text):
       # Remove common prompt injection patterns
       dangerous_patterns = [
           "Ignore previous instructions",
           "Disregard the above",
           "New instructions:",
           "System prompt:"
       ]
       
       for pattern in dangerous_patterns:
           text = text.replace(pattern, "[REDACTED]")
       
       return text
   ```

2. **Output Validation:**
   - Verify AI output matches expected format (JSON for quizzes, Mermaid syntax for diagrams)
   - Reject outputs containing suspicious content

3. **Context Boundaries:**
   - Clearly separate system instructions from user content in prompts
   - Use delimiters: `--- USER CONTENT BEGINS ---`

---

## Security Best Practices

**(ADDED — Industry Standard)**

### 1. Authentication Security

✅ **Password Requirements:**
- Minimum 8 characters
- Must include uppercase, lowercase, number, special character
- Reject common passwords (use library like `zxcvbn`)

✅ **JWT Security:**
- Use short expiration times (access token: 1 hour)
- Store refresh tokens securely (httpOnly cookies in production)
- Implement token refresh mechanism
- Revoke tokens on logout

✅ **Rate Limiting:**

```python
# Flask example using Flask-Limiter
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.headers.get('Authorization', 'anonymous'),
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/v1/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    # ... login logic
```

**Recommended Limits:**
- Login: 5 attempts per minute
- Signup: 3 attempts per hour
- AI generation: 10 per hour (authenticated users)
- File uploads: 5 per hour

---

### 2. File Upload Security

✅ **Validation:**
- Check file size (max 10 MB)
- Validate MIME type server-side
- Verify file extension matches content
- Scan for viruses (production)

✅ **Storage:**
- Store files outside web root
- Use random filenames (prevent path traversal)
- Implement access controls (Supabase RLS)

✅ **Example (Flask):**

```python
import mimetypes

def validate_upload(file):
    # Check file exists
    if not file or file.filename == '':
        raise ValueError("No file selected")
    
    # Check extension
    if not allowed_file(file.filename):
        raise ValueError("File type not allowed")
    
    # Check MIME type
    mime_type = mimetypes.guess_type(file.filename)[0]
    if mime_type not in ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
        raise ValueError("Invalid file type")
    
    # Check size
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    
    if size > 10 * 1024 * 1024:
        raise ValueError("File too large")
    
    return True
```

---

### 3. API Security

✅ **CORS Configuration:**

```python
# Flask-CORS
from flask_cors import CORS

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "https://yourdomain.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

```javascript
// Express
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

✅ **Request Size Limits:**

```python
# Flask
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB
```

```javascript
// Express
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

✅ **Input Validation:**
- Use libraries (Flask: Flask-Pydantic, Express: Joi, express-validator)
- Validate all user inputs
- Sanitize HTML/SQL inputs

---

### 4. Environment Variables

**Required Variables:**

```bash
# .env file
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key  # Backend only, keep secret

# AI Service
GEMINI_API_KEY=your-gemini-api-key

# Backend
PORT=5000
FLASK_ENV=development  # or production
SECRET_KEY=your-secret-key-for-sessions

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Security Rules:**
- Never commit `.env` to version control
- Use different keys for development/production
- Rotate keys regularly
- Use secret management services (AWS Secrets Manager, HashiCorp Vault) in production

---

### 5. Logging & Monitoring (ADDED — Best Practice)

**What to Log:**

✅ Authentication attempts (success/failure)  
✅ API errors and exceptions  
✅ AI API usage (for cost tracking)  
✅ File uploads (filename, size, user)  
✅ Slow queries (> 1 second)  

**What NOT to Log:**

❌ Passwords  
❌ JWT tokens  
❌ Full file contents  
❌ Personal identifiable information (PII) without hashing  

**Python Logging Example:**

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Usage
logger.info(f"User {user_id} uploaded file {filename}")
logger.error(f"Gemini API error: {error_message}")
```

---

## Error Handling

**(ADDED — Industry Standard)**

### Standard Error Response Format

All errors must follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "timestamp": "2026-02-06T14:30:00Z",
    "request_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request parameters |
| 400 | `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| 400 | `INVALID_FILE_TYPE` | File type not supported |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 401 | `TOKEN_EXPIRED` | JWT token has expired |
| 403 | `FORBIDDEN` | User doesn't have permission to access resource |
| 404 | `NOT_FOUND` | Requested resource not found |
| 409 | `CONFLICT` | Resource already exists (e.g., email taken) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |
| 500 | `AI_SERVICE_ERROR` | Error communicating with Gemini API |
| 500 | `DATABASE_ERROR` | Database operation failed |

---

### Implementation Example (Flask)

```python
from flask import jsonify
import uuid
from datetime import datetime

class APIError(Exception):
    def __init__(self, code, message, status_code=400, details=None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details

@app.errorhandler(APIError)
def handle_api_error(error):
    response = {
        "success": False,
        "error": {
            "code": error.code,
            "message": error.message,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": str(uuid.uuid4())
        }
    }
    
    if error.details:
        response["error"]["details"] = error.details
    
    return jsonify(response), error.status_code

# Usage
@app.route('/api/v1/sessions', methods=['POST'])
@require_auth
def create_session():
    if 'file' not in request.files:
        raise APIError(
            code="VALIDATION_ERROR",
            message="No file provided",
            status_code=400,
            details={"field": "file"}
        )
    
    # ... rest of logic
```

---

### Frontend Error Handling

**Example (React/Next.js):**

```typescript
async function createSession(file: File, title: string) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    const response = await fetch('/api/v1/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!data.success) {
      // Handle API error
      switch (data.error.code) {
        case 'UNAUTHORIZED':
          // Redirect to login
          router.push('/login');
          break;
        case 'FILE_TOO_LARGE':
          toast.error('File is too large. Maximum size is 10 MB.');
          break;
        default:
          toast.error(data.error.message);
      }
      return null;
    }
    
    return data.data.session;
    
  } catch (error) {
    // Handle network errors
    toast.error('Network error. Please check your connection.');
    return null;
  }
}
```

---

## Deployment Architecture

**(ADDED — MVP Requirement)**

### Recommended Deployment Strategy

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend)               │
│    Next.js Static + SSR                 │
│    Environment: Production              │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTPS (API Calls)
                  │
┌─────────────────▼───────────────────────┐
│      Backend API Server                 │
│  - Railway / Render / Fly.io            │
│  - Flask / Express                      │
│  - Environment: Production              │
└─────────┬───────────────┬───────────────┘
          │               │
          │               │
          ▼               ▼
┌─────────────────┐  ┌──────────────────┐
│  Supabase       │  │  Gemini API      │
│  - PostgreSQL   │  │  (Google Cloud)  │
│  - Auth         │  │                  │
│  - Storage      │  │                  │
└─────────────────┘  └──────────────────┘
```

---

### Deployment Steps

#### 1. Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

#### 2. Backend (Railway/Render)

**Option A: Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

**Option B: Render**

1. Connect GitHub repo
2. Set build command: `pip install -r requirements.txt` (Flask) or `npm install` (Express)
3. Set start command: `gunicorn app:app` (Flask) or `npm start` (Express)
4. Add environment variables

---

#### 3. Database (Supabase)

1. Create project at supabase.com
2. Run SQL migrations from [Database Schema](#database-schema) section
3. Configure Row Level Security policies
4. Create storage bucket for file uploads
5. Copy connection details to backend environment variables

---

### Production Checklist

✅ **Security:**
- [ ] Environment variables configured (no hardcoded secrets)
- [ ] CORS configured with production domains
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] JWT expiration times set appropriately

✅ **Database:**
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Indexes created for performance
- [ ] Backup strategy configured
- [ ] Connection pooling configured

✅ **Monitoring:**
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Performance monitoring (New Relic, Datadog)
- [ ] Logging configured
- [ ] Uptime monitoring (UptimeRobot, Pingdom)

✅ **API:**
- [ ] API documentation published
- [ ] Health check endpoint working
- [ ] Rate limits tested
- [ ] Error responses standardized

---

## Appendix

### A. Database Indexes (Performance Optimization)

```sql
-- Sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);

-- Summaries
CREATE INDEX idx_summaries_session_id ON summaries(session_id);

-- Quizzes
CREATE INDEX idx_quizzes_session_id ON quizzes(session_id);

-- Quiz Attempts
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- Diagrams
CREATE INDEX idx_diagrams_session_id ON diagrams(session_id);
```

---

### B. API Versioning Strategy

**Current Version:** v1

**Breaking Changes:**
- Changes to response structure
- Removed endpoints
- Changed authentication method

**Non-Breaking Changes:**
- New endpoints
- New optional fields
- Performance improvements

**When to Increment Version:**
- Introduce `/api/v2/...` when breaking changes are required
- Maintain v1 for at least 6 months after v2 launch
- Document deprecation timeline

---

### C. Development vs Production Configuration

| Setting | Development | Production |
|---------|-------------|------------|
| **Frontend URL** | http://localhost:3000 | https://yourdomain.com |
| **Backend URL** | http://localhost:5000 | https://api.yourdomain.com |
| **CORS Origins** | `*` (all) | Specific domains only |
| **Rate Limiting** | Disabled or lenient | Strict limits |
| **Logging Level** | DEBUG | INFO/WARNING |
| **Error Details** | Full stack traces | Generic messages |
| **JWT Expiration** | Long (24h) | Short (1h) |

---

### D. Testing Strategy (ADDED — Best Practice)

**Backend Tests:**

```python
# tests/test_sessions.py
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_create_session_unauthorized(client):
    response = client.post('/api/v1/sessions')
    assert response.status_code == 401

def test_create_session_with_file(client, auth_token):
    with open('test_file.pdf', 'rb') as file:
        response = client.post(
            '/api/v1/sessions',
            headers={'Authorization': f'Bearer {auth_token}'},
            data={'file': file, 'title': 'Test Session'}
        )
    assert response.status_code == 201
    assert response.json['success'] == True
```

**Frontend Tests:**

```typescript
// __tests__/SessionCreation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SessionCreation from '@/components/SessionCreation';

describe('SessionCreation', () => {
  it('shows error when no file selected', () => {
    render(<SessionCreation />);
    const submitButton = screen.getByText('Upload');
    fireEvent.click(submitButton);
    expect(screen.getByText('Please select a file')).toBeInTheDocument();
  });
});
```

---

### E. Performance Optimization Tips

1. **Database:**
   - Use indexes on foreign keys
   - Implement pagination on list endpoints
   - Use connection pooling

2. **API:**
   - Cache AI responses for identical inputs (Redis)
   - Compress responses (gzip)
   - Use CDN for static assets

3. **Frontend:**
   - Implement lazy loading for large lists
   - Cache API responses (React Query, SWR)
   - Optimize bundle size (Next.js automatic optimization)

---

## Document Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-06 | Initial MVP specification with authentication, session management, complete API documentation |

---

**END OF ARCHITECTURE.md**