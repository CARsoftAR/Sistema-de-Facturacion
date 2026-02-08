#!/usr/bin/env python
"""
Simple test to reproduce the image upload error
"""
import os
import sys

# Setup Django
sys.path.append('C:\\Sistema de Facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')

import django
django.setup()

from django.contrib.auth.models import User
from administrar.models import PerfilUsuario
from django.core.files.uploadedfile import SimpleUploadedFile

def test_image_upload_direct():
    """Test image upload directly without HTTP"""
    print("Testing image upload directly...")
    
    try:
        # Get user
        user = User.objects.get(username='cristian')
        print(f"User found: {user.username}")
        
        # Get or create profile
        perfil, created = PerfilUsuario.objects.get_or_create(user=user)
        
        if created:
            print("Created new profile for user")
        else:
            print("Found existing profile for user")
        
        # Create a simple test image
        test_image_data = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13'
            b'\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc'
            b'\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        
        # Create SimpleUploadedFile
        uploaded_file = SimpleUploadedFile(
            "test.png", 
            test_image_data, 
            content_type="image/png"
        )
        
        print("Test image file created")
        
        # Try to save the image
        old_image = perfil.imagen
        perfil.imagen = uploaded_file
        perfil.save()
        
        print("Image saved successfully!")
        print(f"Image path: {perfil.imagen.path}")
        print(f"Image URL: {perfil.imagen.url}")
        
        # Clean up old image if needed
        if old_image and old_image.name and old_image != perfil.imagen:
            try:
                old_image.delete(save=False)
                print("Old image cleaned up")
            except Exception as e:
                print(f"Error cleaning up old image: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"Error during image upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def check_model_fields():
    """Check the PerfilUsuario model fields"""
    print("\nChecking PerfilUsuario model fields...")
    
    try:
        # Check model definition
        from django.db import connection
        
        # Get table info
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info(administrar_perfilusuario")
            columns = cursor.fetchall()
            
        print("Table columns:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        return True
        
    except Exception as e:
        print(f"Error checking model fields: {str(e)}")
        return False

if __name__ == '__main__':
    print("Starting direct image upload test...")
    
    # Check model fields
    check_model_fields()
    
    # Test direct upload
    if test_image_upload_direct():
        print("\nDirect image upload test PASSED!")
    else:
        print("\nDirect image upload test FAILED!")
        sys.exit(1)