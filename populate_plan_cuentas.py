import os
import sys
import django

# Add the project root to sys.path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_facturacion.settings')
django.setup()

from administrar.models import PlanCuenta

def populate_plan_cuentas():
    # Limpiar cuentas existentes (opcional, pero recomendado para evitar duplicados en pruebas)
    # PlanCuenta.objects.all().delete()
    
    cuentas = [
        # ACTIVO
        {'codigo': '1', 'nombre': 'ACTIVO', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '1.1', 'nombre': 'ACTIVO CORRIENTE', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 2, 'padre': '1'},
        {'codigo': '1.1.01', 'nombre': 'CAJA Y BANCOS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
        {'codigo': '1.1.01.01', 'nombre': 'Caja', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
        {'codigo': '1.1.01.02', 'nombre': 'Banco Nación c/c', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
        {'codigo': '1.1.01.03', 'nombre': 'Valores a Depositar', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
        
        {'codigo': '1.1.02', 'nombre': 'INVERSIONES', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
        {'codigo': '1.1.02.01', 'nombre': 'Plazo Fijo', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.02'},
        
        {'codigo': '1.1.03', 'nombre': 'CREDITOS POR VENTAS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
        {'codigo': '1.1.03.01', 'nombre': 'Deudores por Ventas', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
        {'codigo': '1.1.03.02', 'nombre': 'Deudores Morosos', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
        {'codigo': '1.1.03.03', 'nombre': 'Deudores en Gestión Judicial', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
        {'codigo': '1.1.03.04', 'nombre': 'Tarjetas de Crédito a Cobrar', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
        
        {'codigo': '1.1.04', 'nombre': 'OTROS CREDITOS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
        {'codigo': '1.1.04.01', 'nombre': 'IVA Crédito Fiscal', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
        {'codigo': '1.1.04.02', 'nombre': 'Retenciones Sufridas', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
        {'codigo': '1.1.04.03', 'nombre': 'Anticipo Impuesto a las Ganancias', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
        
        {'codigo': '1.1.05', 'nombre': 'BIENES DE CAMBIO', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
        {'codigo': '1.1.05.01', 'nombre': 'Mercaderías de Reventa', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.05'},
        
        {'codigo': '1.2', 'nombre': 'ACTIVO NO CORRIENTE', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 2, 'padre': '1'},
        {'codigo': '1.2.01', 'nombre': 'BIENES DE USO', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.2'},
        {'codigo': '1.2.01.01', 'nombre': 'Rodados', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
        {'codigo': '1.2.01.02', 'nombre': 'Muebles y Útiles', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
        {'codigo': '1.2.01.03', 'nombre': 'Instalaciones', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
        {'codigo': '1.2.01.04', 'nombre': 'Equipos de Computación', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
        {'codigo': '1.2.01.05', 'nombre': 'Inmuebles', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
        {'codigo': '1.2.01.99', 'nombre': 'Amort. Acum. Bienes de Uso', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},

        # PASIVO
        {'codigo': '2', 'nombre': 'PASIVO', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '2.1', 'nombre': 'PASIVO CORRIENTE', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 2, 'padre': '2'},
        {'codigo': '2.1.01', 'nombre': 'DEUDAS COMERCIALES', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.1'},
        {'codigo': '2.1.01.01', 'nombre': 'Proveedores', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.01'},
        {'codigo': '2.1.01.02', 'nombre': 'Cheques Diferidos a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.01'},
        
        {'codigo': '2.1.02', 'nombre': 'DEUDAS SOCIALES', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.1'},
        {'codigo': '2.1.02.01', 'nombre': 'Sueldos a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.02'},
        {'codigo': '2.1.02.02', 'nombre': 'Cargas Sociales a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.02'},
        
        {'codigo': '2.1.03', 'nombre': 'DEUDAS FISCALES', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.1'},
        {'codigo': '2.1.03.01', 'nombre': 'IVA Débito Fiscal', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.03'},
        {'codigo': '2.1.03.02', 'nombre': 'IVA a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.03'},
        {'codigo': '2.1.03.03', 'nombre': 'Ingresos Brutos a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.03'},
        {'codigo': '2.1.03.04', 'nombre': 'Ganancias a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.03'},
        
        {'codigo': '2.2', 'nombre': 'PASIVO NO CORRIENTE', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 2, 'padre': '2'},
        {'codigo': '2.2.01', 'nombre': 'DEUDAS BANCARIAS A LARGO PLAZO', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.2'},
        {'codigo': '2.2.01.01', 'nombre': 'Préstamos Bancarios L.P.', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.2.01'},

        # PATRIMONIO NETO
        {'codigo': '3', 'nombre': 'PATRIMONIO NETO', 'tipo': 'PN', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '3.1', 'nombre': 'CAPITAL', 'tipo': 'PN', 'imputable': False, 'nivel': 2, 'padre': '3'},
        {'codigo': '3.1.01', 'nombre': 'Capital Social', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.1'},
        {'codigo': '3.1.02', 'nombre': 'Ajuste de Capital', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.1'},
        
        {'codigo': '3.2', 'nombre': 'RESULTADOS', 'tipo': 'PN', 'imputable': False, 'nivel': 2, 'padre': '3'},
        {'codigo': '3.2.01', 'nombre': 'Resultados Acumulados', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.2'},
        {'codigo': '3.2.02', 'nombre': 'Resultado del Ejercicio', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.2'},

        # RESULTADOS POSITIVOS (INGRESOS)
        {'codigo': '4', 'nombre': 'INGRESOS', 'tipo': 'R_POS', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '4.1', 'nombre': 'VENTAS', 'tipo': 'R_POS', 'imputable': False, 'nivel': 2, 'padre': '4'},
        {'codigo': '4.1.01', 'nombre': 'Ventas de Mercaderías', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.1'},
        {'codigo': '4.1.02', 'nombre': 'Ventas de Servicios', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.1'},
        
        {'codigo': '4.2', 'nombre': 'OTROS INGRESOS', 'tipo': 'R_POS', 'imputable': False, 'nivel': 2, 'padre': '4'},
        {'codigo': '4.2.01', 'nombre': 'Intereses Ganados', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
        {'codigo': '4.2.02', 'nombre': 'Descuentos Obtenidos', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},

        # RESULTADOS NEGATIVOS (EGRESOS)
        {'codigo': '5', 'nombre': 'EGRESOS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 1, 'padre': None},
        {'codigo': '5.1', 'nombre': 'COSTOS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
        {'codigo': '5.1.01', 'nombre': 'Costo de Mercaderías Vendidas (CMV)', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.1'},
        
        {'codigo': '5.2', 'nombre': 'GASTOS ADMINISTRATIVOS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
        {'codigo': '5.2.01', 'nombre': 'Sueldos y Jornales', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
        {'codigo': '5.2.02', 'nombre': 'Cargas Sociales', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
        {'codigo': '5.2.03', 'nombre': 'Alquileres', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
        {'codigo': '5.2.04', 'nombre': 'Luz, Gas y Teléfono', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
        {'codigo': '5.2.05', 'nombre': 'Papelería y Útiles', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
        
        {'codigo': '5.3', 'nombre': 'GASTOS COMERCIALES', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
        {'codigo': '5.3.01', 'nombre': 'Publicidad y Propaganda', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
        {'codigo': '5.3.02', 'nombre': 'Comisiones Vendedores', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
        {'codigo': '5.3.03', 'nombre': 'Impuesto a los Ingresos Brutos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
        
        {'codigo': '5.4', 'nombre': 'GASTOS FINANCIEROS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
        {'codigo': '5.4.01', 'nombre': 'Intereses Perdidos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.4'},
        {'codigo': '5.4.02', 'nombre': 'Gastos Bancarios', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.4'},
        {'codigo': '5.4.03', 'nombre': 'Descuentos Cedidos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.4'},
    ]

    print(f"Iniciando carga de {len(cuentas)} cuentas...")
    
    creadas = 0
    existentes = 0
    
    for c in cuentas:
        padre = None
        if c['padre']:
            try:
                padre = PlanCuenta.objects.get(codigo=c['padre'])
            except PlanCuenta.DoesNotExist:
                print(f"Advertencia: Padre {c['padre']} no encontrado para {c['codigo']}")
                continue
        
        obj, created = PlanCuenta.objects.get_or_create(
            codigo=c['codigo'],
            defaults={
                'nombre': c['nombre'],
                'tipo': c['tipo'],
                'imputable': c['imputable'],
                'nivel': c['nivel'],
                'padre': padre
            }
        )
        
        if created:
            creadas += 1
        else:
            existentes += 1
            
    print(f"Proceso finalizado. Creadas: {creadas}, Existentes: {existentes}")

if __name__ == '__main__':
    populate_plan_cuentas()
