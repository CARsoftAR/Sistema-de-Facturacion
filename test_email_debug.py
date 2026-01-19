import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from django.core.mail import send_mail
from administrar.models import Empresa

def test_email():
    print("--- Probando envío de correos ---")
    try:
        empresa = Empresa.objects.first()
        if not empresa:
            print("ERROR: No hay empresa configurada.")
            return

        print(f"Configuración DB: Host={empresa.smtp_server}, Port={empresa.smtp_port}, User={empresa.smtp_user}")
        
        send_mail(
            'Prueba de Correo',
            'Este es un correo de prueba desde el sistema.',
            empresa.smtp_user,
            [empresa.smtp_user], # Send to self
            fail_silently=False,
        )
        print("Correo enviado exitosamente!")
    except Exception as e:
        print(f"ERROR enviando correo: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_email()
