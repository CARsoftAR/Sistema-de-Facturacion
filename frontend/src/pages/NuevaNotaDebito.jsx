import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FileText, Search, User, Package, Calendar,
    Check, ArrowLeft, AlertCircle, ShoppingCart, ArrowUpCircle, PlusCircle
} from 'lucide-react';
import { BtnSave, BtnBack } from '../components/CommonButtons';
import Swal from 'sweetalert2';

const NuevaNotaDebito = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ventaIdParam = searchParams.get('venta_id');

    const [ventaId, setVentaId] = useState(ventaIdParam || '');
    const [venta, setVenta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [motivo, setMotivo] = useState('Recargo adicional');
    const [monto, setMonto] = useState('');

    useEffect(() => {
        if (ventaIdParam) {
            buscarVenta(ventaIdParam);
        }
    }, [ventaIdParam]);

    const buscarVenta = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/ventas/${id}/`);
            const data = await response.json();
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
                setVenta(null);
            } else {
                setVenta(data);
            }
        } catch (error) {
            console.error("Error buscando venta:", error);
            Swal.fire('Error', 'No se pudo cargar la venta', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async () => {
        if (!venta) return;
        if (!monto || parseFloat(monto) <= 0) {
            Swal.fire('Atención', 'Debe ingresar un monto válido', 'warning');
            return;
        }

        setGuardando(true);
        try {
            const response = await fetch(`/api/notas-debito/crear/${venta.id}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo, monto: parseFloat(monto) })
            });
            const data = await response.json();
            if (data.ok) {
                Swal.fire('Éxito', 'Nota de Débito generada correctamente', 'success');
                navigate('/notas-debito');
            } else {
                Swal.fire('Error', data.error || 'Error al generar ND', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <BtnBack onClick={() => navigate('/notas-debito')} />
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <ArrowUpCircle className="text-emerald-600" size={32} />
                        Nueva Nota de Débito
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <label className="block text-sm font-bold text-slate-500 mb-2">Venta Asociada</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ID de Venta (ej: 123)"
                                value={ventaId}
                                onChange={(e) => setVentaId(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all font-medium"
                            />
                            <button
                                onClick={() => buscarVenta(ventaId)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </div>

                    {venta && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <User size={20} className="text-blue-500" />
                                <h2 className="font-bold text-slate-700">Cliente</h2>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="font-bold text-slate-800 text-lg">{venta.cliente_nombre}</p>
                                <p className="text-slate-500 text-sm mt-1">{venta.cliente_cuit || 'Consumidor Final'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-500 ml-1">Monto del Recargo</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={monto}
                                        onChange={(e) => setMonto(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 transition-all font-bold text-lg"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-500 ml-1">Motivo / Observaciones</label>
                                <textarea
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 transition-all text-sm h-24"
                                    placeholder="Especifique el motivo del recargo..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-7">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-emerald-50/30">
                            <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                                <FileText size={20} className="text-emerald-500" />
                                Resumen de Operación
                            </h2>
                        </div>

                        <div className="flex-1 p-8 text-center bg-slate-50/10">
                            {!venta ? (
                                <div className="p-20 text-slate-400">
                                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                        <PlusCircle size={32} />
                                    </div>
                                    <p className="font-medium">Busque una venta para comenzar</p>
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto space-y-8 fade-in">
                                    <div className="text-left space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Venta de Referencia</p>
                                        <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2">
                                            <span className="text-slate-600 font-medium">Factura #{venta.id}</span>
                                            <span className="text-slate-400 font-mono">${new Intl.NumberFormat('es-AR').format(venta.total)}</span>
                                        </div>
                                    </div>

                                    <div className="text-left space-y-2">
                                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Ajuste / Recargo</p>
                                        <div className="flex justify-between items-end border-b-2 border-emerald-100 pb-2">
                                            <span className="text-emerald-700 font-medium">{motivo || 'Sin descripción'}</span>
                                            <span className="text-emerald-600 font-black text-xl">+ ${new Intl.NumberFormat('es-AR').format(monto || 0)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-10">
                                        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl transform rotate-1">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Total de la Nota de Débito</p>
                                            <p className="text-4xl font-black">${new Intl.NumberFormat('es-AR').format(monto || 0)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {venta && (
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <BtnSave
                                    label="Emitir Nota de Débito"
                                    icon={<ArrowUpCircle size={20} />}
                                    onClick={handleGuardar}
                                    disabled={guardando || !monto}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NuevaNotaDebito;
