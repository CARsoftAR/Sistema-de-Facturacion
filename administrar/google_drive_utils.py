"""
Utilidades para integración con Google Drive
"""
import json
import io
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseUpload
from googleapiclient.errors import HttpError


def upload_to_google_drive(file_path, credentials_json, folder_id=None):
    """
    Sube un archivo a Google Drive usando credenciales de cuenta de servicio
    
    Args:
        file_path: Ruta del archivo a subir
        credentials_json: Dict con las credenciales de Google (JSON parseado)
        folder_id: ID de la carpeta de destino en Drive (opcional)
    
    Returns:
        dict: Información del archivo subido (id, name, webViewLink)
    
    Raises:
        Exception: Si hay error en la subida
    """
    try:
        # Crear credenciales desde el JSON
        credentials = service_account.Credentials.from_service_account_info(
            credentials_json,
            scopes=['https://www.googleapis.com/auth/drive.file']
        )
        
        # Construir el servicio de Drive
        service = build('drive', 'v3', credentials=credentials)
        
        # Metadata del archivo
        import os
        file_name = os.path.basename(file_path)
        file_metadata = {
            'name': file_name
        }
        
        # Si se especificó una carpeta, agregar como parent
        if folder_id:
            file_metadata['parents'] = [folder_id]
        
        # Subir el archivo
        media = MediaFileUpload(file_path, resumable=True)
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink, size'
        ).execute()
        
        return {
            'id': file.get('id'),
            'name': file.get('name'),
            'webViewLink': file.get('webViewLink'),
            'size': file.get('size')
        }
        
    except HttpError as error:
        raise Exception(f'Error al subir archivo a Google Drive: {error}')
    except Exception as e:
        raise Exception(f'Error inesperado al subir a Google Drive: {str(e)}')


def test_google_drive_connection(credentials_json):
    """
    Prueba la conexión con Google Drive usando las credenciales proporcionadas
    
    Args:
        credentials_json: Dict con las credenciales de Google (JSON parseado)
    
    Returns:
        dict: {'ok': True/False, 'message': str}
    """
    try:
        # Crear credenciales desde el JSON
        credentials = service_account.Credentials.from_service_account_info(
            credentials_json,
            scopes=['https://www.googleapis.com/auth/drive.file']
        )
        
        # Construir el servicio de Drive
        service = build('drive', 'v3', credentials=credentials)
        
        # Intentar listar archivos (solo para probar la conexión)
        results = service.files().list(pageSize=1, fields="files(id, name)").execute()
        
        return {
            'ok': True,
            'message': 'Conexión exitosa con Google Drive'
        }
        
    except HttpError as error:
        return {
            'ok': False,
            'message': f'Error de autenticación con Google Drive: {error}'
        }
    except Exception as e:
        return {
            'ok': False,
            'message': f'Error al conectar con Google Drive: {str(e)}'
        }
