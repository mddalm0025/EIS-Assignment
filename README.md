# EIS School Platform

A Django REST API and React dashboard for importing, cleaning, browsing, and correcting Class 6 examination marks. The supplied data uses `EIS-####` admission numbers.

## Stack

- Backend: Python, Django, Django REST Framework, SQLite
- Frontend: React, Vite, Axios

## Project layout

```text
EISAssignment/
├── backend/                 Django project and `marks` application
├── frontend/                React/Vite dashboard
├── students_marks.csv       Source ERP export
├── corrections.json         Batch of valid and invalid corrections
├── apply_corrections.py     Posts the correction batch through the API
└── requirements.txt         Python dependencies
```

## Setup

Prerequisites: Python 3.10+ and Node.js 18+.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py import_marks
python manage.py runserver
```

`import_marks` is re-runnable: it clears the existing students and marks, then imports a clean pre-corrections state. By default it loads the repository's `students_marks.csv`; pass a path to import a different file:

```bash
python manage.py import_marks ..\students_marks.csv
```

In a second terminal, start the UI:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## PostgreSQL and deployment

All deployment settings are environment-driven. Copy `.env.example` to `.env`, replace every placeholder secret, and set the public frontend and backend URLs. Never commit `.env`.

Production defaults enforce HTTPS and enable one-year HSTS. If TLS terminates outside Django, configure `DJANGO_SECURE_SSL_REDIRECT`, `DJANGO_SECURE_HSTS_SECONDS`, and proxy headers to match that platform before exposing the service publicly.
Only set `DJANGO_SECURE_HSTS_PRELOAD=True` after confirming every subdomain is HTTPS-only and eligible for browser preload.

The API selects PostgreSQL automatically whenever `DATABASE_URL` is supplied, for example:

```text
DATABASE_URL=postgresql://eis_user:strong-password@db:5432/eis_assignment
```

To run the API and PostgreSQL together in containers:

```bash
cp .env.example .env
# Edit .env and set DJANGO_SECRET_KEY and POSTGRES_PASSWORD.
docker compose up --build
```

The container runs migrations and resets/imports the source data before starting Gunicorn on port 8000. For a separately deployed frontend, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE_URL` to the public API URL (including `/api`).

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/students/?search=<text>` | List students; optional case-insensitive name search |
| GET | `/api/students/<admission_no>/` | Student profile, per-subject marks, total, and average |
| GET | `/api/summary/` | One-decimal subject averages and top student by total |
| POST | `/api/marks/corrections/` | Validate and replace one mark |

Example correction:

```json
{"admission_no":"EIS-1012","subject":"Maths","marks":88}
```

With the Django server running from the repository root, apply every record in `corrections.json` through the API:

```bash
python apply_corrections.py
```

The script reports six accepted corrections and three rejected invalid records. Import again to reset the database before corrections.

## Data model and cleaning rules

`Student` is keyed by `admission_no`; `Mark` has a foreign key to `Student` and a uniqueness constraint over `(student, subject)`. Marks are nullable, so an absence remains distinct from a zero. Totals and averages are model properties calculated from non-null marks on every request.

The importer title-cases and normalizes whitespace in names, parses all provided date formats into ISO dates, preserves absences, and deduplicates by `(admission_no, subject)`, retaining the highest non-blank mark when duplicate scores conflict.

## Next steps

- Use PostgreSQL and environment-based settings for deployment.
- Add authentication, permissions, and audit history for corrections.
- Add API and UI test coverage plus CI.
