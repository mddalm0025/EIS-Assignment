# EIS School Platform

A Django REST API paired with a React dashboard for importing, cleaning, browsing, and correcting Class 6 exam marks. It's built around the `EIS-####` admission numbers used in the supplied ERP export.

## Stack

- **Backend:** Python, Django, Django REST Framework, SQLite
- **Frontend:** React, Vite, Axios

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

## Getting started

You'll need Python 3.10+ and Node.js 18+ installed.

Set up the backend first:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py import_marks
python manage.py runserver
```

`import_marks` is safe to run more than once — it clears out any existing students and marks, then reimports a clean, pre-corrections state. By default it reads the repo's `students_marks.csv`, but you can point it at a different file:

```bash
python manage.py import_marks ..\students_marks.csv
```

Then, in a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints in the terminal (usually `http://localhost:5173`).

## PostgreSQL and deployment

Deployment settings are all environment-driven. Copy `.env.example` to `.env`, swap in real values for every placeholder secret, and set the public frontend and backend URLs. Don't commit `.env`.

Production defaults enforce HTTPS and turn on a one-year HSTS policy. If TLS is terminated outside Django (e.g. by a load balancer or reverse proxy), make sure `DJANGO_SECURE_SSL_REDIRECT`, `DJANGO_SECURE_HSTS_SECONDS`, and the proxy headers are configured to match before you expose the service publicly. Only turn on `DJANGO_SECURE_HSTS_PRELOAD=True` once every subdomain is confirmed HTTPS-only and eligible for browser preload.

The API switches to PostgreSQL automatically as soon as `DATABASE_URL` is set, for example:

```text
DATABASE_URL=postgresql://eis_user:strong-password@db:5432/eis_assignment
```

To run the API and PostgreSQL together in containers:

```bash
cp .env.example .env
# Edit .env and set DJANGO_SECRET_KEY and POSTGRES_PASSWORD.
docker compose up --build
```

On startup, the container runs migrations and resets/imports the source data before bringing up Gunicorn on port 8000. If you're deploying the frontend separately, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE_URL` to the public API URL (including the `/api` suffix).

### Deploying to Render

`render.yaml` provisions a free Docker web service plus a free Render PostgreSQL database in Singapore. Create a Render Blueprint from the GitHub repo and Render takes care of the rest — it generates `DJANGO_SECRET_KEY`, wires up `DATABASE_URL`, runs migrations and the import, and deploys the API. Once the API has its public URL, set `VITE_API_BASE_URL` to `<api-url>/api` when you deploy the React frontend as a Render Static Site.

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

With the Django server running from the repo root, you can apply every record in `corrections.json` through the API in one go:

```bash
python apply_corrections.py
```

The script reports six accepted corrections and three rejected invalid records. Re-run `import_marks` if you want to reset the database before applying corrections again.

## Data model and cleaning rules

`Student` is keyed by `admission_no`. `Mark` has a foreign key to `Student` and a uniqueness constraint over `(student, subject)`. Marks are nullable, so an absence stays distinct from a zero. Totals and averages aren't stored — they're model properties computed from non-null marks on every request.

The importer title-cases and normalizes whitespace in names, parses whatever date formats show up in the source into ISO dates, preserves absences, and deduplicates by `(admission_no, subject)`, keeping the highest non-blank mark when duplicate scores conflict.
