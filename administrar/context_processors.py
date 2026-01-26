from .models import Empresa

def empresa_context(request):
    """
    Provee el objeto Empresa a todas las plantillas.
    """
    return {
        'empresa': Empresa.objects.first()
    }
