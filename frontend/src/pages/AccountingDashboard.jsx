
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Book,
    BarChart3,
    PieChart,
    FileSpreadsheet,
    Receipt,
    Target,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Settings,
    ChevronRight,
    Search,
    Download,
    Plus,
    Scale,
    Library,
    Banknote,
    History,
    Loader2
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../utils/alerts';

const QuickAction = ({ icon: Icon, title, description, to, color = "primary" }) => (
    <NavLink
        to={to}
        className="group relative overflow-hidden rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98] h-full no-underline"
    >
        {/* Background / Backdrop */}
        <div className={`absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-90 transition-all group-hover:opacity-100 shadow-sm border border-gray-100 group-hover:border-${color}-200 group-hover:shadow-lg group-hover:shadow-${color}-500/10`} />

        {/* Decorative Element */}
        <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-${color}-500/5 blur-2xl transition-all group-hover:bg-${color}-500/10 group-hover:scale-150`} />

        <div className="relative flex flex-col h-full">
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-${color}-50 text-${color}-600 ring-1 ring-${color}-100 transition-all group-hover:scale-110 group-hover:bg-${color}-100 group-hover:rotate-3`}>
                <Icon size={24} strokeWidth={2.2} />
            </div>

            <h3 className="mb-1 text-lg font-bold text-gray-900 group-hover:text-gray-950 flex items-center gap-2">
                {title}
                <ChevronRight size={16} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </h3>
            <p className="text-sm leading-relaxed text-gray-500 group-hover:text-gray-600">
                {description}
            </p>
        </div>
    </NavLink>
);

const MetricCard = ({ label, value, trend, icon: Icon, color = "blue" }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-900">{value}</h3>
                {trend && (
                    <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        {Math.abs(trend)}% vs mes ant.
                    </div>
                )}
            </div>
            <div className={`rounded-xl bg-${color}-50 p-3 text-${color}-600 ring-1 ring-${color}-50`}>
                <Icon size={20} />
            </div>
        </div>
    </div>
);

const AccountingDashboard = () => {
    const [ejercicio, setEjercicio] = useState({ descripcion: 'Cargando...', estado: 'Abierto' });
    const [stats, setStats] = useState({
        totalAsientos: 0,
        totalCuentas: 0,
        cuentasImputables: 0,
        ultimoAsiento: '-'
    });
    const [automating, setAutomating] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Obtener ejercicios
            const resEjercicios = await axios.get('/api/contabilidad/ejercicios/');
            // La API devuelve { success: true, ejercicios: [...] }
            const ejercicios = resEjercicios.data.ejercicios || [];
            const abierto = ejercicios.find(e => !e.cerrado);
            if (abierto) setEjercicio(abierto);

            // Obtener asientos para stats
            const resAsientos = await axios.get('/api/contabilidad/asientos/');
            const resCuentas = await axios.get('/api/contabilidad/plan-cuentas/');

            // La API de asientos devuelve { success: true, asientos: [...] }
            const asientosData = resAsientos.data.asientos || [];
            // La API de cuentas devuelve { success: true, cuentas: [...] }
            const cuentasData = resCuentas.data.cuentas || [];

            // Aplanar cuentas para contar imputables
            const countImputables = (nodes) => {
                let count = 0;
                if (!nodes) return 0;
                nodes.forEach(n => {
                    if (n.imputable) count++;
                    if (n.hijos) count += countImputables(n.hijos);
                });
                return count;
            };

            setStats({
                totalAsientos: asientosData.length,
                totalCuentas: 0,
                cuentasImputables: countImputables(cuentasData),
                ultimoAsiento: asientosData.length > 0 ? (asientosData[0].fecha ? asientosData[0].fecha.split(' ')[0] : '-') : '-'
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    const handleAutomation = async (type) => {
        setAutomating(type);
        try {
            let url = '';
            if (type === 'ventas') url = '/api/contabilidad/automatizacion/ventas/';
            if (type === 'compras') url = '/api/contabilidad/automatizacion/compras/';
            if (type === 'cmv') url = '/api/contabilidad/automatizacion/cmv/';

            const response = await axios.post(url, {}, {
                headers: {
                    'X-CSRFToken': document.cookie.split('csrftoken=')[1]?.split(';')[0]
                }
            });

            if (response.data.ok) {
                showSuccessAlert(response.data.mensaje || "Proceso completado correctamente");
                fetchData(); // Recargar estadísticas
            } else {
                showErrorAlert(response.data.error || "Ocurrió un error");
            }
        } catch (error) {
            console.error("Error en automatización:", error);
            showErrorAlert(error.response?.data?.error || "Error de red o del servidor");
        } finally {
            setAutomating(null);
        }
    };

    const automations = [
        { id: 'ventas', title: 'Centralizar Ventas del Día', desc: 'Genera el asiento resumen de todas las ventas de hoy.', icon: ArrowUpRight, action: 'Ejecutar Ahora' },
        { id: 'compras', title: 'Centralizar Compras', desc: 'Registra facturas de proveedores pendientes en el diario.', icon: ArrowDownLeft, action: 'Contabilizar' },
        { id: 'cmv', title: 'Generar Asiento de CMV', desc: 'Cálculo automático del costo de mercadería vendida.', icon: Receipt, action: 'Calcular' },
    ];

    return (
        <div className="min-h-full bg-[#f8fafc] p-8 pb-12 font-sans overflow-auto">
            {/* Header Section */}
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                            <Scale size={22} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">
                            Central Contable <span className="text-indigo-600">ERP</span>
                        </h1>
                    </div>
                    <p className="text-gray-500 max-w-xl">
                        Gestión profesional de ejercicios, plan de cuentas y reportes financieros al estilo <span className="font-bold text-gray-700">Distribuidora Gani</span>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Estado Ejercicio</span>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${ejercicio.cerrado ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                            <span className="font-bold text-gray-700 text-sm">{ejercicio.descripcion || 'Sin Ejercicio'}</span>
                        </div>
                    </div>
                    <NavLink
                        to="/contabilidad/asientos"
                        className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 no-underline"
                    >
                        <Plus size={20} />
                        Nuevo Asiento
                    </NavLink>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Total Asientos" value={stats.totalAsientos} trend={1} icon={History} color="blue" />
                <MetricCard label="Cuentas Totales" value={stats.totalCuentas || '-'} icon={Library} color="indigo" />
                <MetricCard label="Cuentas Imputables" value={stats.cuentasImputables} icon={Book} color="emerald" />
                <MetricCard label="Última Actividad" value={stats.ultimoAsiento} icon={Calendar} color="orange" />
            </div>

            {/* Main Grid - Quick Actions */}
            <div className="mb-12">
                <h2 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                    <Target size={14} /> Módulos del Sistema
                </h2>
                <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                    <QuickAction
                        title="Plan de Cuentas"
                        description="Estructura jerárquica de cuentas contables e imputaciones."
                        to="/contabilidad/plan-cuentas"
                        icon={Library}
                        color="indigo"
                    />
                    <QuickAction
                        title="Asientos Contables"
                        description="Libro diario, carga manual y centralizaciones automáticas."
                        to="/contabilidad/asientos"
                        icon={Book}
                        color="blue"
                    />
                    <QuickAction
                        title="Libro Mayor"
                        description="Consulta histórica por cuenta y análisis de movimientos."
                        to="/contabilidad/mayor"
                        icon={FileSpreadsheet}
                        color="emerald"
                    />
                    <QuickAction
                        title="Balances y Sumas"
                        description="Balance de sumas y saldos, Estados de situación patrimonial."
                        to="/contabilidad/balance"
                        icon={BarChart3}
                        color="rose"
                    />
                    <QuickAction
                        title="Ejercicios"
                        description="Gestión de periodos fiscales y cierres de ejercicio."
                        to="/contabilidad/ejercicios"
                        icon={Calendar}
                        color="orange"
                    />
                    <QuickAction
                        title="Centros de Costo"
                        description="Análisis de rentabilidad por sector o unidad de negocio."
                        to="#"
                        icon={PieChart}
                        color="violet"
                    />
                    <QuickAction
                        title="Conciliación"
                        description="Cruce de movimientos bancarios con registros contables."
                        to="/bancos/conciliacion"
                        icon={Banknote}
                        color="amber"
                    />
                    <QuickAction
                        title="Reportes Avanzados"
                        description="Exportación profesional para auditoría y presentaciones."
                        to="/contabilidad/reportes"
                        icon={Download}
                        color="slate"
                    />
                </div>
            </div>

            {/* Recent Activity / Tasks Section */}
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                    <h3 className="mb-6 text-xl font-bold text-gray-900 flex items-center justify-between">
                        Automatizaciones Tango
                        <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg uppercase">Configurables</span>
                    </h3>
                    <div className="space-y-4">
                        {automations.map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 p-4 transition-all hover:bg-gray-50 group">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-white p-2 text-indigo-500 shadow-sm ring-1 ring-gray-100">
                                        <item.icon size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAutomation(item.id)}
                                    disabled={automating !== null}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/0 px-3 py-1 rounded-lg transition-all group-hover:bg-indigo-50 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {automating === item.id ? <Loader2 size={14} className="animate-spin" /> : null}
                                    {item.action}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Análisis de Resultados</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-xs">
                        El gráfico comparativo de Ventas vs Costos estará disponible una vez que centralice el periodo actual.
                    </p>
                    <button className="text-sm font-bold text-gray-600 flex items-center gap-2 hover:text-gray-900 transition-all">
                        Ver configuración de reportes <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountingDashboard;
