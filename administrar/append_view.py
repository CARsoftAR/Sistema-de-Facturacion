
import os

views_path = r"c:\Sistema de Facturacion\administrar\views.py"
temp_path = r"c:\Sistema de Facturacion\administrar\temp_api_nc_detalle.py"

print(f"Appending {temp_path} to {views_path}...")

try:
    with open(temp_path, 'r', encoding='utf-8') as f_temp:
        new_code = f_temp.read()
        
    with open(views_path, 'a', encoding='utf-8') as f_views:
        f_views.write('\n\n')
        f_views.write(new_code)
        
    print("Successfully appended new code.")

except Exception as e:
    print(f"An error occurred: {e}")
