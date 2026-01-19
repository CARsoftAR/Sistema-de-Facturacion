import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema_comercial.settings")
django.setup()

from django.contrib.auth.models import User

def check_users():
    print("--- USERS & EMAILS ---")
    users = User.objects.all()
    for u in users:
        print(f"User: '{u.username}' | Email: '{u.email}' | Active: {u.is_active}")

    print("\n--- DUPLICATE EMAILS ---")
    ems = [u.email for u in users if u.email]
    seen = set()
    dupes = set(x for x in ems if x in seen or seen.add(x))
    if dupes:
        print(f"Found duplicate emails: {dupes}")
        for d in dupes:
            print(f"Users with email '{d}':")
            for u in users:
                if u.email == d:
                    print(f" - {u.username}")
    else:
        print("No duplicate emails found.")

if __name__ == "__main__":
    check_users()
