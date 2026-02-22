import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from django.contrib.auth.models import User

def check_user_3():
    print("--- Checking User ID 3 ---")
    try:
        u = User.objects.get(id=3)
        print(f"ID: {u.id}")
        print(f"Username: '{u.username}'")
        print(f"First Name: '{u.first_name}'")
        print(f"Email: '{u.email}'")
    except User.DoesNotExist:
        print("User ID 3 does not exist.")

if __name__ == "__main__":
    check_user_3()
