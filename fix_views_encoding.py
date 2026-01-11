
import os

file_path = r"c:\Sistema de Facturacion\administrar\views.py"

try:
    with open(file_path, 'rb') as f:
        content = f.read()

    # Remove null bytes
    clean_content = content.replace(b'\x00', b'')

    if len(content) != len(clean_content):
        print(f"Removed {len(content) - len(clean_content)} null bytes.")
        with open(file_path, 'wb') as f:
            f.write(clean_content)
        print("File cleaned successfully.")
    else:
        print("No null bytes found.")

except Exception as e:
    print(f"Error: {e}")
