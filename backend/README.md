# Smart Study Assistant - Backend

The stateless utility backend for transforming academic content into structured study aids.

## 🚀 Quick Start

1. **Setup Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run App**:
   ```bash
   uvicorn app.main:app --reload
   ```

## 📚 Documentation

For complete setup instructions, troubleshooting, and architectural details, please refer to:
- **[Local Development Guide](docs/LOCAL_DEVELOPMENT_GUIDE.md)**: How to set up DB, environment variables, and run tests.
- **[Architecture Guide](ARCHITECTURE_GUIDE.md)**: Deep dive into the feature-based modular design.

## 🛠️ Tech Stack
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [SQLAlchemy](https://www.sqlalchemy.org/)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Linting**: [Ruff](https://beta.ruff.rs/docs/)
- **Formatting**: [Black](https://github.com/psf/black)
- **Testing**: [Pytest](https://docs.pytest.org/)
