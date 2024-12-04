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
            
class UpdatePendingOrderView(APIView):
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
            recipientId = order.get('recipient')
            recipient = User.objects.get(id = recipientId)
            

            if not product or not date_of_delivery or not recipient:
                return Response(
                    {'error': 'Pedido inválido'},
                    status = status.HTTP_400_BAD_REQUEST
                )
                
            try: 
                existing_pending_order = PendingOrder.objects.get(
                    requester=user,
                    product=product,
                    recipient=recipient,
                    date_of_delivery=date_of_delivery
                )
                
                if int(quantity) > 0:
                    existing_pending_order.quantity = quantity
                    existing_pending_order.save()

                else:
                    existing_pending_order.delete()      
                          
            except PendingOrder.DoesNotExist:
                
                if int(quantity) > 0:
                    PendingOrder.objects.create(
                        product=product,
                        recipient=recipient,
                        requester=user,
                        status='pending',
                        quantity=quantity,
                        date_of_delivery=date_of_delivery
                    )
                
            return Response(
                {'message': 'Pedidos atualizados com sucesso'},
                status.HTTP_200_OK
                )
            
class DeleteOrderView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = self.request.user
        week_label = request.data.get('weekLabel')  # Corrigido para acessar dados do corpo da requisição
        try:
            # Busca pedidos do usuário para a semana especificada
            existing_orders = Order.objects.filter(
                user=user,
                week_label=week_label
            )

            if not existing_orders.exists():  # Verifica se há pedidos para deletar
                return Response({
                    'message': 'Order does not exist'
                }, status=status.HTTP_404_NOT_FOUND)

            existing_orders.delete()  # Deleta os pedidos encontrados
            return Response(
                {"message": "Pedido deletado com sucesso"},
                status=status.HTTP_200_OK
            )

        except Exception as e:  # Captura erros genéricos
            return Response({
                'message': 'An error occurred',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        all_weeks = Week.objects.filter(date__lt='2025-01-01')
        # Serializar as semanas com o usuário no contexto para o WeekSerializer
        serializer = WeekSerializer(all_weeks, many=True, context={'user': request.user})
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
    

