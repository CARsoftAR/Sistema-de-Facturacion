import React, { useState, useEffect, useCallback } from 'react';
import {
    Wallet,
    PlusCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    Search,
    Filter,
    RotateCcw,
    Pencil,
    Trash2,
    CheckCircle2,
    AlertCircle,
    X,
    TrendingUp,
    TrendingDown,
    Calendar,
    LogIn,
    LogOut,
    Printer
} from 'lucide-react';
import Swal from 'sweetalert2';
import { BtnClear, BtnEdit, BtnDelete, BtnAction } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import { showDeleteAlert, showSuccessAlert, showErrorAlert, showWarningAlert } from '../utils/alerts';

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
        if (saved) {
            const parsed = parseInt(saved, 10);
            return (parsed && parsed > 0) ? parsed : 10;
        }
        return 10;
    });

    useEffect(() => {
        // Consultar config solo si no hay preferencia local guardada para inicializar,
        // pero como ya inicializamos con localStorage o 10, esto es secundario.
        // Mantenemos la lógica de consultar si no hay nada guardado o para confirmar defaults.
        if (!localStorage.getItem(STORAGE_KEY)) {
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => {
                    if (data.items_por_pagina) setItemsPerPage(data.items_por_pagina);
                })
                .catch(error => {
                    console.error("Error fetching config:", error);
                    showErrorAlert('Error', 'No se pudo cargar la configuración de la tabla.');
                });
        }
    }, []);

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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
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
                await showSuccessAlert('Éxito', id ? 'Movimiento actualizado' : 'Movimiento creado');
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
        const result = await showDeleteAlert(
            "¿Eliminar movimiento?",
            "Esta acción eliminará el registro de caja de forma permanente. El saldo se recalculará automáticamente."
        );

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/caja/movimiento/${id}/eliminar/`, { method: 'POST' });
                const data = await response.json();
                if (data.ok || !data.error) {
                    await showSuccessAlert('Eliminado', 'El movimiento ha sido eliminado');
                    fetchCajaData();
                } else {
                    showErrorAlert('Error', data.error);
                }
            } catch (error) {
                showErrorAlert('Error', 'Ocurrió un error al eliminar');
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
                await showSuccessAlert('Caja Abierta', 'Se inició la jornada correctamente');
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
            showErrorAlert('Error', 'No se pudo cargar el historial');
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchCierreDetail = async (id) => {
        try {
            Swal.fire({ title: 'Cargando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const res = await fetch(`/api/caja/cierre/${id}/`);
            const data = await res.json();
            Swal.close();

            if (data.caja) {
                setSelectedCierre(data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', 'No se pudo cargar el detalle');
        }
    };

    const handleCierre = () => {
        setMontoCierreReal('');
        setShowCierreModal(true);
    };

    const submitCierre = async (e) => {
        e.preventDefault();
        if (!montoCierreReal) {
            showWarningAlert('Atención', 'Debes ingresar un monto');
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
                        <div class="mt-2 p-2 rounded ${isSobrante ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} fw-bold border">
                            ${isSobrante ? 'Sobrante' : 'Faltante'}: $${Math.abs(data.diferencia).toLocaleString('es-AR')}
                        </div>
                    `;
                }
                await showSuccessAlert('Cierre Exitoso', '', 'Entendido', {
                    html: `
                        <div class="text-start p-2">
                            <p className="mb-2"><strong>Saldo Final:</strong> $${data.saldo_total.toLocaleString('es-AR')}</p>
                            <p className="mb-2"><strong>Ingresos:</strong> $${data.ingresos_dia.toLocaleString('es-AR')}</p>
                            <p className="mb-2 text-danger"><strong>Egresos:</strong> $${data.egresos_dia.toLocaleString('es-AR')}</p>
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

    const openEditModal = (mov) => {
        setEditingMovimiento(mov);
        setMovimientoForm({
            tipo: mov.tipo,
            descripcion: mov.descripcion,
            monto: mov.monto
        });
        setShowMovimientoModal(true);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
            {/* Compact Header with Integrated Balance */}
            <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center mb-4 gap-3 border-bottom pb-4">
                {/* Clean Title Section */}
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Wallet className="me-2 inline-block" size={32} />
                        Caja y Movimientos
                    </h2>
                    <div className="d-flex align-items-center gap-2 mt-1">
                        <span className={`badge rounded-3 ${cajaAbierta ? 'bg-success' : 'bg-danger'} px-4 py-2 fw-bold shadow-sm`}>
                            {cajaAbierta ? 'SESIÓN ABIERTA' : 'CAJA CERRADA'}
                        </span>
                        {cajaAbierta && cajaData && (
                            <span className="text-muted small">
                                Apertura: {cajaData.fecha_apertura} por {cajaData.usuario}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Side: Clean Balance + Actions */}
                <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
                    {/* Minimalist Balance */}
                    <div className="text-end">
                        <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                            {(filters.tipo || filters.busqueda || filters.fecha_desde || filters.fecha_hasta) ? 'SALDO FILTRADO' : 'SALDO ACTUAL'}
                        </div>
                        <div className={`h2 mb-0 fw-bold ${((filters.tipo || filters.busqueda || filters.fecha_desde || filters.fecha_hasta) ? saldoFiltrado : saldoActual) >= 0 ? 'text-dark' : 'text-danger'}`}>
                            {formatCurrency((filters.tipo || filters.busqueda || filters.fecha_desde || filters.fecha_hasta) ? saldoFiltrado : saldoActual)}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex gap-2">
                        <button onClick={fetchHistory} className="btn btn-white border shadow-sm d-flex align-items-center gap-2 fw-medium px-3 py-2 text-primary hover-bg-primary transition-all">
                            <RotateCcw size={18} /> Historial Cierres
                        </button>

                        {!cajaAbierta ? (
                            <button onClick={() => setShowAperturaModal(true)} className="btn btn-primary shadow-sm d-flex align-items-center gap-2 fw-bold px-3 py-2">
                                <TrendingUp size={18} /> Abrir
                            </button>
                        ) : (
                            <button onClick={handleCierre} className="btn btn-dark shadow-sm d-flex align-items-center gap-2 fw-bold px-3 py-2">
                                <TrendingDown size={18} /> Cerrar
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (!cajaAbierta) return Swal.fire('Caja Cerrada', 'Debes abrir la caja antes de registrar movimientos', 'warning');
                                setEditingMovimiento(null);
                                setMovimientoForm({ tipo: 'Ingreso', descripcion: '', monto: '' });
                                setShowMovimientoModal(true);
                            }}
                            className={`btn shadow-sm d-flex align-items-center gap-2 fw-bold px-3 py-2 ${cajaAbierta ? 'btn-primary' : 'btn-secondary'}`}
                            title={!cajaAbierta ? "Debes abrir la caja para registrar movimientos" : "Registrar nuevo movimiento manual"}
                        >
                            <PlusCircle size={18} /> Nuevo Movimiento
                        </button>
                    </div>
                </div>
            </div>



            {/* Filtros */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    name="busqueda"
                                    className="form-control border-start-0"
                                    placeholder="Buscar..."
                                    value={filters.busqueda}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <input
                                type="date"
                                name="fecha_desde"
                                className="form-control"
                                value={filters.fecha_desde}
                                onChange={handleFilterChange}
                                title="Fecha Desde"
                            />
                        </div>
                        <div className="col-md-2">
                            <input
                                type="date"
                                name="fecha_hasta"
                                className="form-control"
                                value={filters.fecha_hasta}
                                onChange={handleFilterChange}
                                title="Fecha Hasta"
                            />
                        </div>
                        <div className="col-md-2">
                            <select
                                name="tipo"
                                className="form-select"
                                value={filters.tipo}
                                onChange={handleFilterChange}
                            >
                                <option value="">Tipo</option>
                                <option value="Ingreso">Ingresos</option>
                                <option value="Egreso">Egresos</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <div className="d-flex gap-1">
                                <BtnAction onClick={fetchCajaData} label="Filtrar" icon={Search} color="primary" className="flex-grow-1" />
                                <BtnClear onClick={resetFilters} label="Limpiar Filtro" className="flex-grow-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold" style={{ width: '15%' }}>Fecha / Hora</th>
                                    <th className="py-3 fw-bold" style={{ width: '35%' }}>Descripción</th>
                                    <th className="text-center py-3 fw-bold" style={{ width: '10%' }}>Tipo</th>
                                    <th className="text-end py-3 fw-bold" style={{ width: '15%' }}>Monto</th>
                                    <th className="py-3 fw-bold" style={{ width: '10%' }}>Usuario</th>
                                    <th className="text-end pe-4 py-3 fw-bold" style={{ width: '15%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && movimientos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : movimientos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="text-muted opacity-50 mb-3"><Wallet size={48} className="mx-auto" /></div>
                                            <p className="text-muted mb-0">No se encontraron movimientos disponibles.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    movimientos.map(mov => (
                                        <tr key={mov.id} className="border-bottom-0">
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Calendar size={14} className="text-muted" />
                                                    <span className="text-dark fw-medium small">{mov.fecha}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className="text-dark fw-medium">{mov.descripcion}</span>
                                            </td>
                                            <td className="text-center py-3">
                                                <span className={`badge rounded-pill px-3 py-2 ${mov.tipo === 'Ingreso' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                                                    {mov.tipo}
                                                </span>
                                            </td>
                                            <td className="text-end py-3">
                                                <span className={`fw-bold ${mov.tipo === 'Ingreso' ? 'text-success' : 'text-danger'}`}>
                                                    {mov.tipo === 'Egreso' ? '-' : '+'} {formatCurrency(mov.monto)}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle small d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                                                        {mov.usuario?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="small text-muted">{mov.usuario}</span>
                                                </div>
                                            </td>
                                            <td className="pe-4 text-end py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnEdit onClick={() => openEditModal(mov)} />
                                                    <BtnDelete onClick={() => handleDeleteMovimiento(mov.id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
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


                </div >
            </div >

            {/* MODAL: MOVIMIENTO (Nuevo/Editar) */}
            {
                showMovimientoModal && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <PlusCircle className="text-blue-600" size={22} strokeWidth={2.5} />
                                    {editingMovimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                                </h2>
                                <button
                                    onClick={() => setShowMovimientoModal(false)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-slate-50 p-2 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveMovimiento} className="p-6 space-y-5">
                                {/* Tipo de Operación */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Tipo de Operación</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setMovimientoForm({ ...movimientoForm, tipo: 'Ingreso' })}
                                            className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${movimientoForm.tipo === 'Ingreso'
                                                ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 scale-[1.02]'
                                                : 'bg-white border text-slate-400 hover:bg-slate-50'
                                                }`}
                                        >
                                            <ArrowUpCircle size={20} /> Ingreso
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMovimientoForm({ ...movimientoForm, tipo: 'Egreso' })}
                                            className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${movimientoForm.tipo === 'Egreso'
                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-[1.02]'
                                                : 'bg-white border text-slate-400 hover:bg-slate-50'
                                                }`}
                                        >
                                            <ArrowDownCircle size={20} /> Egreso
                                        </button>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Descripción</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                        placeholder="Ej: Cobro a cliente, Pago servicio..."
                                        required
                                        value={movimientoForm.descripcion}
                                        onChange={(e) => setMovimientoForm({ ...movimientoForm, descripcion: e.target.value })}
                                    />
                                </div>

                                {/* Monto */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Monto</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-xl text-slate-800 placeholder:text-slate-300"
                                            placeholder="0.00"
                                            required
                                            value={movimientoForm.monto}
                                            onChange={(e) => setMovimientoForm({ ...movimientoForm, monto: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                                >
                                    <CheckCircle2 size={24} strokeWidth={2.5} />
                                    {editingMovimiento ? 'Actualizar Movimiento' : 'Guardar Movimiento'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* MODAL: APERTURA */}
            {
                showAperturaModal && (
                    <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1100 }}>
                        <div className="rounded-4 shadow-lg scale-in" style={{ width: '450px', overflow: 'hidden', backgroundColor: '#ffffff', border: 'none' }}>
                            <div className="px-4 py-3 d-flex justify-content-between align-items-center bg-primary text-white">
                                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <LogIn size={20} />
                                    Apertura de Caja Diaria
                                </h5>
                                <button onClick={() => setShowAperturaModal(false)} className="btn-close btn-close-white shadow-none"></button>
                            </div>
                            <form onSubmit={handleApertura}>
                                <div className="p-4">
                                    <p className="text-secondary mb-3">Ingrese el monto inicial (cambio) con el que inicia el día.</p>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-dark">Monto Inicial <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control form-control-lg border shadow-none"
                                            placeholder="0.00"
                                            autoFocus
                                            required
                                            value={montoApertura}
                                            onChange={(e) => setMontoApertura(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-light d-flex justify-content-end gap-2 border-top">
                                    <button type="button" onClick={() => setShowAperturaModal(false)} className="btn btn-secondary px-4 fw-medium border-0 shadow-sm" style={{ backgroundColor: '#6c757d' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                                        <CheckCircle2 size={18} /> Abrir Caja
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }


            {/* MODAL: CIERRE */}
            {
                showCierreModal && (
                    <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1100 }}>
                        <div className="rounded-4 shadow-lg scale-in" style={{ width: '450px', overflow: 'hidden', backgroundColor: '#ffffff', border: 'none' }}>
                            <div className="px-4 py-3 d-flex justify-content-between align-items-center bg-primary text-white">
                                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <LogOut size={20} />
                                    Cierre de Caja (Arqueo)
                                </h5>
                                <button onClick={() => setShowCierreModal(false)} className="btn-close btn-close-white shadow-none"></button>
                            </div>
                            <form onSubmit={submitCierre}>
                                <div className="p-4">
                                    <p className="text-secondary mb-3">Por favor, ingresá el dinero físico total que hay en caja actualmente para realizar el arqueo.</p>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-dark">Monto Físico en Caja <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control form-control-lg border shadow-none"
                                            placeholder="0.00"
                                            autoFocus
                                            required
                                            value={montoCierreReal}
                                            onChange={(e) => setMontoCierreReal(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-light d-flex justify-content-end gap-2 border-top">
                                    <button type="button" onClick={() => setShowCierreModal(false)} className="btn btn-secondary px-4 fw-medium border-0 shadow-sm" style={{ backgroundColor: '#6c757d' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                                        <TrendingDown size={18} /> Cerrar Caja
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* MODAL: HISTORIAL CIERRES */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <RotateCcw className="text-blue-600" size={22} strokeWidth={2.5} />
                                Historial de Cierres (Z)
                            </h2>
                            <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-red-500 hover:bg-slate-50 p-2 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-grow overflow-auto p-4">
                            <table className="table align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Fecha Cierre</th>
                                        <th>Usuario</th>
                                        <th className="text-end">Monto Sistema</th>
                                        <th className="text-end">Monto Real</th>
                                        <th className="text-end">Diferencia</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingHistory ? (
                                        <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border text-primary" /></td></tr>
                                    ) : historyData.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-4 text-muted">No hay cierres registrados</td></tr>
                                    ) : (
                                        historyData.map(c => (
                                            <tr key={c.id}>
                                                <td>{c.fecha_cierre}</td>
                                                <td>{c.usuario}</td>
                                                <td className="text-end fw-medium">${c.monto_sistema.toLocaleString('es-AR')}</td>
                                                <td className="text-end fw-bold">${c.monto_real.toLocaleString('es-AR')}</td>
                                                <td className={`text-end fw-bold ${c.diferencia === 0 ? 'text-muted' : c.diferencia > 0 ? 'text-success' : 'text-danger'}`}>
                                                    {c.diferencia > 0 ? '+' : ''}{c.diferencia.toLocaleString('es-AR')}
                                                </td>
                                                <td className="text-end">
                                                    <button onClick={() => fetchCierreDetail(c.id)} className="btn btn-sm btn-outline-primary shadow-sm hover:translate-y-[-1px] transition-all">
                                                        <Search size={16} /> Ver Detalle
                                                    </button>
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

            {/* MODAL: DETALLE DE CIERRE (ARQUEO) */}
            {showDetailModal && selectedCierre && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col max-h-[95vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle2 className="text-green-600" size={22} strokeWidth={2.5} />
                                    Detalle de Cierre #{selectedCierre.caja.id}
                                </h2>
                                <p className="text-sm text-slate-500 ms-8">Cerrado el {selectedCierre.caja.fecha_cierre} por {selectedCierre.caja.usuario}</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-red-500 hover:bg-slate-50 p-2 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-auto p-6 bg-slate-50/50">
                            {/* Kards Summary */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm h-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monto Apertura</div>
                                        <div className="text-2xl font-bold text-slate-700">${selectedCierre.caja.monto_apertura.toLocaleString('es-AR')}</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm h-100">
                                        <div className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Ingresos</div>
                                        <div className="text-2xl font-bold text-green-600">+${selectedCierre.resumen.ingresos.toLocaleString('es-AR')}</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm h-100">
                                        <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Egresos</div>
                                        <div className="text-2xl font-bold text-red-600">-${Math.abs(selectedCierre.resumen.egresos).toLocaleString('es-AR')}</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-sm h-100 text-white">
                                        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Saldo Sistema</div>
                                        <div className="text-2xl font-bold">${selectedCierre.caja.monto_sistema.toLocaleString('es-AR')}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className={`p-4 rounded-xl border h-100 flex items-center justify-between ${selectedCierre.caja.diferencia === 0 ? 'bg-white border-slate-200' : selectedCierre.caja.diferencia > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div>
                                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Resultado del Arqueo</div>
                                            <div className="text-3xl font-bold text-slate-800 mt-1">${selectedCierre.caja.monto_real.toLocaleString('es-AR')}</div>
                                            <div className="text-sm text-slate-500">Monto Real en Caja</div>
                                        </div>
                                        <div className="text-end">
                                            <div className={`text-lg font-bold ${selectedCierre.caja.diferencia === 0 ? 'text-muted' : selectedCierre.caja.diferencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedCierre.caja.diferencia > 0 ? '+' : ''}{selectedCierre.caja.diferencia.toLocaleString('es-AR')}
                                            </div>
                                            <div className="text-xs font-bold uppercase text-slate-400">Diferencia</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 h-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observaciones</div>
                                        <p className="text-slate-600 italic">"{selectedCierre.caja.observaciones || 'Sin observaciones'}"</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-sm uppercase tracking-wider">
                                    Detalle de Movimientos
                                </div>
                                <table className="table fs-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th>Hora</th>
                                            <th>Descripción</th>
                                            <th>Tipo</th>
                                            <th>Usuario</th>
                                            <th className="text-end">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedCierre.movimientos.map(m => (
                                            <tr key={m.id}>
                                                <td>{m.fecha}</td>
                                                <td>{m.descripcion}</td>
                                                <td>
                                                    <span className={`badge rounded-pill ${m.tipo === 'Ingreso' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                                        {m.tipo}
                                                    </span>
                                                </td>
                                                <td>{m.usuario}</td>
                                                <td className={`text-end fw-bold ${m.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {m.tipo === 'Egreso' ? '-' : '+'}${m.monto.toLocaleString('es-AR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2">
                            <button onClick={() => window.print()} className="btn btn-outline-secondary d-flex align-items-center gap-2">
                                <Printer size={18} /> Imprimir
                            </button>
                            <button onClick={() => setShowDetailModal(false)} className="btn btn-primary px-5">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .hover-bg-primary:hover { background-color: #e7f1ff !important; color: #0d6efd !important; }
                .hover-bg-danger:hover { background-color: #f8d7da !important; color: #dc3545 !important; }
                .input-group-merge .form-control:focus { border-color: #dee2e6; }
                .tracking-wider { letter-spacing: 0.1em; }
                .pagination .page-link:hover { background-color: #f8f9fa; }
            `}</style>
        </div >
    );
};

export default Caja;
