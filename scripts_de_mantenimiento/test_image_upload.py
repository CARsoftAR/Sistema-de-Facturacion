#!/usr/bin/env python
"""
Test script to reproduce the image upload error
"""
import os
import sys
import django
import requests
from pathlib import Path

# Setup Django
sys.path.append('C:\\Sistema de Facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')
django.setup()

from django.contrib.auth.models import User
from django.test import Client
from administrar.models import PerfilUsuario

def test_image_upload():
    """Test the image upload functionality"""
    print("Testing image upload functionality...")
    
    # Create test client
    client = Client()
    
    # Get user
    try:
        user = User.objects.get(username='cristian')
        print(f"User found: {user.username}")
    except User.DoesNotExist:
        print("User not found")
        return False
    
    # Login user
    client.login(username='cristian', password='12345')
    print("User logged in")
    
    # Create test image
    test_image_path = "C:\\Sistema de Facturacion\\test_upload.png"
    with open(test_image_path, 'wb') as f:
        # Create a simple 1x1 PNG image
        f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82')
    
    print(f"Test image created: {test_image_path}")
    
    # Test image upload
    try:
        with open(test_image_path, 'rb') as f:
            response = client.post('/api/mi-perfil/imagen/', {
                'imagen': f
            })
        
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.content.decode()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                print("Image upload successful!")
                if data.get('imagen_url'):
                    print(f"Image URL: {data['imagen_url']}")
                return True
            else:
                print(f"Upload failed: {data.get('error')}")
                return False
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.content.decode()}")
            return False
            
    except Exception as e:
        print(f"Exception during upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Clean up test image
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            print("Test image cleaned up")

def check_perfil_model():
    """Check the PerfilUsuario model"""
    print("\nChecking PerfilUsuario model...")
    
    try:
        user = User.objects.get(username='cristian')
        
        # Get or create profile
        perfil, created = PerfilUsuario.objects.get_or_create(user=user)
        
        if created:
            print("Created new profile for user")
        else:
            print("Found existing profile for user")
        
        print(f"Profile ID: {perfil.id}")
        print(f"Profile image: {perfil.imagen}")
        print(f"Profile image path: {perfil.imagen.path if perfil.imagen else 'None'}")
        print(f"Profile image URL: {perfil.imagen.url if perfil.imagen else 'None'}")
        
        return True
        
    except Exception as e:
        print(f"Error checking profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("Starting image upload test...")
    
    # Check model
    if not check_perfil_model():
        print("Model check failed")
        sys.exit(1)
    
    # Test upload
    if not test_image_upload():
        print("Image upload test failed")
        sys.exit(1)
    
    print("\nAll tests passed!")