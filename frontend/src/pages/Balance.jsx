import React, { useState, useEffect } from 'react';
import {
    PieChart, Search, Download, Calendar, Filter
} from 'lucide-react';

const Balance = () => {
    const [loading, setLoading] = useState(false);
    const [cuentas, setCuentas] = useState([]);
    const [totales, setTotales] = useState(null);
    const [ejercicioInfo, setEjercicioInfo] = useState(null);

    // Filtros
    const [filtros, setFiltros] = useState({
        ejercicio_id: '',
        fecha_desde: '',
        fecha_hasta: '',
        solo_con_movimientos: true,
        nivel: ''
    });

    const [ejercicios, setEjercicios] = useState([]);

    useEffect(() => {
        // Cargar ejercicios
        fetch('/api/contabilidad/ejercicios/')
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    setEjercicios(res.ejercicios);
                    const active = res.ejercicios.find(e => !e.cerrado);
                    if (active) {
                        setFiltros(prev => ({
                            ...prev,
                            ejercicio_id: active.id,
                            fecha_desde: active.fecha_inicio,
                            fecha_hasta: active.fecha_fin
                        }));
                    }
                }
            });
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!filtros.ejercicio_id) return alert("Seleccione un ejercicio");

        setLoading(true);
        try {
            const params = new URLSearchParams(filtros).toString();
            const res = await fetch(`/api/contabilidad/balance/generar/?${params}`);
            const data = await res.json();

            if (data.success) {
                setCuentas(data.cuentas);
                setTotales(data.totales);
                setEjercicioInfo(data.ejercicio);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!filtros.ejercicio_id) return;
        const params = new URLSearchParams(filtros).toString();
        window.open(`/api/contabilidad/balance/exportar/?${params}`, '_blank');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <PieChart className="text-blue-600" size={32} />
                        Balance de Sumas y Saldos
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Estado de situación patrimonial y resultados.</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ejercicio</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                        >
                            <option value="">Seleccionar...</option>
                            {ejercicios.map(e => <option key={e.id} value={e.id}>{e.descripcion}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Desde</label>
                        <input
                            type="date"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                            value={filtros.fecha_desde}
                            onChange={e => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasta</label>
                        <input
                            type="date"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                            value={filtros.fecha_hasta}
                            onChange={e => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2 flex items-center h-full pb-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                checked={filtros.solo_con_movimientos}
                                onChange={e => setFiltros({ ...filtros, solo_con_movimientos: e.target.checked })}
                            />
                            <span className="text-sm font-bold text-slate-600">Solo con saldo</span>
                        </label>
                    </div>

                    <div className="md:col-span-3 flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-colors flex justify-center items-center gap-2"
                        >
                            <Filter size={18} /> Generar
                        </button>
                    </div>
                </form>
            </div>

            {/* Resultados */}
            {totales && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-end">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-colors flex items-center gap-2"
                        >
                            <Download size={18} /> Exportar Excel
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                        <th className="p-4 w-32">Código</th>
                                        <th className="p-4">Cuenta</th>
                                        <th className="p-4 text-right">Debe</th>
                                        <th className="p-4 text-right">Haber</th>
                                        <th className="p-4 text-right">Saldo Deudor</th>
                                        <th className="p-4 text-right">Saldo Acreedor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {cuentas.map((c) => (
                                        <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${!c.nivel || c.nivel === 1 ? 'font-bold bg-slate-50/50' : ''}`}>
                                            <td className="p-4 font-mono text-slate-600 text-sm">
                                                {c.codigo}
                                            </td>
                                            <td className="p-4 text-slate-800">
                                                <div style={{ paddingLeft: `${(c.nivel - 1) * 1.5}rem` }}>
                                                    {c.nombre}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-mono text-slate-500 text-sm">
                                                {c.debe > 0 ? c.debe.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </td>
                                            <td className="p-4 text-right font-mono text-slate-500 text-sm">
                                                {c.haber > 0 ? c.haber.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </td>
                                            <td className="p-4 text-right font-mono text-slate-800 font-medium">
                                                {c.saldo > 0 ? c.saldo.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </td>
                                            <td className="p-4 text-right font-mono text-slate-800 font-medium">
                                                {c.saldo < 0 ? Math.abs(c.saldo).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-800">
                                        <td colSpan="2" className="p-4 text-right uppercase text-xs tracking-wider">Totales</td>
                                        <td className="p-4 text-right font-mono">{totales.total_debe.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-right font-mono">{totales.total_haber.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-right font-mono">{totales.total_saldo_deudor.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-right font-mono">{totales.total_saldo_acreedor.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Balance;
