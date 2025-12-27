from django.contrib import admin
from .models import InvoiceTemplate
from .forms import InvoiceTemplateForm


@admin.register(InvoiceTemplate)
class InvoiceTemplateAdmin(admin.ModelAdmin):
    form = InvoiceTemplateForm
    list_display = ('title', 'active')
    list_editable = ('active',)

from .models import Remito, DetalleRemito, Empresa

class DetalleRemitoInline(admin.TabularInline):
    model = DetalleRemito
    extra = 1

@admin.register(Remito)
class RemitoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha', 'cliente', 'estado')
    # Add new fields to fieldsets or just let default behavior show them
    inlines = [DetalleRemitoInline]

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'cuit')

