import os

file_path = r"c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\models.py"

new_fields = """    direccion_entrega = models.CharField(max_length=200, blank=True)

    # Datos Adicionales para Impresion
    proyecto = models.CharField(max_length=100, blank=True)
    orden_compra = models.CharField(max_length=50, blank=True)
    pedido_interno = models.CharField(max_length=50, blank=True)
    
    transportista = models.CharField(max_length=100, blank=True)
    cuit_transportista = models.CharField(max_length=20, blank=True)
    
    maq = models.CharField(max_length=50, blank=True, verbose_name="M.A.Q.")
    material = models.CharField(max_length=50, blank=True)
    
    ocm = models.CharField(max_length=50, blank=True, verbose_name="O.C.M.")
    alcance = models.CharField(max_length=50, blank=True)
    denominacion = models.CharField(max_length=100, blank=True, verbose_name="Denominacion y Capacidad")
"""

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
except UnicodeDecodeError:
    # Fallback to distinct encoding if utf-8 fails, typical for windows legacy files
    with open(file_path, 'r', encoding='latin-1') as f:
        lines = f.readlines()

new_lines = []
for line in lines:
    if "direccion_entrega = models.CharField(max_length=200, blank=True)" in line:
        new_lines.append(new_fields)
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully updated models.py")
