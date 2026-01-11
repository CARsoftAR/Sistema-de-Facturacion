
@login_required
def imprimir_nc(request, id):
    nc = get_object_or_404(NotaCredito, pk=id)
    empresa = Empresa.objects.first()
    return render(request, 'administrar/comprobantes/imprimir_nc.html', {'nota': nc, 'empresa': empresa})
