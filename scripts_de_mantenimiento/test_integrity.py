from administrar.models import Producto, Venta, Remito, MovimientoCaja, MovimientoStock

def check():
    print("--- INTEGRITY CHECK ---")
    
    # 1. Count Records
    print(f"Productos: {Producto.objects.count()} (Expected > 0)")
    print(f"Ventas: {Venta.objects.count()} (Expected > 0)")
    print(f"Remitos: {Remito.objects.count()} (Expected > 0)")
    
    # 2. Check Remito Fields
    r = Remito.objects.last()
    if r:
        print(f"Last Remito: {r.numero_formateado()}")
        print(f"  Transportista: {r.transportista} (Expected 'Transportes El Rapido')")
        print(f"  Proyecto: {r.proyecto} (Expected '25-096')")
        if r.transportista == "Transportes El Rapido" and r.proyecto == "25-096":
            print("  [PASS] Remito fields populated correctly.")
        else:
            print("  [FAIL] Remito fields mismatch.")
    
    # 3. Check Stock Logic
    # Producto 2 (Taladro): Stock Initial 20 - 1 Sold (Venta1) + 10 Bought (OC) = 29? No, OC is PENDING.
    # So stock should be 19.
    p2 = Producto.objects.get(codigo="2005") # Taladro
    print(f"Stock Taladro: {p2.stock} (Expected 19)")
    
    # Producto 4 (Brida): Initial 100 - 80 Sold + 5 Returned = 25.
    p4 = Producto.objects.filter(codigo="TBRAC188000CBR01").first()
    if p4:
        print(f"Stock Brida: {p4.stock} (Expected 25)")
        if p4.stock == 25:
             print("  [PASS] Stock logic correct.")
        else:
             print("  [FAIL] Stock logic incorrect.")
             
    print("--- END CHECK ---")

if __name__ == "__main__":
    check()
