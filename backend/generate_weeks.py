import os
from datetime import date, timedelta
import django

# Configurar o Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # Substitua 'seu_projeto' pelo nome do seu projeto
django.setup()

from api.models import Week  # Substitua 'app' pelo nome do seu app

def generate_weeks(start_date, end_date):
    current_date = start_date
    Week.objects.all().delete()  # Limpa o banco antes de gerar novos dados

    while current_date <= end_date:
        # Verifica se é sexta-feira, caso contrário pula para a próxima sexta
        if current_date.weekday() != 4:
            current_date += timedelta(days=(4 - current_date.weekday()) % 7)

        # Cria o registro no banco
        Week.objects.create(date=current_date)
        
        # Avança para a próxima sexta-feira
        current_date += timedelta(days=7)

if __name__ == "__main__":
    start_date = date(2024, 1, 1)  # Data inicial
    end_date = date(2024, 12, 31)  # Data final

    generate_weeks(start_date, end_date)
    print("Semanas geradas com sucesso!")
