import React, { useState, useEffect, useMemo } from 'react';
import {
    BookOpen, Search, FileSpreadsheet, Wallet2,
    ArrowDownCircle, ArrowUpCircle, Clock, Layers, Download,
    Book, RefreshCw, Hash, TrendingUp, TrendingDown, Calendar
} from 'lucide-react';
import axios from 'axios';
import {
    BentoCard, StatCard, PremiumTable, TableCell,
    PremiumSelect, PremiumFilterBar, BentoGrid
} from '../components/premium';
import { SearchableSelect } from '../components/premium/SearchableSelect';
import EmptyState from '../components/EmptyState';
import { showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { formatNumber } from '../utils/formats';
import { cn } from '../utils/cn';

const flattenCuentas = (nodes, result = []) => {
    nodes.forEach(node => {
        result.push(node);
        if (node.hijos && node.hijos.length > 0) {
            flattenCuentas(node.hijos, result);
        }
    });
    return result;
};

const LibroMayor = () => {
    const [loading, setLoading] = useState(false);
    const [movimientos, setMovimientos] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [cuenta, setCuenta] = useState(null);

    // Filtros
    const [filtros, setFiltros] = useState({
        cuenta_id: '',
        ejercicio_id: '',
        fecha_desde: '',
        fecha_hasta: ''
    });

    const [cuentas, setCuentas] = useState([]);
    const [ejercicios, setEjercicios] = useState([]);

    useEffect(() => {
        const loadMaestros = async () => {
            try {
                const [resCuentas, resEj] = await Promise.all([
                    axios.get('/api/contabilidad/plan-cuentas/'),
                    axios.get('/api/contabilidad/ejercicios/')
                ]);

                if (resCuentas.data.success) setCuentas(flattenCuentas(resCuentas.data.cuentas));
                if (resEj.data.success) {
                    setEjercicios(resEj.data.ejercicios);
                    const active = resEj.data.ejercicios.find(e => !e.cerrado);
                    if (active) {
                        setFiltros(prev => ({
                            ...prev,
                            ejercicio_id: active.id,
                            fecha_desde: active.fecha_inicio,
                            fecha_hasta: active.fecha_fin
                        }));
                    }
                }
            } catch (error) {
                console.error("Error loading masters:", error);
            }
        };
        loadMaestros();
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!filtros.cuenta_id) {
            showErrorAlert("Faltan Datos", "Debe seleccionar una cuenta contable para realizar la consulta.");
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams(filtros).toString();
            const res = await axios.get(`/api/contabilidad/mayor/consultar/?${params}`);

            if (res.data.success) {
                setMovimientos(res.data.movimientos);
                setResumen(res.data.resumen);
                setCuenta(res.data.cuenta);
            } else {
                showErrorAlert("Error", res.data.error || "No se pudo obtener el mayor");
            }
        } catch (err) {
            showErrorAlert("Error", "Ocurrió un error al consultar el Libro Mayor");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!filtros.cuenta_id) return;
        const params = new URLSearchParams(filtros).toString();
        window.open(`/api/contabilidad/mayor/exportar/?${params}`, '_blank');
    };

    const handleFilterChange = (field, value) => {
        const newFiltros = { ...filtros, [field]: value };

        if (field === 'ejercicio_id') {
            const ej = ejercicios.find(x => x.id == value);
            if (ej) {
                newFiltros.fecha_desde = ej.fecha_inicio;
                newFiltros.fecha_hasta = ej.fecha_fin;
            }
        }
        setFiltros(newFiltros);
    };

    const columns = [
        {
            key: 'fecha',
            label: 'FECHA',
            width: '150px',
            render: (val) => <TableCell.Date value={val} />
        },
        {
            key: 'asiento_numero',
            label: 'ASIENTO',
            width: '120px',
            render: (val) => (
                <span className="font-bold text-primary-600">
                    #{val}
                </span>
            )
        },
        {
            key: 'descripcion',
            label: 'DESCRIPCIÓN',
            render: (val) => <TableCell.Primary value={val} />
        },
        {
            key: 'debe',
            label: 'DEBE',
            width: '150px',
            align: 'right',
            render: (val) => val > 0 ? <span className="text-emerald-600 font-black tabular-nums">$ {formatNumber(val)}</span> : <span className="text-neutral-300">-</span>
        },
        {
            key: 'haber',
            label: 'HABER',
            width: '150px',
            align: 'right',
            render: (val) => val > 0 ? <span className="text-primary-600 font-black tabular-nums">$ {formatNumber(val)}</span> : <span className="text-neutral-300">-</span>
        },
        {
            key: 'saldo',
            label: 'SALDO',
            width: '150px',
            align: 'right',
            render: (val) => (
                <span className={cn(
                    "font-black tabular-nums",
                    val < 0 ? "text-error-600" : "text-neutral-900"
                )}>
                    $ {formatNumber(val)}
                </span>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-100px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/30">
                            <Book size={30} strokeWidth={2.5} />
                        </div>
                        Libro Mayor
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1 flex items-center gap-2">
                        <Clock size={14} className="text-indigo-500" /> Consulta detallada de movimientos y evolución de saldos por cuenta.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {resumen && (
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-50 transition-all shadow-sm"
                        >
                            <Download size={18} /> Exportar PDF
                        </button>
                    )}
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading || !filtros.cuenta_id}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl",
                            loading || !filtros.cuenta_id
                                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none"
                                : "bg-primary-600 text-white shadow-primary-500/20 hover:bg-primary-700 active:scale-95"
                        )}
                    >
                        <Search size={18} className={loading ? "animate-spin" : ""} />
                        {loading ? 'Consultando...' : 'Consultar'}
                    </button>
                </div>
            </header>

            {/* KPI Section */}
            <BentoGrid cols={4} className="shrink-0">
                <StatCard
                    label="Saldo Inicial"
                    value={`$${formatNumber(resumen?.saldo_inicial || 0)}`}
                    icon={Wallet2}
                    color="neutral"
                    description="Balance al inicio del periodo"
                />
                <StatCard
                    label="Total Debe (+)"
                    value={`$${formatNumber(resumen?.total_debe || 0)}`}
                    icon={TrendingUp}
                    color="success"
                    description="Sumatoria de débitos"
                />
                <StatCard
                    label="Total Haber (-)"
                    value={`$${formatNumber(resumen?.total_haber || 0)}`}
                    icon={TrendingDown}
                    color="primary"
                    description="Sumatoria de créditos"
                />
                <StatCard
                    label={resumen?.saldo_final < 0 ? "Saldo (Deudor)" : "Saldo (Acreedor)"}
                    value={`$${formatNumber(resumen?.saldo_final || 0)}`}
                    icon={Hash}
                    color={resumen?.saldo_final < 0 ? "error" : "neutral"}
                    className={cn(resumen?.saldo_final >= 0 && "!bg-neutral-900 !text-white")}
                    description="Balance final calculado"
                />
            </BentoGrid>

            {/* Content Area: Filter + Table */}
            <div className="flex flex-col flex-1 min-h-0 gap-4">
                <div className="flex flex-col lg:flex-row items-center gap-4 w-full shrink-0">
                    <div className="flex-1 w-full overflow-visible">
                        <SearchableSelect
                            value={filtros.cuenta_id}
                            onChange={(e) => handleFilterChange('cuenta_id', e.target.value)}
                            options={cuentas.map(c => ({ value: c.id, label: `${c.codigo} - ${c.nombre}` }))}
                            placeholder="Buscar y seleccionar cuenta contable..."
                            className="shadow-sm"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto overflow-visible">
                        <div className="w-48 overflow-visible">
                            <PremiumSelect
                                value={filtros.ejercicio_id}
                                onChange={(e) => handleFilterChange('ejercicio_id', e.target.value)}
                                options={[
                                    { value: '', label: 'Ejercicio...' },
                                    ...ejercicios.map(e => ({ value: e.id, label: e.descripcion }))
                                ]}
                                className="!h-[52px] !rounded-full border-neutral-200 shadow-sm bg-white font-bold text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-3 bg-white px-6 h-[52px] rounded-full border border-neutral-200 shadow-sm min-w-max">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-neutral-400" />
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">Desde</span>
                                <input
                                    type="date"
                                    value={filtros.fecha_desde}
                                    onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                                    className="text-xs font-bold text-neutral-700 bg-transparent outline-none cursor-pointer hover:text-primary-600 transition-colors uppercase"
                                />
                            </div>
                            <div className="w-[1px] h-4 bg-neutral-200 mx-1"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">Hasta</span>
                                <input
                                    type="date"
                                    value={filtros.fecha_hasta}
                                    onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                                    className="text-xs font-bold text-neutral-700 bg-transparent outline-none cursor-pointer hover:text-primary-600 transition-colors uppercase"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                    {!resumen && !loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-neutral-200/60 rounded-[2rem] shadow-sm">
                            <EmptyState
                                title="Consulta de Mayor"
                                description="Selecciona una cuenta contable y presiona 'Consultar' para visualizar el historial de movimientos."
                                icon={Search}
                            />
                        </div>
                    ) : (
                        <PremiumTable
                            columns={columns}
                            data={movimientos}
                            loading={loading}
                            className="flex-1 shadow-lg border border-neutral-200/60 !bg-white rounded-[2rem] overflow-hidden"
                            emptyState={
                                <EmptyState
                                    title="No hay movimientos"
                                    description="Esta cuenta no presenta registros para el periodo seleccionado."
                                />
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibroMayor;
