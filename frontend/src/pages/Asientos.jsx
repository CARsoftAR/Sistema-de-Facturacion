
import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText, Plus, Trash2, Save, X, Calendar, DollarSign, Filter, RefreshCw,
    BookOpen, Layers, CheckCircle2, AlertCircle, Search, Clock, Hash, TrendingUp, TrendingDown
} from 'lucide-react';
import axios from 'axios';
import { showDeleteAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { BtnAdd, BtnSave, BtnCancel } from '../components/CommonButtons';
import { formatNumber } from '../utils/formats';
import { PremiumFilterBar, BentoCard, StatCard, PremiumTable, TableCell } from '../components/premium';
import { BentoGrid } from '../components/premium/BentoCard';
import { SearchableSelect } from '../components/premium/SearchableSelect';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';
import { cn } from '../utils/cn';

// Helper recursivo para aplanar el plan de cuentas
const flattenCuentas = (nodes, result = []) => {
    nodes.forEach(node => {
        if (node.imputable) {
            result.push(node);
        }
        if (node.hijos && node.hijos.length > 0) {
            flattenCuentas(node.hijos, result);
        }
    });
    return result;
};

const Asientos = () => {
    // --- Estado Principal ---
    const [asientos, setAsientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // --- Paginación ---
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // --- Estado Modal / Editor ---
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        ejercicio_id: '',
        numero: '',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        movimientos: [
            { id: Date.now(), cuenta_id: '', debe: 0, haber: 0 },
            { id: Date.now() + 1, cuenta_id: '', debe: 0, haber: 0 }
        ]
    });

    // --- Datos Maestros ---
    const [ejercicios, setEjercicios] = useState([]);
    const [cuentasPlanas, setCuentasPlanas] = useState([]);

    // --- Cargas iniciales ---
    const fetchMaestros = async () => {
        try {
            const [resEj, resCuentas] = await Promise.all([
                axios.get('/api/contabilidad/ejercicios/'),
                axios.get('/api/contabilidad/plan-cuentas/')
            ]);

            if (resEj.data.success) setEjercicios(resEj.data.ejercicios);
            if (resCuentas.data.success) setCuentasPlanas(flattenCuentas(resCuentas.data.cuentas));
        } catch (error) {
            console.error("Error cargando maestros:", error);
        }
    };

    const fetchAsientos = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/contabilidad/asientos/');
            if (res.data.success) {
                setAsientos(res.data.asientos);
            }
        } catch (error) {
            console.error("Error fetching asientos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaestros();
        fetchAsientos();
    }, []);


    // --- Filtrado ---
    const filteredAsientos = useMemo(() => {
        // ... (existing logic remains)
        return asientos.filter(as => {
            const matchesSearch = busqueda === '' ||
                as.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                as.numero.toString().includes(busqueda);

            const asDate = as.fecha ? as.fecha.split(' ')[0] : '';
            const matchesStart = !dateRange.start || asDate >= dateRange.start;
            const matchesEnd = !dateRange.end || asDate <= dateRange.end;

            return matchesSearch && matchesStart && matchesEnd;
        });
    }, [asientos, busqueda, dateRange]);

    // Calcular datos paginados
    const paginatedAsientos = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredAsientos.slice(start, end);
    }, [filteredAsientos, page, itemsPerPage]);

    useEffect(() => {
        setTotalItems(filteredAsientos.length);
        setTotalPages(Math.ceil(filteredAsientos.length / itemsPerPage));
    }, [filteredAsientos, itemsPerPage]);

    const stats = useMemo(() => {
        const totalDebe = filteredAsientos.reduce((acc, as) => acc + (parseFloat(as.total_debe) || 0), 0);
        const totalHaber = filteredAsientos.reduce((acc, as) => acc + (parseFloat(as.total_haber) || 0), 0);
        const ultimo = filteredAsientos.length > 0 ? filteredAsientos[0].fecha?.split(' ')[0] : '-';

        return {
            totalDebe,
            totalHaber,
            count: filteredAsientos.length,
            ultimo
        };
    }, [filteredAsientos]);

    // --- Lógica del Formulario ---
    const handleMoveChange = (idx, field, val) => {
        const newMoves = [...formData.movimientos];
        newMoves[idx][field] = val;

        // Auto-fix: Si escribe en Debe, borra Haber y viceversa
        if (field === 'debe' && parseFloat(val) > 0) newMoves[idx]['haber'] = 0;
        if (field === 'haber' && parseFloat(val) > 0) newMoves[idx]['debe'] = 0;

        setFormData({ ...formData, movimientos: newMoves });
    };

    const addRow = () => {
        setFormData({
            ...formData,
            movimientos: [...formData.movimientos, { id: Date.now(), cuenta_id: '', debe: 0, haber: 0 }]
        });
    };

    const removeRow = (idx) => {
        if (formData.movimientos.length <= 2) return;
        const newMoves = formData.movimientos.filter((_, i) => i !== idx);
        setFormData({ ...formData, movimientos: newMoves });
    };

    const totalDebe = formData.movimientos.reduce((acc, m) => acc + (parseFloat(m.debe) || 0), 0);
    const totalHaber = formData.movimientos.reduce((acc, m) => acc + (parseFloat(m.haber) || 0), 0);
    const diferencia = totalDebe - totalHaber;
    const balanceado = Math.abs(diferencia) < 0.01;

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!balanceado) {
            showErrorAlert("Asiento Descuadrado", `El asiento tiene una diferencia de $ ${diferencia.toFixed(2)}`);
            return;
        }
        if (!formData.ejercicio_id) {
            showErrorAlert("Faltan Datos", "Debe seleccionar un ejercicio fiscal");
            return;
        }

        setSaving(true);
        try {
            const res = await axios.post(`/api/contabilidad/asientos/crear/`, formData, {
                headers: { 'X-CSRFToken': document.cookie.split('csrftoken=')[1]?.split(';')[0] }
            });
            if (res.data.ok || res.data.success) {
                showSuccessAlert("¡Éxito!", "El asiento ha sido registrado correctamente.");
                setModalOpen(false);
                fetchAsientos();
            } else {
                showErrorAlert("Error", res.data.error || "No se pudo registrar el asiento.");
            }
        } catch (error) {
            showErrorAlert("Error", error.response?.data?.error || "Error de conexión con el servidor.");
        } finally {
            setSaving(false);
        }
    };

    const openNew = () => {
        const defaultEj = ejercicios.find(e => !e.cerrado);
        setFormData({
            id: null,
            ejercicio_id: defaultEj ? defaultEj.id : '',
            numero: '',
            fecha: new Date().toISOString().split('T')[0],
            descripcion: '',
            movimientos: [
                { id: Date.now(), cuenta_id: '', debe: 0, haber: 0 },
                { id: Date.now() + 1, cuenta_id: '', debe: 0, haber: 0 }
            ]
        });
        setModalOpen(true);
    };

    const loadDetalle = async (id) => {
        try {
            const res = await axios.get(`/api/contabilidad/asientos/${id}/`);
            if (res.data.ok) {
                const as = res.data.asiento;
                setFormData({
                    id: as.id,
                    ejercicio_id: as.ejercicio_id,
                    numero: as.numero,
                    fecha: as.fecha.split(' ')[0],
                    descripcion: as.descripcion,
                    movimientos: as.movimientos.map(m => ({
                        id: m.id,
                        cuenta_id: m.cuenta_id,
                        debe: parseFloat(m.debe),
                        haber: parseFloat(m.haber)
                    }))
                });
                setModalOpen(true);
            }
        } catch (err) {
            showErrorAlert("Error", "No se pudo cargar el detalle del asiento");
        }
    };

    const handleDelete = async (id) => {
        const result = await showDeleteAlert(
            "¿Eliminar asiento?",
            "Esta acción eliminará el asiento contable de forma permanente. Los saldos de las cuentas se recalcularán.",
            'Eliminar'
        );
        if (!result.isConfirmed) return;

        try {
            const res = await axios.post(`/api/contabilidad/asientos/${id}/eliminar/`, {}, {
                headers: { 'X-CSRFToken': document.cookie.split('csrftoken=')[1]?.split(';')[0] }
            });
            if (res.data.ok) {
                showSuccessAlert("Eliminado", "Asiento eliminado correctamente");
                fetchAsientos();
            } else {
                showErrorAlert("Error", res.data.error);
            }
        } catch (err) {
            showErrorAlert("Error", "Error al intentar eliminar el asiento");
        }
    };

    // --- Configuración de Columnas de la Tabla ---
    const columns = [
        {
            key: 'numero',
            label: 'NÚMERO',
            width: '120px',
            render: (val) => (
                <span className="font-bold text-primary-600 hover:underline cursor-pointer">
                    #{val}
                </span>
            )
        },
        {
            key: 'fecha',
            label: 'FECHA',
            width: '150px',
            render: (val) => <TableCell.Date value={val ? val.split(' ')[0] : '-'} />
        },
        {
            key: 'descripcion',
            label: 'DESCRIPCIÓN',
            render: (val) => <TableCell.Primary value={val} />
        },
        {
            key: 'total_debe',
            label: 'DEBE',
            width: '150px',
            align: 'right',
            render: (val) => <span className="text-emerald-600 font-black tabular-nums">$ {formatNumber(val)}</span>
        },
        {
            key: 'total_haber',
            label: 'HABER',
            width: '150px',
            align: 'right',
            render: (val) => <span className="text-primary-600 font-black tabular-nums">$ {formatNumber(val)}</span>
        },
        {
            key: 'acciones',
            label: 'ACCIONES',
            width: '100px',
            align: 'right',
            sortable: false,
            render: (_, row) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }}
                        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-100px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-500/30">
                            <BookOpen size={30} strokeWidth={2.5} />
                        </div>
                        Asientos Contables
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1 flex items-center gap-2">
                        <Clock size={14} className="text-primary-500" /> Registro manual de operaciones y centralizaciones automáticas.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchAsientos()}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-50 transition-all shadow-sm"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Sincronizar
                    </button>
                    <BtnAdd
                        label="NUEVO ASIENTO"
                        onClick={openNew}
                        className="!bg-primary-600 !hover:bg-primary-700 !rounded-xl !px-8 !py-4 !font-black !tracking-widest !text-xs !shadow-xl !shadow-primary-600/20"
                    />
                </div>
            </header>

            {/* KPI Section */}
            <BentoGrid cols={4} className="shrink-0">
                <StatCard
                    label="Débitos Totales"
                    value={`$${formatNumber(stats.totalDebe)}`}
                    icon={TrendingUp}
                    color="success"
                    description="Suma total del Debe"
                />
                <StatCard
                    label="Créditos Totales"
                    value={`$${formatNumber(stats.totalHaber)}`}
                    icon={TrendingDown}
                    color="primary"
                    description="Suma total del Haber"
                />
                <StatCard
                    label="Registros"
                    value={stats.count}
                    icon={Hash}
                    color="warning"
                    description="Cantidad de asientos"
                />
                <StatCard
                    label="Último Registro"
                    value={stats.ultimo}
                    icon={Calendar}
                    color="neutral"
                    description="Fecha de actividad"
                />
            </BentoGrid>

            {/* Content Area: Filter + Table */}
            <div className="flex flex-col flex-1 min-h-0 gap-4">
                <PremiumFilterBar
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    onClear={() => { setBusqueda(''); setDateRange({ start: '', end: '' }); setPage(1); }}
                    placeholder="Buscar por descripción o número de asiento..."
                    className="!px-0"
                />

                <div className="flex flex-col flex-1 min-h-0">
                    <PremiumTable
                        columns={columns}
                        data={paginatedAsientos}
                        loading={loading}
                        onRowClick={(row) => loadDetalle(row.id)}
                        className="flex-1 shadow-lg border border-neutral-200/60 !bg-white rounded-t-[2rem]"
                        emptyState={
                            <EmptyState
                                title="No se encontraron asientos"
                                description="Ajusta los filtros o crea un nuevo asiento manual para comenzar."
                            />
                        }
                    />

                    {/* Pagination Bar */}
                    <div className="bg-white border-x border-b border-neutral-200 rounded-b-[2rem] px-8 py-2 shadow-premium shrink-0">
                        <TablePagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setPage}
                            onItemsPerPageChange={(val) => { setItemsPerPage(val); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border-0">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50 shrink-0">
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "p-4 rounded-[1.5rem] shadow-lg",
                                    formData.id ? "bg-primary-600 text-white shadow-primary-500/30" : "bg-emerald-600 text-white shadow-emerald-500/30"
                                )}>
                                    <FileText size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-black text-2xl text-neutral-900 leading-tight">
                                        {formData.id ? `Asiento Contable #${formData.numero}` : 'Nuevo Registro Diario'}
                                    </h3>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1">
                                        {formData.id ? 'Vista de consulta operativa' : 'Carga manual de movimientos de partida doble'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-neutral-400 hover:text-rose-500"
                            >
                                <X size={24} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto grow space-y-8 no-scrollbar">
                            {/* Master Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="md:col-span-1">
                                    <PremiumSelect
                                        label="Ejercicio Fiscal"
                                        value={formData.ejercicio_id}
                                        onChange={e => setFormData({ ...formData, ejercicio_id: e.target.value })}
                                        disabled={formData.id}
                                        options={ejercicios.map(e => ({ value: e.id, label: e.descripcion }))}
                                    />
                                </div>
                                <div>
                                    <PremiumInput
                                        label="Identificador / N°"
                                        type="number"
                                        value={formData.numero}
                                        onChange={e => setFormData({ ...formData, numero: e.target.value })}
                                        disabled={formData.id}
                                        className="!text-lg font-black text-primary-700"
                                    />
                                </div>
                                <div>
                                    <PremiumInput
                                        label="Fecha de Registro"
                                        type="date"
                                        value={formData.fecha}
                                        onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                                        disabled={formData.id}
                                        icon={Calendar}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <div className={cn(
                                        "h-full flex items-center justify-center p-6 rounded-[2rem] border-2 border-dashed transition-all",
                                        balanceado ? "border-emerald-200 bg-emerald-50/30 text-emerald-600" : "border-rose-200 bg-rose-50/30 text-rose-600"
                                    )}>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Estado de Partida</p>
                                            <div className="flex items-center gap-2 font-black uppercase text-xs">
                                                {balanceado ? <CheckCircle2 size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={3} />}
                                                {balanceado ? 'Balanceado' : 'Descuadrado'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-4">
                                    <PremiumInput
                                        label="Descripción / Glosa del Asiento"
                                        type="text"
                                        value={formData.descripcion}
                                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                        disabled={formData.id}
                                        placeholder="Ej: Pago de sueldos administración..."
                                        icon={Search}
                                    />
                                </div>
                            </div>

                            {/* Detalle de Movimientos */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-neutral-900 flex items-center gap-3">
                                        <div className="w-2 h-8 bg-primary-600 rounded-full shadow-lg shadow-primary-500/20"></div>
                                        MOVIMIENTOS DE LAS CUENTAS
                                    </h4>
                                    {!formData.id && (
                                        <button
                                            onClick={addRow}
                                            className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm border border-neutral-200/50"
                                        >
                                            <Plus size={16} strokeWidth={3} /> Agregar Fila
                                        </button>
                                    )}
                                </div>

                                <div className="rounded-[2rem] border border-neutral-100 overflow-hidden shadow-xl bg-white">
                                    <div className="grid grid-cols-[1fr_180px_180px_60px] bg-neutral-900 px-8 py-4 font-black text-[10px] text-neutral-400 uppercase tracking-[0.2em]">
                                        <div>Cuenta Contable / Imputación</div>
                                        <div className="text-right">DEBE (+)</div>
                                        <div className="text-right">HABER (-)</div>
                                        <div></div>
                                    </div>

                                    <div className="divide-y divide-neutral-50 max-h-[400px] overflow-y-auto no-scrollbar">
                                        {formData.movimientos.map((mov, idx) => (
                                            <div key={mov.id || idx} className="grid grid-cols-[1fr_180px_180px_60px] gap-4 items-center px-6 py-4 hover:bg-neutral-50 transition-colors">
                                                <div className="relative overflow-visible">
                                                    <SearchableSelect
                                                        value={mov.cuenta_id}
                                                        onChange={e => handleMoveChange(idx, 'cuenta_id', e.target.value)}
                                                        disabled={formData.id}
                                                        options={cuentasPlanas.map(c => ({ value: c.id, label: `${c.codigo} - ${c.nombre}` }))}
                                                        placeholder="Vincular cuenta..."
                                                        className="!border-0 !bg-neutral-100 !rounded-xl !h-12"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full h-12 px-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-right font-black text-lg text-emerald-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-emerald-300"
                                                        value={mov.debe}
                                                        onChange={e => handleMoveChange(idx, 'debe', e.target.value)}
                                                        disabled={formData.id}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full h-12 px-4 bg-primary-50/50 border border-primary-100 rounded-xl text-right font-black text-lg text-primary-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-primary-300"
                                                        value={mov.haber}
                                                        onChange={e => handleMoveChange(idx, 'haber', e.target.value)}
                                                        disabled={formData.id}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="flex justify-center">
                                                    {!formData.id && (
                                                        <button
                                                            onClick={() => removeRow(idx)}
                                                            className="p-3 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                                        >
                                                            <Trash2 size={20} strokeWidth={2} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer / Totals */}
                        <div className="px-10 py-8 border-t border-neutral-100 bg-neutral-900 shrink-0">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                                <div className="flex gap-12">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Total Debe</span>
                                        <span className="font-black text-3xl text-emerald-400 tracking-tighter">$ {formatNumber(totalDebe)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-1">Total Haber</span>
                                        <span className="font-black text-3xl text-primary-400 tracking-tighter">$ {formatNumber(totalHaber)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Diferencia</span>
                                        <span className={cn(
                                            "font-black text-3xl tracking-tighter",
                                            balanceado ? "text-neutral-600" : "text-rose-500 animate-pulse"
                                        )}>
                                            $ {Math.abs(diferencia).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {!formData.id && (
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <button
                                            onClick={() => setModalOpen(false)}
                                            className="px-8 py-4 bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                        >
                                            DESCARTAR
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!balanceado || saving}
                                            className={cn(
                                                "px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl",
                                                balanceado && !saving
                                                    ? "bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700"
                                                    : "bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700"
                                            )}
                                        >
                                            {saving ? "REGISTRANDO..." : "REGISTRAR ASIENTO"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Asientos;
