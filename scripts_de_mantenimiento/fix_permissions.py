import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from django.contrib.auth.models import User
from administrar.models import PerfilUsuario

try:
    u = User.objects.get(username='cristian')
    p, created = PerfilUsuario.objects.get_or_create(user=u)
    
    # Dar todos los permisos
    p.acceso_ventas = True
    p.acceso_compras = True
    p.acceso_productos = True
    p.acceso_clientes = True
    p.acceso_proveedores = True
    p.acceso_caja = True
    p.acceso_contabilidad = True
    p.acceso_configuracion = True
    p.acceso_usuarios = True
    p.acceso_reportes = True
    p.acceso_pedidos = True
    p.acceso_bancos = True
    p.acceso_ctacte = True
    p.acceso_remitos = True
    
    # Hacerlo staff para asegurar acceso total
    u.is_staff = True
    u.save()
    p.save()
    
    print(f"Permisos asignados correctamente al usuario {u.username}")
except User.DoesNotExist:
    print("El usuario cristian no existe")
except Exception as e:
    print(f"Error: {e}")
