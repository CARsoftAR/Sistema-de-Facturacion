import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search, Plus, Trash2, User, ShoppingCart, DollarSign,
    ArrowUpCircle, Check, X, ArrowLeft
} from 'lucide-react';
import { BtnSave, BtnBack } from '../components/CommonButtons';
import { useProductSearch } from '../hooks/useProductSearch';
import Swal from 'sweetalert2';

// Helper Token
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

const NuevaNotaDebito = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ventaIdParam = searchParams.get('venta_id');

    // Refs
    const codigoRef = useRef(null);
    const cantidadRef = useRef(null);

    // Estado Venta Asociada
    const [venta, setVenta] = useState(null);
    const [loadingVenta, setLoadingVenta] = useState(false);

    // Estado Items y Formulario
    const [motivo, setMotivo] = useState('Recargos Varios');
    const [items, setItems] = useState([]);

    // Inputs Productos
    const [inputCantidad, setInputCantidad] = useState('1');
    const [inputPrecio, setInputPrecio] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // Hook Búsqueda Productos
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
            // Nota Débito usa precio efectivo base, pero editable
            setProductoSeleccionado(producto);
            setInputPrecio(producto.precio_efectivo.toString());
            setTimeout(() => cantidadRef.current?.select(), 50);
        }
    });

    // Cargar Venta al Inicio
    useEffect(() => {
        if (ventaIdParam) {
            fetchVenta(ventaIdParam);
        }
    }, [ventaIdParam]);

    const fetchVenta = async (id) => {
        setLoadingVenta(true);
        try {
            const res = await fetch(`/api/ventas/${id}/`);
            const data = await res.json();
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
            } else {
                setVenta(data);
            }
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'No se pudo cargar la venta', 'error');
        } finally {
            setLoadingVenta(false);
        }
    };

    // ================= LOGICA ITEMS =================
    const agregarProductoALista = () => {
        if (!productoSeleccionado) return;

        const cantidad = parseFloat(inputCantidad) || 1;
        const precio = parseFloat(inputPrecio) || 0;

        if (cantidad <= 0 || precio <= 0) {
            setMensaje({ tipo: 'error', texto: 'Cantidad y precio deben ser mayores a 0' });
            return;
        }

        const nuevoItem = {
            id: productoSeleccionado.id,
            codigo: productoSeleccionado.codigo,
            descripcion: productoSeleccionado.descripcion,
            cantidad: cantidad,
            precio: precio,
            subtotal: cantidad * precio
        };

        // Si ya existe, sumamos?? En ND quizás es mejor separar lineas si son conceptos distintos, 
        // pero por simplicidad de UI sumamos si es mismo producto/precio. 
        // Aqui simplificamos: agregamos como nuevo item siempre o sumamos si id coincide?
        // Vamos a sumar si coinciden ID y Precio.
        const existeIndex = items.findIndex(i => i.id === nuevoItem.id && i.precio === nuevoItem.precio);

        if (existeIndex >= 0) {
            const itemsCopia = [...items];
            itemsCopia[existeIndex].cantidad += cantidad;
            itemsCopia[existeIndex].subtotal = itemsCopia[existeIndex].cantidad * itemsCopia[existeIndex].precio;
            setItems(itemsCopia);
        } else {
            setItems([...items, nuevoItem]);
        }

        limpiarCampos();
        setMensaje(null);
        codigoRef.current?.focus();
    };

    const limpiarCampos = () => {
        limpiarBusqueda();
        setInputCantidad('1');
        setInputPrecio('');
        setProductoSeleccionado(null);
    };

    const eliminarItem = (index) => {
        const nuevos = [...items];
        nuevos.splice(index, 1);
        setItems(nuevos);
    };

    const handleCantidadKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarProductoALista();
        }
    };

    const totalGeneral = items.reduce((acc, i) => acc + i.subtotal, 0);

    // ================= GUARDAR =================
    const handleGuardar = async () => {
        if (!items.length) {
            setMensaje({ tipo: 'error', texto: 'Debe agregar al menos un item.' });
            return;
        }
        if (!venta) return;

        setGuardando(true);
        try {
            const response = await fetch(`/api/notas-debito/crear/${venta.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    items: items,
                    motivo: motivo
                })
            });
            const data = await response.json();

            if (data.ok) {
                Swal.fire({
                    title: 'Éxito',
                    text: data.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/notas-debito');
                });
            } else {
                setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar.' });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión.' });
        } finally {
            setGuardando(false);
        }
    };


    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* COLUMNA IZQUIERDA: INFO VENTA + MOTIVO */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-[calc(100vh-8rem)] pr-1">

                    <div className="flex items-center gap-4">
                        <BtnBack onClick={() => navigate('/notas-debito')} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <ArrowUpCircle className="text-emerald-600" size={32} />
                            Nueva ND
                        </h1>
                        <p className="text-slate-500 font-medium ml-10">Generar Nota de Débito</p>
                    </div>

                    {/* Venta Info Box */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <User size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Cliente / Venta</h2>
                        </div>

                        {loadingVenta ? (
                            <div className="text-center py-4 text-slate-400">Cargando datos...</div>
                        ) : venta ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Cliente</p>
                                    <p className="font-bold text-slate-800 text-lg">{venta.cliente_nombre}</p>
                                    <p className="text-sm text-slate-500">{venta.cliente_cuit || 'Consumidor Final'}</p>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-sm font-bold text-slate-600">Factura Ref.</span>
                                    <span className="font-mono font-bold text-blue-600">#{venta.id}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold">
                                No se ha seleccionado una venta válida.
                            </div>
                        )}
                    </div>

                    {/* Motivo Box */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex-1 flex flex-col min-h-0">
                        <label className="block text-sm font-bold text-slate-600 mb-2">Motivo / Observación</label>
                        <textarea
                            className="w-full flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:border-emerald-500 resize-none text-sm min-h-[6rem]"
                            placeholder="Describa el motivo del débito..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                        />
                    </div>
                </div>

                {/* COLUMNA DERECHA: ITEMS + TOTALES */}
                <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">

                    {/* INPUTS BAR */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex-shrink-0 z-20">
                        <div className="grid grid-cols-12 gap-4 items-end">
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
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white font-mono text-sm uppercase text-center font-bold"
                                />
                                {mostrarSugerenciasCodigo && codigosSugeridos.length > 0 && (
                                    <div ref={codigoListRef} className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                                        {codigosSugeridos.map((p, idx) => (
                                            <div key={p.id} onClick={() => seleccionarProducto(p)} className={`px-4 py-2 cursor-pointer ${idx === sugerenciaCodigoActiva ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                                                <span className="font-bold text-slate-700">{p.codigo}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Producto */}
                            <div className="col-span-5 relative">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">PRODUCTO / CONCEPTO</label>
                                <input
                                    ref={productoRef}
                                    type="text"
                                    value={inputProducto}
                                    onChange={(e) => { setInputProducto(e.target.value); setProductoSeleccionado(null); }}
                                    onKeyDown={handleProductoKeyDown}
                                    onBlur={handleProductoBlur}
                                    placeholder="Buscar producto..."
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-sm font-medium"
                                />
                                {mostrarSugerenciasProducto && productosSugeridos.length > 0 && (
                                    <div ref={productoListRef} className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                                        {productosSugeridos.map((p, idx) => (
                                            <div key={p.id} onClick={() => seleccionarProducto(p)} className={`px-4 py-3 cursor-pointer border-b border-slate-50 ${idx === sugerenciaActiva ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                                                <div className="font-bold text-sm">{p.descripcion}</div>
                                                <div className="text-xs text-slate-400 font-mono">{p.codigo}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Precio (Editable en ND) */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">PRECIO</label>
                                <input
                                    type="number"
                                    value={inputPrecio}
                                    onChange={(e) => setInputPrecio(e.target.value)}
                                    className="w-full px-2 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-sm text-center font-bold"
                                />
                            </div>

                            {/* Cantidad */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 text-center">CANT.</label>
                                <input ref={cantidadRef} type="number" min="1" value={inputCantidad} onChange={(e) => setInputCantidad(e.target.value)} onKeyDown={handleCantidadKeyDown} disabled={!productoSeleccionado} title={!productoSeleccionado ? "Seleccione un producto primero" : "Cantidad"} className={`w-full px-2 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm text-center font-bold transition-colors ${!productoSeleccionado ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-75' : 'bg-white text-slate-800'}`} />
                            </div>

                            <div className="col-span-1">
                                <button onClick={agregarProductoALista} disabled={!productoSeleccionado} className={`w-full py-2.5 rounded-lg flex items-center justify-center transition-all shadow-sm ${productoSeleccionado ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-300'}`}>
                                    <Plus size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabla Items */}
                    <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                <tr className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    <th className="px-6 py-3 text-left w-24">Código</th>
                                    <th className="px-6 py-3 text-left">Producto</th>
                                    <th className="px-6 py-3 text-right">Precio</th>
                                    <th className="px-6 py-3 text-center">Cant.</th>
                                    <th className="px-6 py-3 text-right">Subtotal</th>
                                    <th className="px-6 py-3 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {items.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-mono text-xs font-bold text-slate-500">{item.codigo}</td>
                                        <td className="px-6 py-3 font-medium text-slate-700">{item.descripcion}</td>
                                        <td className="px-6 py-3 text-right text-slate-600">${item.precio.toLocaleString('es-AR')}</td>
                                        <td className="px-6 py-3 text-center font-bold">{item.cantidad}</td>
                                        <td className="px-6 py-3 text-right font-bold text-emerald-600">${item.subtotal.toLocaleString('es-AR')}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button onClick={() => eliminarItem(index)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-10 text-center text-slate-400">
                                            No hay items cargados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Totals */}
                    <div className="p-6 m-4 mb-8 rounded-3xl bg-slate-900 text-white flex justify-between items-center shadow-2xl ring-1 ring-white/10 flex-shrink-0">
                        <div className="space-y-1">
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Debito</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black tracking-tight">${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        <BtnSave
                            label="Generar Débito"
                            onClick={handleGuardar}
                            disabled={items.length === 0 || guardando}
                            className="bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-bold text-lg text-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NuevaNotaDebito;
