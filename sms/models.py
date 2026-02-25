from django.db import models

class SMS(models.Model):
    sender = models.CharField(max_length=20)
    message = models.TextField()
    received_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} - {self.received_at}"

    class Meta:
        ordering = ['-received_at']