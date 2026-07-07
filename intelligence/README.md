# TITAN Intelligence

The AI engine powering intelligent learning features in **TITAN LMS**.

`titan-lms/intelligence` provides AI capabilities including personalized tutoring, content generation, document understanding, and learning assistance using Large Language Models and Retrieval-Augmented Generation.

---

## 🚀 Tech Stack

- Python
- FastAPI
- LangChain
- OpenAI / Gemini
- ChromaDB
- Vector Embeddings
- Retrieval-Augmented Generation (RAG)

---

## 📁 Project Responsibilities

This repository handles:

- AI Tutor
- Question answering
- Course content understanding
- Quiz generation
- Notes generation
- Summarization
- Learning roadmap generation
- Document processing
- Knowledge retrieval
- Prompt management

---

## 🏗️ Architecture

```
TITAN Core
    |
    |
TITAN Intelligence
    |
    |
LLM Provider
(OpenAI/Gemini)

    |
    |
Vector Database
(ChromaDB)
```

---

## 📂 Main Structure

```
app/
    api/             → FastAPI endpoints exposed to titan-core
    agents/          → AI agents (Tutor, Study Planner, Quiz Agent)
    rag/             → Retrieval-Augmented Generation pipeline
    loaders/         → PDF, DOCX, TXT content ingestion
    embeddings/      → Text embedding generation
    vectorstores/    → ChromaDB / vector database management
    chains/          → LangChain pipelines
    prompts/         → Version-controlled LLM prompts
    memory/          → Conversation history and context
    services/        → AI business logic
    tools/           → External AI tools/search functions
```

---

## ⚙️ Environment Setup

Create `.env`:

```env
OPENAI_API_KEY=your_key

LLM_PROVIDER=openai

VECTOR_DATABASE=chroma

CORE_API_URL=http://localhost:8000
```

---

## ▶️ Running Locally

Create environment:

```bash
python -m venv venv
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run service:

```bash
uvicorn app.main:app --reload --port 8001
```

AI service:

```
http://localhost:8001
```

---

## 🔗 Related Services

| Service  | Repository |
| -------- | ---------- |
| Frontend | titan-web  |
| Backend  | titan-core |

---

## 📌 Development Guidelines

- Keep prompts version controlled
- Separate AI logic from API routes
- Optimize retrieval quality
- Monitor AI responses
- Maintain safe and reliable AI behavior

---

## License

Private project — TITAN LMS
