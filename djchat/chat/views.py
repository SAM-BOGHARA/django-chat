from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from account.models import *
from .models import *

# Create your views here.


@require_POST
def create_room(request, uuid):
    name = request.POST.get("name", "")
    url = request.POST.get("url", "")
    Room.objects.create(client=name, url=url, uuid=uuid)
    return JsonResponse({"message": "Room created"})

 
@login_required
def admin(request):
    rooms = Room.objects.all()
    users = User.objects.filter(is_staff=True)

    return render(request, "chat/admin.html", {"rooms": rooms, "users": users})
