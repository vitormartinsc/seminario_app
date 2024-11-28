from django.db.models import Sum, Q
from django.contrib.auth.models import User
from rest_framework import generics, status
from .serializers import UserSerializer
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer, OrderSerializer, WeekSerializer, PendingOrderSerializer
from .models import Order, PendingOrder, Week
from rest_framework.views import APIView
from datetime import datetime, timedelta, time
import uuid


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
    
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if isinstance(request.data, list):  # Verifica se os dados recebidos são uma lista
            batch_id = uuid.uuid4()
            orders = []
            for order_data in request.data:
                order_data['batch_id'] = batch_id
                #print(order_data)
                serializer = OrderSerializer(data=order_data, context={'request': request})
                if serializer.is_valid():
                    #print(serializer.data)
                    serializer.save()
                    orders.append(serializer.data)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(orders, status=status.HTTP_201_CREATED)
        else:
            serializer = OrderSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class UpdateOrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = self.request.user
        orders = request.data.get('orders', [])
        
        if not orders:
            return Response({'error': 'Nenhum pedido fornecido'}, status=status.HTTP_400_BAD_REQUEST)
                       
        for order in orders:
            product = order.get('product')
            quantity = order.get('quantity')
            date_of_delivery = order.get('date_of_delivery')

            if not product or not date_of_delivery:
                return Response(
                    {'error': 'Pedido inválido'},
                    stastus = status.HTTP_400_BAD_REQUEST
                )
                
            try: 
                existing_order = Order.objects.get(
                    user=user,
                    product=product,
                    date_of_delivery=date_of_delivery
                )
                
                if int(quantity) > 0:
                    existing_order.quantity = quantity
                    existing_order.save()

                else:
                    existing_order.delete()      
                          
            except Order.DoesNotExist:
                
                if int(quantity) > 0:
                    Order.objects.create(
                        user=user,
                        product=product,
                        quantity=quantity,
                        date_of_delivery=date_of_delivery
                    )
                
            return Response(
                {'message': 'Pedidos atualizados com sucesso'},
                status.HTTP_200_OK
                )
        

class PreviousOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    today = timezone.now().date()
    
    def get_queryset(self):
        return Order.objects.filter(
            date_of_delivery__lt = self.today,
            user=self.request.user
            ).order_by('-date')
        
class OrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-date_of_delivery')
    
class PendingOrdersView(generics.ListAPIView):
    serializer_class = PendingOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PendingOrder.objects.filter(
            Q(requester=self.request.user) | Q(recipient=self.request.user)
            ).order_by('-date_of_delivery')
    
class EditableOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    today = timezone.now().date()
    
    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(
            user = user,
            date_of_delivery__gte=self.today
        ).order_by('-date_of_delivery')

class PreviousOrdersSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Filtra os pedidos do usuário atual
        user_orders = Order.objects.filter(user=request.user)

        # Resumo mensal
        month_summary = (
            user_orders
            .values('year', 'month')  # Agrupar por ano e mês
            .annotate(total_quantity=Sum('quantity'))  # Soma as quantidades
            .order_by('year', 'month')  # Ordena por ano e mês
        )

        # Resumo semanal
        week_summary = (
            user_orders
            .values('year', 'week')  # Agrupar por ano e semana
            .annotate(total_quantity=Sum('quantity'))  # Soma as quantidades
            .order_by('year', 'week')  # Ordena por ano e semana
        )

        # Retorna os resumos como resposta JSON
        return Response({
            'month_summary': list(month_summary),
            'week_summary': list(week_summary),
        })
        
class availableDatesView(APIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = timezone.now()
        today = now.date()
        
        # Pedidos editáveis do usuário
        editable_orders = Order.objects.filter(
            user=user,
            date_of_delivery__gte=today  # Apenas futuras ou da data atual
        ).values_list('week_label', flat=True)  # Obtemos apenas os labels

        # Todas as semanas disponíveis até o final do ano
        all_weeks = Week.objects.filter(date__lt='2025-01-01')
        
        available_weeks = []
        
        for week in all_weeks:
            week_date = week.date
            wednesday_date = week_date - timedelta(days=(week_date.weekday() - 2))
        # Converte para datetime às 12h
            wednesday_cutoff = datetime.combine(wednesday_date, time(hour=12))
            wednesday_cutoff_awere = timezone.make_aware(wednesday_cutoff) # Tornar a timezone aware
            is_editable = now < wednesday_cutoff_awere
            if is_editable and week.week_label not in editable_orders:
                available_weeks.append(week)
            
        # Serializar as semanas disponíveis
        serializer = WeekSerializer(available_weeks, many=True)
        return Response(serializer.data)
        
class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        users = User.objects.all()
        user_list = [
            {"id": user.id, 'name': f'{user.first_name} {user.last_name}'}
            for user in users
        ]        
        return Response(user_list)
    

