# Deployment Notes

## Frontend: Vercel

Set:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url
```

Build command:

```bash
npm run build
```

Deploy the `frontend/` directory.

## Backend: Render

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

```env
FRONTEND_ORIGIN=https://your-frontend-url
PRODUCTION_FRONTEND_ORIGIN=https://your-frontend-url
DATABASE_URL=sqlite:///./guestops.db
OPENAI_API_KEY=
GEMINI_API_KEY=
```

Deploy the `backend/` directory.

## Local Demo

Backend:

```bash
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

## Submission Warning

Do not submit a localhost URL as the live demo. Deploy the frontend and backend first, then add the public links to the README.
