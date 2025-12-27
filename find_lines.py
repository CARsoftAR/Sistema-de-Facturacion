
params = ['def api_caja']
filename = 'c:/Sistemas CARSOFT/Sistema de facturacion/Sistema de facturacion/administrar/views.py'
with open(filename, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        for p in params:
            if p in line:
                print(f"{i}: {line.strip()}")
