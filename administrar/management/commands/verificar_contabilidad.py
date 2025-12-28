# -*- coding: utf-8 -*-
"""
Comando de Django para verificar la integridad de los asientos contables
"""

from django.core.management.base import BaseCommand
from administrar.models import (
    Venta, Compra, Recibo, Cheque, MovimientoCaja,
    Asiento, ItemAsiento, EjercicioContable, PlanCuenta
)
from administrar.services import AccountingService
from decimal import Decimal
from datetime import date

class Command(BaseCommand):
    help = 'Verifica que todas las operaciones comerciales tengan sus asientos contables'

    def handle(self, *args, **options):
        self.stdout.write("="*60)
        self.stdout.write(self.style.SUCCESS("VERIFICACION DE CONTABILIDAD DE OPERACIONES"))
        self.stdout.write("="*60)
        
        # 1. Verificar Ejercicio
        self.stdout.write("\n1. EJERCICIO CONTABLE:")
        ejercicio = EjercicioContable.objects.filter(cerrado=False).first()
        if ejercicio:
            self.stdout.write(self.style.SUCCESS(f"OK Ejercicio vigente: {ejercicio.descripcion}"))
            self.stdout.write(f"  Periodo: {ejercicio.fecha_inicio} a {ejercicio.fecha_fin}")
        else:
            self.stdout.write(self.style.ERROR("X No hay ejercicio vigente"))
            return
        
        # 2. Verificar Plan de Cuentas
        self.stdout.write("\n2. PLAN DE CUENTAS:")
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
        
        cuentas_faltantes = []
        for nombre in cuentas_requeridas:
            cuenta = AccountingService._obtener_cuenta(nombre)
            if cuenta:
                self.stdout.write(self.style.SUCCESS(f"OK {nombre}: {cuenta.codigo}"))
            else:
                self.stdout.write(self.style.ERROR(f"X {nombre}: NO ENCONTRADA"))
                cuentas_faltantes.append(nombre)
        
        # 3. Balance de Asientos
        self.stdout.write("\n3. BALANCE DE ASIENTOS:")
        total_asientos = Asiento.objects.count()
        desbalanceados = []
        
        for asiento in Asiento.objects.all():
            debe = sum(item.debe for item in asiento.items.all())
            haber = sum(item.haber for item in asiento.items.all())
            if abs(debe - haber) > Decimal("0.01"):
                desbalanceados.append({
                    'numero': asiento.numero,
                    'descripcion': asiento.descripcion,
                    'debe': debe,
                    'haber': haber,
                    'diferencia': debe - haber
                })
        
        if desbalanceados:
            self.stdout.write(self.style.ERROR(f"X {len(desbalanceados)} asientos desbalanceados de {total_asientos}:"))
            for asiento in desbalanceados[:5]:  # Mostrar solo los primeros 5
                self.stdout.write(f"  - Asiento #{asiento['numero']}: {asiento['descripcion']}")
                self.stdout.write(f"    Debe: {asiento['debe']}, Haber: {asiento['haber']}, Dif: {asiento['diferencia']}")
        else:
            self.stdout.write(self.style.SUCCESS(f"OK Todos los {total_asientos} asientos estan balanceados"))
        
        # 4. Ventas
        self.stdout.write("\n4. VENTAS:")
        total_ventas = Venta.objects.count()
        asientos_ventas = Asiento.objects.filter(origen='VENTAS').count()
        self.stdout.write(f"Total ventas: {total_ventas}")
        self.stdout.write(f"Asientos de ventas: {asientos_ventas}")
        
        if total_ventas > 0:
            porcentaje = (asientos_ventas / total_ventas) * 100
            if porcentaje >= 90:
                self.stdout.write(self.style.SUCCESS(f"OK Cobertura: {porcentaje:.1f}%"))
            else:
                self.stdout.write(self.style.WARNING(f"! Cobertura: {porcentaje:.1f}%"))
        
        # 5. Compras
        self.stdout.write("\n5. COMPRAS:")
        total_compras = Compra.objects.count()
        asientos_compras = Asiento.objects.filter(origen='COMPRAS').count()
        self.stdout.write(f"Total compras: {total_compras}")
        self.stdout.write(f"Asientos de compras: {asientos_compras}")
        
        if total_compras > 0:
            porcentaje = (asientos_compras / total_compras) * 100
            if porcentaje >= 90:
                self.stdout.write(self.style.SUCCESS(f"OK Cobertura: {porcentaje:.1f}%"))
            else:
                self.stdout.write(self.style.WARNING(f"! Cobertura: {porcentaje:.1f}%"))
        
        # 6. Cheques
        self.stdout.write("\n6. CHEQUES:")
        total_cheques = Cheque.objects.filter(tipo='TERCERO').count()
        asientos_cheques = Asiento.objects.filter(descripcion__icontains='Cheque').count()
        self.stdout.write(f"Total cheques de terceros: {total_cheques}")
        self.stdout.write(f"Asientos relacionados a cheques: {asientos_cheques}")
        
        # 7. Recibos
        self.stdout.write("\n7. RECIBOS:")
        total_recibos = Recibo.objects.count()
        asientos_recibos = Asiento.objects.filter(descripcion__icontains='Recibo').count()
        self.stdout.write(f"Total recibos: {total_recibos}")
        self.stdout.write(f"Asientos relacionados a recibos: {asientos_recibos}")
        
        if total_recibos > 0:
            self.stdout.write(self.style.WARNING(f"! Los recibos deberian generar asientos principales de cobro/pago"))
        
        # 8. Movimientos Caja
        self.stdout.write("\n8. MOVIMIENTOS DE CAJA:")
        total_mov_caja = MovimientoCaja.objects.count()
        asientos_caja = Asiento.objects.filter(descripcion__icontains='Caja').count()
        self.stdout.write(f"Total movimientos de caja: {total_mov_caja}")
        self.stdout.write(f"Asientos de caja: {asientos_caja}")
        
        # Resumen Final
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("RESUMEN DE VERIFICACION"))
        self.stdout.write("="*60)
        
        errores = len(cuentas_faltantes) + len(desbalanceados)
        if not ejercicio:
            errores += 1
        
        if errores == 0:
            self.stdout.write(self.style.SUCCESS("OK VERIFICACION EXITOSA - No se encontraron errores criticos"))
        else:
            self.stdout.write(self.style.ERROR(f"X Se encontraron {errores} errores criticos"))
        
        # Recomendaciones
        self.stdout.write("\nRECOMENDACIONES:")
        
        if cuentas_faltantes:
            self.stdout.write(self.style.WARNING("! Faltan cuentas en el plan de cuentas"))
            self.stdout.write("  Ejecute: python manage.py cargar_plan_cuentas")
        
        if total_recibos > 0 and asientos_recibos < total_recibos:
            self.stdout.write(self.style.WARNING("! Los recibos no estan generando asientos principales"))
            self.stdout.write("  Se debe implementar AccountingService.registrar_recibo()")
        
        self.stdout.write("\n" + "="*60)
