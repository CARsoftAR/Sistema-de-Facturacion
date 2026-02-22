import os
import MySQLdb
import sys
from dotenv import load_dotenv

# Load .env file
load_dotenv()

env_host = os.getenv('DB_HOST', 'localhost')
env_user = os.getenv('DB_USER', 'root')
# Handle case if DB_PASSWORD is None
env_password = os.getenv('DB_PASSWORD')
if env_password is None:
    env_password = ""
env_port = int(os.getenv('DB_PORT', '3306'))

print(f"--- Advanced Database Connection Diagnostics (ASCII) ---")
print(f"Python: {sys.executable}")

def try_connect(label, host, user, password, port):
    pwd_len = len(password) if password else 0
    print(f"\n[{label}] Connecting to {host}:{port} as '{user}' with password length {pwd_len}...")
    try:
        conn = MySQLdb.connect(host=host, user=user, passwd=password, port=port)
        print(f"  [OK] SUCCESS! This combination works.")
        conn.close()
        return True
    except MySQLdb.OperationalError as e:
        error_code = e.args[0]
        # Try to decode error safely or just print code
        print(f"  [X] FAILED: Error {error_code}")
        return False
    except Exception as e:
        print(f"  [X] ERROR: {e}")
        return False

# 1. Try credentials exactly from .env
try_connect("FROM .ENV", env_host, env_user, env_password, env_port)

# 2. Try root with NO password (common default for XAMPP, etc)
# Only try if we didn't just try it above (i.e. if env_password is NOT empty)
if env_password != "":
    try_connect("ROOT / NO PASSWORD", env_host, "root", "", env_port)

# 3. Try root with password 'root' (common default)
if env_password != "root":
    try_connect("ROOT / 'root'", env_host, "root", "root", env_port)

# 4. Try 127.0.0.1 instead of localhost (if different)
if env_host == "localhost":
    try_connect("FORCE 127.0.0.1 FROM .ENV", "127.0.0.1", env_user, env_password, env_port)
