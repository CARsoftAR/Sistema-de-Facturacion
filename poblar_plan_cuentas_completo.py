import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import PlanCuenta

print("=" * 60)
print("EXPANSIÓN DEL PLAN DE CUENTAS")
print("=" * 60)

# Lista completa de cuentas ordenadas jerárquicamente
# Formato: (codigo, nombre, tipo, imputable, nivel, padre_codigo)
# NOTA: Omitimos las que ya sabemos que existen en el script básico para no redundar, 
# pero el script verificará existencia de todas formas.

nuevas_cuentas = [
    # 1. ACTIVO
    # 1.1 ACTIVO CORRIENTE
    # 1.1.01 CAJA Y BANCOS
    ('1.1.01.003', 'Valores a Depositar', 'ACTIVO', True, 4, '1.1.01'),
    ('1.1.01.004', 'Fondo Fijo', 'ACTIVO', True, 4, '1.1.01'),
    ('1.1.01.005', 'Moneda Extranjera', 'ACTIVO', True, 4, '1.1.01'),
    
    # 1.1.02 CREDITOS POR VENTAS
    ('1.1.02.002', 'Deudores Morosos', 'ACTIVO', True, 4, '1.1.02'),
    ('1.1.02.003', 'Deudores en Gestión Judicial', 'ACTIVO', True, 4, '1.1.02'),
    ('1.1.02.004', 'Documentos a Cobrar', 'ACTIVO', True, 4, '1.1.02'),
    ('1.1.02.005', 'Tarjeta de Crédito a Cobrar', 'ACTIVO', True, 4, '1.1.02'),
    ('1.1.02.099', 'Previsión para Deudores Incobrables', 'ACTIVO', True, 4, '1.1.02'), # Regularizadora

    # 1.1.03 BIENES DE CAMBIO (Ya tiene Mercaderías)
    ('1.1.03.002', 'Anticipo a Proveedores', 'ACTIVO', True, 4, '1.1.03'),
    
    # 1.1.04 OTROS CREDITOS
    ('1.1.04.002', 'Anticipo de Impuestos', 'ACTIVO', True, 4, '1.1.04'),
    ('1.1.04.003', 'Gastos Pagados por Adelantado', 'ACTIVO', True, 4, '1.1.04'),
    ('1.1.04.004', 'Retenciones de IVA', 'ACTIVO', True, 4, '1.1.04'),
    ('1.1.04.005', 'Retenciones de IIBB', 'ACTIVO', True, 4, '1.1.04'),
    ('1.1.04.006', 'Saldo a Favor IIBB', 'ACTIVO', True, 4, '1.1.04'),

    # 1.1.05 INVERSIONES (NUEVO RUBRO n3)
    ('1.1.05', 'INVERSIONES TEMPORARIAS', 'ACTIVO', False, 3, '1.1'),
    ('1.1.05.001', 'Plazo Fijo', 'ACTIVO', True, 4, '1.1.05'),

    # 1.2 ACTIVO NO CORRIENTE (NUEVO RUBRO n2)
    ('1.2', 'ACTIVO NO CORRIENTE', 'ACTIVO', False, 2, '1'),
    
    ('1.2.01', 'BIENES DE USO', 'ACTIVO', False, 3, '1.2'),
    ('1.2.01.001', 'Inmuebles', 'ACTIVO', True, 4, '1.2.01'),
    ('1.2.01.002', 'Rodados', 'ACTIVO', True, 4, '1.2.01'),
    ('1.2.01.003', 'Muebles y Útiles', 'ACTIVO', True, 4, '1.2.01'),
    ('1.2.01.004', 'Instalaciones', 'ACTIVO', True, 4, '1.2.01'),
    ('1.2.01.005', 'Equipos de Computación', 'ACTIVO', True, 4, '1.2.01'),
    ('1.2.01.051', 'Amort. Acum. Inmuebles', 'ACTIVO', True, 4, '1.2.01'),
    ('1.2.01.052', 'Amort. Acum. Rodados', 'ACTIVO', True, 4, '1.2.01'),
    ('1.2.01.053', 'Amort. Acum. Muebles y Útiles', 'ACTIVO', True, 4, '1.2.01'),

    ('1.2.02', 'ACTIVOS INTANGIBLES', 'ACTIVO', False, 3, '1.2'),
    ('1.2.02.001', 'Marcas y Patentes', 'ACTIVO', True, 4, '1.2.02'),

    # 2. PASIVO
    # 2.1 PASIVO CORRIENTE
    # 2.1.01 DEUDAS COMERCIALES
    ('2.1.01.002', 'Documentos a Pagar', 'PASIVO', True, 4, '2.1.01'),
    ('2.1.01.003', 'Anticipo de Clientes', 'PASIVO', True, 4, '2.1.01'),

    # 2.1.02 DEUDAS FISCALES
    ('2.1.02.002', 'IVA a Pagar', 'PASIVO', True, 4, '2.1.02'),
    ('2.1.02.003', 'Ingresos Brutos a Pagar', 'PASIVO', True, 4, '2.1.02'),
    ('2.1.02.004', 'Impuesto a las Ganancias a Pagar', 'PASIVO', True, 4, '2.1.02'),
    ('2.1.02.005', 'Moratorias Fiscales', 'PASIVO', True, 4, '2.1.02'),

    # 2.1.03 DEUDAS SOCIALES (NUEVO RUBRO n3)
    ('2.1.03', 'DEUDAS SOCIALES', 'PASIVO', False, 3, '2.1'),
    ('2.1.03.001', 'Sueldos a Pagar', 'PASIVO', True, 4, '2.1.03'),
    ('2.1.03.002', 'Cargas Sociales a Pagar', 'PASIVO', True, 4, '2.1.03'),
    ('2.1.03.003', 'Sindicato a Pagar', 'PASIVO', True, 4, '2.1.03'),

    # 2.1.04 OTRAS DEUDAS (NUEVO RUBRO n3)
    ('2.1.04', 'DEUDAS FINANCIERAS', 'PASIVO', False, 3, '2.1'),
    ('2.1.04.001', 'Préstamos Bancarios', 'PASIVO', True, 4, '2.1.04'),
    ('2.1.04.002', 'Adelanto en Cta Cte', 'PASIVO', True, 4, '2.1.04'),

    # 2.2 PASIVO NO CORRIENTE (NUEVO RUBRO n2)
    ('2.2', 'PASIVO NO CORRIENTE', 'PASIVO', False, 2, '2'),
    ('2.2.01', 'DEUDAS A LARGO PLAZO', 'PASIVO', False, 3, '2.2'),
    ('2.2.01.001', 'Préstamos Bancarios LP', 'PASIVO', True, 4, '2.2.01'),

    # 3. PATRIMONIO NETO
    # 3.1.02 AJUSTES CAPITAL
    ('3.1.02', 'Ajuste de Capital', 'PN', True, 3, '3.1'),
    
    # 3.2 RESULTADOS
    ('3.2.02', 'Resultado del Ejercicio', 'PN', True, 3, '3.2'),
    ('3.2.03', 'Reservas', 'PN', True, 3, '3.2'),

    # 4. RESULTADOS POSITIVOS
    # 4.1.02 OTROS INGRESOS
    ('4.1.02', 'OTROS INGRESOS', 'R_POS', False, 3, '4.1'), # OJO: 4.1 era INGRESOS POR VENTAS. Quizás deberíamos crear 4.2
    # Mejor crear 4.2 OTROS INGRESOS
    ('4.2', 'OTROS INGRESOS', 'R_POS', False, 2, '4'),
    ('4.2.01', 'Intereses Ganados', 'R_POS', True, 3, '4.2'),
    ('4.2.02', 'Descuentos Obtenidos', 'R_POS', True, 3, '4.2'),
    ('4.2.03', 'Resultado Venta Bienes de Uso', 'R_POS', True, 3, '4.2'),

    # 5. RESULTADOS NEGATIVOS
    # 5.2 GASTOS DE ADMINISTRACION (NUEVO RUBRO n2)
    ('5.2', 'GASTOS DE ADMINISTRACIÓN', 'R_NEG', False, 2, '5'),
    ('5.2.01', 'Sueldos y Jornales Adm.', 'R_NEG', True, 3, '5.2'),
    ('5.2.02', 'Cargas Sociales Adm.', 'R_NEG', True, 3, '5.2'),
    ('5.2.03', 'Alquileres Cedidos', 'R_NEG', True, 3, '5.2'), # O Pagados
    ('5.2.04', 'Luz, Gas y Teléfono', 'R_NEG', True, 3, '5.2'),
    ('5.2.05', 'Internet y Comunicaciones', 'R_NEG', True, 3, '5.2'),
    ('5.2.06', 'Papelería y Librería', 'R_NEG', True, 3, '5.2'),
    ('5.2.07', 'Honorarios Profesionales', 'R_NEG', True, 3, '5.2'),
    ('5.2.08', 'Mantenimiento y Reparaciones', 'R_NEG', True, 3, '5.2'),
    ('5.2.09', 'Seguros', 'R_NEG', True, 3, '5.2'),
    ('5.2.10', 'Amortizaciones', 'R_NEG', True, 3, '5.2'),

    # 5.3 GASTOS DE COMERCIALIZACION (NUEVO RUBRO n2)
    ('5.3', 'GASTOS DE COMERCIALIZACIÓN', 'R_NEG', False, 2, '5'),
    ('5.3.01', 'Sueldos y Jornales Com.', 'R_NEG', True, 3, '5.3'),
    ('5.3.02', 'Cargas Sociales Com.', 'R_NEG', True, 3, '5.3'),
    ('5.3.03', 'Comisiones Vendedores', 'R_NEG', True, 3, '5.3'),
    ('5.3.04', 'Publicidad y Propaganda', 'R_NEG', True, 3, '5.3'),
    ('5.3.05', 'Impuesto a los Ingresos Brutos', 'R_NEG', True, 3, '5.3'),
    ('5.3.06', 'Fletes y Acarreos', 'R_NEG', True, 3, '5.3'),
    ('5.3.07', 'Gastos de Rodados', 'R_NEG', True, 3, '5.3'),

    # 5.4 GASTOS FINANCIEROS (NUEVO RUBRO n2)
    ('5.4', 'RESULTADOS FINANCIEROS', 'R_NEG', False, 2, '5'),
    ('5.4.01', 'Intereses Perdidos', 'R_NEG', True, 3, '5.4'),
    ('5.4.02', 'Gastos Bancarios', 'R_NEG', True, 3, '5.4'),
    ('5.4.03', 'Descuentos Cedidos', 'R_NEG', True, 3, '5.4'),
    ('5.4.04', 'Impuesto Débitos/Créditos', 'R_NEG', True, 3, '5.4'),
]

creadas = 0
omitidas = 0

for codigo, nombre, tipo, imputable, nivel, padre_codigo in nuevas_cuentas:
    # 1. Verificar si existe
    if PlanCuenta.objects.filter(codigo=codigo).exists():
        # print(f"  [SKIP] {codigo} ya existe")
        omitidas += 1
        continue

    # 2. Buscar padre
    padre_obj = None
    if padre_codigo:
        padre_obj = PlanCuenta.objects.filter(codigo=padre_codigo).first()
        if not padre_obj:
            print(f"  [ERROR] Padre {padre_codigo} no encontrado para {codigo}. Saltando.")
            continue
    
    # 3. Crear
    try:
        PlanCuenta.objects.create(
            codigo=codigo,
            nombre=nombre,
            tipo=tipo,
            imputable=imputable,
            nivel=nivel,
            padre=padre_obj
        )
        print(f"  [OK] Creada: {codigo} - {nombre}")
        creadas += 1
    except Exception as e:
        print(f"  [ERROR] Falló crear {codigo}: {e}")

print("-" * 60)
print(f"Proceso finalizado.")
print(f"Cuentas agregadas: {creadas}")
print(f"Cuentas preexistentes: {omitidas}")
print(f"Total cuentas ahora: {PlanCuenta.objects.count()}")
print("=" * 60)
