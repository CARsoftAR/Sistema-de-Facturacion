
import os
import shutil

print("-" * 50)
print("Checking for mysqldump...")

# 1. PATH environment
path = shutil.which('mysqldump')
if path:
    print(f"[OK] Found in PATH: {path}")
else:
    print("[FAIL] Not found in PATH")

# 2. Common Windows Paths
common_paths = [
    r"C:\Program Files\MySQL\MySQL Server 8.0\bin",
    r"C:\Program Files\MySQL\MySQL Workbench 8.0",
    r"C:\Program Files\MySQL\MySQL Workbench 8.0 CE",
    r"C:\Program Files\MySQL\MySQL Server 5.7\bin",
    r"C:\xampp\mysql\bin",
]

found_common = False
for base_path in common_paths:
    exe_path = os.path.join(base_path, "mysqldump.exe")
    if os.path.exists(exe_path):
        print(f"[OK] Found in Common Path: {exe_path}")
        found_common = True
        break

if not found_common:
    print("[FAIL] Not found in common paths")

print("-" * 50)
