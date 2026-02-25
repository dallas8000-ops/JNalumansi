from django.urls import path
from . import views

urlpatterns = [
    path('inbox/', views.inbox, name='inbox'),
    path('receive/', views.receive_sms, name='receive_sms'),
]
