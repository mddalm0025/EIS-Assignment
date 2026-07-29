from rest_framework import serializers
from marks.models import Student, Mark

class StudentListSerializer(serializers.ModelSerializer):
    dob = serializers.DateField(source='date_of_birth')
    average = serializers.FloatField(source='average_marks')

    class Meta:
        model = Student
        fields = ['admission_no', 'name', 'class_name', 'section', 'dob', 'average']

    def to_representation(self, instance):
        # Map 'class_name' key to 'class' in JSON representation
        ret = super().to_representation(instance)
        ret['class'] = ret.pop('class_name')
        return ret

class StudentDetailSerializer(serializers.ModelSerializer):
    dob = serializers.DateField(source='date_of_birth')
    marks = serializers.SerializerMethodField()
    total = serializers.IntegerField(source='total_marks')
    average = serializers.FloatField(source='average_marks')

    class Meta:
        model = Student
        fields = ['admission_no', 'name', 'class_name', 'section', 'dob', 'marks', 'total', 'average']

    def get_marks(self, obj):
        subjects = ['English', 'Hindi', 'Maths', 'Science', 'Social Science']
        # Load marks from database for this student
        marks_map = {m.subject: m.marks_obtained for m in obj.marks.all()}
        
        # Format as list of objects: [{"subject": "Maths", "marks": 85}, ...]
        return [{"subject": subj, "marks": marks_map.get(subj, None)} for subj in subjects]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['class'] = ret.pop('class_name')
        return ret

class CorrectionSerializer(serializers.Serializer):
    admission_no = serializers.CharField(max_length=20)
    subject = serializers.ChoiceField(choices=Mark.SUBJECT_CHOICES)
    marks = serializers.IntegerField(min_value=0, max_value=100)

    def validate_admission_no(self, value):
        if not Student.objects.filter(admission_no=value).exists():
            raise serializers.ValidationError("Student admission number does not exist.")
        return value
