from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Order, Week
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from datetime import datetime, timedelta, time

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "first_name", "last_name"]  # Adicionando first_name e last_name
        extra_kwargs = {"password": {"write_only": True}} 

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"], 
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", "")
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adiciona custom claims ao token JWT
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['username'] = user.username  # Caso queira retornar o nome de usuário também

        return token

    # Modificar a resposta para incluir os dados do usuário junto com o token
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user  # O usuário autenticado a partir do request

        # Inclui os dados do usuário junto com o token
        data['first_name'] = user.first_name
        data['last_name'] = user.last_name
        data['username'] = user.username
        return data
    
class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Adicionando dados do usuário na resposta (first_name e last_name)
        user = self.context['request'].user
        data['first_name'] = user.first_name
        data['last_name'] = user.last_name
        data['username'] = user.username  # Se necessário, inclua o nome de usuário também

        return data
    
class OrderSerializer(serializers.ModelSerializer):
    editable = serializers.SerializerMethodField()  # Adiciona o campo editable calculado

    class Meta:
        model = Order
        fields = ['id', 'product', 'quantity', 'date', 'user', 'batch_id', 'date_of_delivery', 'week_label', 'editable']
        read_only_fields = ['id', 'date', 'user']

    def get_editable(self, obj):
        """
        Define se o pedido é editável com base na regra:
        - É editável antes de quarta-feira (12h) para entregas na sexta-feira seguinte.
        """
        now = datetime.now()
        if obj.date_of_delivery:
           # Calcula a quarta-feira antes da data de entrega
            wednesday_date = obj.date_of_delivery - timedelta(days=(obj.date_of_delivery.weekday() - 2))
        # Converte para datetime às 12h
            wednesday_cutoff = datetime.combine(wednesday_date, time(hour=12))
            return now < wednesday_cutoff
        return False

    def create(self, validated_data):
        # Atribua o usuário da requisição ao pedido
        user = self.context['request'].user
        product = validated_data.get('product')
        date_of_delivery = validated_data.get('date_of_delivery')
        quantity = validated_data.get('quantity')
        
        existing_order = Order.objects.filter(
            user=user,
            product=product,
            date_of_delivery = date_of_delivery
        ).first()
        
        if existing_order:
            existing_order.quantity += quantity
            existing_order.save()
            return existing_order
        
        else:
            return Order.objects.create(user=user, **validated_data)

class WeekSerializer(serializers.ModelSerializer):
    editable = serializers.SerializerMethodField()  # Adiciona o campo editable calculado
    
    class Meta:
        model = Week
        fields = ['id', 'date', 'week_label', 'editable']

    def get_editable(self, obj):
        """
        Define se o pedido é editável com base na regra:
        - É editável antes de quarta-feira (12h) para entregas na sexta-feira seguinte.
        """
        now = datetime.now()
        if obj.date:
           # Calcula a quarta-feira antes da data de entrega
            wednesday_date = obj.date - timedelta(days=(obj.date.weekday() - 2))
        # Converte para datetime às 12h
            wednesday_cutoff = datetime.combine(wednesday_date, time(hour=12))
            return now < wednesday_cutoff
        return False

