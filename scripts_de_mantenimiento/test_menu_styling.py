#!/usr/bin/env python
"""
Test the menu styling and navigation
"""
import os
import sys

# Setup Django
sys.path.append('C:\\Sistema de Facturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_comercial.settings')

import django
django.setup()

from django.contrib.auth.models import User
from django.test import Client

def test_menu_loading():
    """Test if the menu loads with proper styling"""
    print("Testing menu loading and styling...")
    
    # Create test client
    client = Client()
    
    # Get user and login
    user = User.objects.get(username='cristian')
    client.force_login(user)
    print(f"User logged in: {user.username}")
    
    # Test the menu page
    try:
        response = client.get('/')
        
        print(f"Menu page status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.content.decode('utf-8')
            
            # Check for key elements
            checks = [
                ('Bootstrap CSS', 'bootstrap' in content.lower()),
                ('Menu wrapper', 'menu-wrapper' in content),
                ('Menu grid', 'menu-grid' in content),
                ('Card minimal', 'card-minimal' in content),
                ('Icon wrapper', 'icon-wrapper' in content),
                ('Navigation bar', 'navbar' in content),
                ('Dashboard link', 'dashboard' in content.lower()),
            ]
            
            print("\nMenu elements check:")
            all_passed = True
            for name, passed in checks:
                status = "✅" if passed else "❌"
                print(f"  {status} {name}")
                if not passed:
                    all_passed = False
            
            if all_passed:
                print("\n✅ All menu elements are present!")
                return True
            else:
                print("\n❌ Some menu elements are missing!")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response content: {response.content.decode()}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during menu test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_navigation_links():
    """Test navigation links in the menu"""
    print("\nTesting navigation links...")
    
    client = Client()
    user = User.objects.get(username='cristian')
    client.force_login(user)
    
    # Get menu page
    response = client.get('/')
    content = response.content.decode('utf-8')
    
    # Test some key links
    test_links = [
        ('Dashboard', '/dashboard'),
        ('Ventas', '/ventas'),
        ('Clientes', '/clientes'),
        ('Productos', '/productos'),
    ]
    
    print("Testing navigation links:")
    all_passed = True
    
    for name, url in test_links:
        try:
            link_response = client.get(url)
            status = "✅" if link_response.status_code == 200 else "❌"
            print(f"  {status} {name} ({url}) - Status: {link_response.status_code}")
            
            if link_response.status_code != 200:
                all_passed = False
                
        except Exception as e:
            print(f"  ❌ {name} ({url}) - Error: {str(e)}")
            all_passed = False
    
    return all_passed

if __name__ == '__main__':
    print("Starting menu styling and navigation test...")
    
    # Test menu loading
    success1 = test_menu_loading()
    
    # Test navigation links
    success2 = test_navigation_links()
    
    if success1 and success2:
        print("\n🎉 All menu tests PASSED!")
    else:
        print("\n❌ Some menu tests FAILED!")
        sys.exit(1)