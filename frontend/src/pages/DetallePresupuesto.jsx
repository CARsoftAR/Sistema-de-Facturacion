import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, User, Calendar, DollarSign, Clock, CheckCircle2, AlertCircle, ShoppingCart, XCircle } from 'lucide-react';
import { BtnAction, BtnBack } from '../components/CommonButtons';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';

const DetallePresupuesto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [presupuesto, setPresupuesto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [converting, setConverting] = useState(false);
    const [reactivating, setReactivating] = useState(false);
    const [cancelling, setCancelling] = useState(false);

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
        const result = await showConfirmationAlert(
            '¿Convertir a Pedido?',
            "Se creará un nuevo Pedido con los mismos items. El stock se descontará solo al facturar el Pedido.",
            'SÍ, CONVERTIR',
            'warning',
            { cancelText: 'CANCELAR' }
        );

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
                    showSuccessAlert(
                        '¡Convertido!',
                        `Se ha creado el Pedido #${data.pedido_id} exitosamente.`,
                        'VER PEDIDO'
                    ).then(() => {
                        navigate(`/pedidos/${data.pedido_id}`);
                    });
                } else {
                    showErrorAlert('Error', data.error || 'No se pudo convertir el presupuesto');
                }
            } catch (error) {
                console.error(error);
                showErrorAlert('Error', 'Error de conexión');
            } finally {
                setConverting(false);
            }
        }
    };

    const handleReactivar = async () => {
        const result = await showConfirmationAlert(
            '¿Renovar Presupuesto?',
            "Se actualizará la fecha del presupuesto a hoy, extendiendo su validez por otros " + presupuesto.validez + " días.",
            'SÍ, RENOVAR',
            'info',
            { cancelText: 'CANCELAR' }
        );

        if (result.isConfirmed) {
            setReactivating(true);
            try {
                const response = await fetch(`/api/presupuesto/reactivar/${id}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
                    }
                });
                const data = await response.json();

                if (data.ok) {
                    showSuccessAlert('¡Renovado!', 'El presupuesto ha sido renovado exitosamente.');
                    // Refresh data
                    window.location.reload();
                } else {
                    showErrorAlert('Error', data.error || 'No se pudo renovar el presupuesto');
                }
            } catch (error) {
                console.error(error);
                showErrorAlert('Error', 'Error de conexión');
            } finally {
                setReactivating(false);
            }
        }
    };

    const handleAnular = async () => {
        const result = await showConfirmationAlert(
            '¿Anular Presupuesto?',
            "Esta acción no se puede deshacer.",
            'SÍ, ANULAR',
            'error',
            { cancelText: 'CANCELAR' }
        );

        if (result.isConfirmed) {
            setCancelling(true);
            try {
                const response = await fetch(`/api/presupuesto/anular/${id}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
                    }
                });
                const data = await response.json();

                if (data.ok) {
                    showSuccessAlert('¡Anulado!', 'El presupuesto ha sido anulado.');
                    window.location.reload();
                } else {
                    showErrorAlert('Error', data.error || 'No se pudo anular el presupuesto');
                }
            } catch (error) {
                console.error(error);
                showErrorAlert('Error', 'Error de conexión');
            } finally {
                setCancelling(false);
            }
        }
    };

    const getEstadoBadge = (estado) => {
        const est = estado?.toUpperCase();
        switch (est) {
            case 'PENDIENTE':
                return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><Clock size={16} /> Pendiente</span>;
            case 'VENCIDO':
                return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><AlertCircle size={16} /> Vencido</span>;
            case 'ANULADO':
                return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><XCircle size={16} /> Anulado</span>;
            case 'CONVERTIDO':
                return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><CheckCircle2 size={16} /> Convertido</span>;
            default:
                return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-bold">{estado}</span>;
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;
    if (!presupuesto) return null;

    const items = presupuesto.detalles || [];

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-pink-50/30 to-slate-50 flex flex-col">
            <div className="flex-1 overflow-hidden p-6 flex flex-col">

                {/* Header - Compacto */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BtnBack onClick={() => navigate('/presupuestos')} />
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <span className="bg-gradient-to-br from-pink-600 to-pink-700 p-2 rounded-xl text-white shadow-md">
                                        <FileText size={20} />
                                    </span>
                                    Presupuesto #{presupuesto.id}
                                </h1>
                                <p className="text-sm text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                                    <Calendar size={12} className="text-pink-500" />
                                    {presupuesto.fecha}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {presupuesto.estado?.toUpperCase() === 'PENDIENTE' && (
                                <>
                                    <button
                                        onClick={handleConvertir}
                                        disabled={converting}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <ShoppingCart size={16} /> {converting ? 'Convirtiendo...' : 'Convertir a Pedido'}
                                    </button>
                                    <button
                                        onClick={handleAnular}
                                        disabled={cancelling}
                                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
                                    >
                                        {cancelling ? 'Anulando...' : 'Anular'}
                                    </button>
                                </>
                            )}
                            {presupuesto.estado?.toUpperCase() === 'VENCIDO' && (
                                <button
                                    onClick={handleReactivar}
                                    disabled={reactivating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                                >
                                    {reactivating ? 'Renovando...' : 'Renovar'}
                                </button>
                            )}
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-md flex items-center gap-2"
                            >
                                <Printer size={16} /> Imprimir
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">

                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">

                        {/* Estado y Total */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Actual</h3>
                                {getEstadoBadge(presupuesto.estado)}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Estimado</label>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
                                        $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(presupuesto.total)}
                                    </span>
                                    <span className="text-slate-400 font-medium text-xs">ARS</span>
                                </div>
                            </div>
                        </div>

                        {/* Validez */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                                    <Clock size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">Validez</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Vencimiento</span>
                                    <span className="text-xs font-bold text-slate-800">{presupuesto.vencimiento}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Validez</span>
                                    <span className="text-xs font-bold text-slate-800">{presupuesto.validez} días</span>
                                </div>
                            </div>
                        </div>

                        {/* Cliente */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                                    <User size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">Cliente</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nombre / Razón Social</label>
                                    <p className="text-base font-bold text-slate-900 leading-tight">{presupuesto.cliente_nombre}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Tabla */}
                    <div className="lg:col-span-2 flex flex-col min-h-0">
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200/50 overflow-hidden flex flex-col h-full">

                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                            <ShoppingCart size={18} />
                                        </div>
                                        Detalle de Productos
                                    </h3>
                                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                                    </span>
                                </div>
                            </div>

                            {/* Tabla */}
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-1.5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Producto</th>
                                            <th className="px-3 py-1.5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Cant.</th>
                                            <th className="px-3 py-1.5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Unitario</th>
                                            <th className="px-4 py-1.5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-pink-50/50 transition-all duration-200 group">
                                                <td className="px-4 py-1.5">
                                                    <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-pink-700 transition-colors">{item.producto_descripcion}</p>
                                                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">{item.producto_codigo}</p>
                                                </td>
                                                <td className="px-3 py-1.5 text-center">
                                                    <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 h-7 rounded-lg bg-slate-100 font-black text-slate-700 text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.cantidad)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5 text-right text-slate-600 font-semibold text-sm">
                                                    $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.precio_unitario)}
                                                </td>
                                                <td className="px-4 py-1.5 text-right">
                                                    <span className="font-black text-slate-900 text-base">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.subtotal)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-white border-t-2 border-slate-100">
                                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 shadow-xl shadow-slate-900/20 ring-1 ring-white/10 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                    <div className="flex justify-end items-center relative z-10">
                                        {/* Total */}
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em] mb-1">Total Estimado</p>
                                            <div className="flex items-baseline justify-end gap-2">
                                                <span className="text-slate-400 text-lg font-light">$</span>
                                                <span className="text-4xl font-black text-white tracking-tighter">
                                                    {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(presupuesto.total)}
                                                </span>
                                                <span className="text-slate-400 text-[10px] font-bold uppercase ml-1">ARS</span>
                                            </div>
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
