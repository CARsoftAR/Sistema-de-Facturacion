from django.core.management.base import BaseCommand
from administrar.models import PlanCuenta

class Command(BaseCommand):
    help = 'Inicializa las cuentas contables necesarias para los medios de pago'

    def handle(self, *args, **options):
        cuentas = [
            # Activo Corriente - Disponibilidades / Créditos
            {
                "codigo": "1.1.03.003",
                "nombre": "Tarjetas a Cobrar",
                "tipo": "ACTIVO",
                "imputable": True,
                "padre_codigo": "1.1.03" # Asumiendo 1.1.03 es Créditos por Ventas o similar
            },
            {
                "codigo": "1.1.03.004",
                "nombre": "Valores a Depositar",
                "tipo": "ACTIVO",
                "imputable": True,
                "padre_codigo": "1.1.01" # Asumiendo 1.1.01 es Caja y Bancos o similar
            },
            # Egresos - Gastos Comerciales
            {
                "codigo": "5.1.02.005",
                "nombre": "Comisiones Tarjeta",
                "tipo": "R_NEG",
                "imputable": True,
                "padre_codigo": "5.1.02" # Gastos de Comercialización
            }
        ]

        for c in cuentas:
            exists = PlanCuenta.objects.filter(codigo=c["codigo"]).exists()
            if not exists:
                # Intentar buscar padre
                padre = None
                if "padre_codigo" in c:
                    padre = PlanCuenta.objects.filter(codigo=c["padre_codigo"]).first()
                
                PlanCuenta.objects.create(
                    codigo=c["codigo"],
                    nombre=c["nombre"],
                    tipo=c["tipo"],
                    imputable=c["imputable"],
                    padre=padre
                )
                self.stdout.write(self.style.SUCCESS(f'Cuenta creada: {c["nombre"]} ({c["codigo"]})'))
            else:
                self.stdout.write(f'Cuenta ya existe: {c["nombre"]}')
