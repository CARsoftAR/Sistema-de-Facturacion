
from django.core.mail.backends.smtp import EmailBackend
from django.conf import settings
from .models import Empresa
import logging

logger = logging.getLogger(__name__)

class DatabaseEmailBackend(EmailBackend):
    def __init__(self, host=None, port=None, username=None, password=None,
                 use_tls=None, fail_silently=False, use_ssl=None, timeout=None,
                 ssl_keyfile=None, ssl_certfile=None,
                 **kwargs):
        
        # Intentar cargar configuración de la base de datos
        try:
            empresa = Empresa.objects.first()
            if empresa and empresa.smtp_server and empresa.smtp_user:
                host = empresa.smtp_server
                port = empresa.smtp_port
                username = empresa.smtp_user.strip()
                password = empresa.smtp_password.strip()
                
                # Mapear seguridad
                use_tls = (empresa.smtp_security == 'STARTTLS')
                use_ssl = (empresa.smtp_security == 'SSL')
                
                logger.info(f"Using Database SMTP Config: {host}:{port}")
            else:
                logger.info("Database SMTP Config missing, falling back to settings")
        except Exception as e:
            logger.warning(f"Error loading SMTP config from DB: {e}")

        super().__init__(host=host, port=port, username=username, password=password,
                         use_tls=use_tls, fail_silently=fail_silently, use_ssl=use_ssl,
                         timeout=timeout, ssl_keyfile=ssl_keyfile, ssl_certfile=ssl_certfile,
                         **kwargs)
