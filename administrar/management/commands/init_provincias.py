from django.core.management.base import BaseCommand
from administrar.models import Provincia

class Command(BaseCommand):
    help = 'Carga las provincias de Argentina'

    def handle(self, *args, **kwargs):
        provincias = [
            "Buenos Aires",
            "Catamarca",
            "Chaco",
            "Chubut",
            "Ciudad Autónoma de Buenos Aires",
            "Córdoba",
            "Corrientes",
            "Entre Ríos",
            "Formosa",
            "Jujuy",
            "La Pampa",
            "La Rioja",
            "Mendoza",
            "Misiones",
            "Neuquén",
            "Río Negro",
            "Salta",
            "San Juan",
            "San Luis",
            "Santa Cruz",
            "Santa Fe",
            "Santiago del Estero",
            "Tierra del Fuego",
            "Tucumán"
        ]

        for nombre in provincias:
            obj, created = Provincia.objects.get_or_create(nombre=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Provincia creada: {nombre}'))
            else:
                self.stdout.write(f'Ya existe: {nombre}')
        
        self.stdout.write(self.style.SUCCESS('Carga de provincias completada.'))
