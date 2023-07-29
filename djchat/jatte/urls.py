from django.contrib import admin
from django.urls import path, include
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('', include('chat.urls')),
    path('', include('core.urls')),
    path('', include('account.urls')),
    path('admin/', admin.site.urls),
]

urlpatterns += staticfiles_urlpatterns()