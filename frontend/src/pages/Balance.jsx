
import React, { useState, useEffect } from 'react';
import {
    PieChart, Download, Calendar, ArrowUpRight, Wallet,
    Calculator, TrendingUp, TrendingDown, Target, Search
} from 'lucide-react';
import axios from 'axios';
import { BentoCard } from '../components/premium/BentoCard';
import { PremiumSelect, PremiumInput } from '../components/premium/PremiumInput';
import { showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { formatNumber } from '../utils/formats';
import { cn } from '../utils/cn';

const Balance = () => {
    const [loading, setLoading] = useState(false);
    const [cuentas, setCuentas] = useState([]);
    const [totales, setTotales] = useState(null);
    const [ejercicioInfo, setEjercicioInfo] = useState(null);
    const [ejercicios, setEjercicios] = useState([]);

    // Filtros
    const [filtros, setFiltros] = useState({
        ejercicio_id: '',
        fecha_desde: '',
        fecha_hasta: '',
        solo_con_movimientos: true,
        nivel: ''
    });

    useEffect(() => {
        const loadMaestros = async () => {
            try {
                const res = await axios.get('/api/contabilidad/ejercicios/');
                if (res.data.success) {
                    setEjercicios(res.data.ejercicios);
                    const active = res.data.ejercicios.find(e => !e.cerrado);
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
                console.error("Error cargando ejercicios:", error);
            }
        };
        loadMaestros();
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!filtros.ejercicio_id) {
            showErrorAlert("Falta Información", "Debe seleccionar un ejercicio contable");
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams(filtros).toString();
            const res = await axios.get(`/api/contabilidad/balance/generar/?${params}`);

            if (res.data.success) {
                setCuentas(res.data.cuentas);
                setTotales(res.data.totales);
                setEjercicioInfo(res.data.ejercicio);
                showSuccessAlert("¡Éxito!", "Balance generado correctamente.");
            } else {
                showErrorAlert("Error", res.data.error || "No se pudo generar el balance");
            }
        } catch (err) {
            showErrorAlert("Error", "Error al conectar con el servidor para generar el balance");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!filtros.ejercicio_id) return;
        const params = new URLSearchParams(filtros).toString();
        window.open(`/api/contabilidad/balance/exportar/?${params}`, '_blank');
    };

    const formatCurr = (val) => {
        if (!val || val === 0) return '-';
        return val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] p-6 gap-6 overflow-hidden bg-neutral-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-neutral-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <PieChart size={28} strokeWidth={2.5} />
                        </div>
                        Sumas y Saldos
                    </h1>
                    <p className="text-neutral-500 mt-1 font-medium flex items-center gap-2">
                        <Wallet size={14} /> Balance General de Comprobación
                    </p>
                </div>
                {totales && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="flex h-11 items-center gap-2 rounded-xl bg-white border border-neutral-200 px-6 font-bold text-neutral-600 shadow-sm transition-all hover:bg-neutral-50 active:scale-95"
                        >
                            <Download size={18} />
                            Exportar PDF
                        </button>
                    </div>
                )}
            </div>

            {/* Filtros */}
            <BentoCard className="p-3 shrink-0">
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <PremiumSelect
                            label="Período / Ejercicio"
                            icon={<Calendar size={18} />}
                            value={filtros.ejercicio_id}
                            onChange={e => {
                                const ej = ejercicios.find(x => x.id == e.target.value);
                                setFiltros({
                                    ...filtros,
                                    ejercicio_id: e.target.value,
                                    fecha_desde: ej ? ej.fecha_inicio : '',
                                    fecha_hasta: ej ? ej.fecha_fin : ''
                                });
                            }}
                            options={[
                                { value: '', label: 'Seleccionar...' },
                                ...ejercicios.map(e => ({ value: e.id, label: e.descripcion }))
                            ]}
                        />
                    </div>

                    <div className="w-40">
                        <PremiumInput
                            label="Desde"
                            type="date"
                            value={filtros.fecha_desde}
                            onChange={e => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                        />
                    </div>

                    <div className="w-40">
                        <PremiumInput
                            label="Hasta"
                            type="date"
                            value={filtros.fecha_hasta}
                            onChange={e => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-4 px-4 h-[50px] bg-neutral-100/50 rounded-2xl border border-neutral-200 mt-5">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div className={cn(
                                "w-10 h-5 rounded-full relative transition-all duration-300",
                                filtros.solo_con_movimientos ? "bg-primary-500" : "bg-neutral-300"
                            )}>
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                                    filtros.solo_con_movimientos ? "left-6" : "left-1"
                                )} />
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={filtros.solo_con_movimientos}
                                onChange={e => setFiltros({ ...filtros, solo_con_movimientos: e.target.checked })}
                            />
                            <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Solo saldos activos</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="ml-auto h-[50px] mt-5 px-8 rounded-xl bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <ArrowUpRight size={18} />
                        )}
                        {loading ? 'Generando...' : 'Generar Balance'}
                    </button>
                </form>
            </BentoCard>

            {/* Resume Cards */}
            {totales && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
                    <MetricCard
                        label="Total Debe / Haber"
                        value={`$ ${formatNumber(totales.suma_debe)}`}
                        icon={<Calculator className="text-blue-600" />}
                        description="Equilibrio de la partida doble"
                    />
                    <MetricCard
                        label="Diferencia"
                        value={`$ ${formatNumber(Math.abs(totales.suma_debe - totales.suma_haber))}`}
                        icon={<Target className={cn(Math.abs(totales.suma_debe - totales.suma_haber) < 0.01 ? "text-success-600" : "text-error-600")} />}
                        description={Math.abs(totales.suma_debe - totales.suma_haber) < 0.01 ? "Balance Cuadrado" : "Balance con Diferencias"}
                    />
                    <MetricCard
                        label="Saldos Deudores"
                        value={`$ ${formatNumber(totales.total_deudor)}`}
                        icon={<TrendingUp className="text-emerald-600" />}
                        description="Total de saldos positivos"
                    />
                    <MetricCard
                        label="Saldos Acreedores"
                        value={`$ ${formatNumber(totales.total_acreedor)}`}
                        icon={<TrendingDown className="text-rose-600" />}
                        description="Total de saldos negativos/pasivos"
                    />
                </div>
            )}

            {/* Results Table */}
            <div className="flex-1 min-h-0 flex flex-col gap-6">
                <BentoCard className="flex-1 min-h-0 p-0 overflow-hidden flex flex-col border border-neutral-200/60 shadow-xl shadow-neutral-200/40">
                    <div className="overflow-auto flex-1 no-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-neutral-900 text-white">
                                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] w-32 font-mono">Código</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Cuenta Contable</th>
                                    <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] w-40">Debe</th>
                                    <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] w-40">Haber</th>
                                    <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] w-40 bg-emerald-900/40">S. Deudor</th>
                                    <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] w-40 bg-rose-900/40">S. Acreedor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 bg-white">
                                {cuentas.map((cta, idx) => (
                                    <tr
                                        key={cta.codigo}
                                        className={cn(
                                            "hover:bg-neutral-50/80 transition-colors group",
                                            !cta.imputable && "bg-neutral-50/30"
                                        )}
                                    >
                                        <td className="px-6 py-3.5 text-xs font-black text-neutral-400 font-mono tracking-wider">{cta.codigo}</td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-1.5 h-3.5 rounded-full",
                                                    cta.tipo === 'ACTIVO' ? "bg-emerald-400" :
                                                        cta.tipo === 'PASIVO' ? "bg-rose-400" :
                                                            cta.tipo === 'PN' ? "bg-indigo-400" : "bg-neutral-300"
                                                )} />
                                                <span className={cn(
                                                    "text-sm tracking-tight transition-all",
                                                    !cta.imputable ? "font-black text-neutral-800" : "font-semibold text-neutral-600 group-hover:text-primary-600"
                                                )}>
                                                    {cta.nombre}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-right font-medium text-xs text-neutral-500 tabular-nums">{formatCurr(cta.debe)}</td>
                                        <td className="px-6 py-3.5 text-right font-medium text-xs text-neutral-500 tabular-nums">{formatCurr(cta.haber)}</td>
                                        <td className="px-6 py-3.5 text-right font-black text-sm text-emerald-600 bg-emerald-50/20 tabular-nums">{formatCurr(cta.saldo_deudor)}</td>
                                        <td className="px-6 py-3.5 text-right font-black text-sm text-rose-600 bg-rose-50/20 tabular-nums">{formatCurr(cta.saldo_acreedor)}</td>
                                    </tr>
                                ))}
                                {cuentas.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Search size={48} />
                                                <p className="font-black text-sm uppercase tracking-widest">No hay datos para mostrar</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </BentoCard>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, description }) => (
    <BentoCard className="flex flex-col gap-3 p-5 group hover:border-primary-200 transition-all border border-neutral-100">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</span>
            <div className="p-2 bg-neutral-50 rounded-lg group-hover:bg-white group-hover:shadow-md transition-all">
                {React.cloneElement(target_label(icon), { size: 18 })}
            </div>
        </div>
        <div>
            <span className="text-2xl font-black text-neutral-800 tracking-tight">{value}</span>
            <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-tight">{description}</p>
        </div>
    </BentoCard>
);

// Helper to handle icon cloning correctly
function target_label(icon) {
    if (React.isValidElement(icon)) return icon;
    return <span></span>;
}

export default Balance;
