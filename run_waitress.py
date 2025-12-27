import os
import sys
from waitress import serve
from sistema_comercial.wsgi import application

def main():
    print("Iniciando servidor de producción con Waitress...")
    print("Accede al sistema en: http://localhost:8000")
    print("Presiona Ctrl+C para detener el servidor.")
    
    # Servir la aplicación en el puerto 8000
    serve(application, host='0.0.0.0', port=8000)

if __name__ == "__main__":
    main()
