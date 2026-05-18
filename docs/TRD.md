# Technical Requirements Document

## Stack

Frontend:

- Next.js App Router
- TypeScript
- Tailwind CSS
- custom shadcn-style components
- Recharts
- Lucide icons

Backend:

- FastAPI
- Pydantic v2
- SQLAlchemy
- SQLite
- pytest and FastAPI TestClient

Data:

- JSON seed files for synthetic properties, KB chunks, reservations, scenarios, expectations, and agent versions
- SQLite for generated runs, traces, evals, failures, and comparisons

## Architecture

```text
Seed Data -> Scenario API -> Agent Runner -> Simulated Tools
          -> SQLite Persistence -> Eval Engine -> Frontend Cockpit
```

## Backend Modules

- `app/api`: FastAPI route handlers.
- `app/agents`: deterministic baseline and guarded agents.
- `app/tools`: simulated reservation, KB, case, handoff, and logging tools.
- `app/evals`: deterministic scoring logic.
- `app/models`: SQLAlchemy persistence models.
- `app/schemas`: Pydantic response and request schemas.
- `app/seed`: JSON seed data.

## API Surface

- `GET /api/health`
- `GET /api/scenarios`
- `GET /api/scenarios/{scenario_id}`
- `GET /api/properties`
- `GET /api/reservations/{booking_id}`
- `POST /api/runs`
- `GET /api/runs/{run_id}`
- `GET /api/runs/{run_id}/trace`
- `GET /api/runs/{run_id}/report`
- `POST /api/compare`
- `POST /api/demo/best`
- `GET /api/evals/summary`

## Agent Design

The baseline agent is deliberately plausible but unsafe. It may sound helpful while implying compensation, skipping handoff, or answering without enough tool support.

The guarded agent produces a structured decision object, calls required tools, respects policy boundaries, escalates when needed, and admits missing data.

## Persistence

SQLite stores generated artifacts:

- agent runs
- tool calls
- retrieved contexts
- eval results
- failure modes
- comparison results

`Base.metadata.create_all()` is used for MVP setup. Alembic is intentionally not included yet.

## LLM Interfaces

The MVP works without API keys. Optional OpenAI or Gemini provider interfaces can be added later without changing the frontend flow.
