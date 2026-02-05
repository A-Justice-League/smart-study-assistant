# Smart Study Assistant - Technical Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                       │
│                       Next.js 14+ (App Router)                           │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐               │
│  │  Landing  │ │   Study   │ │  History  │ │  Results  │               │
│  │   Page    │ │ Workspace │ │   Page    │ │   View    │               │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘               │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    React Components                             │     │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │     │
│  │  │  Input  │  │ Output  │  │ Layout  │  │   UI    │           │     │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│                     API Client (fetch)                                   │
│                              │                                           │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
                          HTTP/REST
                          (JSON)
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                        │
│                   Flask (Python) or Express (Node.js)                     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                         Routes Layer                             │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │     │
│  │  │  Upload  │ │ Extract  │ │    AI    │ │ Sessions │           │     │
│  │  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │           │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                              │                                            │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                       Services Layer                             │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │     │
│  │  │ Storage  │ │   PDF    │ │  Gemini  │ │ Session  │           │     │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │           │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│         │              │              │              │                    │
└─────────┼──────────────┼──────────────┼──────────────┼───────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
     ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
     │  File   │    │  PyPDF  │    │ Gemini  │    │ Supabase│
     │ Storage │    │Tesseract│    │   API   │    │   DB    │
     └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## Data Flow Diagrams

### Flow 1: Text Input → Summary + Quiz

```
User types notes in frontend
              │
              ▼
┌──────────────────────┐
│    TextInput.tsx     │
│    (React Component) │
└──────────┬───────────┘
           │ { content, style }
           ▼
┌──────────────────────┐
│   API Client (axios) │
│   POST /api/ai/      │
│      summarize       │
└──────────┬───────────┘
           │ HTTP Request
           ▼
═══════════════════════════════════════════  (Network Boundary)
           │
           ▼
┌──────────────────────┐
│   Backend Route      │
│   /api/ai/summarize  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐     ┌──────────────────────┐
│   GeminiService      │────▶│   Google Gemini API  │
│   - Build prompt     │     │   (External Service) │
│   - Call API         │◀────│                      │
│   - Parse response   │     └──────────────────────┘
└──────────┬───────────┘
           │ { summary, keyPoints }
           ▼
┌──────────────────────┐
│   Return JSON        │
│   Response           │
└──────────┬───────────┘
           │
═══════════════════════════════════════════  (Network Boundary)
           │
           ▼
┌──────────────────────┐
│   SummaryCard.tsx    │
│   (Display Result)   │
└──────────────────────┘
```

### Flow 2: PDF Upload → Processing

```
User uploads PDF
        │
        ▼
┌────────────────┐      ┌────────────────┐
│  FileUpload    │─────▶│  API Client    │
│  Component     │      │  POST /upload  │
└────────────────┘      └───────┬────────┘
                                │ multipart/form-data
                                ▼
                   ═════════════════════════════
                                │
                                ▼
                   ┌────────────────────────┐
                   │  Upload Route          │
                   │  /api/upload           │
                   └───────────┬────────────┘
                               │
                               ▼
                   ┌────────────────────────┐
                   │  StorageService        │
                   │  - Validate file       │
                   │  - Save to disk/cloud  │
                   │  - Return URL          │
                   └───────────┬────────────┘
                               │ { fileUrl, fileId }
                               ▼
                   ═════════════════════════════
                               │
                               ▼
        Frontend receives URL, calls /api/extract/pdf
                               │
                               ▼
                   ┌────────────────────────┐
                   │  Extract Route         │
                   │  /api/extract/pdf      │
                   └───────────┬────────────┘
                               │
                               ▼
                   ┌────────────────────────┐
                   │  PDFService            │
                   │  - Fetch file          │
                   │  - Extract text        │
                   │  - Return content      │
                   └───────────┬────────────┘
                               │ { text, pageCount }
                               ▼
                   Frontend calls /api/ai/summarize
                   (same as Flow 1)
```

### Flow 3: Quiz Interaction State Machine

```
┌──────────────────────────────────────────────────────────────────────┐
│                        QuizCard Component                             │
│                                                                       │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐    │
│   │ Loading │─────▶│ Active  │─────▶│Answered │─────▶│  Done   │    │
│   │  State  │      │  State  │      │  State  │      │  State  │    │
│   └─────────┘      └────┬────┘      └────┬────┘      └────┬────┘    │
│        │                │                │                 │         │
│        │                ▼                ▼                 ▼         │
│        │         ┌───────────┐    ┌───────────┐     ┌───────────┐   │
│        │         │  Display  │    │   Show    │     │   Final   │   │
│        │         │ Question  │    │Explanation│     │   Score   │   │
│        │         └───────────┘    └───────────┘     └───────────┘   │
│        │                │                                            │
│        ▼                ▼                                            │
│  ┌──────────┐    ┌──────────┐                                       │
│  │  Fetch   │    │  Select  │                                       │
│  │   Quiz   │    │  Answer  │                                       │
│  │  from    │    │  Option  │                                       │
│  │  Backend │    └──────────┘                                       │
│  └──────────┘                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Component Architecture

### Component Hierarchy

```
App (Next.js App Router)
├── layout.tsx (Root Layout)
│   ├── Header
│   │   ├── Logo
│   │   └── Navigation
│   │
│   ├── Sidebar (optional)
│   │   └── HistoryList
│   │
│   ├── {children} (Page Content)
│   │   ├── page.tsx (/)
│   │   │   ├── Hero
│   │   │   ├── Features
│   │   │   └── CTA
│   │   │
│   │   ├── study/page.tsx (/study)
│   │   │   ├── InputSection
│   │   │   │   ├── TabSelector
│   │   │   │   ├── TextInput
│   │   │   │   ├── PDFUploader
│   │   │   │   └── ImageUploader
│   │   │   │
│   │   │   ├── ActionButtons
│   │   │   │   ├── SummarizeBtn
│   │   │   │   ├── QuizBtn
│   │   │   │   └── DiagramBtn
│   │   │   │
│   │   │   └── OutputSection
│   │   │       ├── OutputTabs
│   │   │       ├── SummaryCard
│   │   │       ├── QuizCard
│   │   │       │   └── QuizQuestion (×n)
│   │   │       └── DiagramImage
│   │   │
│   │   ├── history/page.tsx (/history)
│   │   │   ├── SessionList
│   │   │   └── SessionDetail
│   │   │
│   │   └── not-found.tsx (404)
│   │
│   └── Footer
│
└── Providers (in layout.tsx)
    └── ToastProvider
```

### State Management

```typescript
// Local Component State (useState)
- Form inputs
- UI toggles (loading, error, tabs)
- Quiz answers

// Lifted State (Context or props)
interface StudyState {
  inputType: 'text' | 'pdf' | 'image';
  content: string;
  fileUrl: string | null;

  // AI outputs
  summary: Summary | null;
  quiz: Quiz | null;
  diagram: Diagram | null;

  // Status
  isLoading: boolean;
  error: string | null;
}

// Server State (React Query recommended)
- Session history
- Cached AI responses
```

---

## Backend Architecture

### Flask Structure (Python)

```
backend/
├── app/
│   ├── __init__.py         # App factory
│   │   def create_app():
│   │       app = Flask(__name__)
│   │       app.config.from_object(Config)
│   │       CORS(app)
│   │       register_routes(app)
│   │       return app
│   │
│   ├── config.py           # Configuration
│   │   class Config:
│   │       GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
│   │       UPLOAD_FOLDER = './uploads'
│   │       MAX_CONTENT_LENGTH = 10 * 1024 * 1024
│   │
│   ├── routes/
│   │   ├── __init__.py     # Route registration
│   │   │
│   │   ├── upload.py
│   │   │   @bp.route('/upload', methods=['POST'])
│   │   │   def upload_file():
│   │   │       # Handle file upload
│   │   │
│   │   ├── extract.py
│   │   │   @bp.route('/extract/pdf', methods=['POST'])
│   │   │   def extract_pdf():
│   │   │       # Extract text from PDF
│   │   │
│   │   ├── ai.py
│   │   │   @bp.route('/ai/summarize', methods=['POST'])
│   │   │   @bp.route('/ai/quiz', methods=['POST'])
│   │   │   @bp.route('/ai/diagram', methods=['POST'])
│   │   │
│   │   └── sessions.py
│   │       @bp.route('/sessions', methods=['GET', 'POST'])
│   │       @bp.route('/sessions/<id>', methods=['GET'])
│   │
│   ├── services/
│   │   ├── gemini_service.py
│   │   │   class GeminiService:
│   │   │       def summarize(content, style) -> dict
│   │   │       def generate_quiz(content, count, difficulty) -> dict
│   │   │       def generate_diagram(content, type) -> dict
│   │   │
│   │   ├── pdf_service.py
│   │   │   class PDFService:
│   │   │       def extract_text(file_path) -> str
│   │   │
│   │   ├── ocr_service.py
│   │   │   class OCRService:
│   │   │       def extract_text(image_path) -> str
│   │   │
│   │   └── storage_service.py
│   │       class StorageService:
│   │           def save_file(file) -> str
│   │           def get_file_url(file_id) -> str
│   │
│   ├── models/
│   │   ├── session.py      # Session data model
│   │   └── quiz.py         # Quiz data model
│   │
│   └── utils/
│       ├── prompts.py      # Gemini prompts
│       └── validators.py   # Input validation
│
├── tests/
├── requirements.txt
├── run.py
└── .env.example
```

### Express Structure (Node.js)

```
backend/
├── src/
│   ├── index.ts            # Entry point
│   │   const app = express();
│   │   app.use(cors());
│   │   app.use(express.json());
│   │   app.use('/api', routes);
│   │   app.listen(PORT);
│   │
│   ├── config.ts           # Configuration
│   │
│   ├── routes/
│   │   ├── index.ts        # Route aggregator
│   │   ├── upload.routes.ts
│   │   ├── extract.routes.ts
│   │   ├── ai.routes.ts
│   │   └── sessions.routes.ts
│   │
│   ├── services/
│   │   ├── gemini.service.ts
│   │   ├── pdf.service.ts
│   │   ├── ocr.service.ts
│   │   └── storage.service.ts
│   │
│   ├── models/
│   │   ├── session.model.ts
│   │   └── quiz.model.ts
│   │
│   └── utils/
│       ├── prompts.ts
│       └── validators.ts
│
├── tests/
├── package.json
├── tsconfig.json
└── .env.example
```

---

## API Specifications

### Standard Response Format

```typescript
// Success Response
{
  success: true,
  data: { ... }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: object
  }
}
```

### POST /api/upload

```typescript
// Request
Content-Type: multipart/form-data
Body: {
  file: File,                    // PDF or Image
  type: "pdf" | "image"
}

// Response (200)
{
  success: true,
  data: {
    fileId: string,              // UUID
    fileName: string,
    fileUrl: string,
    fileType: string,
    size: number,
    uploadedAt: string
  }
}

// Errors
// 400: INVALID_FILE_TYPE, FILE_TOO_LARGE
// 500: UPLOAD_FAILED
```

### POST /api/extract/pdf

```typescript
// Request
{
  fileUrl: string,
  fileId: string
}

// Response (200)
{
  success: true,
  data: {
    text: string,
    pageCount: number,
    wordCount: number
  }
}

// Errors
// 400: INVALID_PDF
// 500: EXTRACTION_FAILED
```

### POST /api/ai/summarize

```typescript
// Request
{
  content: string,               // Min 50 chars, max 100,000
  style: "brief" | "detailed" | "bullet-points"
}

// Response (200)
{
  success: true,
  data: {
    summary: string,
    keyPoints: string[],         // 3-7 items
    topics: string[],
    wordCount: number,
    generatedAt: string
  }
}

// Errors
// 400: CONTENT_TOO_SHORT, CONTENT_TOO_LONG
// 429: RATE_LIMITED
// 500: AI_ERROR
```

### POST /api/ai/quiz

```typescript
// Request
{
  content: string,
  questionCount: number,         // 5-20
  difficulty: "easy" | "medium" | "hard",
  questionTypes?: string[]       // ["multiple-choice", "true-false"]
}

// Response (200)
{
  success: true,
  data: {
    quiz: {
      id: string,
      title: string,
      questions: [
        {
          id: string,
          type: "multiple-choice" | "true-false",
          question: string,
          options?: string[],    // For multiple-choice
          correctAnswer: number | boolean,
          explanation: string,
          difficulty: string
        }
      ],
      totalQuestions: number
    }
  }
}
```

### POST /api/ai/diagram

```typescript
// Request
{
  content: string,
  diagramType: "flowchart" | "mindmap" | "concept-map"
}

// Response (200)
{
  success: true,
  data: {
    title: string,
    imageUrl: string,            // Base64 data URL or hosted image URL
    explanation: string
  }
}
```

> **Note:** Gemini generates images directly. Frontend renders with `<Image src={imageUrl} />`

---

## Gemini Prompt Templates

### Summarization Prompt

```python
# Python (Flask)
def get_summarize_prompt(content: str, style: str) -> str:
    return f"""
You are an expert educational content summarizer helping students learn efficiently.

TASK: Create a {style} summary of the following study material.

GUIDELINES:
- Focus on key concepts, definitions, and important facts
- Preserve technical terms and their meanings
- Highlight relationships between concepts
- Use clear, student-friendly language
- For "brief": 2-3 paragraphs maximum
- For "detailed": Comprehensive coverage with sections
- For "bullet-points": Organized hierarchical bullet list

OUTPUT FORMAT (JSON):
{{
  "summary": "The main summary text...",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "topics": ["Topic 1", "Topic 2"]
}}

CONTENT TO SUMMARIZE:
---
{content}
---

Respond ONLY with valid JSON, no additional text.
"""
```

### Quiz Generation Prompt

```python
def get_quiz_prompt(content: str, count: int, difficulty: str) -> str:
    return f"""
You are an expert educator creating assessment questions.

TASK: Generate {count} quiz questions at {difficulty} difficulty level.

REQUIREMENTS:
- Mix of multiple-choice (4 options) and true-false questions
- Test understanding, not just memorization
- Each question must have clear correct answer
- Provide explanation for each answer

OUTPUT FORMAT (JSON):
{{
  "title": "Quiz on [Main Topic]",
  "questions": [
    {{
      "id": "q1",
      "type": "multiple-choice",
      "question": "What is...",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": 0,
      "explanation": "This is correct because...",
      "difficulty": "{difficulty}"
    }},
    {{
      "id": "q2",
      "type": "true-false",
      "question": "Statement to evaluate",
      "correctAnswer": true,
      "explanation": "This is true because..."
    }}
  ]
}}

CONTENT:
---
{content}
---

Respond ONLY with valid JSON.
"""
```

### Diagram Generation (Image)

Gemini can generate images directly using its multimodal capabilities:

```python
# Python (Flask) - Using Gemini's image generation
from google import genai

def generate_diagram_image(content: str, diagram_type: str) -> dict:
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

    prompt = f"""
    Create a clear, educational {diagram_type} diagram that visualizes the key concepts
    and relationships from this study material:

    {content}

    The diagram should:
    - Be visually clean and easy to understand
    - Show main concepts as nodes/boxes
    - Show relationships with labeled arrows
    - Use a light background suitable for studying
    - Include a title at the top
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",  # or model with image generation
        contents=prompt,
        config={"response_modalities": ["image", "text"]}
    )

    # Extract image from response
    for part in response.candidates[0].content.parts:
        if part.inline_data:
            image_data = part.inline_data.data
            mime_type = part.inline_data.mime_type
            return {
                "imageUrl": f"data:{mime_type};base64,{image_data}",
                "title": f"{diagram_type.title()} Diagram",
                "explanation": "Visual representation of key concepts"
            }
```

Frontend renders with Next.js Image component:
```tsx
<Image
  src={diagram.imageUrl}
  alt={diagram.title}
  width={800}
  height={600}
/>
```

---

## Database Schema

```sql
-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    input_type VARCHAR(20) NOT NULL,  -- 'text', 'pdf', 'image'
    content TEXT,
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Summaries table
CREATE TABLE summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    key_points JSONB,
    style VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    title VARCHAR(255),
    questions JSONB NOT NULL,
    difficulty VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score INTEGER,
    completed_at TIMESTAMP DEFAULT NOW()
);

-- Diagrams table
CREATE TABLE diagrams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    mermaid_code TEXT NOT NULL,
    diagram_type VARCHAR(20),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX idx_summaries_session ON summaries(session_id);
CREATE INDEX idx_quizzes_session ON quizzes(session_id);
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_INPUT | 400 | Malformed request body |
| CONTENT_TOO_SHORT | 400 | Content less than 50 characters |
| CONTENT_TOO_LONG | 400 | Content exceeds 100,000 characters |
| INVALID_FILE_TYPE | 400 | Unsupported file format |
| FILE_TOO_LARGE | 400 | File exceeds 10MB limit |
| EXTRACTION_FAILED | 500 | PDF/OCR extraction error |
| AI_ERROR | 500 | Gemini API error |
| PARSE_ERROR | 500 | Failed to parse AI response |
| RATE_LIMITED | 429 | Too many requests |
| NOT_FOUND | 404 | Resource not found |
| INTERNAL_ERROR | 500 | Unexpected server error |

### Error Response Handler (Flask)

```python
from flask import jsonify

class APIError(Exception):
    def __init__(self, code: str, message: str, status: int = 400):
        self.code = code
        self.message = message
        self.status = status

@app.errorhandler(APIError)
def handle_api_error(error):
    return jsonify({
        'success': False,
        'error': {
            'code': error.code,
            'message': error.message
        }
    }), error.status
```

### Error Response Handler (Express)

```typescript
interface APIError extends Error {
  code: string;
  status: number;
}

app.use((err: APIError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message
    }
  });
});
```

---

## CORS Configuration

### Flask

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    'http://localhost:5173',      # Vite dev server
    'http://localhost:3000',      # Next.js dev server
    'https://your-frontend.com'   # Production
])
```

### Express

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-frontend.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Security Considerations

### Input Validation

```python
# Flask example
def validate_content(content: str):
    if not content or len(content.strip()) < 50:
        raise APIError('CONTENT_TOO_SHORT', 'Minimum 50 characters required')
    if len(content) > 100000:
        raise APIError('CONTENT_TOO_LONG', 'Maximum 100,000 characters allowed')

def validate_file(file):
    allowed_types = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
    if file.content_type not in allowed_types:
        raise APIError('INVALID_FILE_TYPE', 'Only PDF and image files allowed')
    if file.content_length > 10 * 1024 * 1024:
        raise APIError('FILE_TOO_LARGE', 'Maximum file size is 10MB')
```

### Environment Variables

```bash
# Backend .env (NEVER commit)
GEMINI_API_KEY=your_key_here
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=your_key_here
CORS_ORIGINS=http://localhost:5173,https://your-frontend.com
```

---

## Deployment

### Frontend (Vercel)

1. Connect GitHub repo
2. Set environment variables:
   - `VITE_API_URL=https://your-backend.com/api`
3. Deploy

### Backend (Railway/Render)

1. Connect GitHub repo
2. Set environment variables (all from .env)
3. Set start command:
   - Flask: `gunicorn run:app`
   - Express: `npm start`
4. Deploy

### Deployment Checklist

- [ ] Environment variables set in all environments
- [ ] CORS configured for production domains
- [ ] Database migrations run
- [ ] File storage configured (Supabase/S3)
- [ ] Error monitoring set up (optional: Sentry)
- [ ] Rate limiting configured
- [ ] SSL certificates active
