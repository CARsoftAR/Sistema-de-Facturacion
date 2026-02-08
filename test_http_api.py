#!/usr/bin/env python
"""
Test the HTTP API endpoint for image upload
"""
import os
import sys
import requests
import base64

# Setup Django
sys.path.append('C:\\Sistema de Facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')

import django
django.setup()

from django.contrib.auth.models import User
from django.test import Client

def test_http_api():
    """Test the HTTP API endpoint"""
    print("Testing HTTP API endpoint...")
    
    # Create test client
    client = Client()
    
    # Get user and login
    user = User.objects.get(username='cristian')
    client.force_login(user)
    print(f"User logged in: {user.username}")
    
    # Create test image data
    test_image_data = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    )
    
    # Create SimpleUploadedFile
    from django.core.files.uploadedfile import SimpleUploadedFile
    uploaded_file = SimpleUploadedFile(
        "test.png", 
        test_image_data, 
        content_type="image/png"
    )
    
    print("Test image file created")
    
    # Test the API endpoint
    try:
        response = client.post('/api/mi-perfil/imagen/', {
            'imagen': uploaded_file
        })
        
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.content.decode()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                print("HTTP API test PASSED!")
                if data.get('imagen_url'):
                    print(f"Image URL: {data['imagen_url']}")
                return True
            else:
                print(f"API returned error: {data.get('error')}")
                return False
        else:
            print(f"HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Exception during HTTP API test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_with_real_file():
    """Test with a real file upload"""
    print("\nTesting with real file upload...")
    
    # Create a real test file
    test_file_path = "C:\\Sistema de Facturacion\\real_test.png"
    test_image_data = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    )
    
    with open(test_file_path, 'wb') as f:
        f.write(test_image_data)
    
    print(f"Real test file created: {test_file_path}")
    
    # Create test client
    client = Client()
    user = User.objects.get(username='cristian')
    client.force_login(user)
    
    try:
        # Test with real file
        with open(test_file_path, 'rb') as f:
            response = client.post('/api/mi-perfil/imagen/', {
                'imagen': f
            })
        
        print(f"Real file test - Status: {response.status_code}")
        print(f"Real file test - Response: {response.content.decode()}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Exception during real file test: {str(e)}")
        return False
    finally:
        # Clean up
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
            print("Real test file cleaned up")

if __name__ == '__main__':
    print("Starting HTTP API image upload test...")
    
    # Test HTTP API
    success1 = test_http_api()
    
    # Test with real file
    success2 = test_with_real_file()
    
    if success1 and success2:
        print("\nAll HTTP API tests PASSED!")
    else:
        print("\nSome HTTP API tests FAILED!")
        sys.exit(1)