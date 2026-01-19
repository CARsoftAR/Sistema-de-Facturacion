import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, ShoppingCart, CreditCard, DollarSign, FileText, Check, X, Truck } from 'lucide-react';
import { BtnSave, BtnBack } from '../components/CommonButtons';
import { useProductSearch } from '../hooks/useProductSearch';
import Swal from 'sweetalert2';
import { showToast, showWarningAlert, showSuccessAlert } from '../utils/alerts';

// CSRF Helper
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const NuevaCompra = () => {
    const navigate = useNavigate();

    // ==================== STATE & REFS ====================
    // Refs
    const codigoRef = useRef(null);
    const proveedorInputRef = useRef(null);
    const proveedorListRef = useRef(null);
    const cantidadRef = useRef(null);
    const costoRef = useRef(null);

    // State
    const [proveedor, setProveedor] = useState(null);
    const [busquedaProveedor, setBusquedaProveedor] = useState('');
    const [proveedoresSugeridos, setProveedoresSugeridos] = useState([]);
    const [mostrarSugerenciasProveedor, setMostrarSugerenciasProveedor] = useState(false);
    const [sugerenciaProveedorActiva, setSugerenciaProveedorActiva] = useState(0);

    const [inputCantidad, setInputCantidad] = useState('1');
    const [inputCosto, setInputCosto] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    // Items y Totales
    const [items, setItems] = useState([]);
    const [medioPago, setMedioPago] = useState('EFECTIVO'); // EFECTIVO, CTACTE, CHEQUE, TRANSFERENCIA
    const [nroComprobante, setNroComprobante] = useState('');
    const [guardando, setGuardando] = useState(false);

    // Modal Pago / Confirmación
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [montoPago, setMontoPago] = useState(''); // Solo visual para verificar total

    // Discriminar IVA (Compras) - Defaults to true usually for businesses but let's make it toggleable
    const [discriminarIVA, setDiscriminarIVA] = useState(false);

    // Config (Auto focus / Barcode Behavior)
    const [autoFoco, setAutoFoco] = useState(false);
    const [barcodeMode, setBarcodeMode] = useState('DEFAULT'); // DEFAULT, CANTIDAD, DIRECTO
    const [triggerDirectAdd, setTriggerDirectAdd] = useState(null);

    // ==================== PRODUCT SEARCH HOOK ====================
    const {
        inputCodigo, setInputCodigo,
        inputProducto, setInputProducto,
        codigosSugeridos, productosSugeridos,
        mostrarSugerenciasCodigo, mostrarSugerenciasProducto,
        sugerenciaCodigoActiva, sugerenciaActiva,
        codigoListRef,
        productoListRef,
        nextInputRef: productoRef,
        handleCodigoKeyDown, handleProductoKeyDown,
        handleCodigoBlur, handleProductoBlur,
        seleccionar: seleccionarProducto,
        limpiar: limpiarBusqueda
    } = useProductSearch({
        onSelect: (producto) => {
            setProductoSeleccionado(producto);
            // Pre-fill cost if available (last cost)
            setInputCosto(producto.costo ? producto.costo.toString() : '');

            if (barcodeMode === 'DIRECTO') {
                setTriggerDirectAdd(producto);
            } else {
                setTimeout(() => cantidadRef.current?.select(), 50);
            }
        }
    });

    // ==================== EFFECTS ====================
    useEffect(() => {
        // Fetch config if needed, or just set focus
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config/obtener/');
                const data = await response.json();
                setDiscriminarIVA(data.discriminar_iva_compras || false);
                setAutoFoco(data.auto_foco_codigo_barras || false);
                setBarcodeMode(data.comportamiento_codigo_barras || 'DEFAULT');
            } catch (error) {
                console.error("Error fetching config:", error);
            }
        };
        fetchConfig();

        setTimeout(() => proveedorInputRef.current?.focus(), 100);
    }, []);

    // Buscar Proveedores
    useEffect(() => {
        if (!busquedaProveedor || busquedaProveedor.length < 2) {
            setProveedoresSugeridos([]);
            setMostrarSugerenciasProveedor(false);
            return;
        }

        const fetchProveedores = async () => {
            try {
                const response = await fetch(`/api/proveedores/buscar/?q=${encodeURIComponent(busquedaProveedor)}`);
                const data = await response.json();
                setProveedoresSugeridos(data || []);
                setMostrarSugerenciasProveedor((data && data.length > 0));
                setSugerenciaProveedorActiva(0);
            } catch (error) {
                console.error("Error buscando proveedores:", error);
            }
        };

        const timer = setTimeout(fetchProveedores, 300);
        return () => clearTimeout(timer);
    }, [busquedaProveedor]);

    useEffect(() => {
        if (triggerDirectAdd) {
            const costo = parseFloat(triggerDirectAdd.costo || 0);
            if (costo > 0) {
                agregarProducto(triggerDirectAdd, 1, costo);
            } else {
                // If cost is 0, setup manual entry
                setProductoSeleccionado(triggerDirectAdd);
                setInputCosto('');
                setTimeout(() => costoRef.current?.focus(), 50);
            }
            setTriggerDirectAdd(null);
        }
    }, [triggerDirectAdd]);

    // ==================== HANDLERS ====================
    const seleccionarProveedor = (p) => {
        setProveedor(p);
        setBusquedaProveedor('');
        setMostrarSugerenciasProveedor(false);
        setProveedoresSugeridos([]);
        setTimeout(() => codigoRef.current?.focus(), 100);
    };

    const agregarProducto = (productoOverride = null, cantidadOverride = null, costoOverride = null) => {
        const prod = productoOverride || productoSeleccionado;
        if (!prod) return;

        const cantidad = cantidadOverride !== null ? parseFloat(cantidadOverride) : (parseFloat(inputCantidad) || 1);
        const costo = costoOverride !== null ? parseFloat(costoOverride) : (parseFloat(inputCosto) || 0);

        if (costo <= 0) {
            Swal.fire('Atención', 'El costo debe ser mayor a 0', 'warning');
            return;
        }

        const existe = items.find(i => i.id === prod.id);

        if (existe) {
            setItems(items.map(i =>
                i.id === prod.id
                    ? { ...i, cantidad: i.cantidad + cantidad, subtotal: (i.cantidad + cantidad) * costo, costo: costo }
                    : i
            ));
        } else {
            setItems([...items, {
                id: prod.id,
                codigo: prod.codigo,
                descripcion: prod.descripcion,
                cantidad: cantidad,
                costo: costo,
                subtotal: cantidad * costo,
                iva_alicuota: prod.iva_alicuota || 21
            }]);
        }

        limpiarBusqueda();
        setInputCantidad('1');
        setInputCosto('');
        setProductoSeleccionado(null);
        codigoRef.current?.focus();
    };

    const handleCantidadKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            costoRef.current?.focus();
        }
    };

    const handleCostoKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarProducto();
        }
    };

    const eliminarItem = (id) => {
        setItems(items.filter(i => i.id !== id));
    };

    const totalGeneral = items.reduce((acc, i) => acc + i.subtotal, 0);

    const guardarCompra = async () => {
        if (!proveedor) {
            showWarningAlert('Atención', 'Debe seleccionar un proveedor');
            return;
        }
        if (items.length === 0) {
            showWarningAlert('Atención', 'Agregue al menos un producto');
            return;
        }

        setGuardando(true);
        try {
            const response = await fetch('/api/compras/orden/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    proveedor: proveedor.id,
                    items: items.map(i => ({
                        producto_id: i.id,
                        cantidad: i.cantidad,
                        precio: i.costo,
                        iva_alicuota: i.iva_alicuota
                    })),
                    // If creating a direct purchase (received), we might need extra flags?
                    // Assuming this creates an Order first. If we want direct purchase, we typically auto-receive.
                    // For now, let's keep it consistent with the "Nueva Compra" flow which creates an Order.
                    observaciones: `Compra directa (Web) - ${medioPago}`,
                    nro_comprobante: nroComprobante || 'S/N',
                    condicion_pago: medioPago, // This might need to map to medio_pago expected by backend
                    total_estimado: totalGeneral,
                    recepcionar: true // We want to receive it immediately normally in this view? Or maybe just create order?
                    // Based on "Nueva Compra" name, it often implies receiving stock.
                    // Let's check backend: api_orden_compra_guardar accepts 'recepcionar'
                })
            });

            const data = await response.json();

            if (data.ok) {
                // If we want to auto-receive (impact stock):
                // We'd call /api/compras/orden/<id>/recibir/
                // But let's verify if the user wants that flow later. 
                // For now, success message.

                await showSuccessAlert(
                    '¡Compra Registrada!',
                    `Orden #${data.orden_id} creada correctamente.`,
                    undefined,
                    {
                        timer: 2000,
                        showConfirmButton: false
                    }
                );

                setProveedor(null);
                setItems([]);
                setNroComprobante('');
                setMostrarModalPago(false);
                setTimeout(() => proveedorInputRef.current?.focus(), 100);
            } else {
                showWarningAlert('Error', data.error || 'No se pudo guardar la compra');
            }

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* Left Panel: Proveedor & Info */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-[calc(100vh-8rem)]">

                    <div className="flex items-center gap-4">
                        <BtnBack onClick={() => navigate('/compras')} />
                    </div>

                    {/* Header Interno */}
                    <div className="flex-shrink-0">
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <Truck className="text-indigo-600" size={32} strokeWidth={2.5} />
                            Nueva Compra
                        </h1>
                        <p className="text-slate-500 font-medium ml-10">Registrar ingreso de mercadería</p>
                    </div>

                    {/* Proveedor Search */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-4 text-indigo-700">
                            <Truck size={20} />
                            <h2 className="font-bold text-lg">Proveedor</h2>
                        </div>
                        <div className="relative">
                            <input
                                ref={proveedorInputRef}
                                type="text"
                                placeholder="Buscar Proveedor..."
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium"
                                value={busquedaProveedor}
                                onChange={(e) => setBusquedaProveedor(e.target.value)}
                                autoComplete="off"
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setSugerenciaProveedorActiva(prev => {
                                            const newVal = Math.min(prev + 1, proveedoresSugeridos.length - 1);
                                            const item = proveedorListRef.current?.children[newVal];
                                            item?.scrollIntoView({ block: 'nearest' });
                                            return newVal;
                                        });
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setSugerenciaProveedorActiva(prev => {
                                            const newVal = Math.max(prev - 1, 0);
                                            const item = proveedorListRef.current?.children[newVal];
                                            item?.scrollIntoView({ block: 'nearest' });
                                            return newVal;
                                        });
                                    } else if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (proveedoresSugeridos.length > 0) {
                                            seleccionarProveedor(proveedoresSugeridos[sugerenciaProveedorActiva]);
                                        }
                                    }
                                }}
                            />
                            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />

                            {mostrarSugerenciasProveedor && (
                                <div ref={proveedorListRef} className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {proveedoresSugeridos.map((p, idx) => (
                                        <div
                                            key={p.id}
                                            onClick={() => seleccionarProveedor(p)}
                                            className={`p-3 cursor-pointer border-b border-slate-50 last:border-0 ${idx === sugerenciaProveedorActiva ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-100' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="font-bold text-slate-700">{p.nombre}</div>
                                            <div className="text-xs text-slate-500">{p.cuit || 'Sin CUIT'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {proveedor ? (
                            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-indigo-900">{proveedor.nombre}</div>
                                    <div className="text-xs text-indigo-600 font-mono">{proveedor.cuit}</div>
                                </div>
                                <button onClick={() => setProveedor(null)} className="text-indigo-400 hover:text-red-500">
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="mt-2 text-xs text-slate-400 text-center">Seleccione un proveedor para continuar</div>
                        )}
                    </div>

                    {/* Datos Comprobante */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center gap-2 mb-4 text-slate-700">
                            <FileText size={20} />
                            <h2 className="font-bold text-lg">Detalles</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">NRO. COMPROBANTE</label>
                                <input
                                    type="text"
                                    value={nroComprobante}
                                    onChange={(e) => setNroComprobante(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Ej: 0001-00001234"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">CONDICIÓN PAGO</label>
                                <select
                                    value={medioPago}
                                    onChange={(e) => setMedioPago(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="CTACTE">Cuenta Corriente</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="discriminarIVA"
                                    checked={discriminarIVA}
                                    onChange={(e) => setDiscriminarIVA(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <label htmlFor="discriminarIVA" className="text-sm text-slate-600 font-medium cursor-pointer">Discriminar IVA</label>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Panel: Items */}
                <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Add Item Bar */}
                    <div className="p-2 bg-slate-50 border-b border-slate-200 grid grid-cols-12 gap-2 items-end flex-shrink-0">
                        <div className="col-span-2 relative">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">CÓDIGO</label>
                            <input
                                ref={codigoRef}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg font-mono text-sm uppercase font-bold tracking-wide text-center"
                                value={inputCodigo}
                                onChange={(e) => setInputCodigo(e.target.value.toUpperCase())}
                                onKeyDown={handleCodigoKeyDown}
                                onBlur={handleCodigoBlur}
                                placeholder="XXX"
                                autoComplete="off"
                            />
                            {mostrarSugerenciasCodigo && codigosSugeridos.length > 0 && (
                                <div ref={codigoListRef} className="absolute top-full left-0 w-72 bg-white shadow-xl border border-slate-200 rounded-xl z-20 max-h-60 overflow-y-auto mt-1">
                                    {codigosSugeridos.map((p, idx) => (
                                        <div
                                            key={p.id}
                                            onClick={() => seleccionarProducto(p)}
                                            className={`p-3 cursor-pointer text-sm border-b border-slate-50 last:border-0 ${idx === sugerenciaCodigoActiva ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-100' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">{p.codigo}</span>
                                                <span className="font-bold text-slate-700">${p.precio_efectivo.toLocaleString('es-AR')}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">{p.descripcion}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-span-5 relative">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">PRODUCTO</label>
                            <input
                                ref={productoRef}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium"
                                value={inputProducto}
                                onChange={(e) => setInputProducto(e.target.value)}
                                onKeyDown={handleProductoKeyDown}
                                onBlur={handleProductoBlur}
                                placeholder="Buscar..."
                                autoComplete="off"
                            />
                            {mostrarSugerenciasProducto && (
                                <div ref={productoListRef} className="absolute top-full left-0 w-full bg-white shadow-xl border border-slate-200 rounded-xl z-20 max-h-60 overflow-y-auto mt-1">
                                    {productosSugeridos.map((p, idx) => (
                                        <div
                                            key={p.id}
                                            onClick={() => seleccionarProducto(p)}
                                            className={`p-3 cursor-pointer text-sm border-b border-slate-50 ${idx === sugerenciaActiva ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="font-bold">{p.descripcion}</div>
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>{p.codigo}</span>
                                                <span>Stock: {p.stock}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">CANT.</label>
                            <input
                                ref={cantidadRef}
                                type="number"
                                className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-center font-bold text-sm transition-colors ${!productoSeleccionado ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-900'}`}
                                value={inputCantidad}
                                onChange={(e) => setInputCantidad(e.target.value)}
                                onKeyDown={handleCantidadKeyDown}
                                disabled={!productoSeleccionado}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">COSTO</label>
                            <input
                                ref={costoRef}
                                type="number"
                                className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-center font-bold text-sm transition-colors ${!productoSeleccionado ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-900'}`}
                                value={inputCosto}
                                onChange={(e) => setInputCosto(e.target.value)}
                                onKeyDown={handleCostoKeyDown}
                                placeholder="0.00"
                                disabled={!productoSeleccionado}
                            />
                        </div>
                        <div className="col-span-1">
                            <button
                                onClick={agregarProducto}
                                disabled={!productoSeleccionado}
                                className={`w-full py-2 rounded-lg flex items-center justify-center transition-all ${!productoSeleccionado ? 'bg-slate-100 text-slate-300 shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0 z-10 text-xs text-slate-500 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 text-left">Código</th>
                                    <th className="px-6 py-3 text-left">Producto</th>
                                    <th className="px-6 py-3 text-center">Cant</th>
                                    <th className="px-6 py-3 text-right">Costo U.</th>
                                    {discriminarIVA && <th className="px-6 py-3 text-right">IVA</th>}
                                    <th className="px-6 py-3 text-right">Total</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-mono text-slate-500">{item.codigo}</td>
                                        <td className="px-6 py-3 font-medium text-slate-800">{item.descripcion}</td>
                                        <td className="px-6 py-3 text-center">{item.cantidad}</td>
                                        <td className="px-6 py-3 text-right">${item.costo.toLocaleString('es-AR')}</td>
                                        {discriminarIVA && (
                                            <td className="px-6 py-3 text-right text-slate-500">{item.iva_alicuota}%</td>
                                        )}
                                        <td className="px-6 py-3 text-right font-bold text-indigo-700">${item.subtotal.toLocaleString('es-AR')}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button onClick={() => eliminarItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-10 text-center text-slate-400">
                                            No hay productos en la orden de compra.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="p-6 m-4 mb-8 rounded-3xl bg-slate-900 text-white flex justify-between items-center shadow-2xl ring-1 ring-white/10 flex-shrink-0">
                        {discriminarIVA ? (
                            <div className="flex items-center gap-8">
                                <div className="space-y-0.5">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Subtotal Neto</p>
                                    <p className="text-xl font-bold text-slate-200">${(totalGeneral / 1.21).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="space-y-0.5 relative">
                                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-px h-8 bg-slate-700"></div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">IVA Estimado</p>
                                    <p className="text-xl font-bold text-slate-200">${(totalGeneral - (totalGeneral / 1.21)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-px h-8 bg-slate-700"></div>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-emerald-400 text-sm font-black uppercase tracking-wider">Total Estimado</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black tracking-tight text-emerald-400">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-400 text-sm font-bold uppercase">Total Estimado</p>
                                <p className="text-3xl font-black tracking-tight">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        )}
                        <BtnSave
                            label="Generar Orden"
                            onClick={() => setMostrarModalPago(true)}
                            disabled={items.length === 0}
                            className="px-8 py-3 text-base"
                        />
                    </div>

                </div>
            </div>

            {/* Modal Confirmacion */}
            {mostrarModalPago && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} strokeWidth={3} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmar Compra</h3>
                        <p className="text-slate-600 mb-6">
                            Se generará una orden de compra por <b>${totalGeneral.toLocaleString('es-AR')}</b> para <b>{proveedor?.nombre}</b>.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setMostrarModalPago(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancelar</button>
                            <button
                                onClick={guardarCompra}
                                disabled={guardando}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                            >
                                {guardando ? 'Guardando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NuevaCompra;
