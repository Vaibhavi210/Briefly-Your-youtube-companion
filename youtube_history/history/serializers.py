from rest_framework import serializers
from .models import customUser

class registerSerializer(serializers.ModelSerializer):
    class Meta:
        model=customUser
        fields=['id','username','email','password']
    def validate_email(self, value):
        if customUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self,validated_data):
        user=customUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']

        )
        return user
class loginSerializer(serializers.Serializer):
    email=serializers.EmailField()
    password=serializers.CharField()

class pwdResetSerializer(serializers.Serializer):
    email=serializers.EmailField()

class pwdConfirmSerializer(serializers.Serializer):
    token=serializers.CharField()
    password=serializers.CharField(write_only=True)
