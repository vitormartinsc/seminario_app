from django.contrib import admin
from .models import Note, Order


admin.site.register(Note)
#admin.site.register(Order)

def delete_all_orders(modeladmin, request, queryset):
    # Deletar todas as ordens
    queryset.all().delete()
    # Retornar uma mensagem de sucesso
    modeladmin.message_user(request, "Todas as ordens foram deletadas com sucesso!")

# Registrar o modelo no admin com a ação personalizada
class OrderAdmin(admin.ModelAdmin):
    actions = [delete_all_orders]  # Adiciona a ação personalizada de deletar todas as ordens

admin.site.register(Order, OrderAdmin)


# Register your models here.
