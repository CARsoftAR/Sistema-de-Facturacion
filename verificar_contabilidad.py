"""
Script de Verificación de Contabilidad de Operaciones Comerciales

Este script verifica que todas las operaciones comerciales generen
correctamente sus asientos contables.
"""

import os
import django
import sys

# Configurar Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import (
    Venta, Compra, Recibo, Cheque, MovimientoCaja, MovimientoBanco,
    Asiento, ItemAsiento, EjercicioContable, PlanCuenta
)
from administrar.services import AccountingService
from decimal import Decimal
from datetime import date, timedelta

class VerificadorContabilidad:
    """Verifica la integridad de los asientos contables"""
    
    def __init__(self):
        self.errores = []
        self.advertencias = []
        self.exitos = []
        
    def log_error(self, mensaje):
        self.errores.append(f"❌ ERROR: {mensaje}")
        print(f"❌ {mensaje}")
        
    def log_advertencia(self, mensaje):
        self.advertencias.append(f"⚠️  ADVERTENCIA: {mensaje}")
        print(f"⚠️  {mensaje}")
        
    def log_exito(self, mensaje):
        self.exitos.append(f"✅ {mensaje}")
        print(f"✅ {mensaje}")
    
    def verificar_ejercicio_vigente(self):
        """Verifica que exista un ejercicio contable vigente"""
        print("\n" + "="*60)
        print("1. VERIFICANDO EJERCICIO CONTABLE")
        print("="*60)
        
        hoy = date.today()
        ejercicio = EjercicioContable.objects.filter(
            fecha_inicio__lte=hoy,
            fecha_fin__gte=hoy,
            cerrado=False
        ).first()
        
        if ejercicio:
            self.log_exito(f"Ejercicio vigente encontrado: {ejercicio.nombre}")
            self.log_exito(f"  Período: {ejercicio.fecha_inicio} a {ejercicio.fecha_fin}")
            return ejercicio
        else:
            self.log_error("No hay ejercicio contable vigente")
            return None
    
    def verificar_plan_cuentas(self):
        """Verifica que existan las cuentas contables necesarias"""
        print("\n" + "="*60)
        print("2. VERIFICANDO PLAN DE CUENTAS")
        print("="*60)
        
        cuentas_requeridas = [
            "Deudores por Ventas",
            "Ventas",
            "IVA Débito Fiscal",
            "Costo de Ventas",
            "Mercaderías",
            "IVA Crédito Fiscal",
            "Proveedores",
            "Caja en Pesos",
            "Valores a Depositar",
            "Banco",
            "Retenciones a Depositar",
            "Retenciones Sufridas"
        ]
        
        for nombre_cuenta in cuentas_requeridas:
            cuenta = AccountingService._obtener_cuenta(nombre_cuenta)
            if cuenta:
                self.log_exito(f"Cuenta '{nombre_cuenta}' encontrada: {cuenta.codigo}")
            else:
                self.log_error(f"Cuenta '{nombre_cuenta}' NO encontrada")
    
    def verificar_balance_asientos(self):
        """Verifica que todos los asientos estén balanceados (Debe = Haber)"""
        print("\n" + "="*60)
        print("3. VERIFICANDO BALANCE DE ASIENTOS")
        print("="*60)
        
        asientos_desbalanceados = []
        
        for asiento in Asiento.objects.all():
            total_debe = sum(item.debe for item in asiento.items.all())
            total_haber = sum(item.haber for item in asiento.items.all())
            
            if abs(total_debe - total_haber) > Decimal("0.01"):
                asientos_desbalanceados.append({
                    'id': asiento.id,
                    'numero': asiento.numero,
                    'descripcion': asiento.descripcion,
                    'debe': total_debe,
                    'haber': total_haber,
                    'diferencia': total_debe - total_haber
                })
        
        if asientos_desbalanceados:
            self.log_error(f"Se encontraron {len(asientos_desbalanceados)} asientos desbalanceados:")
            for asiento in asientos_desbalanceados:
                print(f"  - Asiento #{asiento['numero']}: {asiento['descripcion']}")
                print(f"    Debe: {asiento['debe']}, Haber: {asiento['haber']}, Dif: {asiento['diferencia']}")
        else:
            self.log_exito(f"Todos los asientos ({Asiento.objects.count()}) están balanceados")
    
    def verificar_ventas(self):
        """Verifica que las ventas tengan sus asientos contables"""
        print("\n" + "="*60)
        print("4. VERIFICANDO ASIENTOS DE VENTAS")
        print("="*60)
        
        total_ventas = Venta.objects.count()
        ventas_recientes = Venta.objects.order_by('-fecha')[:10]
        
        print(f"Total de ventas en el sistema: {total_ventas}")
        print(f"Verificando las últimas 10 ventas...")
        
        for venta in ventas_recientes:
            # Buscar asiento relacionado
            descripcion_esperada = f"Venta {venta.tipo_comprobante}"
            asientos = Asiento.objects.filter(
                descripcion__icontains=descripcion_esperada,
                origen='VENTAS'
            )
            
            if asientos.exists():
                self.log_exito(f"Venta #{venta.id} tiene asiento contable")
            else:
                self.log_advertencia(f"Venta #{venta.id} NO tiene asiento contable")
    
    def verificar_compras(self):
        """Verifica que las compras tengan sus asientos contables"""
        print("\n" + "="*60)
        print("5. VERIFICANDO ASIENTOS DE COMPRAS")
        print("="*60)
        
        total_compras = Compra.objects.count()
        compras_recientes = Compra.objects.order_by('-fecha')[:10]
        
        print(f"Total de compras en el sistema: {total_compras}")
        print(f"Verificando las últimas 10 compras...")
        
        for compra in compras_recientes:
            asientos = Asiento.objects.filter(
                descripcion__icontains="Compra",
                origen='COMPRAS'
            )
            
            if asientos.exists():
                self.log_exito(f"Compra #{compra.id} tiene asiento contable")
            else:
                self.log_advertencia(f"Compra #{compra.id} NO tiene asiento contable")
    
    def verificar_cheques(self):
        """Verifica que los cheques tengan sus asientos contables"""
        print("\n" + "="*60)
        print("6. VERIFICANDO ASIENTOS DE CHEQUES")
        print("="*60)
        
        total_cheques = Cheque.objects.filter(tipo='TERCERO').count()
        cheques_recientes = Cheque.objects.filter(tipo='TERCERO').order_by('-fecha_emision')[:10]
        
        print(f"Total de cheques de terceros: {total_cheques}")
        print(f"Verificando los últimos 10 cheques...")
        
        for cheque in cheques_recientes:
            asientos = Asiento.objects.filter(
                descripcion__icontains=f"Cheque {cheque.numero}",
                origen='COBROS'
            )
            
            if asientos.exists():
                self.log_exito(f"Cheque #{cheque.id} ({cheque.numero}) tiene asiento(s)")
            else:
                self.log_advertencia(f"Cheque #{cheque.id} ({cheque.numero}) NO tiene asientos")
    
    def verificar_recibos(self):
        """Verifica que los recibos tengan sus asientos contables"""
        print("\n" + "="*60)
        print("7. VERIFICANDO ASIENTOS DE RECIBOS")
        print("="*60)
        
        total_recibos = Recibo.objects.count()
        recibos_recientes = Recibo.objects.order_by('-fecha')[:10]
        
        print(f"Total de recibos en el sistema: {total_recibos}")
        print(f"Verificando los últimos 10 recibos...")
        
        for recibo in recibos_recientes:
            # Los recibos pueden generar múltiples asientos (cheques, retenciones, etc.)
            # pero deberían tener al menos uno
            asientos = Asiento.objects.filter(
                descripcion__icontains=f"Recibo #{recibo.numero_formateado()}"
            )
            
            if asientos.exists():
                self.log_exito(f"Recibo #{recibo.numero_formateado()} tiene {asientos.count()} asiento(s)")
            else:
                self.log_advertencia(f"Recibo #{recibo.numero_formateado()} NO tiene asientos")
    
    def verificar_movimientos_caja(self):
        """Verifica que los movimientos de caja tengan sus asientos"""
        print("\n" + "="*60)
        print("8. VERIFICANDO ASIENTOS DE MOVIMIENTOS DE CAJA")
        print("="*60)
        
        total_movimientos = MovimientoCaja.objects.count()
        movimientos_recientes = MovimientoCaja.objects.order_by('-fecha')[:10]
        
        print(f"Total de movimientos de caja: {total_movimientos}")
        print(f"Verificando los últimos 10 movimientos...")
        
        for mov in movimientos_recientes:
            asientos = Asiento.objects.filter(
                descripcion__icontains=mov.descripcion[:30]
            )
            
            if asientos.exists():
                self.log_exito(f"Movimiento Caja #{mov.id} tiene asiento")
            else:
                self.log_advertencia(f"Movimiento Caja #{mov.id} NO tiene asiento")
    
    def generar_reporte(self):
        """Genera un reporte final de la verificación"""
        print("\n" + "="*60)
        print("REPORTE FINAL DE VERIFICACIÓN")
        print("="*60)
        
        print(f"\n✅ Éxitos: {len(self.exitos)}")
        print(f"⚠️  Advertencias: {len(self.advertencias)}")
        print(f"❌ Errores: {len(self.errores)}")
        
        if self.errores:
            print("\n" + "-"*60)
            print("ERRORES CRÍTICOS:")
            print("-"*60)
            for error in self.errores:
                print(error)
        
        if self.advertencias:
            print("\n" + "-"*60)
            print("ADVERTENCIAS:")
            print("-"*60)
            for adv in self.advertencias[:10]:  # Mostrar solo las primeras 10
                print(adv)
            if len(self.advertencias) > 10:
                print(f"... y {len(self.advertencias) - 10} advertencias más")
        
        print("\n" + "="*60)
        if self.errores:
            print("RESULTADO: ❌ VERIFICACIÓN FALLIDA")
        elif self.advertencias:
            print("RESULTADO: ⚠️  VERIFICACIÓN CON ADVERTENCIAS")
        else:
            print("RESULTADO: ✅ VERIFICACIÓN EXITOSA")
        print("="*60 + "\n")

def main():
    print("\n" + "="*60)
    print("VERIFICACIÓN DE CONTABILIDAD DE OPERACIONES COMERCIALES")
    print("="*60)
    
    verificador = VerificadorContabilidad()
    
    # Ejecutar todas las verificaciones
    ejercicio = verificador.verificar_ejercicio_vigente()
    
    if not ejercicio:
        print("\n⚠️  No se puede continuar sin un ejercicio contable vigente")
        return
    
    verificador.verificar_plan_cuentas()
    verificador.verificar_balance_asientos()
    verificador.verificar_ventas()
    verificador.verificar_compras()
    verificador.verificar_cheques()
    verificador.verificar_recibos()
    verificador.verificar_movimientos_caja()
    
    # Generar reporte final
    verificador.generar_reporte()

if __name__ == '__main__':
    main()
