from django import template
from ..models import PerfilUsuario

register = template.Library()

@register.filter
def has_perm(user, perm_name):
    """
    Verifica si el usuario tiene el permiso especificado.
    Uso: {% if user|has_perm:'ventas' %}
    """
    if not user.is_authenticated:
        return False
        
    if user.is_staff:
        return True
        
    try:
        perfil = user.perfilusuario
        field_name = f'acceso_{perm_name}'
        return getattr(perfil, field_name, False)
    except (PerfilUsuario.DoesNotExist, AttributeError):
        return False
