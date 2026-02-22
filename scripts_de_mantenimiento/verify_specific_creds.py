import MySQLdb
import sys

host = 'localhost'
user = 'root'
password = '12345'
port = 3306

print(f"--- Verifying Specific Credentials ---")
print(f"User: {user}")
print(f"Password: {password}")

try:
    print(f"\nConnecting to {host}:{port}...")
    conn = MySQLdb.connect(host=host, user=user, passwd=password, port=port)
    print(f"[OK] SUCCESS! Credentials are correct.")
    conn.close()
except MySQLdb.OperationalError as e:
    print(f"[X] FAILED: Error {e.args[0]}")
    sys.exit(1)
except Exception as e:
    print(f"[X] ERROR: {e}")
    sys.exit(1)
