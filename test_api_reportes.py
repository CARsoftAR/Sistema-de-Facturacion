from django.test import Client
from django.contrib.auth.models import User

# Crear cliente de prueba
client = Client()

# Obtener usuario
user = User.objects.first()
print(f"Usuario: {user.username}")

# Login
client.force_login(user)

# Hacer request a la API
response = client.get('/api/estadisticas/ventas/')
print(f"\nStatus Code: {response.status_code}")
print(f"Content-Type: {response.get('Content-Type', 'N/A')}")

if response.status_code == 200:
    try:
        import json
        data = json.loads(response.content)
        print(f"\nRespuesta JSON:")
        print(f"  ok: {data.get('ok', 'N/A')}")
        print(f"  total_ventas: {data.get('total_ventas', 'N/A')}")
        print(f"  cantidad_ventas: {data.get('cantidad_ventas', 'N/A')}")
        print(f"  promedio_venta: {data.get('promedio_venta', 'N/A')}")
        print(f"  ventas_por_mes: {len(data.get('ventas_por_mes', []))} meses")
        print(f"  top_clientes: {len(data.get('top_clientes', []))} clientes")
        print(f"  top_productos: {len(data.get('top_productos', []))} productos")
    except Exception as e:
        print(f"Error parseando JSON: {e}")
        print(f"Contenido: {response.content[:500]}")
else:
    print(f"Error: {response.content[:500]}")
