import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from administrar.models import Empresa

def check_creds():
    print("--- Verificando Credenciales ---")
    empresa = Empresa.objects.first()
    if not empresa:
        print("No empresa found.")
        return

    user = empresa.smtp_user
    pwd = empresa.smtp_password
    
    print(f"User: '{user}' (Len: {len(user)})")
    print(f"Pass: '{pwd}' (Len: {len(pwd)})")
    
    if user.strip() != user:
        print("WARNING: Username has whitespace!")
    if pwd.strip() != pwd:
        print("WARNING: Password has whitespace!")

if __name__ == "__main__":
    check_creds()
