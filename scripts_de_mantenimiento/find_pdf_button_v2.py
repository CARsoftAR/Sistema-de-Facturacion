import os

search_dir = r"c:\Sistema de Facturacion"
for root, dirs, files in os.walk(search_dir):
    # Exclude compiled and node_modules
    if any(x in root.lower() for x in ['node_modules', '.git', 'staticfiles', 'dist']):
        continue
    for file in files:
        if file.endswith(('.jsx', '.js', '.html', '.py')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if 'PDF' in content and 'bg-red-50' in content:
                        print(f"FOUND: {path}")
            except Exception as e:
                pass
