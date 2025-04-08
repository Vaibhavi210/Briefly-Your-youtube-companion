from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class customUser(AbstractUser):
    username=models.CharField(max_length=150,unique=False)
    email=models.EmailField(unique=True)
    password=models.CharField(max_length=150)

    USERNAME_FIELD='email'
    REQUIRED_FIELDS=[]

    def __str__(self):
        return self.email
