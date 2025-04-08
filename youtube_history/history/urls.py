from .views import *
from django.urls import path,re_path
from rest_framework_simplejwt.views import(
TokenObtainPairView,
TokenRefreshView
)
urlpatterns=[
    
    path("signup/",registerAPI.as_view(),name="signup"),
    #giving access to the valid token with refresh api
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    #taking the refreshed token and return new access with valid token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api/token/login/",loginAPI.as_view(),name="login"),
    path('password-reset/', pwdResetAPI.as_view(), name='password-reset'),
    path('password-reset-confirm/', confirmResetPwdAPI.as_view(), name='password-reset-confirm'),
    path('api/token/verify/', VerifyTokenAPI.as_view(), name='VerifyTokenAPI'),
]