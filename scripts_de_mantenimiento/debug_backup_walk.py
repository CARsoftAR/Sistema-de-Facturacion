
import os
import sys

# Simular entorno
# BASE_DIR = settings.BASE_DIR
project_root = os.getcwd() # c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion

print(f"Project Root: {project_root}")
print("-" * 50)

found_media = False
found_static = False

for root, dirs, files in os.walk(project_root):
    # Logica original de exclusión
    # dirs[:] = [d for d in dirs if d not in ['venv', '.git', '__pycache__', 'backups', 'staticfiles']]
    
    # Vamos a imprimir qué directorios se mantienen en cada paso
    rel_root = os.path.relpath(root, project_root)
    
    if rel_root == '.':
        print(f"Scanning Root. Dirs found: {dirs}")
        
        # Simular el filtrado
        original_dirs = dirs.copy()
        dirs[:] = [d for d in dirs if d not in ['venv', '.git', '__pycache__', 'backups', 'staticfiles']]
        print(f"Dirs after filtering: {dirs}")
        
        if 'media' in dirs:
            found_media = True
            print(">>> MEDIA found and kept!")
        else:
            if 'media' in original_dirs:
                 print(">>> MEDIA found but FILTERED OUT!")
            else:
                 print(">>> MEDIA NOT FOUND in root!")

        if 'static' in dirs:
            found_static = True
            print(">>> STATIC found and kept!")
        else:
             if 'static' in original_dirs:
                 print(">>> STATIC found but FILTERED OUT!")
             else:
                 print(">>> STATIC NOT FOUND in root!")

    # Solo imprimir si estamos dentro de media o static para verificar contenido
    if rel_root.startswith('media') or rel_root.startswith('static'):
        print(f"Walking inside: {rel_root} - Files: {len(files)}")
