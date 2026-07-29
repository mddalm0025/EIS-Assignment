from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Avg

from marks.models import Student, Mark
from marks.serializers import (
    StudentListSerializer,
    StudentDetailSerializer,
    CorrectionSerializer
)

class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentListSerializer
    lookup_field = 'admission_no'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StudentDetailSerializer
        return StudentListSerializer

    def get_queryset(self):
        queryset = Student.objects.all()
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        return queryset

@api_view(['GET'])
def class_summary(request):
    subjects = ['English', 'Hindi', 'Maths', 'Science', 'Social Science']
    subject_averages = {}

    for subj in subjects:
        # Calculate mean of non-absent marks
        avg_dict = Mark.objects.filter(
            subject=subj,
            marks_obtained__isnull=False
        ).aggregate(Avg('marks_obtained'))
        
        avg_val = avg_dict['marks_obtained__avg']
        if avg_val is not None:
            subject_averages[subj] = round(avg_val, 1)
        else:
            subject_averages[subj] = 0.0

    # Top student by total marks
    students = Student.objects.all()
    top_student = None
    if students.exists():
        # Sort by total_marks desc, then by average_marks desc
        top_student = max(students, key=lambda s: (s.total_marks, s.average_marks))

    if top_student:
        top_student_data = {
            'admission_no': top_student.admission_no,
            'name': top_student.name,
            'total': top_student.total_marks
        }
    else:
        top_student_data = None

    return Response({
        'subject_averages': subject_averages,
        'top_student': top_student_data
    })

@api_view(['POST'])
def apply_correction(request):
    serializer = CorrectionSerializer(data=request.data)
    if serializer.is_valid():
        admission_no = serializer.validated_data['admission_no']
        subject = serializer.validated_data['subject']
        marks = serializer.validated_data['marks']

        student = Student.objects.get(admission_no=admission_no)
        # Update or create the mark record
        Mark.objects.update_or_create(
            student=student,
            subject=subject,
            defaults={'marks_obtained': marks}
        )

        return Response(
            {"message": "Correction applied successfully."},
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
