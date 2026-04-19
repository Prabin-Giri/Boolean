# INTERVAI

INTERVAI is a full-stack mock interview app that lets a user answer interview questions through webcam and microphone, analyze delivery quality, and review a final feedback dashboard with scores.

## What is included

- React frontend with setup, interview room, and results dashboard
- FastAPI backend with session creation, question seeding, answer upload, scoring, and results aggregation
- Browser webcam and microphone capture using `getUserMedia` and `MediaRecorder`
- Browser speech-recognition fallback that sends transcript hints to the backend
- Starter scoring logic for communication, confidence, clarity, relevance, and eye contact

## Project structure

```txt
frontend/
backend/
README.md
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs by default on `http://localhost:5173`.

If your API is not on the default backend URL, create a `.env` file in `frontend/`:

```bash
VITE_API_URL=http://localhost:8000
```

## Backend setup

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

Backend runs by default on `http://localhost:8000`.

To enable AI-generated, career-specific interview questions, export an OpenAI API key before starting the backend:

```bash
export OPENAI_API_KEY="your_api_key_here"
```

Optional model override:

```bash
export OPENAI_MODEL="gpt-5-mini"
```

## Current backend behavior

The backend is ready for the product flow and already attempts real file-based analysis if the optional ML packages are installed:

- Transcription tries Whisper first, then falls back to the `transcript_hint` sent from the frontend
- Eye contact tries MediaPipe + OpenCV first, then falls back to a starter placeholder score
- Emotion analysis tries FER + OpenCV first, then falls back to a starter placeholder summary

Optional transcription dependency:

```bash
cd backend
source venv/bin/activate
pip install -r requirements-optional.txt
```

## Next upgrades

Replace the stub services with production analysis:

- `backend/app/services/transcription_service.py`
  Add Whisper-based audio transcription
- `backend/app/services/eye_contact_service.py`
  Add MediaPipe face mesh + gaze estimation
- `backend/app/services/emotion_service.py`
  Add FER or DeepFace frame sampling

## Main API endpoints

- `POST /session/start`
- `GET /session/{id}`
- `GET /session/{id}/results`
- `POST /answer/upload`
- `POST /score/session/{id}`
- `GET /questions`
- `GET /health`

## Demo flow

1. Open the frontend
2. Start a session from setup
3. Allow camera and microphone permissions
4. Record an answer
5. Submit the answer for scoring
6. Move through the questions
7. Review the results dashboard

## Notes

- The easiest stable MVP demo is post-answer analysis rather than true live streaming analysis.
- Browser speech recognition support depends on the browser. Chrome-derived browsers tend to work best.
- SQLite is used for simplicity and local demos.
