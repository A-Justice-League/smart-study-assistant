# Smart Study Assistant Backend

This is the FastAPI backend for the Smart Study Assistant application.

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Pip
- Supabase Account (Optional for mock mode)
- Google Gemini API Key (Optional for mock AI)

### Installation

1. Clone the repository and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your API keys.

### Running the Server

Start the development server with hot reload:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
API Documentation (Swagger UI) is available at `http://localhost:8000/docs`.

### Running Tests

```bash
pytest
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/v1/         # API Routes
│   ├── core/           # Config, Logging, Errors
│   ├── db/             # Database Client & Repositories
│   ├── schemas/        # Pydantic Models
│   ├── services/       # Business Logic (AI, PDF, Storage)
│   └── utils/          # Helper functions
├── tests/              # Test Suite
├── .env.example        # Environment Template
├── main.py             # App Entry Point
└── requirements.txt    # Python Dependencies
```
