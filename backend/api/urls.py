from django.urls import path
from . import views

urlpatterns = [
    path('orders/create/', views.CreateOrderView.as_view(), name='create-order'),
    path('orders/previous/', views.PreviousOrdersView.as_view(), name='previous-orders'),
    path('orders/', views.OrdersView.as_view(), name='orders-view'),
    path('orders/previous/summary/', views.PreviousOrdersSummaryView.as_view(), name='previous-orders-summary'),
    path('orders/editable/', views.EditableOrdersView.as_view(), name='editable-orders'),
    path('orders/update/', views.UpdateOrderView.as_view(), name='update-order'),
    path('orders/available-dates/', views.availableDatesView.as_view(), name='available-dates'),
    path('orders/delete/', views.DeleteOrderView.as_view(), name='delete-order'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('pending-orders/', views.PendingOrdersView.as_view(), name='pending-orders-view'),
    path('pending-orders/update/', views.UpdatePendingOrderView.as_view(), name='update-pending-order')
]
