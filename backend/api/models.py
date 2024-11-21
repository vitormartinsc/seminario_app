from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid
import datetime

# Dicionário para mapear meses de inglês para português
MONTHS_TRANSLATION = {
    'January': 'Janeiro',
    'February': 'Fevereiro',
    'March': 'Março',
    'April': 'Abril',
    'May': 'Maio',
    'June': 'Junho',
    'July': 'Julho',
    'August': 'Agosto',
    'September': 'Setembro',
    'October': 'Outubro',
    'November': 'Novembro',
    'December': 'Dezembro'
}

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
    month = models.PositiveIntegerField(null=True, blank=True)
    week = models.PositiveIntegerField(null=True, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f'{self.product} - {self.quantity} unit(s)'
    
    def save(self, *args, **kwargs):
        if not self.date_of_delivery: # se nenhuma data de delivery for selecionada    
            self.date_of_delivery = self.get_next_friday(self.date)
        self.month = self.date_of_delivery.month
        self.year = self.date_of_delivery.year
        self.week = self.date_of_delivery.isocalendar()[1]  # Semana do ano
        super().save(*args, **kwargs)  # Chama o método save(

    def get_next_friday(date):
        days_ahead = 4 - date.weekday()
        if days_ahead <= 0:
            days_ahead += 7 # move para a próxima semana se já passou de sexta feira
        
        return date + datetime.timedelta(days=days_ahead)

class Week(models.Model):
    date = models.DateField(unique=True)  # Sempre será uma sexta-feira
    week_label = models.CharField(max_length=50)  # Campo para armazenar o rótulo da semana

    def save(self, *args, **kwargs):
        # Calcula o week_label antes de salvar
        week_number = (self.date.day - 1) // 7 + 1
        month_name_english = self.date.strftime("%B")  # Nome do mês em inglês
        month_name_portuguese = MONTHS_TRANSLATION.get(month_name_english, month_name_english)  # Traduz o nome do mês
        self.week_label = f"{week_number}ª sem. de {month_name_portuguese.capitalize()}"
        
        super().save(*args, **kwargs)  # Salva o objeto com o week_label preenchido

    def __str__(self):
        return f"{self.week_label} ({self.date})"
