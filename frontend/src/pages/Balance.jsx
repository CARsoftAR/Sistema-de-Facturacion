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

                    {/* Tabla Standardizada */}
                    <div className="card border-0 shadow mb-4 flex-grow-1 overflow-hidden d-flex flex-column">
                        <div className="card-body p-0 d-flex flex-column overflow-hidden">
                            <div className="table-responsive flex-grow-1 overflow-auto">
                                <table className="table align-middle mb-0">
                                    <thead className="bg-white border-bottom">
                                        <tr>
                                            <th className="ps-4 py-3 w-32 text-dark fw-bold">Código</th>
                                            <th className="py-3 text-dark fw-bold">Cuenta</th>
                                            <th className="text-end py-3 text-dark fw-bold">Debe</th>
                                            <th className="text-end py-3 text-dark fw-bold">Haber</th>
                                            <th className="text-end py-3 text-dark fw-bold">Saldo Deudor</th>
                                            <th className="text-end pe-4 py-3 text-dark fw-bold">Saldo Acreedor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cuentas.map((c) => (
                                            <tr key={c.id} className={`${!c.nivel || c.nivel === 1 ? 'fw-bold bg-light' : ''} border-bottom-0`}>
                                                <td className="ps-4 text-nowrap font-monospace text-muted py-3">{c.codigo}</td>
                                                <td className="py-3">
                                                    <div style={{ paddingLeft: `${(c.nivel - 1) * 1.5}rem` }}>
                                                        {c.nombre}
                                                    </div>
                                                </td>
                                                <td className="text-end font-monospace text-secondary py-3">
                                                    {c.debe > 0 ? c.debe.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                </td>
                                                <td className="text-end font-monospace text-secondary py-3">
                                                    {c.haber > 0 ? c.haber.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                </td>
                                                <td className="text-end font-monospace text-dark fw-medium py-3">
                                                    {c.saldo > 0 ? c.saldo.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                </td>
                                                <td className="text-end pe-4 font-monospace text-dark fw-medium py-3">
                                                    {c.saldo < 0 ? Math.abs(c.saldo).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-light border-top">
                                        <tr className="fw-bold">
                                            <td colSpan="2" className="ps-4 py-3 text-end text-uppercase small text-muted align-middle">Totales</td>
                                            <td className="text-end font-monospace align-middle text-success py-3">{totales.total_debe.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="text-end font-monospace align-middle text-danger py-3">{totales.total_haber.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="text-end font-monospace align-middle py-3">{totales.total_saldo_deudor.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="text-end pe-4 font-monospace align-middle py-3">{totales.total_saldo_acreedor.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Balance;
