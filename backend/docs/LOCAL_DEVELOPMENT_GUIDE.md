# Local Development Setup Guide

Welcome to the **Smart Study Assistant** backend team! This guide will walk you through setting up your local environment on WSL (Ubuntu) and getting the project running.

## 🚀 Prerequisites

Ensure you have the following installed on your WSL Ubuntu instance:
- **Python 3.12+**
- **Git**
- **PostgreSQL 15+** (Running locally or via Docker)

---

## 🛠️ Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone <repo-url>
cd smart-study-assistant/backend
```

### 2. Environment Setup
Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Environment Variables
Copy the template and update the values for your local machine:
```bash
cp .env.example .env
```
> [!IMPORTANT]
> Change the `SECRET_KEY` in `.env` to a secure random string.

### 4. Database Setup
Ensure PostgreSQL is running, then create the database:
```bash
# In your terminal
sudo service postgresql start
sudo -u postgres psql -c "CREATE DATABASE smart_study_db;"
```

### 5. Run Migrations
Apply the existing database schema via Alembic:
```bash
alembic upgrade head
```

### 6. Start the Server
Launch the FastAPI application using Uvicorn:
```bash
uvicorn app.main:app --reload
```

- **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🧪 Quality Control

### Running Tests
We use `pytest` for automated testing:
```bash
pytest
```

### Linting & Formatting
Ensure your code follows project standards before committing:
```bash
# Linting
ruff check .

# Formatting
black .
```

---

## 🧱 Feature-Based Workflow

This project follows a **Feature-Based Modular Architecture**. When implementing a new feature:

1.  **Create a Folder**: `app/api/v1/features/<feature_name>/`
2.  **Add Files**:
    - `routes.py`: Endpoints
    - `services.py`: Business logic
    - `crud.py`: Database queries
    - `models.py`: Database models
    - `schemas.py`: Pydantic models
3.  **Register Router**: Mount your new feature router in `app/api/v1/router.py`.

> [!TIP]
> Refer to the [ARCHITECTURE_GUIDE.md](../ARCHITECTURE_GUIDE.md) for a deeper deep dive into this pattern.

---

## 🧑‍💻 Contribution Guide

- **Branch Naming**: `feat/feature-name` or `fix/bug-description`.
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
- **PRs**: Keep them small and focused on a single feature or fix.

---

## 🔍 Verification Checklist

- [ ] `uvicorn` starts without errors.
- [ ] `/docs` page is accessible.
- [ ] `pytest` passes all tests.
- [ ] `ruff` and `black` report no issues.
- [ ] Database connection is successful.
