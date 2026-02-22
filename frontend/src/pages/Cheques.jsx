import React, { useState, useEffect, useCallback } from 'react';
import {
    Banknote,
    Search,
    Filter,
    ArrowUpRight,  // For "A Pagar"
    ArrowDownLeft, // For "En Cartera" (Received)
    CheckCircle2,  // For "Depositados"
    AlertCircle,   // For "Rechazados"
    Calendar,
    RefreshCw,
    History as HistoryIcon,
    ChevronDown
} from 'lucide-react';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert, showDeleteAlert } from '../utils/alerts';
import ChequeForm from '../components/cheques/ChequeForm';
import EmptyState from '../components/EmptyState';
import TablePagination from '../components/common/TablePagination';

const Cheques = () => {
    // Cache bust
    console.log("Cheques Component V4 Loaded");

    // Cache bust: Force update styles v2
    const [loading, setLoading] = useState(true);
    const [cheques, setCheques] = useState([]);
    const [kpis, setKpis] = useState({
        cartera_terceros: { total: 0, count: 0 },
        apagar_propios: { total: 0 },
        depositados_mes: { total: 0 },
        rechazados: { total: 0 }
    });

    // Toggle Stats State (Persisted)
    const [showStats, setShowStats] = useState(() => {
        const saved = localStorage.getItem('cheques_show_stats');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('cheques_show_stats', JSON.stringify(showStats));
    }, [showStats]);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filters
    const [filters, setFilters] = useState({
        busqueda: '',
        tipo: '',
        estado: ''
    });

    const fetchCheques = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                per_page: itemsPerPage,
                ...filters
            });
            const response = await fetch(`/api/cheques/listar/?${params}`);
            const data = await response.json();

            if (data.ok) {
                setCheques(data.data || []);
                setTotalPages(data.total_pages || 1);
                setTotalItems(data.total || 0);
                if (data.kpis) setKpis(data.kpis);
            } else {
                showErrorAlert('Error', data.error || 'No se pudieron cargar los cheques');
            }
        } catch (error) {
            console.error("Error cargando cheques:", error);
            showErrorAlert('Error', 'Error de conexión');
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters]);

    useEffect(() => {
        fetchCheques();
    }, [fetchCheques]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    const getEstadoBadge = (estado) => {
        const styles = {
            'CARTERA': 'bg-blue-100 text-blue-700 border-blue-200',
            'DEPOSITADO': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'COBRADO': 'bg-green-100 text-green-700 border-green-200',
            'ENTREGADO': 'bg-slate-100 text-slate-700 border-slate-200',
            'RECHAZADO': 'bg-rose-100 text-rose-700 border-rose-200',
            'ANULADO': 'bg-slate-200 text-slate-800 border-slate-300'
        };
        const style = styles[estado] || 'bg-slate-50 text-slate-600 border-slate-100';
        return <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${style}`}>{estado}</span>;
    };

    const getTipoBadge = (tipo) => {
        if (tipo === 'PROPIO') return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm bg-indigo-100 text-indigo-700 border-indigo-200">PROPIO</span>;
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm bg-slate-50 text-slate-600 border-slate-100">TERCERO</span>;
    };

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    // Confirm Change Status
    const handleEstadoChange = async (cheque, nuevoEstado) => {
        setOpenDropdownId(null);
        let cuentaDestinoId = null;

        if (nuevoEstado === 'DEPOSITADO') {
            try {
                const respBancos = await fetch('/api/bancos/listar/');
                const dataBancos = await respBancos.json();

                if (!dataBancos.ok || !dataBancos.cuentas || dataBancos.cuentas.length === 0) {
                    showErrorAlert('Error', 'No hay cuentas bancarias activas para depositar');
                    return;
                }

                const options = {};
                dataBancos.cuentas.forEach(c => {
                    options[c.id] = `${c.banco} (${c.moneda})`;
                });

                const { value: selectedBankId } = await Swal.fire({
                    title: '<span class="text-2xl font-black text-slate-800">Seleccionar Cuenta</span>',
                    text: `¿Dónde depositar el cheque #${cheque.numero}?`,
                    input: 'select',
                    inputOptions: options,
                    inputPlaceholder: 'Seleccione un banco',
                    confirmButtonText: 'Confirmar Depósito',
                    confirmButtonColor: '#0d6efd',
                    showCancelButton: true,
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        popup: 'rounded-premium-alert shadow-2xl border-0 p-10',
                        confirmButton: 'rounded-xl px-8 py-3 font-bold',
                        cancelButton: 'rounded-xl px-8 py-3 font-bold',
                        input: 'rounded-xl border-slate-200 text-slate-800 font-medium'
                    },
                    didOpen: (popup) => {
                        popup.style.borderRadius = '2.5rem';
                    },
                    inputValidator: (value) => !value && 'Debe seleccionar una cuenta'
                });

                if (!selectedBankId) return;
                cuentaDestinoId = selectedBankId;
            } catch (error) {
                console.error(error);
                showErrorAlert('Error', 'Error cargando bancos');
                return;
            }
        } else {
            const result = await showConfirmationAlert(
                '¿Confirmar cambio?',
                `El cheque #${cheque.numero} pasará a estado ${nuevoEstado}`,
                'primary',
                { icon: 'question', confirmText: 'Sí, cambiar' }
            );
            if (!result.isConfirmed) return;
        }

        try {
            const body = { estado: nuevoEstado };
            if (cuentaDestinoId) body.cuenta_destino_id = cuentaDestinoId;

            const response = await fetch(`/api/cheques/${cheque.id}/cambiar-estado/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();

            if (data.ok) {
                await showSuccessAlert('¡Actualizado!', `Estado cambiado a ${nuevoEstado}`, 'Aceptar', { timer: 1500, showConfirmButton: false });
                fetchCheques();
            } else {
                showErrorAlert('Error', data.error || 'No se pudo actualizar');
            }
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', 'Error de conexión');
        }
    };

    const handleDelete = async (cheque) => {
        setOpenDropdownId(null);
        const result = await showDeleteAlert(
            '¿Eliminar Cheque?',
            `Esta acción no se puede deshacer. Se eliminará el cheque #${cheque.numero}.`
        );

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/cheques/${cheque.id}/eliminar/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.ok) {
                await showSuccessAlert('¡Eliminado!', '', 'Aceptar', { timer: 1500, showConfirmButton: false });
                fetchCheques();
            } else {
                showErrorAlert('Error', data.error || 'No se pudo eliminar');
            }
        } catch (error) {
            showErrorAlert('Error', 'Error de conexión');
        }
    };

    const [showForm, setShowForm] = useState(false);
    const [editingCheque, setEditingCheque] = useState(null);

    const handleCreate = () => {
        setEditingCheque(null);
        setShowForm(true);
    };

    const handleEdit = (cheque) => {
        setEditingCheque(cheque);
        setShowForm(true);
    };

    const handleSave = () => {
        fetchCheques();
    };

    return (
        <div className="p-6 pb-10 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in space-y-6">

            {/* Header Premium */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <Banknote className="text-blue-600" size={32} strokeWidth={2.5} />
                        Cartera de Cheques
                    </h1>
                    <p className="text-slate-500 font-medium ml-10">Control total de pagos propios y de terceros</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className={`p-3 rounded-xl border transition-all flex items-center gap-2 font-bold text-sm ${showStats ? 'bg-white border-slate-200 text-slate-600 shadow-sm' : 'bg-slate-800 border-slate-700 text-white shadow-lg'
                            }`}
                    >
                        <RefreshCw size={18} className={!showStats ? 'animate-spin-slow' : ''} />
                        {showStats ? 'Ocultar Resumen' : 'Ver Resumen'}
                    </button>
                    <BtnAdd
                        label="Nuevo Cheque"
                        icon={Banknote}
                        className="px-6 py-3.5 rounded-xl shadow-xl shadow-blue-500/20"
                        onClick={handleCreate}
                    />
                </div>
            </div>

            {/* KPI Cards Glassmorphism */}
            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">En Cartera</span>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ArrowDownLeft size={20} /></div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-slate-800">{formatCurrency(kpis?.cartera_terceros?.total || 0)}</h3>
                            <p className="text-xs text-slate-500 font-bold mt-1">{kpis?.cartera_terceros?.count || 0} cheques registrados</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Propios a Pagar</span>
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><ArrowUpRight size={20} /></div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-slate-800">{formatCurrency(kpis?.apagar_propios?.total || 0)}</h3>
                            <p className="text-xs text-slate-500 font-bold mt-1">Pendientes de cobro</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Depositados Mes</span>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-slate-800">{formatCurrency(kpis?.depositados_mes?.total || 0)}</h3>
                            <p className="text-xs text-slate-500 font-bold mt-1">Ingresados en bancos</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rechazados</span>
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><AlertCircle size={20} /></div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-slate-800">{formatCurrency(kpis?.rechazados?.total || 0)}</h3>
                            <p className="text-xs text-slate-500 font-bold mt-1">Total histórico alertas</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros Card */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        name="busqueda"
                        placeholder="Buscar por banco, número o firmante..."
                        value={filters.busqueda}
                        onChange={handleFilterChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <select
                        name="tipo"
                        value={filters.tipo}
                        onChange={handleFilterChange}
                        className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-600 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                    >
                        <option value="">Todos los Tipos</option>
                        <option value="TERCERO">Terceros</option>
                        <option value="PROPIO">Propios</option>
                    </select>
                    <select
                        name="estado"
                        value={filters.estado}
                        onChange={handleFilterChange}
                        className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-600 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                    >
                        <option value="">Cualquier Estado</option>
                        <option value="CARTERA">En Cartera</option>
                        <option value="DEPOSITADO">Depositados</option>
                        <option value="COBRADO">Cobrados</option>
                        <option value="ENTREGADO">Entregados</option>
                        <option value="RECHAZADO">Rechazados</option>
                    </select>
                    <button
                        onClick={() => {
                            setFilters({ busqueda: '', tipo: '', estado: '' });
                            setPage(1);
                        }}
                        className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest min-w-[140px]"
                        title="Limpiar Filtros"
                    >
                        <FilterX size={18} strokeWidth={2.5} /> Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vencimiento</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Banco / Firmante</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Número</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monto</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tipo</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cargando cheques...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : cheques.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <EmptyState title="No hay cheques" description="No se encontraron cheques con los filtros aplicados." icon={Banknote} />
                                    </td>
                                </tr>
                            ) : (
                                cheques.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800">{c.fecha_pago}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Emisión: {c.fecha_emision}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{c.banco}</span>
                                                <span className="text-xs text-slate-500 truncate max-w-[200px]">{c.firmante || 'Sin firmante'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">#{c.numero}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-base font-black text-slate-900">{formatCurrency(c.monto)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getTipoBadge(c.tipo)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getEstadoBadge(c.estado)}
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => toggleDropdown(c.id)}
                                                    className={`p-2.5 rounded-xl border transition-all ${openDropdownId === c.id
                                                        ? 'bg-slate-800 border-slate-700 text-white shadow-lg'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 shadow-sm'
                                                        }`}
                                                >
                                                    <ChevronDown size={18} className={`transition-transform duration-300 ${openDropdownId === c.id ? 'rotate-180' : ''}`} />
                                                </button>

                                                {openDropdownId === c.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)}></div>
                                                        <div className="absolute right-6 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                            <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 mb-1">Acciones Rápidas</div>
                                                            {c.estado === 'CARTERA' && (
                                                                <>
                                                                    <button onClick={() => handleEstadoChange(c, 'DEPOSITADO')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
                                                                        <CheckCircle2 size={16} /> Depositar
                                                                    </button>
                                                                    <button onClick={() => handleEstadoChange(c, 'COBRADO')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
                                                                        <CheckCircle2 size={16} /> Cobrar
                                                                    </button>
                                                                    <button onClick={() => handleEstadoChange(c, 'ENTREGADO')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
                                                                        <ArrowUpRight size={16} /> Entregar
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(c.estado === 'DEPOSITADO' || c.estado === 'ENTREGADO' || c.estado === 'COBRADO') && (
                                                                <>
                                                                    <button onClick={() => handleEstadoChange(c, 'CARTERA')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
                                                                        <ArrowDownLeft size={16} /> Volver a Cartera
                                                                    </button>
                                                                    {c.estado === 'DEPOSITADO' && (
                                                                        <button onClick={() => handleEstadoChange(c, 'RECHAZADO')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
                                                                            <AlertCircle size={16} /> Rechazado
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                            {c.estado === 'RECHAZADO' && (
                                                                <button onClick={() => handleEstadoChange(c, 'CARTERA')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
                                                                    <RotateCcw size={16} /> Recuperar
                                                                </button>
                                                            )}
                                                            <div className="h-px bg-slate-50 my-1 mx-2"></div>
                                                            <button onClick={() => handleEdit(c)} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
                                                                Editar
                                                            </button>
                                                            <button onClick={() => handleDelete(c)} className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
                                                                <Trash2 size={16} /> Eliminar
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Dark Bar Pagination */}
                <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center shadow-2xl ring-1 ring-white/10 shrink-0 gap-4 mt-auto">
                    <div className="flex items-center gap-8">
                        <div className="space-y-0.5">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total en Moneda</p>
                            <p className="text-2xl font-black text-slate-200">
                                {formatCurrency(totalItems > 0 ? cheques.reduce((acc, c) => acc + parseFloat(c.monto), 0) : 0)}
                            </p>
                        </div>
                        <div className="hidden md:block w-px h-8 bg-slate-700"></div>
                        <div className="space-y-0.5">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Registros</p>
                            <p className="text-2xl font-black text-slate-200">{totalItems}</p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto overflow-x-auto">
                        <TablePagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setPage}
                            onItemsPerPageChange={(newVal) => {
                                setItemsPerPage(newVal);
                                setPage(1);
                            }}
                            className="bg-transparent border-0 text-white pagination-dark"
                        />
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <ChequeForm
                    cheque={editingCheque}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default Cheques;
