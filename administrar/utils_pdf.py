import os
from io import BytesIO
from django.conf import settings
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa

def link_callback(uri, rel):
    """
    Convierte URIs de Django (static y media) a rutas de archivos absolutas
    para que xhtml2pdf pueda acceder a ellas.
    """
    # Usar rutas absolutas de Django
    if uri.startswith(settings.MEDIA_URL):
        path = os.path.join(settings.MEDIA_ROOT, uri.replace(settings.MEDIA_URL, ""))
    elif uri.startswith(settings.STATIC_URL):
        path = os.path.join(settings.STATIC_ROOT, uri.replace(settings.STATIC_URL, ""))
    else:
        return uri

    # Asegurarse de que el archivo existe
    if not os.path.isfile(path):
        # Fallback para desarrollo si STATIC_ROOT no está poblado
        if settings.DEBUG and uri.startswith(settings.STATIC_URL):
            for static_dir in settings.STATICFILES_DIRS:
                alt_path = os.path.join(static_dir, uri.replace(settings.STATIC_URL, ""))
                if os.path.isfile(alt_path):
                    return alt_path
        return uri
    
    return path

def render_to_pdf(template_src, context_dict=None):
    """
    Renderiza un template de Django a un PDF usando xhtml2pdf.
    """
    if context_dict is None:
        context_dict = {}
        
    template = get_template(template_src)
    html = template.render(context_dict)
    result = BytesIO()
    
    # Generar PDF
    pdf = pisa.pisaDocument(
        BytesIO(html.encode("UTF-8")), 
        result, 
        link_callback=link_callback
    )
    
    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type='application/pdf')
    
    return None
