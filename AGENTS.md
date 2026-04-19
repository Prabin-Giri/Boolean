# IntervAI Repository Notes

This repository now contains only the IntervAI app under `ai-interview-simulator/`.

## Scope

- `ai-interview-simulator/frontend` is the React + Vite client.
- `ai-interview-simulator/backend` is the FastAPI server.
- Do not assume any legacy monorepo workspaces exist.

## Validation

Before finalizing changes, run the checks relevant to the files you touched.

- Frontend changes: `npm run build:frontend`
- Backend changes: `cd ai-interview-simulator/backend && python -m compileall app run.py`

## Environment

- Frontend API base URL: `VITE_API_URL`
- Backend AI settings: `OPENAI_API_KEY`, `OPENAI_MODEL`
