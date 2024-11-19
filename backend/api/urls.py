from django.urls import path
from . import views

urlpatterns = [
    path('notes/', views.NoteListCreate.as_view(), name='note-list'),
    path('notes/delete/<int:pk>/', views.NoteDelete.as_view(), name='delete-note'),
    path('orders/create/', views.CreateOrderView.as_view(), name='create-order'),
    path('orders/previous/', views.PreviousOrdersView.as_view(), name='previous-orders'),
    path('orders/previous/summary/', views.PreviousOrdersSummaryView.as_view(), name='previous-order-summary')
]
