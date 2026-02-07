# Smart Study Assistant - Backend

AI-powered backend that converts notes into **summaries, quizzes, and diagrams** using the **Google Gemini API**.  
Stateless, fast, and designed for hackathon use.

---

## Features

- Upload PDFs → extract text  
- Paste notes → AI summaries (brief, detailed, bullet-points)  
- Generate quizzes (MCQs) from content  
- Generate AI diagrams (flowchart, mindmap, concept-map)  

---

## Tech Stack

- **Python 3.11**, **FastAPI**, **pdfplumber**  
- **Google Gemini API** for AI content  
- **Poetry / pip**, **Black**, **isort**, **flake8**, **mypy** for dev tools  

---

## To Setup & Run Locally, Python3.11.x is highly recommended

1. Clone repo:

```bash
git clone <repo_url>
cd backend```

# Setup

## Install Poetry if not available(Recommened if you complete linux environment)
```curl -sSL https://install.python-poetry.org | python3 -```
### Add poetry to the system path if not done automatically

### Activate virtual environment
```poetry env activate``` # prints the command you must run to activate the environment

### After activating the environment run
```poetry lock``` # To create the poetry.lock file

### Install dependencies
```poetry install``` # Installs all dependencies specified in pyproject.toml


## OR pip(Recommended if you are in a windows environment or a partial linux environment)
```python -m venv venv source venv/bin/activate``` # Linux
```venv\Scripts\activate```    # Windows
```pip install -r requirements.txt```

3. Create .env file

GEMINI_API_KEY=GEMINI_API_KEY
PORT=8000
CORS_ORIGINS=http://localhost:5173

4.Run the server

```uvicorn app.main:app --reload --port 8000```

# Sending Requests

### API Endpoints Definations

Summarize → POST http://127.0.0.1:8000/api/ai/summarize

Quiz → POST http://127.0.0.1:8000/api/ai/quiz

Diagram → POST http://127.0.0.1:8000/api/ai/diagram

Upload → POST http://127.0.0.1:8000/api/upload
