# Smart Study Assistant

> AI-powered study companion that transforms your notes into summaries, quizzes, and visual diagrams using Google Gemini API.

Built for the Google Gemini API Hackathon - February 2026

## Features

- **Text Input** - Paste your notes directly
- **PDF Upload** - Extract and analyze PDF documents
- **Image OCR** - Read text from images (optional)
- **AI Summaries** - Get concise or detailed summaries
- **Quiz Generation** - Test your knowledge with auto-generated questions
- **Visual Diagrams** - Understand concepts through Mermaid diagrams

## Architecture

This project uses a **separated frontend/backend architecture** for clean team division:

```
┌─────────────────────┐         ┌─────────────────────┐
│      FRONTEND       │  HTTP   │       BACKEND       │
│   Next.js 14+       │◄──────► │   Flask / Express   │
│   (Deployed on      │  JSON   │   (Deployed on      │
│    Vercel)          │         │    Railway/Render)  │
└─────────────────────┘         └─────────────────────┘
```

## Project Structure

```
smart-study-assistant/
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API client
│   │   ├── hooks/           # Custom hooks
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── backend/                  # Flask or Express API
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   └── utils/           # Helpers & prompts
│   └── requirements.txt     # (or package.json)
│
├── docs/
│   └── ARCHITECTURE.md      # Technical documentation
│
└── README.md
```

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14+ (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Fetch API | API communication |

> Diagrams rendered as images from Gemini (no Mermaid.js needed)

### Backend
| Technology | Purpose |
|------------|---------|
| Flask (Python) OR Express (Node.js) | API server |
| Google Gemini SDK | AI integration |
| PyPDF2 / pdf-parse | PDF extraction |
| Tesseract / pytesseract | OCR (optional) |
| Supabase | Database & storage |

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+ (if using Flask)
- Google Gemini API key
- Supabase account (optional)

### Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Frontend runs at `http://localhost:3000`

### Backend Setup (Flask)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Start server
flask run --port=5000
```

### Backend Setup (Express)

```bash
cd backend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Start server
npm run dev
```

Backend runs at `http://localhost:5000`

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (.env)
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key

# Database (choose one)
DATABASE_URL=postgresql://...
# OR
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key

# Server
PORT=5000
CORS_ORIGINS=http://localhost:5173

# File uploads
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=10485760
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload PDF/image file |
| `/api/extract/pdf` | POST | Extract text from PDF |
| `/api/extract/image` | POST | OCR on uploaded image |
| `/api/ai/summarize` | POST | Generate AI summary |
| `/api/ai/quiz` | POST | Generate quiz questions |
| `/api/ai/diagram` | POST | Generate Mermaid diagram |
| `/api/sessions` | GET/POST | Manage study sessions |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed API specifications.

## Usage

### 1. Input Study Material
- **Text**: Paste notes directly
- **PDF**: Upload a PDF document (max 10MB)
- **Image**: Upload an image with text

### 2. Generate AI Outputs
- **Summarize**: Get brief, detailed, or bullet-point summary
- **Quiz**: Generate 5-20 multiple-choice questions
- **Diagram**: Create visual concept maps

### 3. Study & Review
- Read AI-generated summaries
- Take interactive quizzes
- Explore concept diagrams

## Team Roles

### Frontend Team (2-3 people)
| Role | Responsibilities |
|------|-----------------|
| Frontend Lead | Component architecture, routing, API integration |
| UI Developer | Input components (text, file upload) |
| UI Developer | Output components (summary, quiz, diagrams) |

### Backend Team (2-3 people)
| Role | Responsibilities |
|------|-----------------|
| Backend Lead | API design, Gemini integration, prompts |
| Backend Dev | PDF/OCR extraction, file storage, database |
| Full-Stack | Integration, testing, deployment |

## Development

### Frontend Commands
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run linter
```

### Backend Commands (Flask)
```bash
flask run                    # Start dev server
flask run --debug           # With hot reload
pytest                      # Run tests
```

### Backend Commands (Express)
```bash
npm run dev      # Start with nodemon
npm start        # Production start
npm test         # Run tests
```

## Deployment

### Frontend → Vercel
1. Connect GitHub repo
2. Set `VITE_API_URL` environment variable
3. Deploy

### Backend → Railway/Render
1. Connect GitHub repo
2. Set all environment variables
3. Set start command:
   - Flask: `gunicorn run:app`
   - Express: `npm start`
4. Deploy

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture, data flows, API specs
- [Plan File](~/.claude/plans/) - Hackathon execution plan

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and test
3. Commit: `git commit -m "Add feature"`
4. Push: `git push origin feature/name`
5. Open Pull Request

## License

MIT License

---

Built with enthusiasm for the Google Gemini API Hackathon
