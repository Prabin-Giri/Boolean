# Contributing to IntervAI

## Development

- Frontend: `npm --prefix ai-interview-simulator/frontend run dev`
- Backend: `cd ai-interview-simulator/backend && python run.py`
- Combined dev workspace: `npm run dev`

## Verification

- Frontend build: `npm run build:frontend`
- Backend import smoke test:

```bash
cd ai-interview-simulator/backend
python -m compileall app run.py
```
