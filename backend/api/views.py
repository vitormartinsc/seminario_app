from django.db.models import Sum
from django.contrib.auth.models import User
from rest_framework import generics, status
from .serializers import UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer, OrderSerializer
from .models import Note, Order
from rest_framework.views import APIView
import uuid


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
    
class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        
        else:
            print(serializer.errors)
        
class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer 
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user) 

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

class PreviousOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-date')

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
    