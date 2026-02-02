import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Wallet, PlusCircle, ArrowUpCircle, ArrowDownCircle, Search, ListFilter, FilterX,
    Pencil, Trash2, CheckCircle2, AlertCircle, X, TrendingUp, TrendingDown,
    Calendar, LogIn, LogOut, Printer, Clock, Activity, DollarSign, History
} from 'lucide-react';
import Swal from 'sweetalert2';
import { BtnAdd, BtnAction } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import { PremiumTable, TableCell } from '../components/premium/PremiumTable';
import { BentoCard, BentoGrid, StatCard } from '../components/premium/BentoCard';
import { SearchInput, PremiumSelect } from '../components/premium/PremiumInput';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert, showWarningAlert, showDeleteAlert } from '../utils/alerts';
import { cn } from '../utils/cn';

const STORAGE_KEY = 'table_prefs_caja_items';

const Caja = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saldoActual, setSaldoActual] = useState(0);
    const [saldoFiltrado, setSaldoFiltrado] = useState(0);
    const [cajaAbierta, setCajaAbierta] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
    });

    // Filtros
    const [filters, setFilters] = useState({
        fecha_desde: '',
        fecha_hasta: '',
        tipo: '',
        busqueda: ''
    });

    // Modales
    const [showMovimientoModal, setShowMovimientoModal] = useState(false);
    const [showAperturaModal, setShowAperturaModal] = useState(false);
    const [showCierreModal, setShowCierreModal] = useState(false);
    const [editingMovimiento, setEditingMovimiento] = useState(null);
    const [cajaData, setCajaData] = useState(null);

    // Formulario Movimiento
    const [movimientoForm, setMovimientoForm] = useState({
        tipo: 'Ingreso',
        descripcion: '',
        monto: ''
    });

    const [montoApertura, setMontoApertura] = useState('');
    const [montoCierreReal, setMontoCierreReal] = useState('');

    // State for History/Reports
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [selectedCierre, setSelectedCierre] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchCajaData = useCallback(async () => {
        setLoading(true);
        try {
            // Verificamos estado de caja
            const resEstado = await fetch('/api/caja/estado/');
            const dataEstado = await resEstado.json();
            setCajaAbierta(dataEstado.abierta);
            setCajaData(dataEstado);

            const params = new URLSearchParams({
                page,
                per_page: itemsPerPage,
                ...filters
            });
            const response = await fetch(`/api/caja/movimientos/?${params}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setMovimientos(data.movimientos || []);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || 0);
            setSaldoActual(data.saldo_actual || 0);
            setSaldoFiltrado(data.saldo_filtrado !== undefined ? data.saldo_filtrado : (data.saldo_actual || 0));
        } catch (error) {
            console.error("Error cargando caja:", error);
            showErrorAlert('Error', 'No se pudieron cargar los movimientos');
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters]);

    useEffect(() => {
        fetchCajaData();
    }, [fetchCajaData]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const resetFilters = () => {
        setFilters({ fecha_desde: '', fecha_hasta: '', tipo: '', busqueda: '' });
        setPage(1);
    };

    const handleSaveMovimiento = async (e) => {
        e.preventDefault();
        const id = editingMovimiento?.id;
        const url = id ? `/api/caja/movimiento/${id}/editar/` : '/api/caja/movimiento/crear/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movimientoForm)
            });
            const data = await response.json();

            if (data.ok || !data.error) {
                await showSuccessAlert('Éxito', id ? 'Movimiento actualizado correctamente' : 'Movimiento registrado con éxito');
                setShowMovimientoModal(false);
                setEditingMovimiento(null);
                setMovimientoForm({ tipo: 'Ingreso', descripcion: '', monto: '' });
                fetchCajaData();
            } else {
                showErrorAlert('Error', data.error);
            }
        } catch (error) {
            showErrorAlert('Error', 'No se pudo guardar el movimiento');
        }
    };

    const handleDeleteMovimiento = async (id) => {
        const result = await showConfirmationAlert(
            "¿Eliminar movimiento?",
            "Esta acción eliminará el registro de caja de forma permanente. El saldo se recalculará automáticamente.",
            "SÍ, ELIMINAR",
            "danger"
        );

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/caja/movimiento/${id}/eliminar/`, { method: 'POST' });
                const data = await response.json();
                if (data.ok || !data.error) {
                    await showSuccessAlert('Eliminado', 'El movimiento ha sido eliminado exitosamente');
                    fetchCajaData();
                } else {
                    showErrorAlert('Error', data.error);
                }
            } catch (error) {
                showErrorAlert('Error', 'Ocurrió un error al intentar eliminar');
            }
        }
    };

    const handleApertura = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/caja/apertura/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monto: parseFloat(montoApertura) })
            });
            const data = await response.json();
            if (data.ok) {
                await showSuccessAlert('Caja Abierta', 'Se ha iniciado la jornada de caja correctamente');
                setShowAperturaModal(false);
                setMontoApertura('');
                fetchCajaData();
            } else {
                showErrorAlert('Error', data.error);
            }
        } catch (error) {
            showErrorAlert('Error', 'Error de conexión');
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        setShowHistoryModal(true);
        try {
            const res = await fetch('/api/caja/cierres/');
            const data = await res.json();
            if (data.cierres) {
                setHistoryData(data.cierres);
            }
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', 'No se pudo cargar el historial de cierres');
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchCierreDetail = async (id) => {
        try {
            Swal.fire({
                title: 'Cargando...',
                html: '<div className="flex justify-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>',
                showConfirmButton: false,
                allowOutsideClick: false
            });
            const res = await fetch(`/api/caja/cierre/${id}/`);
            const data = await res.json();
            Swal.close();

            if (data.caja) {
                setSelectedCierre(data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', 'No se pudo cargar el detalle del arqueo');
        }
    };

    const handleCierre = () => {
        setMontoCierreReal('');
        setShowCierreModal(true);
    };

    const submitCierre = async (e) => {
        e.preventDefault();
        if (!montoCierreReal) {
            showWarningAlert('Atención', 'Debes ingresar el monto físico contado en caja');
            return;
        }

        try {
            const response = await fetch('/api/caja/cierre/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monto_real: montoCierreReal })
            });
            const data = await response.json();

            if (data.ok) {
                setShowCierreModal(false);
                let diffHtml = '';
                if (data.diferencia !== 0) {
                    const isSobrante = data.diferencia > 0;
                    diffHtml = `
                        <div class="mt-4 p-3 rounded-xl ${isSobrante ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'} font-black border text-center text-sm uppercase tracking-wider">
                            ${isSobrante ? 'Sobrante' : 'Faltante'}: $${Math.abs(data.diferencia).toLocaleString('es-AR')}
                        </div>
                    `;
                }
                await showSuccessAlert('Cierre de Caja Exitoso', '', 'Entendido', {
                    html: `
                        <div class="text-start p-2 space-y-3 font-medium text-slate-600">
                            <div class="flex justify-between border-b pb-2"><span>Saldo Final (Sistema):</span> <span class="font-black text-slate-800">$${data.saldo_total.toLocaleString('es-AR')}</span></div>
                            <div class="flex justify-between border-b pb-2"><span>Ingresos del Día:</span> <span class="font-black text-emerald-600">$${data.ingresos_dia.toLocaleString('es-AR')}</span></div>
                            <div class="flex justify-between border-b pb-2"><span>Egresos del Día:</span> <span class="font-black text-rose-600">$${data.egresos_dia.toLocaleString('es-AR')}</span></div>
                            ${diffHtml}
                        </div>
                    `
                });
                fetchCajaData();
            } else {
                showErrorAlert('Error', data.error);
            }
        } catch (error) {
            showErrorAlert('Error', 'Error de conexión');
        }
    };

    const columns = [
        {
            key: 'fecha',
            label: 'Fecha / Hora',
            width: '180px',
            render: (v) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{v.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400 font-black font-mono uppercase tracking-widest">{v.split(' ')[1]}</span>
                </div>
            )
        },
        {
            key: 'descripcion',
            label: 'Descripción del Movimiento',
            render: (v) => <span className="font-bold text-slate-700 text-sm uppercase tracking-tight">{v}</span>
        },
        {
            key: 'tipo',
            label: 'Tipo',
            width: '120px',
            align: 'center',
            render: (v) => (
                <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest flex items-center justify-center gap-1.5",
                    v === 'Ingreso' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
                )}>
                    {v === 'Ingreso' ? <ArrowUpCircle size={12} strokeWidth={3} /> : <ArrowDownCircle size={12} strokeWidth={3} />}
                    {v}
                </span>
            )
        },
        {
            key: 'monto',
            label: 'Monto',
            width: '160px',
            align: 'right',
            render: (v, mov) => (
                <span className={cn(
                    "font-black text-lg tabular-nums",
                    mov.tipo === 'Ingreso' ? "text-emerald-600" : "text-rose-600"
                )}>
                    {mov.tipo === 'Ingreso' ? '+' : '-'} <TableCell.Currency value={v} />
                </span>
            )
        },
        {
            key: 'usuario',
            label: 'Usuario',
            width: '150px',
            render: (v) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">
                        {v?.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase">{v}</span>
                </div>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '120px',
            align: 'right',
            sortable: false,
            render: (_, mov) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 transition-all">
                    <button
                        onClick={() => {
                            setEditingMovimiento(mov);
                            setMovimientoForm({ tipo: mov.tipo, descripcion: mov.descripcion, monto: mov.monto });
                            setShowMovimientoModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => handleDeleteMovimiento(mov.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 flex flex-col p-6 gap-6">

            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <Wallet size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Caja y Arqueos</h1>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-12">
                        <span className={cn(
                            "px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest border uppercase",
                            cajaAbierta ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"
                        )}>
                            {cajaAbierta ? 'SESIÓN ACTIVA' : 'CAJA CERRADA'}
                        </span>
                        {cajaAbierta && cajaData && (
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Clock size={14} className="text-slate-300" />
                                {cajaData.fecha_apertura} • {cajaData.usuario}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchHistory}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
                    >
                        <History size={18} className="text-slate-400" /> Historial Z
                    </button>
                    {!cajaAbierta ? (
                        <BtnAdd
                            label="ABRIR CAJA"
                            onClick={() => setShowAperturaModal(true)}
                            className="!bg-emerald-600 !hover:bg-emerald-700 !shadow-emerald-600/20"
                        />
                    ) : (
                        <button
                            onClick={handleCierre}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                        >
                            <LogOut size={18} /> CERRAR CAJA
                        </button>
                    )}
                    {cajaAbierta && (
                        <BtnAdd
                            label="NUEVO MOVIMIENTO"
                            onClick={() => {
                                setEditingMovimiento(null);
                                setMovimientoForm({ tipo: 'Ingreso', descripcion: '', monto: '' });
                                setShowMovimientoModal(true);
                            }}
                        />
                    )}
                </div>
            </header>

            {/* Stats */}
            <BentoGrid cols={4}>
                <StatCard
                    label="Saldo en Caja"
                    value={formatCurrency(saldoActual)}
                    icon={DollarSign}
                    color="primary"
                />
                <StatCard
                    label="Saldo Filtrado"
                    value={formatCurrency(saldoFiltrado)}
                    icon={ListFilter}
                    color="indigo"
                />
                <StatCard
                    label="Ingresos (Dia)"
                    value={formatCurrency(movimientos.filter(m => m.tipo === 'Ingreso').reduce((acc, m) => acc + parseFloat(m.monto), 0))}
                    icon={ArrowUpCircle}
                    color="success"
                />
                <StatCard
                    label="Egresos (Dia)"
                    value={formatCurrency(movimientos.filter(m => m.tipo === 'Egreso').reduce((acc, m) => acc + parseFloat(m.monto), 0))}
                    icon={ArrowDownCircle}
                    color="error"
                />
            </BentoGrid>

            {/* Main Area */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">

                {/* Filtros */}
                <BentoCard className="p-4 bg-white/80 backdrop-blur-md">
                    <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-12 lg:col-span-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Búsqueda rápida</label>
                            <SearchInput
                                placeholder="Concepto, usuario, referencia..."
                                value={filters.busqueda}
                                onSearch={(v) => handleFilterChange('busqueda', v)}
                                className="!py-3"
                            />
                        </div>
                        <div className="col-span-12 lg:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Desde</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-xs text-slate-700"
                                value={filters.fecha_desde}
                                onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                            />
                        </div>
                        <div className="col-span-12 lg:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Hasta</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-xs text-slate-700"
                                value={filters.fecha_hasta}
                                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                            />
                        </div>
                        <div className="col-span-12 lg:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Tipo Mov.</label>
                            <PremiumSelect
                                value={filters.tipo}
                                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                                options={[
                                    { value: '', label: 'TODOS' },
                                    { value: 'Ingreso', label: 'INGRESOS' },
                                    { value: 'Egreso', label: 'EGRESOS' }
                                ]}
                                className="!py-3 !text-xs !font-black !tracking-widest"
                            />
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex justify-end gap-2">
                            <button
                                onClick={resetFilters}
                                className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest min-w-[140px]"
                                title="Limpiar Filtros"
                            >
                                <FilterX size={18} strokeWidth={2.5} /> Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </BentoCard>

                {/* Tabla */}
                <div className="flex-1 flex flex-col min-h-0">
                    <PremiumTable
                        columns={columns}
                        data={movimientos}
                        loading={loading}
                        className="flex-1 shadow-lg"
                    />
                    <div className="bg-white border-x border-b border-slate-200 rounded-b-[2rem] px-6 py-1 shadow-premium">
                        <TablePagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setPage}
                            onItemsPerPageChange={(newVal) => {
                                setItemsPerPage(newVal);
                                setPage(1);
                                localStorage.setItem(STORAGE_KEY, newVal);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* MODALES */}

            {/* Modal: Apertura */}
            {showAperturaModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white relative">
                            <button onClick={() => setShowAperturaModal(false)} className="absolute right-6 top-6 text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4"><LogIn size={32} strokeWidth={2.5} /></div>
                            <h2 className="text-2xl font-black tracking-tight">Iniciar Jornada</h2>
                            <p className="text-emerald-100 font-medium text-sm mt-1">Ingrese el monto inicial contado para abrir caja.</p>
                        </div>
                        <form onSubmit={handleApertura} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">DINERO INICIAL ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                                    <input
                                        type="number" step="0.01" required autoFocus
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-3xl font-black text-slate-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                        placeholder="0.00"
                                        value={montoApertura}
                                        onChange={(e) => setMontoApertura(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-sm tracking-[0.15em] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all uppercase">
                                CONFIRMAR APERTURA
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Cierre */}
            {showCierreModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <button onClick={() => setShowCierreModal(false)} className="absolute right-6 top-6 text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4"><LogOut size={32} strokeWidth={2.5} /></div>
                            <h2 className="text-2xl font-black tracking-tight">Arqueo de Caja</h2>
                            <p className="text-slate-400 font-medium text-sm mt-1">Cuente el dinero físico y reporte el total.</p>
                        </div>
                        <form onSubmit={submitCierre} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">MONTO FÍSICO CONTADO ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                                    <input
                                        type="number" step="0.01" required autoFocus
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-3xl font-black text-slate-800 focus:border-slate-500 focus:bg-white transition-all outline-none"
                                        placeholder="0.00"
                                        value={montoCierreReal}
                                        onChange={(e) => setMontoCierreReal(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-sm tracking-[0.15em] shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all uppercase">
                                PROCESAR CIERRE (Z)
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Movimiento Manual */}
            {showMovimientoModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="p-8 border-b border-slate-50 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                                    <PlusCircle size={32} strokeWidth={2.5} />
                                </div>
                                <button onClick={() => setShowMovimientoModal(false)} className="text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 p-2 rounded-full"><X size={20} /></button>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{editingMovimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h1>
                                <p className="text-slate-400 text-sm font-medium">Registro manual de dinero en efectivo.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveMovimiento} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">TIPO DE MOVIMIENTO</label>
                                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setMovimientoForm({ ...movimientoForm, tipo: 'Ingreso' })}
                                        className={cn(
                                            "py-3 rounded-xl font-black text-xs tracking-widest transition-all",
                                            movimientoForm.tipo === 'Ingreso' ? "bg-white text-emerald-600 shadow-md scale-[1.02] border border-emerald-100" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <ArrowUpCircle size={16} className="inline-block mr-2" strokeWidth={3} /> INGRESO
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMovimientoForm({ ...movimientoForm, tipo: 'Egreso' })}
                                        className={cn(
                                            "py-3 rounded-xl font-black text-xs tracking-widest transition-all",
                                            movimientoForm.tipo === 'Egreso' ? "bg-white text-rose-600 shadow-md scale-[1.02] border border-rose-100" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <ArrowDownCircle size={16} className="inline-block mr-2" strokeWidth={3} /> EGRESO
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CONCEPTO / DESCRIPCIÓN</label>
                                <input
                                    type="text" required
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-bold focus:border-indigo-500 focus:bg-white transition-all outline-none italic placeholder:text-slate-300"
                                    placeholder="Motivo del movimiento..."
                                    value={movimientoForm.descripcion}
                                    onChange={(e) => setMovimientoForm({ ...movimientoForm, descripcion: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">MONTO ($)</label>
                                <input
                                    type="number" step="0.01" required
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-800 focus:border-indigo-500 focus:bg-white transition-all outline-none tabular-nums"
                                    placeholder="0.00"
                                    value={movimientoForm.monto}
                                    onChange={(e) => setMovimientoForm({ ...movimientoForm, monto: e.target.value })}
                                />
                            </div>

                            <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm tracking-[0.15em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all uppercase mt-2">
                                {editingMovimiento ? 'ACTUALIZAR REGISTRO' : 'REGISTRAR MOVIMIENTO'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Historial de Cierres */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden border border-slate-200 flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600 border border-slate-100"><History size={24} /></div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Historial de Cierres de Caja</h1>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Reportes Z detallados por jornada</p>
                                </div>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="text-slate-300 hover:text-rose-500 transition-colors bg-white p-3 rounded-2xl shadow-sm border border-slate-100"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-auto p-0">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">FECHA CIERRE</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">RESPONSABLE</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">SISTEMA</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">EFECTIVO</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">DIFERENCIA</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                                    {loadingHistory ? (
                                        <tr><td colSpan="6" className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></td></tr>
                                    ) : historyData.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-20 font-black text-slate-300 uppercase italic">No se registran cierres históricos</td></tr>
                                    ) : (
                                        historyData.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-8 py-4 font-black text-slate-800">{c.fecha_cierre}</td>
                                                <td className="px-8 py-4 uppercase text-xs font-black tracking-widest text-slate-400">{c.usuario}</td>
                                                <td className="px-8 py-4 text-right font-bold tabular-nums">${c.monto_sistema.toLocaleString('es-AR')}</td>
                                                <td className="px-8 py-4 text-right font-black text-slate-900 tabular-nums">${c.monto_real.toLocaleString('es-AR')}</td>
                                                <td className={cn(
                                                    "px-8 py-4 text-right font-black tabular-nums",
                                                    c.diferencia === 0 ? "text-slate-300" : c.diferencia > 0 ? "text-emerald-500" : "text-rose-500"
                                                )}>
                                                    {c.diferencia > 0 ? '+' : ''}{c.diferencia.toLocaleString('es-AR')}
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <button onClick={() => fetchCierreDetail(c.id)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] tracking-[0.15em] hover:bg-indigo-600 hover:text-white transition-all">DETALLES</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Detalle de Cierre (Mini-Arqueo) */}
            {showDetailModal && selectedCierre && (
                <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl text-emerald-400"><CheckCircle2 size={24} /></div>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight">Resumen de Jornada #{selectedCierre.caja.id}</h1>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Cierre: {selectedCierre.caja.fecha_cierre} • {selectedCierre.caja.usuario}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-white/30 hover:text-white transition-colors bg-white/5 p-3 rounded-2xl"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-auto p-10 bg-slate-50/30 font-medium">
                            <div className="grid grid-cols-3 gap-6 mb-10">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-1 items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INGRESOS TOTALES</span>
                                    <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight">${selectedCierre.ingresos_totales.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-1 items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EGRESOS TOTALES</span>
                                    <span className="text-2xl font-black text-rose-500 font-mono tracking-tight">${selectedCierre.egresos_totales.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-600/20 flex flex-col gap-1 items-center text-white">
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">DIFERENCIA (Z)</span>
                                    <span className="text-2xl font-black font-mono tracking-tight">${(selectedCierre.caja.monto_real - selectedCierre.caja.monto_sistema).toLocaleString('es-AR')}</span>
                                </div>
                            </div>

                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Activity size={14} className="text-indigo-500" /> Detalle de Movimientos de la Jornada
                            </h3>
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HORA</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">DESCRIPCIÓN</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">MONTO</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-sm">
                                        {selectedCierre.movimientos?.map(m => (
                                            <tr key={m.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-3 text-[10px] font-black text-slate-300 font-mono italic">{m.fecha.split(' ')[1]}</td>
                                                <td className="px-6 py-3 font-bold text-slate-700 uppercase">{m.descripcion}</td>
                                                <td className={cn(
                                                    "px-6 py-3 text-right font-black",
                                                    m.tipo === 'Ingreso' ? "text-emerald-500" : "text-rose-500"
                                                )}>
                                                    {m.tipo === 'Ingreso' ? '+' : '-'} ${m.monto.toLocaleString('es-AR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Caja;
