
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Empresa

def update_company():
    print("Buscando empresa 'CARSOFT Demo' o ID 1...")
    
    # Try to find by ID 1 first (most likely singleton)
    empresa = Empresa.objects.filter(id=1).first()
    
    if not empresa:
        # Try finding by name if ID 1 doesn't exist (unlikely given views.py)
        empresa = Empresa.objects.filter(nombre="CARSOFT Demo").first()
        
    if empresa:
        print(f"Empresa encontrada: {empresa.nombre}")
        old_name = empresa.nombre
        empresa.nombre = "Distribuidora Gani"
        # Also update address if it's the demo one, to make it look matching the user request if they care, 
        # but user only asked for name. I'll stick to name to be safe, or update address if it allows me to "fix" the demo look.
        # User image shows "Av. Demo 123", typically users want real info. 
        # But strictly following prompt: "cambia en donde dice CARSOFT Demo, por Distribuidora Gani"
        
        empresa.save()
        print(f"Nombre actualizado: '{old_name}' -> '{empresa.nombre}'")
    else:
        print("No se encontró la empresa para actualizar.")
        # Create it just in case? No, better to warn.
        
if __name__ == '__main__':
    update_company()
