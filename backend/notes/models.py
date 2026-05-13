from django.db import models
from django.contrib.auth.models import User
import uuid

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True)
    original_file = models.FileField(upload_to='uploads/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    file_type = models.CharField(max_length=50, blank=True) # e.g., 'pdf', 'audio', 'video', 'youtube'
    transcript = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    keywords = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title or f"Note {self.id}"

class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
    ]
    note = models.ForeignKey(Note, related_name='chat_messages', on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role} - {self.timestamp}"
