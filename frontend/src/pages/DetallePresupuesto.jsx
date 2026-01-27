import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, User, Calendar, DollarSign, Clock, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { BtnAction, BtnBack } from '../components/CommonButtons';
import Swal from 'sweetalert2';

const DetallePresupuesto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [presupuesto, setPresupuesto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        fetch(`/api/presupuesto/${id}/`)
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cargar el presupuesto');
                return res.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);
                setPresupuesto(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handlePrint = () => {
        const url = `/presupuesto/pdf/${id}/`;
        const printWindow = window.open(url, '_blank', 'width=1000,height=800');
        if (printWindow) {
            printWindow.onload = function () {
                setTimeout(() => {
                    printWindow.print();
                }, 1000);
            };
        }
    };

    const handleConvertir = async () => {
        const result = await Swal.fire({
            title: '¿Convertir a Pedido?',
            text: "Se creará un nuevo Pedido con los mismos items. El stock se descontará solo al facturar el Pedido.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, convertir',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setConverting(true);
            try {
                const response = await fetch(`/api/presupuesto/convertir-pedido/${id}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
                    }
                });
                const data = await response.json();

                if (data.ok) {
                    Swal.fire(
                        '¡Convertido!',
                        `Se ha creado el Pedido #${data.pedido_id} exitosamente.`,
                        'success'
                    ).then(() => {
                        navigate(`/pedidos/${data.pedido_id}`);
                    });
                } else {
                    Swal.fire('Error', data.error || 'No se pudo convertir el presupuesto', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Error de conexión', 'error');
            } finally {
                setConverting(false);
            }
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;
    if (!presupuesto) return null;

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'APROBADO':
                return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><CheckCircle2 size={16} /> Aprobado</span>;
            case 'PENDIENTE':
                return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><Clock size={16} /> Pendiente</span>;
            case 'VENCIDO':
                return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><AlertCircle size={16} /> Vencido</span>;
            case 'CANCELADO':
                return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><AlertCircle size={16} /> Cancelado</span>;
            default:
                return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{estado}</span>;
        }
    };

    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* Columna Izquierda: Info */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <BtnBack onClick={() => navigate('/presupuestos')} />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    Presupuesto <span className="text-blue-600">#{presupuesto.id}</span>
                                </h1>
                                <p className="text-gray-500 flex items-center gap-2 mt-1">
                                    <Calendar size={14} /> Fecha: {presupuesto.fecha}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <BtnAction
                                label="Imprimir"
                                icon={Printer}
                                onClick={handlePrint}
                                color="primary"
                            />
                            {presupuesto.estado === 'PENDIENTE' && (
                                <BtnAction
                                    label={converting ? 'Convirtiendo...' : 'Convertir a Pedido'}
                                    icon={ShoppingCart}
                                    onClick={handleConvertir}
                                    color="success"
                                    disabled={converting}
                                />
                            )}
                        </div>
                    </div>

                    {/* Estado Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Estado Actual</h3>
                        <div className="mb-4">
                            {getEstadoBadge(presupuesto.estado)}
                        </div>
                        {presupuesto.pedido_id && (
                            <div className="mt-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-2" onClick={() => navigate(`/pedidos/${presupuesto.pedido_id}`)} style={{ cursor: 'pointer' }}>
                                <CheckCircle2 size={16} />
                                Convertido a Pedido #{presupuesto.pedido_id}
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-xs text-gray-400 font-bold mb-1">VENCIMIENTO</h4>
                                <p className="font-semibold text-gray-700">{presupuesto.vencimiento}</p>
                            </div>
                            <div>
                                <h4 className="text-xs text-gray-400 font-bold mb-1">VALIDEZ</h4>
                                <p className="font-semibold text-gray-700">{presupuesto.validez} días</p>
                            </div>
                        </div>
                    </div>

                    {/* Cliente Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 text-blue-600">
                            <User size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Cliente</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-xl font-bold text-gray-900">{presupuesto.cliente_nombre}</h4>
                                <p className="text-sm text-gray-500 mt-1">{presupuesto.cliente_cuit || 'Consumidor Final'}</p>
                            </div>
                            {presupuesto.cliente_telefono && (
                                <p className="text-sm text-gray-600"><span className="font-semibold">Tel:</span> {presupuesto.cliente_telefono}</p>
                            )}
                            {presupuesto.cliente_email && (
                                <p className="text-sm text-gray-600"><span className="font-semibold">Email:</span> {presupuesto.cliente_email}</p>
                            )}
                        </div>
                    </div>

                    {/* Observaciones */}
                    {presupuesto.observaciones && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-3 text-purple-600">
                                <FileText size={18} />
                                <h3 className="font-bold">Observaciones</h3>
                            </div>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {presupuesto.observaciones}
                            </p>
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Items */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 ring-1 ring-slate-200/50 overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
                        {/* Header del Panel */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-black text-slate-700 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <ShoppingCart size={20} />
                                </div>
                                Detalle de Productos
                            </h3>
                            <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-indigo-200/50">
                                {presupuesto.detalles.length} {presupuesto.detalles.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>

                        {/* Tabla de Items */}
                        <div className="overflow-y-auto flex-grow px-2">
                            <table className="w-full text-sm text-left border-separate border-spacing-0">
                                <thead className="bg-white sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Producto</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Cant.</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Unitario</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {presupuesto.detalles.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                            <td className="px-6 py-3">
                                                <p className="font-bold text-slate-800 text-base leading-tight group-hover:text-blue-700 transition-colors">{item.producto_descripcion}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">{item.producto_codigo}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center justify-center w-12 h-8 rounded-xl bg-slate-100 font-black text-slate-700 text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.cantidad)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-500 font-medium">
                                                $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.precio_unitario)}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <span className="font-black text-slate-900 text-lg">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.subtotal)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Flotante (Totales) */}
                        <div className="p-4 bg-white border-t border-slate-50">
                            <div className="bg-slate-900 rounded-[1.5rem] p-4 shadow-2xl shadow-slate-900/20 ring-1 ring-white/10 overflow-hidden relative">
                                {/* Decoración sutil */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                    {/* Total (Centrado o Derecha) */}
                                    <div className="text-right ml-auto">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Total Estimado</p>
                                        <div className="flex items-baseline justify-end gap-2">
                                            <span className="text-slate-500 text-lg font-light">$</span>
                                            <span className="text-4xl font-black text-white tracking-tighter">
                                                {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(presupuesto.total)}
                                            </span>
                                            <span className="text-slate-500 text-[10px] font-bold uppercase ml-1">ARS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetallePresupuesto;
