def find_line():
    target = "def api_usuarios_lista"
    path = r"c:\Sistema de Facturacion\administrar\views.py"
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f, 1):
                if target in line:
                    print(f"Found '{target}' at line {i}")
                    return
        print("Not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_line()
