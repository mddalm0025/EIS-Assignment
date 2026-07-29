from django.urls import path, include
from rest_framework.routers import DefaultRouter
from marks.views import StudentViewSet, class_summary, apply_correction

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', class_summary, name='class-summary'),
    path('marks/corrections/', apply_correction, name='apply-correction'),
]
