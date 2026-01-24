import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Cliente

def test_save():
    try:
        # 1. New Client
        c = Cliente.objects.create(
            nombre="CLIENTE PRUEBA SISTEMA",
            cuit="20999999999",
            condicion_fiscal="CF"
        )
        print(f"Created client {c.id}")
        
        # 2. Check if exists
        c2 = Cliente.objects.get(id=c.id)
        print(f"Verified existence: {c2.nombre}")
        
        # 3. Edit
        c2.nombre = "CLIENTE PRUEBA EDITADO"
        c2.save()
        
        c3 = Cliente.objects.get(id=c.id)
        print(f"Verified edit: {c3.nombre}")
        
        # Cleanup
        # c3.delete()
        # print("Cleaned up.")
        
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_save()
