import os
import sys
import django
from django.db.models import Q

# Setup Django environment
sys.path.append('c:/Sistemas CARSOFT/Sistema de facturacion/Sistema de facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Cheque, Asiento, ItemAsiento, PlanCuenta, EjercicioContable

print("="*60)
print("DIAGNOSTICO DE CHEQUES Y CUENTAS")
print("="*60)

# Check Ejercicios
print("\n--- EJERCICIOS CONTABLES ---")
ejercicios = EjercicioContable.objects.all()
for e in ejercicios:
    print(f"[{e.id}] {e.descripcion}: {e.fecha_inicio} al {e.fecha_fin} (Cerrado: {e.cerrado})")

# 1. Inspect Accounts containing 'Banco' or 'Caja'
print("\n--- PLAN DE CUENTAS (Relevant) ---")
cuentas = PlanCuenta.objects.filter(Q(nombre__icontains='Banco') | Q(nombre__icontains='Caja') | Q(codigo__startswith='1.1.01')).order_by('codigo')
for c in cuentas:
    padre_str = f" [Padre: {c.padre.codigo} ({c.padre.id})]" if c.padre else " [Padre: None]"
    print(f"[{c.id}] {c.codigo} - {c.nombre} (Tipo: {c.tipo}, Nivel: {c.nivel}, Imputable: {c.imputable}){padre_str}")

# 2. Inspect Cheques
print("\n--- CHEQUES EN SISTEMA ---")
cheques = Cheque.objects.all().order_by('-id')
for c in cheques:
    print(f"Cheque #{c.id}: {c.banco} {c.numero} - Estado: {c.estado} - Monto: ${c.monto}")

# 3. Inspect Asientos related to Cheques
print("\n--- ASIENTOS DE CHEQUES ---")
asientos = Asiento.objects.filter(descripcion__icontains='Cheque').order_by('-id')
for a in asientos:
    print(f"Asiento #{a.numero} ({a.fecha.date()}) - {a.descripcion}")
    for item in a.items.all():
        print(f"   > {item.cuenta.codigo} {item.cuenta.nombre}: D={item.debe} | H={item.haber}")

print("\n--- AUDITORIA CHEQUE #1 ---")
try:
    c1 = Cheque.objects.get(id=1)
    print(f"Cheque #1: {c1.banco} {c1.numero} Estado={c1.estado} Tipo={c1.tipo} Cliente={c1.cliente}")
    # Buscar asiento
    asientos_c1 = Asiento.objects.filter(descripcion__contains=c1.numero)
    if asientos_c1.exists():
        print("  [OK] Tiene asientos:")
        for a in asientos_c1:
            print(f"   - Asiento #{a.numero} ({a.fecha.date()}) {a.descripcion}")
    else:
        print("  [ERROR] NO TIENE ASIENTOS CONTABLES!")
except Cheque.DoesNotExist:
    print("Cheque #1 no existe")


print("="*60)
