import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

try:
    from administrar import urls
    print(f"Successfully imported administrar.urls")
    print(f"Number of patterns: {len(urls.urlpatterns)}")
    
    # Check if 'bancos' is in patterns
    found = False
    for p in urls.urlpatterns:
        if hasattr(p, 'pattern'):
            if str(p.pattern) == 'bancos/':
                found = True
                print("Found 'bancos/' pattern!")
                break
    
    if not found:
        print("ERROR: 'bancos/' pattern NOT found in loaded urls.")
        
except Exception as e:
    print(f"FAILED to import administrar.urls: {e}")
