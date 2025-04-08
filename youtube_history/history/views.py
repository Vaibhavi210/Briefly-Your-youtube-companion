from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import *
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.exceptions import TokenBackendError
import requests
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken, TokenError

# Create your views here.
class registerAPI(APIView):
    def post(self,request):
        data=request.data
        serialuser=registerSerializer(data=data)
        
        if serialuser.is_valid():
            email = serialuser.validated_data['email']  #  Correctly accessing email

            # Debugging - Check if email exists
            print(f"Checking if user exists with email: {email}")

           
            # Debugging - Confirming user creation
            print("Creating new user...")
            serialuser.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serialuser.errors,status=status.HTTP_400_BAD_REQUEST)



class loginAPI(APIView):
    # permission_classes = [AllowAny] 
    def post(self, request):
        data = request.data
        serializer = loginSerializer(data=data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            # Authenticate the user
            user = authenticate(request, username=email, password=password)
            
            if user:
                # Create JWT token for the user
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                return Response({
                    "refresh": str(refresh),
                    "access": access_token,
                })
            else:
                return Response({"detail": "Invalid credentials"}, status=401)
        
        return Response(serializer.errors, status=400)
class VerifyTokenAPI(APIView):
    def get(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if auth_header and auth_header.startswith('Bearer '):
            access_token_str = auth_header.split(' ')[1]
            try:
                AccessToken(access_token_str)  # Instantiate AccessToken to verify
                return Response({"detail": "Token is valid"}, status=200)
            except TokenError as e:
                print(f"TokenError during access token verification: {e}")
                return Response({"detail": "Token is invalid or expired"}, status=401)
            except Exception as e:
                print(f"Unexpected error during access token verification: {e}")
                return Response({"detail": "Token is invalid or expired"}, status=401)
        else:
            return Response({"detail": "Authorization header is missing or invalid"}, status=401)
class pwdResetAPI(APIView):
    def post(self, request):
        data = request.data
        serialpwd = pwdResetSerializer(data=data)
        if serialpwd.is_valid():
            email = serialpwd.validated_data['email']
            try:
                user = customUser.objects.get(email=email)
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_url = f"http://localhost:3000/reset-password/{uid}/{token}"

                send_mail(
                    'Password Reset Request',
                    f'Click this link to reset your password: {reset_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False
                )
                return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
            except customUser.DoesNotExist:
                # Return a 200 response to prevent user enumeration
                return Response({'message': 'If your email exists in our system, you will receive a password reset link'}, status=status.HTTP_200_OK)
            except Exception as e:
                # Log the error server-side but don't expose details to client
                print(f"Password reset error: {str(e)}")
                return Response({'error': 'An error occurred while processing your request'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serialpwd.errors, status=status.HTTP_400_BAD_REQUEST)

class confirmResetPwdAPI(APIView):
    def post(self, request):
        serialpwd = pwdConfirmSerializer(data=request.data)
        if serialpwd.is_valid():
            try:
                uid, token = serialpwd.validated_data['token'].split('/')
                uid = force_str(urlsafe_base64_decode(uid))
                user = customUser.objects.get(pk=uid)

                if default_token_generator.check_token(user, token):
                    user.set_password(serialpwd.validated_data['password'])
                    user.save()
                    return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
                return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
            except (TypeError, ValueError, customUser.DoesNotExist) as e:
                print(f"Token verification error: {str(e)}")
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print(f"Unexpected error: {str(e)}")
                return Response({"error": "An error occurred while processing your request"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        return Response(serialpwd.errors, status=status.HTTP_400_BAD_REQUEST)