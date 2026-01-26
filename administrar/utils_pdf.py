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
    # Manejar URLs completas o relativas
    if uri.startswith(settings.MEDIA_URL):
        path = os.path.join(settings.MEDIA_ROOT, uri.replace(settings.MEDIA_URL, ""))
    elif uri.startswith(settings.STATIC_URL):
        path = os.path.join(settings.STATIC_ROOT, uri.replace(settings.STATIC_URL, ""))
    elif uri.startswith('/media/'):
        path = os.path.join(settings.MEDIA_ROOT, uri.replace('/media/', ""))
    elif uri.startswith('/static/'):
        path = os.path.join(settings.STATIC_ROOT, uri.replace('/static/', ""))
    else:
        return uri

    # Limpiar la ruta (importante en Windows)
    path = os.path.normpath(path)

    # Asegurarse de que el archivo existe
    if not os.path.isfile(path):
        # Fallback para desarrollo si STATIC_ROOT no está poblado
        if uri.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            # Si es una imagen y no está en MEDIA_ROOT, intentar buscarla en carpetas comunes
            pass
        
        if settings.DEBUG:
            print(f"DEBUG PDF: Archivo no encontrado en {path}")
            # Intentar buscar en STATICFILES_DIRS si es static
            if 'static' in uri:
                for static_dir in getattr(settings, 'STATICFILES_DIRS', []):
                    alt_path = os.path.join(static_dir, uri.split('/static/')[-1])
                    if os.path.isfile(alt_path):
                        return alt_path
    
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
