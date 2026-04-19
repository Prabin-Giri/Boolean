# IntervAI

IntervAI is a full-stack mock interview app for practicing interview sessions, recording answers, and reviewing AI-assisted feedback.

## Repository Layout

- `ai-interview-simulator/frontend` - React + Vite frontend
- `ai-interview-simulator/backend` - FastAPI backend
- `scripts/dev-workspace.mjs` - starts the frontend and backend together

## Requirements

- Node.js 22+
- npm
- Python 3.11+

## Local Setup

### Frontend

```bash
npm --prefix ai-interview-simulator/frontend install
npm --prefix ai-interview-simulator/frontend run dev
```

The frontend runs on `http://localhost:4173` when started through the root dev script, or Vite's default port when started directly.

### Backend

```bash
cd ai-interview-simulator/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

The backend runs on `http://localhost:8000`.

## Root Convenience Commands

```bash
npm run dev
npm run dev:frontend
npm run build:frontend
```

## Environment Variables

Frontend:

- `VITE_API_URL` - backend base URL, defaults to `http://localhost:8000`

Backend:

- `OPENAI_API_KEY` - enables AI-generated interview questions
- `OPENAI_MODEL` - optional model override, defaults to `gpt-5-mini`

See [.env.example](/Users/kushalbhattarai/Desktop/Ankit%20vai/Boolean/.env.example) for starter values.
