
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Swal from 'sweetalert2';
import { Search, Plus, Trash2, User, ShoppingCart, Check, X, ClipboardList, PenTool, FileText } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { BtnSave, BtnCancel } from '../components/CommonButtons';
import { showSuccessAlert } from '../utils/alerts';
import { useProductSearch } from '../hooks/useProductSearch';

// Componente helper para inputs con autofocus (mismo que NuevaVenta)
const AutoFocusInput = ({ onKeyDownNext, ...props }) => {
    const inputRef = useRef(null);
    useLayoutEffect(() => {
        if (inputRef.current) {
            // Intenta enfocar inmediatamente
            inputRef.current.focus();

            // Reintentos para asegurar el foco en modales/transiciones
            requestAnimationFrame(() => inputRef.current?.focus());
            setTimeout(() => inputRef.current?.focus(), 50);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, []);
    return <input ref={inputRef} {...props} />;
};

const NuevaCompra = () => {
    const navigate = useNavigate();

    // ==================== STATE ====================
    const [proveedor, setProveedor] = useState(null);
    const [busquedaProveedor, setBusquedaProveedor] = useState('');
    const [proveedoresSugeridos, setProveedoresSugeridos] = useState([]);
    const [mostrarSugerenciasProveedor, setMostrarSugerenciasProveedor] = useState(false);
    const [sugerenciaProveedorActiva, setSugerenciaProveedorActiva] = useState(0);

    // ==================== STATE BANCO (CHECK SEARCH) ====================
    const [bancosDisponibles, setBancosDisponibles] = useState([]);
    const [bancosSugeridos, setBancosSugeridos] = useState([]);
    const [mostrarSugerenciasBanco, setMostrarSugerenciasBanco] = useState(false);
    const [sugerenciaBancoActiva, setSugerenciaBancoActiva] = useState(0);
    const bancoListRef = useRef(null); // Ref para lista de bancos

    // Cargar Bancos al inicio para tenerlos listos
    useEffect(() => {
        fetch('/api/bancos/listar/')
            .then(res => res.json())
            .then(data => {
                if (data.ok && data.cuentas) {
                    setBancosDisponibles(data.cuentas);
                }
            })
            .catch(err => console.error("Error cargando bancos:", err));
    }, []);

    // ==================== STATE PAGO ====================
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [medioPago, setMedioPago] = useState('EFECTIVO');
    const [datosCheque, setDatosCheque] = useState({ banco: '', numero: '', fechaVto: '' });

    const chequeNumeroRef = useRef(null);
    const chequeFechaRef = useRef(null);

    const filtrarBancos = (query) => {
        if (!query) return bancosDisponibles;
        return bancosDisponibles.filter(b =>
            b.banco.toLowerCase().includes(query.toLowerCase()) ||
            (b.alias && b.alias.toLowerCase().includes(query.toLowerCase()))
        );
    };

    const handleBancoKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!mostrarSugerenciasBanco) {
                const filtrados = filtrarBancos(datosCheque.banco);
                setBancosSugeridos(filtrados);
                setMostrarSugerenciasBanco(true);
                return;
            }
            const newIndex = Math.min(sugerenciaBancoActiva + 1, bancosSugeridos.length - 1);
            setSugerenciaBancoActiva(newIndex);
            bancoListRef.current?.children[newIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.max(sugerenciaBancoActiva - 1, 0);
            setSugerenciaBancoActiva(newIndex);
            bancoListRef.current?.children[newIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (mostrarSugerenciasBanco && bancosSugeridos.length > 0) {
                seleccionarBanco(bancosSugeridos[sugerenciaBancoActiva]);
            }
        } else if (e.key === 'Escape') {
            setMostrarSugerenciasBanco(false);
        }
    };

    const seleccionarBanco = (banco) => {
        setDatosCheque({ ...datosCheque, banco: banco.banco });
        setMostrarSugerenciasBanco(false);
        // Focus next input: Cheque Number
        setTimeout(() => chequeNumeroRef.current?.focus(), 50);
    };

    const handleChequeNumeroKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            chequeFechaRef.current?.focus();
        }
    };

    // Actualizar sugerencias al escribir
    useEffect(() => {
        if (mostrarSugerenciasBanco) {
            setBancosSugeridos(filtrarBancos(datosCheque.banco));
        }
    }, [datosCheque.banco]);

    // Campos de entrada de producto
    // ==================== PRODUCT SEARCH HOOK ====================
    const {
        inputCodigo, setInputCodigo,
        inputProducto, setInputProducto,
        codigosSugeridos, productosSugeridos,
        mostrarSugerenciasCodigo, mostrarSugerenciasProducto,
        sugerenciaCodigoActiva, sugerenciaActiva,
        codigoListRef, productoListRef,
        nextInputRef: productoRef,
        handleCodigoKeyDown, handleProductoKeyDown,
        handleCodigoBlur, handleProductoBlur,
        seleccionar: seleccionarProducto,
        limpiar: limpiarBusqueda
    } = useProductSearch({
        onSelect: (producto) => {
            setProductoSeleccionado(producto);
            // Sugerir el costo actual o "0"
            setInputCosto(producto.costo ? producto.costo.toString() : '0');
            setTimeout(() => cantidadRef.current?.select(), 50);
        }
    });

    const [inputCantidad, setInputCantidad] = useState('1');
    const [inputCosto, setInputCosto] = useState(''); // Costo unitario
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const [items, setItems] = useState([]);
    const [observaciones, setObservaciones] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // Dialogo Exito Manual (para estilo Premium exacto)
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successOrderData, setSuccessOrderData] = useState(null);

    // Refs
    const codigoRef = useRef(null);
    // productoRef (from hook)
    const cantidadRef = useRef(null);
    const costoRef = useRef(null);
    const proveedorInputRef = useRef(null);

    // Refs para scroll
    const proveedorListRef = useRef(null);
    // codigoListRef (from hook)
    // productoListRef (from hook)

    // ==================== FOCUS INICIAL ====================
    useEffect(() => {
        setTimeout(() => proveedorInputRef.current?.focus(), 100);
    }, []);

    // ==================== BUSCAR PROVEEDOR ====================
    const buscarProveedores = (query) => {
        fetch(`/api/proveedores/buscar/?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                const resultados = Array.isArray(data) ? data : (data.resultados || []);
                setProveedoresSugeridos(resultados);
                setMostrarSugerenciasProveedor(true);
                setSugerenciaProveedorActiva(0);
            })
            .catch(() => setProveedoresSugeridos([]));
    };

    useEffect(() => {
        // Permitir búsqueda con 1 caracter o más, o si es vacío permitir
        // pero generalmente se busca al escribir.
        // El usuario se quejaba de 2 caracteres, bajamos el umbral a 1.
        if (busquedaProveedor.length < 1) {
            setProveedoresSugeridos([]);
            // No ocultamos inmediatamente por si está vacio pero quisimos abrir con flecha
            return;
        }

        const timer = setTimeout(() => {
            buscarProveedores(busquedaProveedor);
        }, 300);
        return () => clearTimeout(timer);
    }, [busquedaProveedor]);

    // ==================== SELECCIONAR PROVEEDOR ====================
    const handleProveedorKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!mostrarSugerenciasProveedor) {
                if (busquedaProveedor.length > 0) buscarProveedores(busquedaProveedor);
                return;
            }
            const newIndex = Math.min(sugerenciaProveedorActiva + 1, proveedoresSugeridos.length - 1);
            setSugerenciaProveedorActiva(newIndex);
            proveedorListRef.current?.children[newIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.max(sugerenciaProveedorActiva - 1, 0);
            setSugerenciaProveedorActiva(newIndex);
            proveedorListRef.current?.children[newIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (mostrarSugerenciasProveedor && proveedoresSugeridos.length > 0) {
                seleccionarProveedor(proveedoresSugeridos[sugerenciaProveedorActiva]);
            }
        } else if (e.key === 'Escape') {
            setMostrarSugerenciasProveedor(false);
        }
    };

    const seleccionarProveedor = (p) => {
        setProveedor(p);
        setBusquedaProveedor('');
        setMostrarSugerenciasProveedor(false);
        setProveedoresSugeridos([]);
        setTimeout(() => codigoRef.current?.focus(), 100);
    };

    // ==================== AGREGAR PRODUCTO A LA LISTA ====================
    const agregarProductoALista = () => {
        if (!productoSeleccionado) return;

        const cantidad = parseFloat(inputCantidad) || 1;
        const costo = parseFloat(inputCosto) || 0;

        // Calcular cantidad total (si ya existe en el carrito)
        const existe = items.find(i => i.id === productoSeleccionado.id);

        if (existe) {
            setItems(items.map(i =>
                i.id === productoSeleccionado.id
                    ? { ...i, cantidad: i.cantidad + cantidad, subtotal: (i.cantidad + cantidad) * costo, costo: costo }
                    : i
            ));
        } else {
            setItems([...items, {
                id: productoSeleccionado.id,
                codigo: productoSeleccionado.codigo,
                descripcion: productoSeleccionado.descripcion,
                costo: costo,
                cantidad: cantidad,
                subtotal: cantidad * costo,
                stock: productoSeleccionado.stock
            }]);
        }

        setMensaje(null);
        limpiarCamposEntrada();
        codigoRef.current?.focus();
    };

    const limpiarCamposEntrada = () => {
        limpiarBusqueda();
        setInputCantidad('1');
        setInputCosto('');
        setProductoSeleccionado(null);
    };

    // ==================== MANEJO DE TECLAS - UTILS ====================
    // Code/Product handlers removed (handled by hook)

    const handleCantidadKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            costoRef.current?.focus(); // Ir a costo
            costoRef.current?.select();
        }
    };

    const handleCostoKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarProductoALista();
        }
    }

    const cambiarCantidad = (id, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
        setItems(items.map(i =>
            i.id === id
                ? { ...i, cantidad: nuevaCantidad, subtotal: nuevaCantidad * i.costo }
                : i
        ));
    };

    const eliminarItem = (id) => {
        setItems(items.filter(i => i.id !== id));
    };

    // ==================== STATE PAGO ====================
    // Ya declarados arriba
    const [montoPago, setMontoPago] = useState('');

    // ==================== ABRIR MODAL ====================
    const abrirModalPago = () => {
        if (!proveedor) {
            setMensaje({ tipo: 'error', texto: 'Debe seleccionar un proveedor.' });
            return;
        }
        if (items.length === 0) {
            setMensaje({ tipo: 'error', texto: 'Debe agregar al menos un producto.' });
            return;
        }
        setMensaje(null);
        setMontoPago(totalGeneral.toString()); // Por defecto pagamos el total
        setMostrarModalPago(true);
    };

    // Helper para obtener cookie CSRF (Django)
    const getCookie = (name) => {
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
    };

    // ==================== GUARDAR COMPRA (FINAL) ====================

    const guardarCompra = async () => {
        setGuardando(true);
        setMensaje(null);

        try {
            const itemsPayload = items.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad,
                precio: item.costo
            }));

            const payload = {
                proveedor: proveedor.id,
                items: itemsPayload,
                observaciones: observaciones,
                recepcionar: false, // Guardar como PENDIENTE (flujo 2 pasos)
                medio_pago: 'CONTADO', // Valor dummy, no se procesa
                datos_cheque: null,
            };

            const res = await fetch('/api/compras/orden/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.ok) {
                // Éxito total
                setMostrarModalPago(false);
                setSuccessOrderData(data);
                setShowSuccessModal(true);
            } else {
                setMostrarModalPago(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al Guardar',
                    text: data.error || 'Ocurrió un error desconocido.',
                });
            }
        } catch (error) {
            setMostrarModalPago(false);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo contactar con el servidor. Intente nuevamente.',
            });
        } finally {
            setGuardando(false);
        }
    };

    const totalGeneral = items.reduce((acc, i) => acc + i.subtotal, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col fade-in">
            {/* Header */}
            <div className="mb-6 flex-shrink-0 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <ClipboardList className="text-blue-600" size={32} strokeWidth={2.5} />
                        Ingresar Compra
                    </h1>
                    <p className="text-slate-500 font-medium ml-10">Registre una compra e ingreso de stock</p>
                </div>
            </div>

            {/* Mensaje */}
            {mensaje && (
                <div className={`mb-4 p-4 rounded-xl flex-shrink-0 shadow-sm border-l-4 ${mensaje.tipo === 'success'
                    ? 'bg-white border-green-500 text-green-800'
                    : 'bg-white border-red-500 text-red-800'
                    }`}>
                    <div className="flex items-center gap-3">
                        {mensaje.tipo === 'success' ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
                        <span className="font-medium">{mensaje.texto}</span>
                    </div>
                </div>
            )}

            {/* Layout principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* =============== COLUMNA IZQUIERDA (4 cols) =============== */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>

                    {/* Proveedor Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex-shrink-0 group">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <User size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Proveedor</h2>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                ref={proveedorInputRef}
                                type="text"
                                placeholder="Buscar proveedor por nombre..."
                                value={busquedaProveedor}
                                onChange={(e) => setBusquedaProveedor(e.target.value)}
                                onKeyDown={handleProveedorKeyDown}
                                onFocus={() => setMostrarSugerenciasProveedor(true)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all font-medium"
                            />
                            {mostrarSugerenciasProveedor && proveedoresSugeridos.length > 0 && (
                                <div ref={proveedorListRef} className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto ring-1 ring-black/5">
                                    {proveedoresSugeridos.map((p, idx) => (
                                        <div
                                            key={p.id}
                                            onClick={() => seleccionarProveedor(p)}
                                            className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-b-0 flex items-center justify-between ${idx === sugerenciaProveedorActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                        >
                                            <div>
                                                <div className="font-bold text-slate-800">{p.nombre}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">CUIT: {p.cuit}</div>
                                            </div>
                                            {idx === sugerenciaProveedorActiva && <div className="text-blue-500"><Check size={16} /></div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {proveedor ? (
                            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-start justify-between relative overflow-hidden">
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white text-blue-600 shadow-sm flex items-center justify-center font-bold text-lg border border-blue-100">
                                        {proveedor.nombre ? proveedor.nombre.substring(0, 2).toUpperCase() : 'PR'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-base">{proveedor.nombre}</p>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                            {proveedor.cuit}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setProveedor(null)} className="text-slate-400 hover:text-red-500 hover:bg-white p-2 rounded-full transition-all relative z-10">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3 flex items-center gap-2 text-slate-400 px-2">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <span className="text-sm font-medium">Seleccione un proveedor</span>
                            </div>
                        )}
                    </div>

                    {/* Observaciones Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex-shrink-0 group">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
                                <FileText size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Observaciones</h2>
                        </div>
                        <textarea
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all font-medium text-sm"
                            rows="4"
                            placeholder="Notas internas para la orden..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                        ></textarea>
                    </div>

                </div>

                {/* =============== COLUMNA DERECHA (8 cols) =============== */}
                <div className="lg:col-span-8 flex flex-col min-h-0">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative">

                        {/* Header + Tooltip */}
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <ShoppingCart size={18} />
                                </div>
                                <h2 className="font-bold text-slate-700">Detalle de Compra</h2>
                            </div>
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                {items.length} items
                            </span>
                        </div>

                        {/* Barra de Entrada */}
                        <div className="p-5 border-b border-slate-100 bg-white flex-shrink-0 z-20">
                            <div className="grid grid-cols-12 gap-3 items-end">
                                {/* Código */}
                                <div className="col-span-2 relative">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">CÓDIGO</label>
                                    <input
                                        ref={codigoRef}
                                        type="text"
                                        value={inputCodigo}
                                        onChange={(e) => setInputCodigo(e.target.value.toUpperCase())}
                                        onKeyDown={handleCodigoKeyDown}
                                        onBlur={handleCodigoBlur}
                                        placeholder="XXX"
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-mono text-sm uppercase text-center font-bold tracking-wide"
                                    />
                                    {mostrarSugerenciasCodigo && codigosSugeridos.length > 0 && (
                                        <div ref={codigoListRef} className="absolute left-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                                            {codigosSugeridos.map((p, idx) => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => seleccionarProducto(p)}
                                                    className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-b-0 ${idx === sugerenciaCodigoActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                                >
                                                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-1.5 rounded mr-2">{p.codigo}</span>
                                                    <span className="text-xs text-slate-600 truncate">{p.descripcion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Producto */}
                                <div className="col-span-4 relative">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">PRODUCTO</label>
                                    <input
                                        ref={productoRef}
                                        type="text"
                                        value={inputProducto}
                                        onChange={(e) => { setInputProducto(e.target.value); setProductoSeleccionado(null); }}
                                        onKeyDown={handleProductoKeyDown}
                                        onBlur={handleProductoBlur}
                                        placeholder="Buscar producto..."
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm font-medium"
                                    />
                                    {mostrarSugerenciasProducto && productosSugeridos.length > 0 && (
                                        <div ref={productoListRef} className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                                            {productosSugeridos.map((p, idx) => (
                                                <div key={p.id} onClick={() => seleccionarProducto(p)} className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-b-0 flex justify-between items-center ${idx === sugerenciaActiva ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                                    <div className="font-bold text-slate-700 text-sm truncate">{p.descripcion}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Cantidad */}
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">CANT.</label>
                                    <input ref={cantidadRef} type="number" min="1" value={inputCantidad} onChange={(e) => setInputCantidad(e.target.value)} onKeyDown={handleCantidadKeyDown} className="w-full px-2 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm text-center font-bold text-slate-800" />
                                </div>

                                {/* Costo */}
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">COSTO</label>
                                    <input ref={costoRef} type="number" step="0.01" value={inputCosto} onChange={(e) => setInputCosto(e.target.value)} onKeyDown={handleCostoKeyDown} className="w-full px-2 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm text-center font-bold text-slate-800" placeholder="0.00" />
                                </div>

                                {/* Botón Add */}
                                <div className="col-span-2">
                                    <button onClick={agregarProductoALista} disabled={!productoSeleccionado} className={`w-full py-2.5 rounded-lg flex items-center justify-center transition-all shadow-sm ${productoSeleccionado ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                                        <Plus size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30">
                            {items.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                        <tr className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                            <th className="px-6 py-3 text-left w-24">Código</th>
                                            <th className="px-6 py-3 text-left">Producto</th>
                                            <th className="px-6 py-3 text-center w-32">Cantidad</th>
                                            <th className="px-6 py-3 text-right w-32">Costo</th>
                                            <th className="px-6 py-3 text-right w-32">Subtotal</th>
                                            <th className="px-6 py-3 w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{item.codigo}</td>
                                                <td className="px-6 py-4"><p className="font-semibold text-slate-800">{item.descripcion}</p></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center bg-slate-100 rounded-lg p-1 w-fit mx-auto">
                                                        <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-white transition-colors">-</button>
                                                        <span className="w-8 text-center font-bold text-slate-700 text-xs">{item.cantidad}</span>
                                                        <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-white transition-colors">+</button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-600 font-medium">${item.costo.toLocaleString('es-AR')}</td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-800">${item.subtotal.toLocaleString('es-AR')}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => eliminarItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300 p-10">
                                    <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <ShoppingCart size={48} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">Orden Vacía</h3>
                                    <p className="text-slate-400 max-w-xs text-center text-sm">Agregue productos desde el panel superior para comenzar la orden.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Total - DARK STYLE */}
                        <div className="p-5 bg-slate-900 text-white flex-shrink-0 mt-auto rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total a Pagar</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black tracking-tight">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                        <span className="text-slate-400 font-light">ARS</span>
                                    </div>
                                </div>
                                <BtnSave
                                    label="Guardar Orden"
                                    onClick={abrirModalPago} // Abrir modal de confirmación
                                    disabled={items.length === 0 || !proveedor}
                                    className="px-8 py-4 rounded-xl font-bold text-lg"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ==================== MODAL DE PAGO ==================== */}
            {mostrarModalPago && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-visible animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-6 relative overflow-hidden rounded-t-3xl">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl">Confirmar Compra</h3>
                                    <p className="text-blue-100 text-sm mt-1">Registrando ingreso de mercadería</p>
                                </div>
                                <button onClick={() => setMostrarModalPago(false)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Total Center */}
                            <div className="text-center mb-8">
                                <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-xs">Monto Total a Pagar</p>
                                <p className="text-5xl font-black text-slate-800 tracking-tight">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                            </div>

                            <p className="text-slate-500 text-sm text-center mb-8">
                                Se generará una **Orden de Compra Pendiente**. Podrás elegir el medio de pago y recepcionar el stock desde la pantalla de Órdenes de Compra.
                            </p>

                            {/* Botones */}
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setMostrarModalPago(false)}
                                    className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarCompra}
                                    disabled={guardando}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {guardando ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Check size={20} strokeWidth={3} />
                                            Confirmar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* ==================== MODAL EXITO (MANUAL) ==================== */}
            {
                showSuccessModal && successOrderData && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 border border-slate-200">
                            <div className="mx-auto bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <Check size={32} strokeWidth={2} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">¡Orden Generada!</h4>
                            <p className="text-slate-500 text-sm mb-6">
                                La orden <strong>#{successOrderData.orden_id}</strong> se guardó correctamente. Recuerda recibirla cuando llegue la mercadería.
                            </p>
                            <div className="flex gap-3">
                                <button className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors outline-none" onClick={() => navigate('/compras')}>
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default NuevaCompra;
