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

## Setup & Run Locally

1. Clone repo:

```bash
git clone <repo_url>
cd backend```
# Install Poetry if not installed
curl -sSL https://install.python-poetry.org | python3 -

# Setup

## Install Poetry if not installed(Recommened if you complete linux environmen)
```curl -sSL https://install.python-poetry.org | python3 -```

# Install dependencies
poetry install

# Activate virtual environment
poetry shell

## OR pip(Recommended if you are in a windows environment or a partial linux environment)
```python -m venv venv
source venv/bin/activate```   # Linux
```venv\Scripts\activate```    # Windows
```pip install -r requirements.txt```

3.Create .env file

GEMINI_API_KEY=GEMINI_API_KEY
PORT=8000
CORS_ORIGINS=http://localhost:5173

4.Run the server

```uvicorn app.main:app --reload --port 8000```
