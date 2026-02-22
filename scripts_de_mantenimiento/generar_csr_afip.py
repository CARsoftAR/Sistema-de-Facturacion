import os
import django
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography.x509.oid import NameOID
from cryptography import x509

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from administrar.models import Empresa

def generar_archivos():
    # 1. Obtener CUIT de la empresa
    empresa = Empresa.objects.first()
    if not empresa:
        print("ERROR: No hay una empresa configurada en el sistema.")
        print("Por favor, cree una empresa desde el panel de administración primero.")
        return

    cuit = empresa.cuit.replace("-", "").strip()
    nombre_empresa = empresa.nombre
    print(f"Generando certificados para: {nombre_empresa} (CUIT {cuit})...")

    # Crear directorio si no existe
    CERT_DIR = 'afip_credenciales'
    if not os.path.exists(CERT_DIR):
        os.makedirs(CERT_DIR)

    # 2. Generar Clave Privada (Private Key)
    key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    key_path = os.path.join(CERT_DIR, 'clave_privada.key')
    with open(key_path, "wb") as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        ))
    print(f" -> Clave privada generada: {key_path}")

    # 3. Generar CSR (Certificate Signing Request)
    csr = x509.CertificateSigningRequestBuilder().subject_name(x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "AR"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, nombre_empresa),
        x509.NameAttribute(NameOID.COMMON_NAME, "sistema_facturacion"),
        x509.NameAttribute(NameOID.SERIAL_NUMBER, f"CUIT {cuit}"),
    ])).sign(key, hashes.SHA256())

    csr_path = os.path.join(CERT_DIR, 'pedido.csr')
    with open(csr_path, "wb") as f:
        f.write(csr.public_bytes(serialization.Encoding.PEM))
    
    print(f" -> Pedido de certificado (CSR) generado: {csr_path}")
    print("\n[INSTRUCCIONES PARA EL USUARIO]")
    print(f"1. Entre a la web de AFIP con Clave Fiscal.")
    print(f"2. Busque el servicio 'Administración de Certificados Digitales'.")
    print(f"3. Agregue un alias (ej: 'facturacion_test') y suba el archivo '{csr_path}'.")
    print(f"4. Descargue el certificado (.crt) y guárdelo en la carpeta '{CERT_DIR}'.")

if __name__ == '__main__':
    try:
        generar_archivos()
    except Exception as e:
        print(f"Error fatal: {e}")
