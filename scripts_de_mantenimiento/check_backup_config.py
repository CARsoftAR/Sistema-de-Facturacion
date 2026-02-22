"""
Script para verificar la configuración de backups en la base de datos
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturacion.settings')
django.setup()

from administrar.models import Empresa

# Obtener la empresa
try:
    empresa = Empresa.objects.get(id=1)
    print("=== CONFIGURACIÓN DE BACKUPS EN BD ===")
    print(f"backup_local_path: '{empresa.backup_local_path}'")
    print(f"backup_google_drive_enabled: {empresa.backup_google_drive_enabled}")
    print(f"backup_google_drive_folder_id: '{empresa.backup_google_drive_folder_id}'")
    print(f"backup_google_drive_credentials: {bool(empresa.backup_google_drive_credentials)}")
    if empresa.backup_google_drive_credentials:
        print(f"  Longitud credenciales: {len(empresa.backup_google_drive_credentials)} caracteres")
except Empresa.DoesNotExist:
    print("No existe la empresa con ID=1")
