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
    date_of_delivery = models.DateField(blank=True, null=True)  # Será automaticamente preenchido com a sexta-feira correspondente ao week_label
    week_label = models.CharField(max_length=50, blank=True, null=True)  # Novo campo week_label

    def __str__(self):
        return f'{self.product} - {self.quantity} unit(s)'

    def save(self, *args, **kwargs):
        # Se o date_of_delivery for fornecido, buscar a semana correspondente e definir date_of_delivery
        if self.date_of_delivery:
            try:
                # Encontra a semana com base no week_label
                week = Week.objects.get(date=self.date_of_delivery)
                self.week_label = week.week_label # Define a sexta-feira correspondente como date_of_delivery
            except Week.DoesNotExist:
                # Se a semana não existir, cria uma nova semana
                raise ValueError(f"A semana com a data {self.date_of_delivery} não existe.")
        
        super().save(*args, **kwargs)  # Salva o objeto
    

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

class PendingOrder(models.Model):
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
    quantity = models.PositiveIntegerField()
    date = models.DateTimeField(default=timezone.now)
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_orders')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pending_orders')
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
        default='pending'
    )
    week_label = models.CharField(max_length=50, blank=True, null=True)
    date_of_delivery = models.DateField(blank=True, null=True)

    def save(self, *args, **kwargs):
    # Se o date_of_delivery for fornecido, buscar a semana correspondente e definir date_of_delivery
        if self.date_of_delivery:
            try:
                # Encontra a semana com base no week_label
                week = Week.objects.get(date=self.date_of_delivery)
                self.week_label = week.week_label # Define a sexta-feira correspondente como date_of_delivery
            except Week.DoesNotExist:
            # Se a semana não existir, cria uma nova semana
                raise ValueError(f"A semana com a data {self.date_of_delivery} não existe.")
    
            super().save(*args, **kwargs)  # Salva o objeto

    def __str__(self):
        return f"{self.product} - {self.quantity} unit(s) - Status: {self.status}"