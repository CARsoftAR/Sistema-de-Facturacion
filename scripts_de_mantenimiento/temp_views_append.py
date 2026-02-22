
# ==========================
# API CATEGORIAS
# ==========================
@login_required
def api_categorias_listar(request):
    try:
        categorias = Categoria.objects.all().order_by('nombre')
        data = [{'id': c.id, 'nombre': c.nombre, 'descripcion': c.descripcion} for c in categorias]
        return JsonResponse({'ok': True, 'data': data})
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_POST
@login_required
@verificar_permiso('configuracion')
def api_categorias_guardar(request):
    try:
        data = json.loads(request.body)
        id_categoria = data.get('id')
        nombre = data.get('nombre', '').strip()
        descripcion = data.get('descripcion', '').strip()

        if not nombre:
            return JsonResponse({'ok': False, 'error': 'El nombre es obligatorio'})

        if id_categoria:
            categoria = Categoria.objects.get(pk=id_categoria)
            categoria.nombre = nombre
            categoria.descripcion = descripcion
            categoria.save()
        else:
            Categoria.objects.create(nombre=nombre, descripcion=descripcion)

        return JsonResponse({'ok': True})
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_POST
@login_required
@verificar_permiso('configuracion')
def api_categorias_eliminar(request, id):
    try:
        categoria = Categoria.objects.get(pk=id)
        categoria.delete()
        return JsonResponse({'ok': True})
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)

@login_required
def api_categorias_detalle(request, id):
    try:
        c = Categoria.objects.get(pk=id)
        return JsonResponse({'id': c.id, 'nombre': c.nombre, 'descripcion': c.descripcion})
    except Categoria.DoesNotExist:
        return JsonResponse({'error': 'Categoría no encontrada'}, status=404)
