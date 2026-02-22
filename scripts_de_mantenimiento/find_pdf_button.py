import os

search_dir = r"c:\Sistema de Facturacion"
for root, dirs, files in os.walk(search_dir):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.git' in dirs:
        dirs.remove('.git')
    for file in files:
        if file.endswith(('.jsx', '.js', '.html')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if 'PDF' in content and 'bg-red-50' in content:
                        print(f"FOUND: {path}")
            except Exception as e:
                pass
