import os
import django
import datetime
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Presupuesto, Cliente
from django.db.models import Sum

def test_presupuestos_list():
    print("Testing Presupuestos List Logic...")
    try:
        presupuestos = Presupuesto.objects.select_related('cliente').order_by('-fecha')
        count = presupuestos.count()
        print(f"Found {count} presupuestos.")
        
        for p in presupuestos[:5]:
            print(f"Processing ID: {p.id}")
            
            # Check date calculation Logic from views.py
            # fecha_venc = p.fecha.date() + datetime.timedelta(days=p.validez)
            
            # Simulate what views.py does
            if not p.validez:
                print(f"WARNING: Presupuesto {p.id} has no validez (None/0).")
                
            fecha_venc = p.fecha.date() + datetime.timedelta(days=p.validez or 0)
            is_vencido = fecha_venc < datetime.date.today() and p.estado == 'PENDIENTE'
            
            print(f"  - Fecha: {p.fecha}")
            print(f"  - Validez: {p.validez}")
            print(f"  - Vencimiento Calc: {fecha_venc}")
            print(f"  - Is Vencido: {is_vencido}")
            
        print("Backend Logic seems OK.")
    except Exception as e:
        print(f"CRITICAL ERROR in Backend Logic: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_presupuestos_list()
