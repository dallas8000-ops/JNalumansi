from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from .models import SMS

def inbox(request):
    messages = SMS.objects.all()
    return render(request, 'sms/inbox.html', {'messages': messages})

@csrf_exempt
def receive_sms(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        sender = data.get('from')
        message = data.get('message')
        
        # Save to database
        SMS.objects.create(
            sender=sender,
            message=message
        )
        
        # Send WhatsApp notification
        requests.get(
            'https://api.callmebot.com/whatsapp.php',
            params={
                'phone': '+16824604038',
                'text': f'New customer text!\nFrom: {sender}\nMessage: {message}',
                'apikey': '1195156'
            }
        )
        
        return JsonResponse({'status': 'ok'})