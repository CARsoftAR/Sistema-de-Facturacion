import os
import base64
from datetime import datetime, timedelta
from lxml import etree
from zeep import Client
from django.conf import settings
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography import x509
import logging

logger = logging.getLogger(__name__)

class AFIPService:
    """
    Servicio para manejar la comunicación con los Web Services de AFIP (WSAA y WSFE).
    """
    
    # URLs de AFIP (Modo Homologación por defecto)
    WSAA_URL = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms?wsdl"
    WSFE_URL = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx?wsdl"
    
    def __init__(self, empresa):
        self.empresa = empresa
        self.cuit = empresa.cuit.replace("-", "").strip()
        
        # Rutas de certificados
        self.cert_path = empresa.certificado_afip.path if empresa.certificado_afip else None
        self.key_path = empresa.clave_privada_afip.path if empresa.clave_privada_afip else None
        
        # Si no están en la DB, buscar en carpeta afip_credenciales por defecto
        if not self.cert_path or not self.key_path:
            base_path = os.path.join(settings.BASE_DIR, 'afip_credenciales')
            if not self.cert_path:
                self.cert_path = os.path.join(base_path, 'certificado.crt')
            if not self.key_path:
                self.key_path = os.path.join(base_path, 'clave_privada.key')

    def _generar_tra(self, service="wsfe"):
        """Genera el Ticket de Requerimiento de Acceso (TRA) en XML"""
        now = datetime.now()
        unique_id = int(now.timestamp())
        
        tra = etree.Element("loginTicketRequest", version="1.0")
        header = etree.SubElement(tra, "header")
        etree.SubElement(header, "uniqueId").text = str(unique_id)
        etree.SubElement(header, "generationTime").text = (now - timedelta(minutes=10)).strftime("%Y-%m-%dT%H:%M:%S")
        etree.SubElement(header, "expirationTime").text = (now + timedelta(minutes=10)).strftime("%Y-%m-%dT%H:%M:%S")
        etree.SubElement(tra, "service").text = service
        
        return etree.tostring(tra, pretty_print=True)

    def _firmar_tra(self, tra_xml):
        """Firma el TRA usando el certificado y la clave privada (CMS PKCS#7)"""
        try:
            from cryptography.hazmat.primitives.serialization import pkcs7
            
            with open(self.key_path, "rb") as f:
                private_key = serialization.load_pem_private_key(f.read(), password=None)
            
            with open(self.cert_path, "rb") as f:
                cert = x509.load_pem_x509_certificate(f.read())

            # Generar la firma PKCS7 (CMS)
            # AFIP requiere que el CMS contenga la data (no detach) y esté en formato PEM
            builder = pkcs7.PKCS7SignatureBuilder(
                data=tra_xml,
                signers=[(cert, private_key, hashes.SHA256())]
            )
            
            cms_pem = builder.sign(
                encoding=serialization.Encoding.PEM,
                options=[]
            )
            
            return cms_pem.decode('utf-8')
        except Exception as e:
            logger.error(f"Error al firmar TRA: {str(e)}")
            raise Exception(f"Error de firma digital: {str(e)}")

    def obtener_token_acceso(self, service="wsfe"):
        """Obtiene el Token y Sign de WSAA"""
        try:
            # 1. Generar y firmar TRA
            tra_xml = self._generar_tra(service)
            cms_pem = self._firmar_tra(tra_xml)
            
            # 2. Llamar a WSAA
            client = Client(self.WSAA_URL)
            response_xml = client.service.loginCms(cms_pem)
            
            # 3. Parsear respuesta (TA)
            root = etree.fromstring(response_xml.encode('utf-8'))
            token = root.find(".//token").text
            sign = root.find(".//sign").text
            
            return token, sign
        except Exception as e:
            logger.error(f"Error en WSAA: {str(e)}")
            raise Exception(f"No se pudo autenticar con AFIP: {str(e)}")

    def consultar_ultimo_comprobante(self, punto_venta, tipo_comp):
        """Consulta el último número de comprobante registrado en AFIP"""
        try:
            token, sign = self.obtener_token_acceso()
            client = Client(self.WSFE_URL)
            
            auth = {
                'Token': token,
                'Sign': sign,
                'Cuit': self.cuit
            }
            
            result = client.service.FECompUltimoAutorizado(
                Auth=auth,
                PtoVta=punto_venta,
                CbteTipo=tipo_comp
            )
            
            if hasattr(result, 'CbteNro'):
                return result.CbteNro
            
            if hasattr(result, 'Errors'):
                error_msg = result.Errors.Err[0].Msg
                raise Exception(error_msg)
                
            return 0
        except Exception as e:
            logger.error(f"Error en WSFE (UltimoAutorizado): {str(e)}")
            raise
