import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturacion.settings')
django.setup()

from administrar.models import Pedido
from django.utils import timezone

print("=" * 80)
print("VERIFICACIÓN DE PEDIDOS EN LA BASE DE DATOS")
print("=" * 80)

# Obtener TODOS los pedidos
todos_pedidos = Pedido.objects.all().order_by('-fecha')
print(f"\n📊 TOTAL DE PEDIDOS EN LA BASE DE DATOS: {todos_pedidos.count()}")

# Agrupar por estado
estados = {}
for pedido in todos_pedidos:
    estado = pedido.estado
    if estado not in estados:
        estados[estado] = []
    estados[estado].append(pedido)

print("\n📋 PEDIDOS POR ESTADO:")
print("-" * 80)
for estado, pedidos_list in estados.items():
    print(f"\n{estado}: {len(pedidos_list)} pedido(s)")
    for p in pedidos_list:
        fecha_local = timezone.localtime(p.fecha).strftime('%d/%m/%Y %H:%M')
        print(f"  - ID: {p.id} | Cliente: {p.cliente.nombre} | Total: ${p.total} | Fecha: {fecha_local}")

# Verificar específicamente los estados que cuenta el dashboard
print("\n" + "=" * 80)
print("PEDIDOS QUE CUENTA EL DASHBOARD (PENDIENTE + PREPARACION):")
print("=" * 80)
pedidos_dashboard = Pedido.objects.filter(estado__in=['PENDIENTE', 'PREPARACION']).order_by('-fecha')
print(f"Total: {pedidos_dashboard.count()}")
for p in pedidos_dashboard:
    fecha_local = timezone.localtime(p.fecha).strftime('%d/%m/%Y %H:%M')
    print(f"  - ID: {p.id} | Estado: {p.estado} | Cliente: {p.cliente.nombre} | Total: ${p.total} | Fecha: {fecha_local}")

# Verificar solo PENDIENTE
print("\n" + "=" * 80)
print("PEDIDOS SOLO CON ESTADO 'PENDIENTE':")
print("=" * 80)
pedidos_pendiente = Pedido.objects.filter(estado='PENDIENTE').order_by('-fecha')
print(f"Total: {pedidos_pendiente.count()}")
for p in pedidos_pendiente:
    fecha_local = timezone.localtime(p.fecha).strftime('%d/%m/%Y %H:%M')
    print(f"  - ID: {p.id} | Cliente: {p.cliente.nombre} | Total: ${p.total} | Fecha: {fecha_local}")

print("\n" + "=" * 80)
