from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid
import datetime

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    
    def __str__(self):
        return self.title
    
class Order(models.Model):
    PRODUCT_CHOICES = [
        ('Tradicional', 'Tradicional'),
        ('Tradicional Sem Açúcar', 'Tradicional Sem Açúcar'),
        ('Cenoura com Chocolate', 'Cenoura com Chocolate'),
        ('Farofa', 'Farofa'),
        ('Antepasto', 'Antepasto'),
        ('Brioche', 'Brioche'),
        ('Browne', 'Browne')
    ]

    product = models.CharField(max_length=50, choices=PRODUCT_CHOICES)
    quantity = models.PositiveIntegerField()  # Campo para quantidade
    date = models.DateTimeField(default=timezone.now)  # Define a data como o momento atual ao criar o pedido
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    batch_id = models.UUIDField(default=uuid.uuid4)
    date_of_delivery = models.DateField(blank=True, null=True)

    def __str__(self):
        return f'{self.product} - {self.quantity} unit(s)'
    
    def save(self, *args, **kwargs):
        if not self.date_of_delivery: # se nenhuma data de delivery for selecionada    
            self.date_of_delivery = self.get_next_friday(self.date)
            
        super().save(*args, **kwargs)

    def get_next_friday(date):
        days_ahead = 4 - date.weekday()
        if days_ahead <= 0:
            days_ahead += 7 # move para a próxima semana se já passou de sexta feira
        
        return date + datetime.timedelta(days=days_ahead)
    