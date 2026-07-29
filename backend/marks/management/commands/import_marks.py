import csv
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from marks.models import Student, Mark

class Command(BaseCommand):
    help = 'Cleans and imports student marks from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_file',
            nargs='?',
            default=str(settings.BASE_DIR.parent / 'students_marks.csv'),
            type=str,
            help='Path to students_marks.csv (defaults to the repository data file)'
        )

    def clean_name(self, name):
        # Trim, split by whitespace, capitalize each word (Title Case)
        words = name.strip().split()
        cleaned_words = [w.capitalize() for w in words]
        return ' '.join(cleaned_words)

    def parse_dob(self, dob_str):
        dob_str = dob_str.strip()
        # Supported formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD-MMM-YY, DD-MMM-YYYY
        for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%d-%b-%y', '%d-%b-%Y'):
            try:
                return datetime.strptime(dob_str, fmt).date()
            except ValueError:
                pass
        raise ValueError(f"Unable to parse date: {dob_str}")

    def handle(self, *args, **options):
        csv_path = options['csv_file']
        self.stdout.write(self.style.NOTICE(f"Loading CSV from: {csv_path}"))

        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f"CSV file not found at {csv_path}"))
            return

        # Read all records
        records = []
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                records.append(row)

        self.stdout.write(self.style.NOTICE(f"Found {len(records)} raw records in CSV."))

        # Deduplication and cleaning
        deduped = {}
        for row in records:
            admission_no = row['admission_no'].strip()
            subject = row['subject'].strip()
            key = (admission_no, subject)

            # Parse marks (blank = None = Absent)
            marks_str = row['marks_obtained'].strip()
            marks = int(marks_str) if marks_str != '' else None

            # Clean profile information
            name = self.clean_name(row['student_name'])
            dob = self.parse_dob(row['date_of_birth'])
            class_name = row['class'].strip()
            section = row['section'].strip()
            max_marks = int(row['max_marks'].strip()) if row.get('max_marks') else 100

            record_obj = {
                'admission_no': admission_no,
                'name': name,
                'class_name': class_name,
                'section': section,
                'date_of_birth': dob,
                'subject': subject,
                'marks_obtained': marks,
                'max_marks': max_marks
            }

            if key in deduped:
                existing = deduped[key]
                m_existing = existing['marks_obtained']
                # Two rows with the same admission_no and subject are the same record; keep only one.
                # If they disagree on marks, keep the higher value.
                if m_existing is None and marks is not None:
                    deduped[key] = record_obj
                elif m_existing is not None and marks is not None:
                    if marks > m_existing:
                        deduped[key] = record_obj
            else:
                deduped[key] = record_obj

        self.stdout.write(self.style.NOTICE(f"Deduplicated to {len(deduped)} records."))

        # Separate students and marks details
        students_to_create = {}
        for key, rec in deduped.items():
            adm = rec['admission_no']
            students_to_create[adm] = {
                'name': rec['name'],
                'class_name': rec['class_name'],
                'section': rec['section'],
                'date_of_birth': rec['date_of_birth']
            }

        # Save to database in a transaction
        with transaction.atomic():
            # Clear old records to make it re-runnable / reset to clean state
            Mark.objects.all().delete()
            Student.objects.all().delete()

            # Create students
            student_objs = {}
            for adm, info in students_to_create.items():
                student = Student(
                    admission_no=adm,
                    name=info['name'],
                    class_name=info['class_name'],
                    section=info['section'],
                    date_of_birth=info['date_of_birth']
                )
                student.save()
                student_objs[adm] = student

            # Create marks
            for key, rec in deduped.items():
                mark = Mark(
                    student=student_objs[rec['admission_no']],
                    subject=rec['subject'],
                    marks_obtained=rec['marks_obtained'],
                    max_marks=rec['max_marks']
                )
                mark.save()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully imported {len(student_objs)} students and {len(deduped)} marks records."
        ))
