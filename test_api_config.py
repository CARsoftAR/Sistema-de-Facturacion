import requests
import json

# URL de la API (ajustar si es necesario)
url = 'http://localhost:8000/api/config/guardar/'

# Simular una sesión autenticada si es necesario, 
# pero aquí solo probaremos si el backend maneja los formatos correctamente.
# NOTA: En un entorno real, necesitarías cookies de sesión.
# Este script es para validación lógica si se pudiera ejecutar en el servidor.

def test_json():
    print("Probando envío JSON...")
    payload = {
        'nombre': 'Empresa Test JSON',
        'habilita_remitos': True
    }
    headers = {'Content-Type': 'application/json'}
    # Como requiere login, esto probablemente falle con 403/302 en un entorno real sin sesión,
    # pero sirve para documentar cómo se vería la prueba.
    print(f"Payload JSON: {payload}")

def test_multipart():
    print("\nProbando envío Multipart...")
    data = {
        'nombre': 'Empresa Test Multipart',
        'habilita_remitos': 'true'
    }
    # En una prueba real, adjuntaríamos un archivo
    files = {
        'logo': ('test_logo.png', b'fake image data', 'image/png')
    }
    print(f"Data Multipart: {data}")

if __name__ == "__main__":
    print("Script de verificación de API Config")
    test_json()
    test_multipart()
