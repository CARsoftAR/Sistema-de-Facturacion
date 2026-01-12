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
        <div className="container-fluid px-4 py-6 max-w-7xl mx-auto fade-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
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
                    <BtnBack onClick={() => navigate('/presupuestos')} />
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda: Info */}
                <div className="lg:col-span-1 space-y-6">
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
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <ShoppingCart size={18} className="text-indigo-500" />
                                Items del Presupuesto
                            </h3>
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
                                {presupuesto.detalles.length} Items
                            </span>
                        </div>

                        <div className="overflow-auto" style={{ height: '700px' }}>
                            <table className="w-full text-sm text-left relative min-h-full">
                                <thead className="bg-gray-900 text-white uppercase font-semibold sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3">Producto</th>
                                        <th className="px-6 py-3 text-center">Cant</th>
                                        <th className="px-6 py-3 text-right">Precio Unit.</th>
                                        <th className="px-6 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {presupuesto.detalles.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{item.producto_descripcion}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">{item.producto_codigo}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">
                                                {item.cantidad}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600">
                                                $ {item.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                $ {item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ height: '100%' }}><td colSpan="4"></td></tr>
                                </tbody>
                                <tfoot className="bg-gray-900 border-t border-gray-700 sticky bottom-0 z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.2)]">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-right text-gray-400 font-bold uppercase tracking-wider">Total</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-2xl font-black text-white flex items-baseline justify-end gap-1">
                                                <span>$</span>
                                                {presupuesto.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetallePresupuesto;
