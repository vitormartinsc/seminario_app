from django.contrib import admin
from .models import Order, PendingOrder, Week

class OrderAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'date_of_delivery', 'user', 'batch_id')
    list_filter = ('date_of_delivery', 'product')
    search_fields = ('product', 'user__username')

    def save_model(self, request, obj, form, change):
        # Verifica se existe uma ordem com o mesmo produto e data de entrega
        existing_order = Order.objects.filter(
            user=obj.user,
            product=obj.product,
            date_of_delivery=obj.date_of_delivery
        ).first()

        if existing_order and not change:  # Só soma se for uma criação
            existing_order.quantity += obj.quantity
            existing_order.save()
        else:
            super().save_model(request, obj, form, change)

admin.site.register(Order, OrderAdmin)
admin.site.register(Week)
admin.site.register(PendingOrder)

