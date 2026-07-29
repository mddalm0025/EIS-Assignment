from django.db import models

class Student(models.Model):
    admission_no = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=100)
    class_name = models.CharField(max_length=10) # e.g. "6"
    section = models.CharField(max_length=5)       # e.g. "A", "B"
    date_of_birth = models.DateField()

    def __str__(self):
        return f"{self.name} ({self.admission_no})"

    @property
    def total_marks(self):
        valid_marks = self.marks.filter(marks_obtained__isnull=False)
        if not valid_marks.exists():
            return 0
        return sum(m.marks_obtained for m in valid_marks)

    @property
    def average_marks(self):
        valid_marks = self.marks.filter(marks_obtained__isnull=False)
        if not valid_marks.exists():
            return 0.0
        avg = sum(m.marks_obtained for m in valid_marks) / valid_marks.count()
        return round(avg, 1)

class Mark(models.Model):
    SUBJECT_CHOICES = [
        ('English', 'English'),
        ('Hindi', 'Hindi'),
        ('Maths', 'Maths'),
        ('Science', 'Science'),
        ('Social Science', 'Social Science'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='marks')
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES)
    marks_obtained = models.IntegerField(null=True, blank=True)
    max_marks = models.IntegerField(default=100)

    class Meta:
        unique_together = ('student', 'subject')

    def __str__(self):
        return f"{self.student.admission_no} - {self.subject}: {self.marks_obtained}"
