
import os
import django
import sys

# Configurar entorno Django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from django.contrib.auth.models import User

def reset_password():
    username = input("Ingresa el nombre de usuario (ej: cristian): ")
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        print(f"Error: El usuario '{username}' no existe.")
        return

    new_pass = input(f"Ingresa la nueva contrasena para '{username}': ")
    if not new_pass:
        print("La contrasena no puede estar vacia.")
        return

    user.set_password(new_pass)
    user.save()
    print(f"\n[OK] Contrasena actualizada exitosamente para '{username}'.")
    print("Ahora puedes iniciar sesion con lav nueva clave.")

if __name__ == "__main__":
    reset_password()
