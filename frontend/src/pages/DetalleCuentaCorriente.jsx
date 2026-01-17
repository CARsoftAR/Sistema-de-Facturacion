import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, FileText, Download, Plus } from 'lucide-react';
import { BtnBack, BtnPrint, BtnClear, BtnTableAction } from '../components/CommonButtons';
import PaymentModal from '../components/common/PaymentModal';
import TablePagination from '../components/common/TablePagination';
import axios from 'axios';

const DetalleCuentaCorriente = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [movimientosFiltrados, setMovimientosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('');

    // Modal de pago (simplified state)
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [savingPago, setSavingPago] = useState(false);


    // Pagination State
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [paginatedMovimientos, setPaginatedMovimientos] = useState([]);

    useEffect(() => {
        fetchMovimientos();
    }, [id]);

    useEffect(() => {
        // Calculate pagination whenever filtered movements or page changes
        const total = movimientosFiltrados.length;
        setTotalPages(Math.ceil(total / itemsPerPage));

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setPaginatedMovimientos(movimientosFiltrados.slice(start, end));
    }, [movimientosFiltrados, page, itemsPerPage]);

    useEffect(() => {
        aplicarFiltros();
    }, [movimientos, fechaDesde, fechaHasta, tipoFiltro]);

    const fetchMovimientos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/ctacte/clientes/${id}/movimientos/`);
            console.log('API Response:', response.data);
            if (response.data.ok) {
                setCliente(response.data.cliente);
                setMovimientos(response.data.movimientos);
            }
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let filtrados = [...movimientos];

        // Filtro por fecha desde
        if (fechaDesde) {
            filtrados = filtrados.filter(mov => {
                const fechaMov = mov.fecha.split('/').reverse().join('-'); // DD/MM/YYYY -> YYYY-MM-DD
                return fechaMov >= fechaDesde;
            });
        }

        // Filtro por fecha hasta
        if (fechaHasta) {
            filtrados = filtrados.filter(mov => {
                const fechaMov = mov.fecha.split('/').reverse().join('-');
                return fechaMov <= fechaHasta;
            });
        }

        // Filtro por tipo
        if (tipoFiltro) {
            filtrados = filtrados.filter(mov => mov.tipo === tipoFiltro);
        }

        setMovimientosFiltrados(filtrados);
    };

    const limpiarFiltros = () => {
        setFechaDesde('');
        setFechaHasta('');
        setTipoFiltro('');
    };

    const handleVerDetalle = (mov) => {
        const referrer = `/ctas-corrientes/clientes/${id}`;
        switch (mov.comprobante_tipo) {
            case 'venta':
                navigate(`/ventas/${mov.comprobante_id}`, { state: { from: referrer } });
                break;
            case 'nota_credito':
                navigate(`/comprobantes/nc/${mov.comprobante_id}`, { state: { from: referrer } });
                break;
            case 'nota_debito':
                navigate(`/comprobantes/nd/${mov.comprobante_id}`, { state: { from: referrer } });
                break;
            default:
                console.log('Tipo de comprobante no soportado:', mov.comprobante_tipo);
        }
    };

    const handleImprimir = () => {
        window.open(`/ctacte/clientes/${id}/imprimir/`, '_blank');
    };

    const handleRegistrarPago = async (paymentData) => {
        // paymentData comes from PaymentModal { monto, fecha, metodo_pago, descripcion, referencia, cheque, tarjeta }

        try {
            const response = await axios.post(`/api/ctacte/clientes/${id}/registrar-pago/`, {
                monto: paymentData.monto,
                fecha: paymentData.fecha,
                metodo_pago: paymentData.metodo_pago,
                descripcion: paymentData.descripcion,

                // Extra params flattened for backend if needed
                referencia: paymentData.referencia,

                // Cheque params currently expected flat by backend or object?
                // Backend views.py expects: cheque_banco, cheque_numero, etc.
                cheque_banco: paymentData.cheque?.bank,
                cheque_numero: paymentData.cheque?.number,
                cheque_fecha_emision: paymentData.cheque?.emissionDate,
                cheque_fecha_pago: paymentData.cheque?.paymentDate,
                cheque_firmante: paymentData.cheque?.signer,

                // Tarjeta params if backend supported (not yet fully implemented in backend but safe to send)
                tarjeta_last4: paymentData.tarjeta?.last4,
                tarjeta_cuotas: paymentData.tarjeta?.installments
            });

            if (response.data.ok) {
                setShowPagoModal(false);
                // Recargar movimientos
                fetchMovimientos();
            } else {
                alert('Error: ' + (response.data.error || 'No se pudo registrar el pago'));
            }
        } catch (error) {
            console.error('Error al registrar pago:', error);
            alert('Error al registrar el pago');
        }
    };


    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(val);

    const getTipoBadge = (tipo) => {
        const badges = {
            'VENTA': { color: 'danger', text: 'Venta' },
            'PAGO': { color: 'success', text: 'Pago' },
            'NOTA_CREDITO': { color: 'info', text: 'N/C' },
            'NOTA_DEBITO': { color: 'warning', text: 'N/D' }
        };
        const badge = badges[tipo] || { color: 'secondary', text: tipo };
        return (
            <span className={`badge bg-${badge.color}-subtle text-${badge.color} border border-${badge.color} px-3 py-2 rounded-pill`}>
                {badge.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container-fluid px-4 pt-4 pb-3 bg-light fade-in">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col fade-in">
            {/* Header */}
            <div className="mb-6 flex-shrink-0 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3">
                        <BtnBack onClick={() => navigate('/ctas-corrientes/clientes')} />
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <CreditCard className="text-blue-600" size={32} strokeWidth={2.5} />
                            Historial de Cuenta Corriente
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-14 mt-1">Movimientos de {cliente?.nombre}</p>
                </div>
            </div>

            {/* Layout Principal Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* COLUMNA IZQUIERDA (Info + Filtros + Acciones) */}
                <div className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto pr-1">

                    {/* Cliente / Saldo Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-base leading-tight">{cliente?.nombre}</h3>
                                <p className="text-[10px] text-slate-400 font-mono">ID: #{cliente?.id}</p>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Saldo Actual</p>
                            <h2 className={`text-3xl font-black tracking-tight ${cliente?.saldo_actual > 0 ? 'text-red-600' : cliente?.saldo_actual < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {formatCurrency(cliente?.saldo_actual || 0)}
                            </h2>
                            <div className="mt-1 text-[10px] font-bold uppercase">
                                {cliente?.saldo_actual > 0 && <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded">Deudor</span>}
                                {cliente?.saldo_actual < 0 && <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">A Favor</span>}
                                {cliente?.saldo_actual === 0 && <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Al Día</span>}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowPagoModal(true)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Registrar Pago
                        </button>
                    </div>

                    {/* Filtros Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                                <FileText size={16} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-sm">Filtros</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Desde</label>
                                    <input
                                        type="date"
                                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-700"
                                        value={fechaDesde}
                                        onChange={(e) => setFechaDesde(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Hasta</label>
                                    <input
                                        type="date"
                                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-700"
                                        value={fechaHasta}
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Tipo Movimiento</label>
                                <select
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-700"
                                    value={tipoFiltro}
                                    onChange={(e) => setTipoFiltro(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="VENTA">Ventas</option>
                                    <option value="PAGO">Pagos</option>
                                    <option value="NOTA_CREDITO">Notas de Crédito</option>
                                    <option value="NOTA_DEBITO">Notas de Débito</option>
                                </select>
                            </div>
                            <button
                                onClick={limpiarFiltros}
                                className="w-full py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors font-medium"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>

                    {/* Export Actions (Mini Card) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex gap-2">
                        <button onClick={() => window.open(`/api/ctacte/clientes/${id}/exportar/excel/`, '_blank')} className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors flex flex-col items-center gap-0.5">
                            <Download size={14} /> Excel
                        </button>
                        <button onClick={() => window.open(`/api/ctacte/clientes/${id}/exportar/pdf/`, '_blank')} className="flex-1 py-1.5 bg-red-50 text-red-700 font-bold text-[10px] rounded-lg border border-red-100 hover:bg-red-100 transition-colors flex flex-col items-center gap-0.5">
                            <FileText size={14} /> PDF
                        </button>
                        <button onClick={handleImprimir} className="flex-1 py-1.5 bg-slate-50 text-slate-700 font-bold text-[10px] rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors flex flex-col items-center gap-0.5">
                            <Download size={14} /> Imprimir
                        </button>
                    </div>

                </div>

                {/* COLUMNA DERECHA (Historial Tabla) */}
                <div className="lg:col-span-8 flex flex-col min-h-0">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative">
                        {/* Header Tabla */}
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText size={18} />
                                </div>
                                <h2 className="font-bold text-slate-700">Movimientos</h2>
                            </div>
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                {movimientosFiltrados.length} Registros
                            </span>
                        </div>

                        {/* Tabla */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm item-table">
                                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 text-left w-32">Fecha</th>
                                        <th className="px-6 py-3 text-center w-24">Tipo</th>
                                        <th className="px-6 py-3 text-left">Descripción</th>
                                        <th className="px-6 py-3 text-right w-28">Debe</th>
                                        <th className="px-6 py-3 text-right w-28">Haber</th>
                                        <th className="px-6 py-3 text-right w-32">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {paginatedMovimientos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-10">
                                                <div className="flex flex-col items-center justify-center text-slate-300">
                                                    <FileText size={48} className="mb-4 text-slate-100" />
                                                    <p className="text-slate-400 font-medium">No hay movimientos registrados</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedMovimientos.map((mov) => (
                                            <tr key={mov.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-3 font-mono text-xs text-slate-500 font-medium">{mov.fecha}</td>
                                                <td className="px-6 py-3 text-center">{getTipoBadge(mov.tipo)}</td>
                                                <td className="px-6 py-3">
                                                    <span
                                                        className="text-blue-600 font-medium hover:underline cursor-pointer"
                                                        onClick={() => handleVerDetalle(mov)}
                                                    >
                                                        {mov.descripcion}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right font-medium text-red-500">
                                                    {mov.debe > 0 ? formatCurrency(mov.debe) : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-right font-medium text-emerald-600">
                                                    {mov.haber > 0 ? formatCurrency(mov.haber) : '-'}
                                                </td>
                                                <td className={`px-6 py-3 text-right font-bold ${mov.saldo > 0 ? 'text-red-500' : mov.saldo < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {formatCurrency(mov.saldo)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Pagination */}
                        <div className="border-t border-slate-100 p-2 bg-white">
                            <TablePagination
                                currentPage={page}
                                totalPages={totalPages}
                                totalItems={movimientosFiltrados.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setPage}
                                onItemsPerPageChange={(val) => {
                                    setItemsPerPage(val);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>

            <PaymentModal
                isOpen={showPagoModal}
                onClose={() => setShowPagoModal(false)}
                onConfirm={handleRegistrarPago}
                total={cliente?.saldo_actual || 0}
                mode="payment"
                clientName={cliente?.nombre}
                isSaving={savingPago}
            />
        </div>
    );
};

export default DetalleCuentaCorriente;
