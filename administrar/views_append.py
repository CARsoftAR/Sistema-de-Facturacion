
# API - Provincias y Localidades
@login_required
def api_provincias_listar(request):
    provincias = Provincia.objects.all().order_by('nombre')
    data = [{'id': p.id, 'nombre': p.nombre} for p in provincias]
    return JsonResponse(data, safe=False)

@login_required
def api_localidades_listar(request):
    localidades = Localidad.objects.all().order_by('nombre')
    data = [{'id': l.id, 'nombre': l.nombre, 'cp': l.codigo_postal} for l in localidades]
    return JsonResponse(data, safe=False)
