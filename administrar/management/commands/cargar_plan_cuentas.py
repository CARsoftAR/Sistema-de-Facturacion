from django.core.management.base import BaseCommand
from administrar.models import PlanCuenta


class Command(BaseCommand):
    help = 'Carga el Plan de Cuentas estándar para Argentina'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando carga del Plan de Cuentas para Argentina...')
        
        # Limpiar cuentas existentes si se desea
        # PlanCuenta.objects.all().delete()
        
        cuentas = [
            # ============================================
            # 1. ACTIVO
            # ============================================
            {'codigo': '1', 'nombre': 'ACTIVO', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 1, 'padre': None},
            
            # 1.1 ACTIVO CORRIENTE
            {'codigo': '1.1', 'nombre': 'ACTIVO CORRIENTE', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 2, 'padre': '1'},
            
            # 1.1.01 CAJA Y BANCOS
            {'codigo': '1.1.01', 'nombre': 'CAJA Y BANCOS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
            {'codigo': '1.1.01.001', 'nombre': 'Caja en Pesos', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
            {'codigo': '1.1.01.002', 'nombre': 'Caja en Dólares', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
            {'codigo': '1.1.01.003', 'nombre': 'Banco Nación Cta. Cte.', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
            {'codigo': '1.1.01.004', 'nombre': 'Banco Provincia Cta. Cte.', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
            {'codigo': '1.1.01.005', 'nombre': 'Banco Galicia Cta. Cte.', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
            {'codigo': '1.1.01.006', 'nombre': 'Valores a Depositar', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
            {'codigo': '1.1.01.007', 'nombre': 'Cheques de Terceros', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
            {'codigo': '1.1.01.008', 'nombre': 'Fondo Fijo', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.01'},
            
            # 1.1.02 INVERSIONES TEMPORARIAS
            {'codigo': '1.1.02', 'nombre': 'INVERSIONES TEMPORARIAS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
            {'codigo': '1.1.02.001', 'nombre': 'Plazo Fijo en Pesos', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.02'},
            {'codigo': '1.1.02.002', 'nombre': 'Plazo Fijo en Dólares', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.02'},
            {'codigo': '1.1.02.003', 'nombre': 'Fondos Comunes de Inversión', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.02'},
            {'codigo': '1.1.02.004', 'nombre': 'Títulos Públicos', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.02'},
            
            # 1.1.03 CREDITOS POR VENTAS
            {'codigo': '1.1.03', 'nombre': 'CREDITOS POR VENTAS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
            {'codigo': '1.1.03.001', 'nombre': 'Deudores por Ventas', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
            {'codigo': '1.1.03.002', 'nombre': 'Documentos a Cobrar', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
            {'codigo': '1.1.03.003', 'nombre': 'Deudores Morosos', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
            {'codigo': '1.1.03.004', 'nombre': 'Deudores en Gestión Judicial', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
            {'codigo': '1.1.03.005', 'nombre': 'Tarjetas de Crédito a Cobrar', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
            {'codigo': '1.1.03.006', 'nombre': 'Mercado Pago a Cobrar', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
            {'codigo': '1.1.03.007', 'nombre': 'Previsión para Deudores Incobrables', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.03'},
            
            # 1.1.04 OTROS CREDITOS
            {'codigo': '1.1.04', 'nombre': 'OTROS CREDITOS', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
            {'codigo': '1.1.04.001', 'nombre': 'IVA Crédito Fiscal', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
            {'codigo': '1.1.04.002', 'nombre': 'IVA Saldo a Favor', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
            {'codigo': '1.1.04.003', 'nombre': 'Retenciones IIBB Sufridas', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
            {'codigo': '1.1.04.004', 'nombre': 'Retenciones Ganancias Sufridas', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
            {'codigo': '1.1.04.005', 'nombre': 'Percepciones IIBB Sufridas', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
            {'codigo': '1.1.04.006', 'nombre': 'Anticipo Impuesto a las Ganancias', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
            {'codigo': '1.1.04.007', 'nombre': 'Anticipo Ingresos Brutos', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
            {'codigo': '1.1.04.008', 'nombre': 'Préstamos al Personal', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
            {'codigo': '1.1.04.009', 'nombre': 'Anticipos a Proveedores', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.04'},
            
            # 1.1.05 BIENES DE CAMBIO
            {'codigo': '1.1.05', 'nombre': 'BIENES DE CAMBIO', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.1'},
            {'codigo': '1.1.05.001', 'nombre': 'Mercaderías de Reventa', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.05'},
            {'codigo': '1.1.05.002', 'nombre': 'Materias Primas', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.05'},
            {'codigo': '1.1.05.003', 'nombre': 'Productos en Proceso', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.05'},
            {'codigo': '1.1.05.004', 'nombre': 'Productos Terminados', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.05'},
            {'codigo': '1.1.05.005', 'nombre': 'Mercaderías en Tránsito', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.1.05'},
            
            # 1.2 ACTIVO NO CORRIENTE
            {'codigo': '1.2', 'nombre': 'ACTIVO NO CORRIENTE', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 2, 'padre': '1'},
            
            # 1.2.01 BIENES DE USO
            {'codigo': '1.2.01', 'nombre': 'BIENES DE USO', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.2'},
            {'codigo': '1.2.01.001', 'nombre': 'Inmuebles', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
            {'codigo': '1.2.01.002', 'nombre': 'Rodados', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
            {'codigo': '1.2.01.003', 'nombre': 'Muebles y Útiles', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
            {'codigo': '1.2.01.004', 'nombre': 'Instalaciones', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
            {'codigo': '1.2.01.005', 'nombre': 'Equipos de Computación', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
            {'codigo': '1.2.01.006', 'nombre': 'Maquinarias', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
            {'codigo': '1.2.01.007', 'nombre': 'Herramientas', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
            {'codigo': '1.2.01.099', 'nombre': 'Amortización Acumulada Bienes de Uso', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.01'},
            
            # 1.2.02 INVERSIONES PERMANENTES
            {'codigo': '1.2.02', 'nombre': 'INVERSIONES PERMANENTES', 'tipo': 'ACTIVO', 'imputable': False, 'nivel': 3, 'padre': '1.2'},
            {'codigo': '1.2.02.001', 'nombre': 'Participaciones en Sociedades', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.02'},
            {'codigo': '1.2.02.002', 'nombre': 'Inmuebles para Renta', 'tipo': 'ACTIVO', 'imputable': True, 'nivel': 4, 'padre': '1.2.02'},
            
            # ============================================
            # 2. PASIVO
            # ============================================
            {'codigo': '2', 'nombre': 'PASIVO', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 1, 'padre': None},
            
            # 2.1 PASIVO CORRIENTE
            {'codigo': '2.1', 'nombre': 'PASIVO CORRIENTE', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 2, 'padre': '2'},
            
            # 2.1.01 DEUDAS COMERCIALES
            {'codigo': '2.1.01', 'nombre': 'DEUDAS COMERCIALES', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.1'},
            {'codigo': '2.1.01.001', 'nombre': 'Proveedores', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.01'},
            {'codigo': '2.1.01.002', 'nombre': 'Documentos a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.01'},
            {'codigo': '2.1.01.003', 'nombre': 'Cheques Diferidos a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.01'},
            {'codigo': '2.1.01.004', 'nombre': 'Anticipos de Clientes', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.01'},
            
            # 2.1.02 DEUDAS BANCARIAS Y FINANCIERAS
            {'codigo': '2.1.02', 'nombre': 'DEUDAS BANCARIAS Y FINANCIERAS', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.1'},
            {'codigo': '2.1.02.001', 'nombre': 'Préstamos Bancarios', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.02'},
            {'codigo': '2.1.02.002', 'nombre': 'Descubierto en Cuenta Corriente', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.02'},
            {'codigo': '2.1.02.003', 'nombre': 'Tarjetas de Crédito', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.02'},
            {'codigo': '2.1.02.004', 'nombre': 'Intereses a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.02'},
            
            # 2.1.03 DEUDAS SOCIALES
            {'codigo': '2.1.03', 'nombre': 'DEUDAS SOCIALES', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.1'},
            {'codigo': '2.1.03.001', 'nombre': 'Sueldos y Jornales a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.03'},
            {'codigo': '2.1.03.002', 'nombre': 'Cargas Sociales a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.03'},
            {'codigo': '2.1.03.003', 'nombre': 'Aportes y Contribuciones a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.03'},
            {'codigo': '2.1.03.004', 'nombre': 'Provisión para SAC', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.03'},
            {'codigo': '2.1.03.005', 'nombre': 'Provisión para Vacaciones', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.03'},
            
            # 2.1.04 DEUDAS FISCALES
            {'codigo': '2.1.04', 'nombre': 'DEUDAS FISCALES', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.1'},
            {'codigo': '2.1.04.001', 'nombre': 'IVA Débito Fiscal', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.04'},
            {'codigo': '2.1.04.002', 'nombre': 'IVA a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.04'},
            {'codigo': '2.1.04.003', 'nombre': 'Ingresos Brutos a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.04'},
            {'codigo': '2.1.04.004', 'nombre': 'Impuesto a las Ganancias a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.04'},
            {'codigo': '2.1.04.005', 'nombre': 'Retenciones a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.04'},
            {'codigo': '2.1.04.006', 'nombre': 'Percepciones a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.04'},
            {'codigo': '2.1.04.007', 'nombre': 'Impuesto sobre los Bienes Personales', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.04'},
            {'codigo': '2.1.04.008', 'nombre': 'Tasas Municipales a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.1.04'},
            
            # 2.2 PASIVO NO CORRIENTE
            {'codigo': '2.2', 'nombre': 'PASIVO NO CORRIENTE', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 2, 'padre': '2'},
            
            # 2.2.01 DEUDAS A LARGO PLAZO
            {'codigo': '2.2.01', 'nombre': 'DEUDAS A LARGO PLAZO', 'tipo': 'PASIVO', 'imputable': False, 'nivel': 3, 'padre': '2.2'},
            {'codigo': '2.2.01.001', 'nombre': 'Préstamos Bancarios L.P.', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.2.01'},
            {'codigo': '2.2.01.002', 'nombre': 'Obligaciones Negociables', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.2.01'},
            {'codigo': '2.2.01.003', 'nombre': 'Hipotecas a Pagar', 'tipo': 'PASIVO', 'imputable': True, 'nivel': 4, 'padre': '2.2.01'},
            
            # ============================================
            # 3. PATRIMONIO NETO
            # ============================================
            {'codigo': '3', 'nombre': 'PATRIMONIO NETO', 'tipo': 'PN', 'imputable': False, 'nivel': 1, 'padre': None},
            
            # 3.1 CAPITAL
            {'codigo': '3.1', 'nombre': 'CAPITAL', 'tipo': 'PN', 'imputable': False, 'nivel': 2, 'padre': '3'},
            {'codigo': '3.1.01', 'nombre': 'Capital Social', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.1'},
            {'codigo': '3.1.02', 'nombre': 'Aportes Irrevocables', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.1'},
            {'codigo': '3.1.03', 'nombre': 'Ajuste de Capital', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.1'},
            
            # 3.2 RESERVAS
            {'codigo': '3.2', 'nombre': 'RESERVAS', 'tipo': 'PN', 'imputable': False, 'nivel': 2, 'padre': '3'},
            {'codigo': '3.2.01', 'nombre': 'Reserva Legal', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.2'},
            {'codigo': '3.2.02', 'nombre': 'Reserva Estatutaria', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.2'},
            {'codigo': '3.2.03', 'nombre': 'Reserva Facultativa', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.2'},
            
            # 3.3 RESULTADOS
            {'codigo': '3.3', 'nombre': 'RESULTADOS', 'tipo': 'PN', 'imputable': False, 'nivel': 2, 'padre': '3'},
            {'codigo': '3.3.01', 'nombre': 'Resultados Acumulados', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.3'},
            {'codigo': '3.3.02', 'nombre': 'Resultado del Ejercicio', 'tipo': 'PN', 'imputable': True, 'nivel': 3, 'padre': '3.3'},
            
            # ============================================
            # 4. INGRESOS (RESULTADOS POSITIVOS)
            # ============================================
            {'codigo': '4', 'nombre': 'INGRESOS', 'tipo': 'R_POS', 'imputable': False, 'nivel': 1, 'padre': None},
            
            # 4.1 VENTAS
            {'codigo': '4.1', 'nombre': 'VENTAS', 'tipo': 'R_POS', 'imputable': False, 'nivel': 2, 'padre': '4'},
            {'codigo': '4.1.01', 'nombre': 'Ventas de Mercaderías', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.1'},
            {'codigo': '4.1.02', 'nombre': 'Ventas de Productos', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.1'},
            {'codigo': '4.1.03', 'nombre': 'Ventas de Servicios', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.1'},
            {'codigo': '4.1.04', 'nombre': 'Devoluciones sobre Ventas', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.1'},
            {'codigo': '4.1.05', 'nombre': 'Descuentos sobre Ventas', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.1'},
            
            # 4.2 OTROS INGRESOS
            {'codigo': '4.2', 'nombre': 'OTROS INGRESOS', 'tipo': 'R_POS', 'imputable': False, 'nivel': 2, 'padre': '4'},
            {'codigo': '4.2.01', 'nombre': 'Intereses Ganados', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
            {'codigo': '4.2.02', 'nombre': 'Descuentos Obtenidos', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
            {'codigo': '4.2.03', 'nombre': 'Alquileres Ganados', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
            {'codigo': '4.2.04', 'nombre': 'Comisiones Ganadas', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
            {'codigo': '4.2.05', 'nombre': 'Recupero de Gastos', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
            {'codigo': '4.2.06', 'nombre': 'Diferencias de Cambio Positivas', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
            {'codigo': '4.2.07', 'nombre': 'Resultado por Venta de Bienes de Uso', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
            
            # ============================================
            # 5. EGRESOS (RESULTADOS NEGATIVOS)
            # ============================================
            {'codigo': '5', 'nombre': 'EGRESOS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 1, 'padre': None},
            
            # 5.1 COSTO DE VENTAS
            {'codigo': '5.1', 'nombre': 'COSTO DE VENTAS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
            {'codigo': '5.1.01', 'nombre': 'Costo de Mercaderías Vendidas', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.1'},
            {'codigo': '5.1.02', 'nombre': 'Costo de Productos Vendidos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.1'},
            {'codigo': '5.1.03', 'nombre': 'Costo de Servicios Prestados', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.1'},
            
            # 5.2 GASTOS DE ADMINISTRACION
            {'codigo': '5.2', 'nombre': 'GASTOS DE ADMINISTRACION', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
            {'codigo': '5.2.01', 'nombre': 'Sueldos y Jornales', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.02', 'nombre': 'Cargas Sociales', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.03', 'nombre': 'Honorarios Profesionales', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.04', 'nombre': 'Alquileres', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.05', 'nombre': 'Servicios Públicos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.06', 'nombre': 'Teléfono e Internet', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.07', 'nombre': 'Papelería y Útiles', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.08', 'nombre': 'Seguros', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.09', 'nombre': 'Amortizaciones', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.10', 'nombre': 'Mantenimiento y Reparaciones', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.11', 'nombre': 'Gastos de Limpieza', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            {'codigo': '5.2.12', 'nombre': 'Gastos de Movilidad', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.2'},
            
            # 5.3 GASTOS DE COMERCIALIZACION
            {'codigo': '5.3', 'nombre': 'GASTOS DE COMERCIALIZACION', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
            {'codigo': '5.3.01', 'nombre': 'Sueldos Vendedores', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
            {'codigo': '5.3.02', 'nombre': 'Comisiones sobre Ventas', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
            {'codigo': '5.3.03', 'nombre': 'Publicidad y Propaganda', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
            {'codigo': '5.3.04', 'nombre': 'Gastos de Envío', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
            {'codigo': '5.3.05', 'nombre': 'Fletes y Acarreos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
            {'codigo': '5.3.06', 'nombre': 'Gastos de Viaje', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
            {'codigo': '5.3.07', 'nombre': 'Impuesto a los Ingresos Brutos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
            {'codigo': '5.3.08', 'nombre': 'Impuesto a los Débitos y Créditos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
            {'codigo': '5.3.09', 'nombre': 'Gastos de Tarjetas de Crédito', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.3'},
            
            # 5.4 GASTOS FINANCIEROS
            {'codigo': '5.4', 'nombre': 'GASTOS FINANCIEROS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
            {'codigo': '5.4.01', 'nombre': 'Intereses Perdidos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.4'},
            {'codigo': '5.4.02', 'nombre': 'Gastos Bancarios', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.4'},
            {'codigo': '5.4.03', 'nombre': 'Descuentos Cedidos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.4'},
            {'codigo': '5.4.04', 'nombre': 'Diferencias de Cambio Negativas', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.4'},
            {'codigo': '5.4.05', 'nombre': 'Comisiones Bancarias', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.4'},
            
            # 5.5 OTROS EGRESOS
            {'codigo': '5.5', 'nombre': 'OTROS EGRESOS', 'tipo': 'R_NEG', 'imputable': False, 'nivel': 2, 'padre': '5'},
            {'codigo': '5.5.01', 'nombre': 'Donaciones', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.5'},
            {'codigo': '5.5.02', 'nombre': 'Multas y Recargos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.5'},
            {'codigo': '5.5.03', 'nombre': 'Quebrantos', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.5'},
            {'codigo': '5.5.04', 'nombre': 'Deudores Incobrables', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.5'},
            {'codigo': '5.5.05', 'nombre': 'Gastos Varios', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.5'},
            {'codigo': '5.5.06', 'nombre': 'Faltante de Caja', 'tipo': 'R_NEG', 'imputable': True, 'nivel': 3, 'padre': '5.5'},

            # 4.2.XX (Adding to Other Incomes)
            {'codigo': '4.2.08', 'nombre': 'Otros Ingresos', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
            {'codigo': '4.2.09', 'nombre': 'Sobrante de Caja', 'tipo': 'R_POS', 'imputable': True, 'nivel': 3, 'padre': '4.2'},
        ]

        creadas = 0
        existentes = 0
        errores = 0

        for c in cuentas:
            try:
                padre = None
                if c['padre']:
                    try:
                        padre = PlanCuenta.objects.get(codigo=c['padre'])
                    except PlanCuenta.DoesNotExist:
                        self.stdout.write(self.style.WARNING(
                            f"Advertencia: Padre {c['padre']} no encontrado para {c['codigo']}"
                        ))
                        errores += 1
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
                    self.stdout.write(f"[OK] Creada: {c['codigo']} - {c['nombre']}")
                else:
                    existentes += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f"Error al crear {c['codigo']}: {str(e)}"
                ))
                errores += 1

        self.stdout.write(self.style.SUCCESS(
            f'\n=== Proceso finalizado ==='
        ))
        self.stdout.write(f'Cuentas creadas: {creadas}')
        self.stdout.write(f'Cuentas existentes: {existentes}')
        if errores > 0:
            self.stdout.write(self.style.WARNING(f'Errores: {errores}'))
