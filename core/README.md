# TITAN Core

The main backend service powering **TITAN LMS**.

`titan-lms/core` is responsible for the core business logic, authentication, database operations, APIs, and communication between the frontend and AI services.

---

## 🚀 Tech Stack

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT Authentication
- Pydantic

---

## 📁 Project Responsibilities

This repository handles:

- User authentication and authorization
- User management
- Course management
- Lesson management
- Enrollment system
- Assignments
- Quizzes
- Student progress tracking
- Analytics
- File management
- Database operations
- API development

---

## 🏗️ Architecture

```
TITAN Web
    |
    |
TITAN Core
(FastAPI)
    |
    |
PostgreSQL Database

    |
    |
TITAN Intelligence
(AI Service)
```

---

## 📂 Main Structure

```
app/
│
├── api/             → HTTP routes/controllers
├── core/            → settings, security, application config
├── db/              → database connection/session
├── models/          → SQLAlchemy database models
├── schemas/         → Pydantic request/response models
├── services/        → business logic
├── repositories/    → database access layer
├── dependencies/    → FastAPI dependency injection
├── middleware/      → CORS, logging, request middleware
└── utils/           → reusable helper functions
```

---

## ⚙️ Environment Setup

Create `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost/titan
SECRET_KEY=your_secret_key

AI_SERVICE_URL=http://localhost:8001
```

---

## ▶️ Running Locally

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

Linux/Mac:

```bash
source venv/bin/activate
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
alembic upgrade head
```

Start server:

```bash
uvicorn app.main:app --reload
```

API will run at:

```
http://localhost:8000
```

Documentation:

```
http://localhost:8000/docs
```

---

## 🔗 Related Services

| Service   | Repository         |
| --------- | ------------------ |
| Frontend  | titan-web          |
| AI Engine | titan-intelligence |

---

## 📌 Development Guidelines

- Keep business logic inside services
- Use repositories for database access
- Follow REST API standards
- Write tests for new features
- Keep database migrations organized

---

## License

Private project — TITAN LMS
