from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
import datetime
import subprocess
import os
import zipfile
from django.conf import settings
from .models import Backup

# ==========================================
# SISTEMA DE BACKUPS
# ==========================================

@login_required
def backups(request):
    """Renderiza la página de gestión de backups"""
    if not request.user.is_staff:
        messages.error(request, 'No tienes permisos para acceder a esta sección.')
        return redirect('menu')
    return render(request, 'administrar/backups.html')

@login_required
def api_listar_backups(request):
    """API para listar los backups disponibles"""
    if not request.user.is_staff:
        return JsonResponse({'ok': False, 'error': 'No autorizado'}, status=403)
    
    backups = Backup.objects.all().order_by('-fecha_creacion')
    data = []
    
    for b in backups:
        data.append({
            'id': b.id,
            'nombre': b.nombre,
            'fecha': b.fecha_creacion.strftime('%d/%m/%Y %H:%M'),
            'tamanio': b.tamanio_formateado(),
            'ubicacion': b.get_ubicacion_display(),
            'ubicacion_code': b.ubicacion,
            'creado_por': b.creado_por.username if b.creado_por else 'Sistema',
            'tipo': b.get_tipo_display()
        })
        
    return JsonResponse({'ok': True, 'data': data})

def get_mysql_executable(name):
    """Busca el ejecutable de MySQL en el PATH o en rutas comunes de Windows"""
    # 1. Intentar usar shutil.which para buscar en el PATH
    import shutil
    path = shutil.which(name)
    if path:
        return path
        
    # 2. Rutas comunes en Windows
    common_paths = [
        r"C:\Program Files\MySQL\MySQL Server 8.0\bin",
        r"C:\Program Files\MySQL\MySQL Workbench 8.0",
        r"C:\Program Files\MySQL\MySQL Workbench 8.0 CE",
        r"C:\Program Files\MySQL\MySQL Server 5.7\bin",
        r"C:\xampp\mysql\bin",
    ]
    
    # Buscar en rutas comunes
    for base_path in common_paths:
        exe_path = os.path.join(base_path, f"{name}.exe")
        if os.path.exists(exe_path):
            return exe_path
            
    # 3. Búsqueda más amplia (opcional, puede ser lenta)
    return name

@csrf_exempt
@login_required
def api_crear_backup(request):
    """API para crear un nuevo backup"""
    if not request.user.is_staff:
        return JsonResponse({'ok': False, 'error': 'No autorizado'}, status=403)
        
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        tipo = data.get('tipo', 'DB') # DB o SISTEMA
        ubicacion = data.get('ubicacion', 'LOCAL')
        
        # Directorios - usar ruta configurada o la por defecto
        from .models import Empresa
        try:
            empresa = Empresa.objects.get(id=1)
            if empresa.backup_local_path and empresa.backup_local_path.strip():
                local_backup_dir = empresa.backup_local_path.strip()
            else:
                local_backup_dir = os.path.join(settings.BASE_DIR, 'backups', 'local')
        except Empresa.DoesNotExist:
            local_backup_dir = os.path.join(settings.BASE_DIR, 'backups', 'local')
        
        os.makedirs(local_backup_dir, exist_ok=True)

        
        timestamp = datetime.datetime.now().strftime('%d%m%Y_%H%M%S')
        
        final_zip_path = ""
        nombre_backup = ""
        
        if tipo == 'DB':
            # Configuración de BD
            db_settings = settings.DATABASES['default']
            db_name = db_settings['NAME']
            db_user = db_settings['USER']
            db_password = db_settings['PASSWORD']
            db_host = db_settings['HOST']
            
            filename = f"backup_datos_{timestamp}.sql"
            file_path = os.path.join(local_backup_dir, filename)
            
            # Obtener ruta de mysqldump
            mysqldump_exe = get_mysql_executable('mysqldump')
            
            # Comando mysqldump con rutinas y triggers
            dump_cmd = [
                mysqldump_exe,
                f'--host={db_host}',
                f'--user={db_user}',
                '--routines',
                '--triggers',
                '--events'
            ]
            
            if db_password:
                dump_cmd.append(f'--password={db_password}')
                
            dump_cmd.append(db_name)
            
            # Ejecutar backup
            with open(file_path, 'w') as f:
                try:
                    # Timeout de 60 segundos
                    process = subprocess.run(dump_cmd, stdout=f, stderr=subprocess.PIPE, check=False, timeout=60)
                    
                    if process.returncode != 0:
                        error_msg = process.stderr.decode('utf-8')
                        return JsonResponse({'ok': False, 'error': f'Error al ejecutar mysqldump: {error_msg}. Verifique que MySQL esté instalado y accesible.'})
                except subprocess.TimeoutExpired:
                    return JsonResponse({'ok': False, 'error': 'El proceso de backup excedió el tiempo límite (60s).'})
                except FileNotFoundError:
                     return JsonResponse({'ok': False, 'error': 'No se encontró el ejecutable "mysqldump". Por favor instale MySQL Server o agregue la carpeta bin al PATH del sistema.'})

            # Comprimir a ZIP
            zip_filename = f"backup_datos_{timestamp}.zip"
            final_zip_path = os.path.join(local_backup_dir, zip_filename)
            
            with zipfile.ZipFile(final_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(file_path, arcname=filename)
                
            # Eliminar archivo SQL original
            os.remove(file_path)
            nombre_backup = f"Backup Datos SQL {timestamp}"
            
        elif tipo == 'DB_JSON':
            # Backup Nativo Django (JSON)
            from django.core.management import call_command
            
            filename = f"backup_datos_{timestamp}.json"
            file_path = os.path.join(local_backup_dir, filename)
            
            # Ejecutar dumpdata
            with open(file_path, 'w', encoding='utf-8') as f:
                # Excluir sessions y contenttypes para evitar conflictos al restaurar
                call_command('dumpdata', exclude=['auth.permission', 'contenttypes', 'sessions', 'admin'], stdout=f)
                
            # Comprimir a ZIP
            zip_filename = f"backup_datos_json_{timestamp}.zip"
            final_zip_path = os.path.join(local_backup_dir, zip_filename)
            
            with zipfile.ZipFile(final_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(file_path, arcname=filename)
                
            os.remove(file_path)
            nombre_backup = f"Backup Datos JSON {timestamp}"
            
        elif tipo == 'SOLO_SISTEMA':
            # Backup solo de archivos del sistema (sin BD)
            zip_filename = f"backup_solo_sistema_{timestamp}.zip"
            final_zip_path = os.path.join(local_backup_dir, zip_filename)
            
            project_root = settings.BASE_DIR
            
            with zipfile.ZipFile(final_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(project_root):
                    # Excluir directorios pesados o innecesarios
                    dirs[:] = [d for d in dirs if d not in ['venv', '.git', '__pycache__', 'backups', 'node_modules', 'dist', '.idea', '.vscode']]
                    
                    for file in files:
                        if file.endswith('.pyc') or file.endswith('.zip') or file.endswith('.rar'):
                            continue
                            
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, project_root)
                        zipf.write(file_path, arcname=arcname)
            
            nombre_backup = f"Backup Solo Sistema {timestamp}"
            
        elif tipo == 'SISTEMA':
            # Backup de archivos del sistema
            zip_filename = f"backup_sistema_{timestamp}.zip"
            final_zip_path = os.path.join(local_backup_dir, zip_filename)
            
            project_root = settings.BASE_DIR
            
            with zipfile.ZipFile(final_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(project_root):
                    # Excluir directorios pesados o innecesarios
                    dirs[:] = [d for d in dirs if d not in ['venv', '.git', '__pycache__', 'backups', 'node_modules', 'dist', '.idea', '.vscode']]
                    
                    for file in files:
                        if file.endswith('.pyc') or file.endswith('.zip') or file.endswith('.rar'):
                            continue
                            
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, project_root)
                        zipf.write(file_path, arcname=arcname)
            
            nombre_backup = f"Backup Sistema {timestamp}"
        
        else:
             return JsonResponse({'ok': False, 'error': 'Tipo de backup no válido'})

        # Calcular tamaño
        file_size = os.path.getsize(final_zip_path)
        
        # Guardar registro en BD (solo LOCAL)
        backup = Backup.objects.create(
            nombre=nombre_backup,
            tipo=tipo,
            archivo=final_zip_path,
            tamanio=file_size,
            ubicacion='LOCAL',
            creado_por=request.user
        )
        
        return JsonResponse({
            'ok': True, 
            'mensaje': 'Backup creado exitosamente',
            'backup': {
                'id': backup.id,
                'nombre': backup.nombre,
                'fecha': backup.fecha_creacion.strftime('%d/%m/%Y %H:%M'),
                'tamanio': backup.tamanio_formateado(),
                'tipo': backup.get_tipo_display()
            }
        })
        
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_subir_backup(request):
    """API para subir un archivo de backup externo"""
    if not request.user.is_staff:
        return JsonResponse({'ok': False, 'error': 'No autorizado'}, status=403)
        
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        if 'archivo' not in request.FILES:
            return JsonResponse({'ok': False, 'error': 'No se envió ningún archivo'}, status=400)
            
        archivo = request.FILES['archivo']
        
        # Validar extensión
        if not archivo.name.endswith('.zip') and not archivo.name.endswith('.json') and not archivo.name.endswith('.sql'):
            return JsonResponse({'ok': False, 'error': 'Formato no válido. Solo se permiten .zip, .json o .sql'}, status=400)
            
        # Directorios
        base_backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        local_backup_dir = os.path.join(base_backup_dir, 'local')
        os.makedirs(local_backup_dir, exist_ok=True)
        
        # Guardar archivo
        file_path = os.path.join(local_backup_dir, archivo.name)
        
        # Si ya existe, agregar timestamp para no sobrescribir
        if os.path.exists(file_path):
            name, ext = os.path.splitext(archivo.name)
            timestamp = datetime.datetime.now().strftime('%H%M%S')
            file_path = os.path.join(local_backup_dir, f"{name}_{timestamp}{ext}")
            
        with open(file_path, 'wb+') as destination:
            for chunk in archivo.chunks():
                destination.write(chunk)
                
        # Determinar tipo
        tipo = 'DB' # Por defecto asumimos DB
        if 'json' in archivo.name.lower():
             tipo = 'DB_JSON'
        elif 'sistema' in archivo.name.lower():
             tipo = 'SISTEMA'
             
        # Guardar registro en BD
        backup = Backup.objects.create(
            nombre=f"Subido: {archivo.name}",
            tipo=tipo,
            archivo=file_path,
            tamanio=archivo.size,
            ubicacion='LOCAL',
            creado_por=request.user,
            descripcion="Backup subido manualmente"
        )
        
        return JsonResponse({
            'ok': True, 
            'mensaje': 'Backup subido exitosamente',
            'backup': {
                'id': backup.id,
                'nombre': backup.nombre,
                'fecha': backup.fecha_creacion.strftime('%d/%m/%Y %H:%M'),
                'tamanio': backup.tamanio_formateado(),
                'tipo': backup.get_tipo_display()
            }
        })
        
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)

@login_required
def api_descargar_backup(request, id):
    """Descargar archivo de backup"""
    if not request.user.is_staff:
        return HttpResponse("No autorizado", status=403)
        
    backup = get_object_or_404(Backup, pk=id)
    
    if os.path.exists(backup.archivo):
        from django.http import FileResponse
        return FileResponse(open(backup.archivo, 'rb'), as_attachment=True, filename=os.path.basename(backup.archivo))
    else:
        return HttpResponse("Archivo no encontrado", status=404)

@csrf_exempt
@login_required
def api_restaurar_backup(request, id):
    """Restaurar base de datos desde backup"""
    if not request.user.is_staff:
        return JsonResponse({'ok': False, 'error': 'No autorizado'}, status=403)
        
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        backup = get_object_or_404(Backup, pk=id)
        
        if backup.tipo not in ['DB', 'DB_JSON']:
             return JsonResponse({'ok': False, 'error': 'Solo se pueden restaurar backups de Base de Datos automáticamente.'})
        
        if not os.path.exists(backup.archivo):
            return JsonResponse({'ok': False, 'error': 'Archivo de backup no encontrado'})
            
        # Directorio temporal
        temp_dir = os.path.join(settings.BASE_DIR, 'backups', 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        
        # Descomprimir para ver qué hay adentro
        sql_file = None
        json_file = None
        
        with zipfile.ZipFile(backup.archivo, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
            for name in zip_ref.namelist():
                if name.endswith('.sql'):
                    sql_file = os.path.join(temp_dir, name)
                elif name.endswith('.json'):
                    json_file = os.path.join(temp_dir, name)
        
        if sql_file:
            # --- RESTAURACIÓN SQL (MYSQL) ---
            db_settings = settings.DATABASES['default']
            db_name = db_settings['NAME']
            db_user = db_settings['USER']
            db_password = db_settings['PASSWORD']
            db_host = db_settings['HOST']
            
            restore_cmd = ['mysql', f'--host={db_host}', f'--user={db_user}']
            if db_password:
                restore_cmd.append(f'--password={db_password}')
            restore_cmd.append(db_name)
            
            with open(sql_file, 'r') as f:
                process = subprocess.run(restore_cmd, stdin=f, stderr=subprocess.PIPE)
                
            if process.returncode != 0:
                error_msg = process.stderr.decode('utf-8')
                return JsonResponse({'ok': False, 'error': f'Error al restaurar SQL: {error_msg}'})
                
        elif json_file:
            # --- RESTAURACIÓN JSON (DJANGO LOADDATA) ---
            from django.core.management import call_command
            
            try:
                # Actualiza o crea registros
                call_command('loaddata', json_file)
            except Exception as e:
                return JsonResponse({'ok': False, 'error': f'Error en loaddata: {str(e)}'})

        else:
            return JsonResponse({'ok': False, 'error': 'No se encontró archivo SQL ni JSON válido dentro del backup'})
            
        # Limpiar temp
        import shutil
        shutil.rmtree(temp_dir)
            
        return JsonResponse({'ok': True, 'mensaje': 'Sistema restaurado exitosamente'})
        
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_eliminar_backup(request, id):
    """Eliminar backup"""
    if not request.user.is_staff:
        return JsonResponse({'ok': False, 'error': 'No autorizado'}, status=403)
        
    if request.method != 'DELETE':
        return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        backup = get_object_or_404(Backup, pk=id)
        
        if os.path.exists(backup.archivo):
            try:
                os.remove(backup.archivo)
            except Exception as e:
                print(f"Error eliminando archivo: {e}")
                
        backup.delete()
        
        return JsonResponse({'ok': True, 'mensaje': 'Backup eliminado correctamente'})
        
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)
