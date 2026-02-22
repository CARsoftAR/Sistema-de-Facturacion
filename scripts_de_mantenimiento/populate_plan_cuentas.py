
import os
import sys
import django

# Add project root to path
sys.path.append(os.getcwd())

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta

def create_account(codigo, nombre, tipo, padre=None, imputable=True):
    # Calculate level
    nivel = 1
    if padre:
        nivel = padre.nivel + 1
    
    cuenta, created = PlanCuenta.objects.get_or_create(
        codigo=codigo,
        defaults={
            'nombre': nombre,
            'tipo': tipo,
            'imputable': imputable,
            'nivel': nivel,
            'padre': padre
        }
    )
    if created:
        print(f"Created: {codigo} - {nombre}")
    else:
        print(f"Exists: {codigo} - {nombre}")
        # Update basics just in case (optional, safe to skip if we trust existing)
        cuenta.nombre = nombre
        cuenta.tipo = tipo
        cuenta.imputable = imputable
        cuenta.nivel = nivel
        cuenta.padre = padre
        cuenta.save()
    return cuenta

def populate():
    print("Populating Plan de Cuentas (Argentina Standard)...")

    # 1. ACTIVO
    activo = create_account('1', 'ACTIVO', 'ACTIVO', None, False)
    
        # 1.1 ACTIVO CORRIENTE
    activo_cte = create_account('1.1', 'ACTIVO CORRIENTE', 'ACTIVO', activo, False)
    
            # 1.1.01 CAJA Y BANCOS
    caja_bancos = create_account('1.1.01', 'CAJA Y BANCOS', 'ACTIVO', activo_cte, False)
    create_account('1.1.01.001', 'Caja', 'ACTIVO', caja_bancos, True)
    create_account('1.1.01.002', 'Banco Nación Cta. Cte.', 'ACTIVO', caja_bancos, True)
    create_account('1.1.01.003', 'Banco Galicia', 'ACTIVO', caja_bancos, True)
    create_account('1.1.01.004', 'Valores a Depositar', 'ACTIVO', caja_bancos, True)
    create_account('1.1.01.005', 'Fondo Fijo', 'ACTIVO', caja_bancos, True)
    create_account('1.1.01.006', 'Moneda Extranjera', 'ACTIVO', caja_bancos, True)

            # 1.1.02 INVERSIONES
    inversiones = create_account('1.1.02', 'INVERSIONES', 'ACTIVO', activo_cte, False)
    create_account('1.1.02.001', 'Plazo Fijo', 'ACTIVO', inversiones, True)
    create_account('1.1.02.002', 'Títulos y Acciones', 'ACTIVO', inversiones, True)

            # 1.1.03 CREDITOS POR VENTAS
    creditos = create_account('1.1.03', 'CREDITOS POR VENTAS', 'ACTIVO', activo_cte, False)
    create_account('1.1.03.001', 'Deudores por Ventas', 'ACTIVO', creditos, True)
    create_account('1.1.03.002', 'Deudores Morosos', 'ACTIVO', creditos, True)
    create_account('1.1.03.003', 'Deudores en Gestión Judicial', 'ACTIVO', creditos, True)
    create_account('1.1.03.004', 'Documentos a Cobrar', 'ACTIVO', creditos, True)
    create_account('1.1.03.005', 'Tarjetas de Crédito a Cobrar', 'ACTIVO', creditos, True)
    create_account('1.1.03.006', 'Cheques Diferidos a Cobrar', 'ACTIVO', creditos, True)

            # 1.1.04 OTROS CREDITOS
    otros_creditos = create_account('1.1.04', 'OTROS CREDITOS', 'ACTIVO', activo_cte, False)
    create_account('1.1.04.001', 'IVA Crédito Fiscal', 'ACTIVO', otros_creditos, True)
    create_account('1.1.04.002', 'Anticipo a Proveedores', 'ACTIVO', otros_creditos, True)
    create_account('1.1.04.003', 'Retenciones Sufridas', 'ACTIVO', otros_creditos, True)
    create_account('1.1.04.004', 'Anticipo de Impuestos', 'ACTIVO', otros_creditos, True)

            # 1.1.05 BIENES DE CAMBIO
    bienes_cambio = create_account('1.1.05', 'BIENES DE CAMBIO', 'ACTIVO', activo_cte, False)
    create_account('1.1.05.001', 'Mercaderías de Reventa', 'ACTIVO', bienes_cambio, True)
    create_account('1.1.05.002', 'Materias Primas', 'ACTIVO', bienes_cambio, True)
    create_account('1.1.05.003', 'Productos en Proceso', 'ACTIVO', bienes_cambio, True) # Optional depending on business

        # 1.2 ACTIVO NO CORRIENTE
    activo_no_cte = create_account('1.2', 'ACTIVO NO CORRIENTE', 'ACTIVO', activo, False)

            # 1.2.01 BIENES DE USO
    bienes_uso = create_account('1.2.01', 'BIENES DE USO', 'ACTIVO', activo_no_cte, False)
    create_account('1.2.01.001', 'Inmuebles', 'ACTIVO', bienes_uso, True)
    create_account('1.2.01.002', 'Rodados', 'ACTIVO', bienes_uso, True)
    create_account('1.2.01.003', 'Muebles y Útiles', 'ACTIVO', bienes_uso, True)
    create_account('1.2.01.004', 'Instalaciones', 'ACTIVO', bienes_uso, True)
    create_account('1.2.01.005', 'Equipos de Computación', 'ACTIVO', bienes_uso, True)
    create_account('1.2.01.006', 'Maquinarias', 'ACTIVO', bienes_uso, True)
    create_account('1.2.01.007', 'Amort. Acum. Inmuebles', 'ACTIVO', bienes_uso, True) # Regularizadora (Usually negative asset, handled as asset here)
    create_account('1.2.01.008', 'Amort. Acum. Rodados', 'ACTIVO', bienes_uso, True)

    # 2. PASIVO
    pasivo = create_account('2', 'PASIVO', 'PASIVO', None, False)
    
        # 2.1 PASIVO CORRIENTE
    pasivo_cte = create_account('2.1', 'PASIVO CORRIENTE', 'PASIVO', pasivo, False)

            # 2.1.01 DEUDAS COMERCIALES
    deudas_com = create_account('2.1.01', 'DEUDAS COMERCIALES', 'PASIVO', pasivo_cte, False)
    create_account('2.1.01.001', 'Proveedores', 'PASIVO', deudas_com, True)
    create_account('2.1.01.002', 'Documentos a Pagar', 'PASIVO', deudas_com, True)
    create_account('2.1.01.003', 'Cheques Diferidos a Pagar', 'PASIVO', deudas_com, True)

            # 2.1.02 DEUDAS SOCIALES
    deudas_soc = create_account('2.1.02', 'DEUDAS SOCIALES', 'PASIVO', pasivo_cte, False)
    create_account('2.1.02.001', 'Sueldos a Pagar', 'PASIVO', deudas_soc, True)
    create_account('2.1.02.002', 'Cargas Sociales a Pagar', 'PASIVO', deudas_soc, True)
    create_account('2.1.02.003', 'Sindicato a Pagar', 'PASIVO', deudas_soc, True)

            # 2.1.03 DEUDAS FISCALES
    deudas_fisc = create_account('2.1.03', 'DEUDAS FISCALES', 'PASIVO', pasivo_cte, False)
    create_account('2.1.03.001', 'IVA Débito Fiscal', 'PASIVO', deudas_fisc, True) # Often mapped to Pasivo waiting for liquidation
    create_account('2.1.03.002', 'IVA a Pagar', 'PASIVO', deudas_fisc, True)
    create_account('2.1.03.003', 'Ingresos Brutos a Pagar', 'PASIVO', deudas_fisc, True)
    create_account('2.1.03.004', 'Ganancias a Pagar', 'PASIVO', deudas_fisc, True)
    create_account('2.1.03.005', 'Monotributo a Pagar', 'PASIVO', deudas_fisc, True)

        # 2.2 PASIVO NO CORRIENTE
    pasivo_no_cte = create_account('2.2', 'PASIVO NO CORRIENTE', 'PASIVO', pasivo, False)
    create_account('2.2.01.001', 'Préstamos Bancarios LP', 'PASIVO', pasivo_no_cte, True)

    # 3. PATRIMONIO NETO
    pn = create_account('3', 'PATRIMONIO NETO', 'PN', None, False)
    create_account('3.1.01.001', 'Capital Social', 'PN', pn, True)
    create_account('3.1.01.002', 'Ajuste de Capital', 'PN', pn, True)
    create_account('3.2.01.001', 'Reserva Legal', 'PN', pn, True)
    create_account('3.3.01.001', 'Resultados Acumulados', 'PN', pn, True)
    create_account('3.3.01.002', 'Resultado del Ejercicio', 'PN', pn, True)

    # 4. RESULTADOS POSITIVOS
    r_pos = create_account('4', 'INGRESOS', 'R_POS', None, False)
    create_account('4.1.01.001', 'Ventas de Mercaderías', 'R_POS', r_pos, True)
    create_account('4.1.01.002', 'Ventas de Servicios', 'R_POS', r_pos, True)
    create_account('4.1.01.003', 'Intereses Ganados', 'R_POS', r_pos, True)
    create_account('4.1.01.004', 'Otros Ingresos', 'R_POS', r_pos, True)

    # 5. RESULTADOS NEGATIVOS
    r_neg = create_account('5', 'EGRESOS', 'R_NEG', None, False)

        # 5.1 Costos
    costos = create_account('5.1', 'COSTOS OPERATIVOS', 'R_NEG', r_neg, False)
    create_account('5.1.01.001', 'Costo de Mercaderías Vendidas', 'R_NEG', costos, True)

        # 5.2 Gastos Administración
    gastos_adm = create_account('5.2', 'GASTOS ADMINISTRATIVOS', 'R_NEG', r_neg, False)
    create_account('5.2.01.001', 'Sueldos y Jornales Adm.', 'R_NEG', gastos_adm, True)
    create_account('5.2.01.002', 'Cargas Sociales Adm.', 'R_NEG', gastos_adm, True)
    create_account('5.2.01.003', 'Alquileres Cedidos', 'R_NEG', gastos_adm, True)
    create_account('5.2.01.004', 'Papelería y Librería', 'R_NEG', gastos_adm, True)
    create_account('5.2.01.005', 'Luz, Gas, Teléfono e Internet', 'R_NEG', gastos_adm, True)
    create_account('5.2.01.006', 'Gastos Bancarios', 'R_NEG', gastos_adm, True)
    create_account('5.2.01.007', 'Seguros', 'R_NEG', gastos_adm, True)

        # 5.3 Gastos Comercialización
    gastos_com = create_account('5.3', 'GASTOS COMERCIALIZACION', 'R_NEG', r_neg, False)
    create_account('5.3.01.001', 'Publicidad y Propaganda', 'R_NEG', gastos_com, True)
    create_account('5.3.01.002', 'Impuesto s/ Ingresos Brutos', 'R_NEG', gastos_com, True)
    create_account('5.3.01.003', 'Comisiones Vendedores', 'R_NEG', gastos_com, True)
    create_account('5.3.01.004', 'Fletes y Acarreos', 'R_NEG', gastos_com, True)

        # 5.4 Gastos Financieros
    gastos_fin = create_account('5.4', 'GASTOS FINANCIEROS', 'R_NEG', r_neg, False)
    create_account('5.4.01.001', 'Intereses Perdidos', 'R_NEG', gastos_fin, True)

        # 5.5 Otros Egresos
    otros_egresos = create_account('5.5', 'OTROS EGRESOS', 'R_NEG', r_neg, False)
    create_account('5.5.01.001', 'Amortizaciones Bienes Uso', 'R_NEG', otros_egresos, True)

    print("Done populating Plan de Cuentas.")

if __name__ == '__main__':
    populate()
