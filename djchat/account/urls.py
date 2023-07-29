from django.contrib.auth.views import LoginView
from django.urls import path

from .forms import LoginForm
from .views import *
app_name = 'account'


urlpatterns = [
    path('login/', LoginView.as_view(template_name='account/login.html', form_class=LoginForm), name='login'),
    path('logout/', logout_user, name='logout')
]
