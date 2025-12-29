import os
import MySQLdb
import sys
from dotenv import load_dotenv

# Load .env file
load_dotenv()

host = os.getenv('DB_HOST', 'localhost')
user = os.getenv('DB_USER', 'root')
password = os.getenv('DB_PASSWORD', '')
port = int(os.getenv('DB_PORT', '3306'))
db_name = os.getenv('DB_NAME', 'sistema_facturacion')

print(f"--- Debugging Database Connection ---")
print(f"Python Executable: {sys.executable}")
print(f"CWD: {os.getcwd()}")
print(f"Target Config:")
print(f"  Host: {host}")
print(f"  Port: {port}")
print(f"  User: {user}")
print(f"  Database: {db_name}")
print(f"  Password: {'*' * len(password) if password else '<NONE>'} (Length: {len(password)})")

try:
    print(f"\n[1] Attempting to connect to MySQL Server...")
    conn = MySQLdb.connect(
        host=host,
        user=user,
        passwd=password,
        port=port
    )
    print("SUCCESS: Connection to MySQL server established!")
    
    try:
        print(f"\n[2] Attempting to select database '{db_name}'...")
        conn.select_db(db_name)
        print(f"SUCCESS: Database '{db_name}' found and selected.")
    except MySQLdb.OperationalError as e:
        print(f"FAILURE: Connected to server, but could not select database '{db_name}'.")
        print(f"Error Code: {e.args[0]}")
        print(f"Error Message: {e.args[1]}")
        
    conn.close()
except MySQLdb.OperationalError as e:
    print(f"FAILURE: Could not connect to MySQL Server.")
    print(f"Error Code: {e.args[0]}")
    print(f"Error Message: {e.args[1]}")
except Exception as e:
    print(f"ERROR: Unexpected error: {e}")
