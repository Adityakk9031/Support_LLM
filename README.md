# Support Ticket System

End-to-end support ticket system with Django + DRF, React, PostgreSQL, and Gemini 2.5 Flash Lite classification.

## Quick Start

1. Set your Gemini API key in the environment.

```bash
export GEMINI_API_KEY=your_key_here
```

2. Build and run:

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

## LLM Integration

Model: `gemini-2.5-flash-lite` via Google Generative Language API.

- Endpoint: `POST /api/tickets/classify/`
- Input: `{ "description": "..." }`
- Output: `{ "suggested_category": "...", "suggested_priority": "..." }`

Prompt lives in `backend/tickets/prompts.py`.

The API key is provided via the `GEMINI_API_KEY` environment variable in `docker-compose.yml`.
If the LLM call fails or the key is missing, the system falls back to `general` / `medium` and ticket submission still works.

## Design Notes

- DB-level constraints are enforced via Django `CheckConstraint` in `backend/tickets/models.py`.
- Stats endpoint uses ORM aggregation (`annotate` + `aggregate`) only.
- Frontend debounces classification as the user types and lets them override suggestions.
