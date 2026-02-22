
import os
import django
import sys

# Configurar Django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import User

def check_email_config():
    print("--- DIAGNÓSTICO DE CORREO ---")
    print(f"EMAIL_BACKEND Configurado: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_HOST_USER: '{settings.EMAIL_HOST_USER}' (Si está vacío, usará consola)")
    
    if 'console' in settings.EMAIL_BACKEND:
        print("\n[!] ALERTA: Estás usando el 'ConsoleBackend'.")
        print("    Esto significa que los correos NO salen a internet.") 
        print("    Solo se imprimen en la pantalla negra donde corre el servidor.")
        print("    CAUSA: Probablemente no has puesto tu usuario/password en el archivo .env")
        return

    print("\n--- Usuarios y Correos en Base de Datos ---")
    for u in User.objects.all():
        print(f"Usuario: {u.username} | Email: {u.email}")

if __name__ == "__main__":
    check_email_config()
