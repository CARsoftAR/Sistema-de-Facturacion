
import os

file_path = r"c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\templates\administrar\comprobantes\imprimir_remito.html"

with open(file_path, 'rb') as f:
    content = f.read()

# Fix broken template tags that span multiple lines
replacements = [
    # Fix empresa condicion fiscal display
    (b'{{ empresa.get_condicion_fiscal_display|default:"Responsable\r\n                    Inscripto" }}', 
     b'{{ empresa.get_condicion_fiscal_display|default:"Responsable Inscripto" }}'),
    # Fix cliente condicion fiscal display
    (b'{{ remito.cliente.get_condicion_fiscal_display|default:"Consumidor\r\n                    Final" }}',
     b'{{ remito.cliente.get_condicion_fiscal_display|default:"Consumidor Final" }}'),
]

changed = False
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        changed = True
        print(f"Fixed: multiline template tag")

if changed:
    with open(file_path, 'wb') as f:
        f.write(content)
    print("SUCCESS: Template fixed.")
else:
    print("Patterns not found. Checking for alternate patterns...")
    # Try finding and printing the problematic area
    idx = content.find(b'get_condicion_fiscal_display')
    if idx != -1:
        print(f"Found at {idx}: {content[idx-50:idx+100]}")
