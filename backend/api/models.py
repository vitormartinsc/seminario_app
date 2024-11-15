from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

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

    def __str__(self):
        return f'{self.product} - {self.quantity} unit(s)'