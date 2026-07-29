FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY students_marks.csv corrections.json ./

WORKDIR /app/backend
CMD ["sh", "-c", "python manage.py migrate && python manage.py import_marks && gunicorn school_platform.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3"]
