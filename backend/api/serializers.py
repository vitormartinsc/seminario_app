from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Order
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

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

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}    

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Adicionando dados do usuário na resposta (first_name e last_name)
        user = self.user
        data['first_name'] = user.first_name
        data['last_name'] = user.last_name
        data['username'] = user.username  # Adiciona o nome de usuário, se necessário

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
    class Meta:
        model = Order
        fields = ['id', 'product', 'quantity', 'date', 'user', 'batch_id']
        read_only_fields = ['id', 'date', 'user']  # `id` e `user` serão gerados automaticamente

    def create(self, validated_data):
        # Atribua o usuário da requisição ao pedido
        user = self.context['request'].user
        return Order.objects.create(user=user, **validated_data)