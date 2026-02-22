from django.test import Client
from django.contrib.auth.models import User
import json

# Crear cliente de prueba
client = Client()

# Obtener usuario
user = User.objects.first()
print(f"Usuario: {user.username}")

# Login
client.force_login(user)

# Hacer request a la API de compras
response = client.get('/api/estadisticas/compras/')
print(f"\nStatus Code: {response.status_code}")
print(f"Content-Type: {response.get('Content-Type', 'N/A')}")

if response.status_code == 200:
    try:
        data = json.loads(response.content)
        print(f"\nRespuesta JSON:")
        print(f"  ok: {data.get('ok', 'N/A')}")
        print(f"  total_compras: {data.get('total_compras', 'N/A')}")
        print(f"  cantidad_compras: {data.get('cantidad_compras', 'N/A')}")
        print(f"  promedio_compra: {data.get('promedio_compra', 'N/A')}")
        print(f"\n  compras_por_mes ({len(data.get('compras_por_mes', []))} meses):")
        for item in data.get('compras_por_mes', []):
            print(f"    - {item['mes']}: ${item['total']}")
        print(f"\n  top_proveedores ({len(data.get('top_proveedores', []))} proveedores):")
        for item in data.get('top_proveedores', []):
            print(f"    - {item['nombre']}: ${item['total']} ({item['cantidad']} compras)")
    except Exception as e:
        print(f"Error parseando JSON: {e}")
        print(f"Contenido: {response.content[:500]}")
else:
    print(f"Error: {response.content[:500]}")
