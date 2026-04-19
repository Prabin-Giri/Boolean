# CareerTwin

CareerTwin is a monorepo with two main apps:

- `JobOps`
  A job search, CV tailoring, scoring, and application tracking app.
- `IntervAI`
  An interview practice app with AI-generated questions, answer feedback, and delivery analysis.

## Repository Structure

- `orchestrator/` - JobOps frontend and backend
- `ai-interview-simulator/` - IntervAI frontend and backend
- `shared/` - shared types, schemas, and utilities
- `extractors/` - job-source extractors
- `docs-site/` - documentation site
- `scripts/` - repo utility scripts

## Core Functionality

### JobOps

- Search jobs from multiple sources in one place
- Score jobs against a user profile
- Generate tailored resume drafts and PDFs
- Track jobs through discovered, ready, applied, and in-progress states
- Store user settings, search terms, pipeline runs, and generated artifacts
- Optional Gmail integration for post-application tracking

### IntervAI

- Run mock interview sessions
- Generate and present interview questions
- Record answers and analyze delivery
- Show structured feedback and metrics

## Main Dependencies

### General

- Node.js 22
- npm
- Docker and Docker Compose for the easiest local setup

### JobOps

- Vite
- React
- TypeScript
- Express
- better-sqlite3 / SQLite
- Drizzle ORM
- Tailwind CSS

### IntervAI

- React + Vite frontend
- Python backend with requirements in `ai-interview-simulator/backend/requirements.txt`

## Data Storage

JobOps stores application data on the server side, not in cookies.

- Main app data is stored in SQLite
- Local default database path: `data/jobs.db`
- In Docker, app data is stored through the mounted data directory
- Auth session records are persisted in the database
- The browser may keep short-lived auth/session tokens in `sessionStorage`

## Environment Setup

Create a `.env` file from `.env.example` and fill in the values you need.

Common settings include:

- LLM provider and API key
- Reactive Resume API settings
- Gmail OAuth credentials
- extractor credentials such as Adzuna or UKVisaJobs
- `TECTONIC_BIN` if LaTeX PDF rendering is used

## Quick Start With Docker

```bash
git clone <repo-url>
cd Boolean
cp .env.example .env
docker compose up -d
```

Open:

- JobOps: `http://localhost:3005`

If your local setup is using the Vite dev server instead of Docker, JobOps may run on `http://localhost:5173`.

## Local Development

### Install dependencies

```bash
npm install
```

### Run JobOps

```bash
npm --workspace orchestrator run dev
```

Typical local ports:

- frontend: `5173`
- backend: `3001`

### Run IntervAI frontend

```bash
npm --prefix ai-interview-simulator/frontend install
npm --prefix ai-interview-simulator/frontend run dev
```

### Run IntervAI backend

```bash
cd ai-interview-simulator/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

## Build Commands

### JobOps client build

```bash
npm --workspace orchestrator run build:client
```

### Type checks

```bash
npm run check:types:shared
npm --workspace orchestrator run check:types
```

## Notes

- JobOps does not auto-apply to jobs
- Many integrations are optional and only need configuration if you plan to use them
- The repository includes extra docs and tooling, but the core runtime apps are `orchestrator/` and `ai-interview-simulator/`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

See [LICENSE](./LICENSE).
