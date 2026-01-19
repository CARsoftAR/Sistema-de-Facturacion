"""
Middleware para el sistema de seguridad
"""
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver
from .models import LoginHistory, ActiveSession, ActivityLog


def get_client_ip(request):
    """Obtiene la IP del cliente desde el request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """Obtiene el user agent del cliente"""
    return request.META.get('HTTP_USER_AGENT', '')[:500]


class ActiveSessionMiddleware(MiddlewareMixin):
    """
    Middleware para actualizar la última actividad de las sesiones activas.
    NOTA: Este middleware solo ACTUALIZA sesiones existentes, no las crea.
    Las sesiones se crean únicamente en el signal user_logged_in.
    """
    def process_request(self, request):
        if request.user.is_authenticated and request.session.session_key:
            try:
                session = ActiveSession.objects.get(
                    user=request.user,
                    session_key=request.session.session_key
                )
                # El campo last_activity se actualiza automáticamente con auto_now=True
                session.save()
            except ActiveSession.DoesNotExist:
                # No crear sesión aquí - solo el signal de login debe crearlas
                # Esto evita crear sesiones huérfanas por cookies de sesión antiguas
                pass
        return None


# =========================================
# SIGNALS PARA LOGIN HISTORY
# =========================================

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """Registra un login exitoso"""
    LoginHistory.objects.create(
        user=user,
        username=user.username,
        ip_address=get_client_ip(request),
        success=True,
        user_agent=get_user_agent(request)
    )
    
    # Crear sesión activa
    if request.session.session_key:
        # Eliminar TODAS las sesiones antiguas del mismo usuario
        # Esto asegura que solo haya una sesión activa por usuario
        ActiveSession.objects.filter(user=user).delete()
        
        ActiveSession.objects.create(
            user=user,
            session_key=request.session.session_key,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request)
        )
    
    # Registrar en bitácora
    ActivityLog.objects.create(
        user=user,
        action_type='LOGIN',
        module='SEGURIDAD',
        description=f'Inicio de sesión exitoso',
        ip_address=get_client_ip(request)
    )


@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    """Registra un intento de login fallido"""
    username = credentials.get('username', 'desconocido')
    LoginHistory.objects.create(
        user=None,
        username=username,
        ip_address=get_client_ip(request),
        success=False,
        user_agent=get_user_agent(request)
    )


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """Registra un logout y elimina la sesión activa"""
    if user:
        # Eliminar sesión activa
        if request.session.session_key:
            ActiveSession.objects.filter(
                user=user,
                session_key=request.session.session_key
            ).delete()
        
        # Registrar en bitácora
        ActivityLog.objects.create(
            user=user,
            action_type='LOGOUT',
            module='SEGURIDAD',
            description=f'Cierre de sesión',
            ip_address=get_client_ip(request)
        )


# =========================================
# FUNCIÓN HELPER PARA REGISTRAR ACTIVIDADES
# =========================================

def log_activity(user, action_type, module, description, details=None, request=None):
    """
    Función helper para registrar actividades en el sistema
    
    Args:
        user: Usuario que realiza la acción
        action_type: Tipo de acción (CREATE, UPDATE, DELETE, etc.)
        module: Módulo del sistema (PRODUCTOS, VENTAS, etc.)
        description: Descripción de la actividad
        details: Detalles adicionales en formato dict (opcional)
        request: Request de Django para obtener IP (opcional)
    """
    ip_address = None
    if request:
        ip_address = get_client_ip(request)
    
    ActivityLog.objects.create(
        user=user,
        action_type=action_type,
        module=module,
        description=description,
        details=details,
        ip_address=ip_address
    )
