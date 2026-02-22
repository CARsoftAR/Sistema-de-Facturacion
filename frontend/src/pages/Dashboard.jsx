// Dashboard Component - Intelligent Redesign 2025
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShoppingCart,
    Wallet,
    Clock,
    AlertTriangle,
    TrendingUp,
    Package,
    Truck,
    PlusCircle,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    Sparkles,
    Zap,
    Target,
    Activity,
    LayoutDashboard
} from 'lucide-react';
import { cn } from '../utils/cn';
import { formatNumber } from '../utils/formats';
import { PremiumAreaChart } from '../components/premium';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('insights');

    // Date Range State (Default: Current Month)
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    fecha_start: dateRange.start,
                    fecha_end: dateRange.end
                });
                const response = await fetch(`/api/dashboard/stats/?${params}`);
                if (!response.ok) throw new Error('Error al cargar datos');
                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error("Dashboard Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dateRange]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const setToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setDateRange({ start: today, end: today });
    };

    const setYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        setDateRange({ start: yesterdayStr, end: yesterdayStr });
    };

    const getPeriodLabel = () => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dateRange.start === today && dateRange.end === today) return 'de Hoy';
        if (dateRange.start === yesterdayStr && dateRange.end === yesterdayStr) return 'de Ayer';
        return 'del Período';
    };

    if (loading && !stats) return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    const { kpi, actividad_reciente, top_productos, rentabilidad, stock_bajo_list } = stats;

    return (
        <div className={cn(
            "p-4 md:p-8 w-full mx-auto space-y-8 animate-in fade-in duration-700 overflow-x-hidden transition-opacity duration-300",
            loading ? "opacity-60 pointer-events-none" : "opacity-100"
        )}>


            {/* Header: Bienvenida e Inteligencia */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2.5 rounded-2xl text-white shadow-lg shadow-primary-600/20">
                            <LayoutDashboard size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Panel de Control
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Analítica inteligente y resumen operativo.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    {/* Quick Selectors */}
                    <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                        <button
                            onClick={setToday}
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                                (dateRange.start === new Date().toISOString().split('T')[0] && dateRange.end === new Date().toISOString().split('T')[0])
                                    ? "bg-white text-primary-600 shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-800"
                            )}
                        >
                            HOY
                        </button>
                        <button
                            onClick={setYesterday}
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                                (dateRange.start === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0] && dateRange.end === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0])
                                    ? "bg-white text-primary-600 shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-800"
                            )}
                        >
                            AYER
                        </button>
                    </div>

                    {/* Period Selector */}
                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm w-full sm:w-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-100">
                            <Clock size={14} className="text-neutral-400" />
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Período</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                name="start"
                                value={dateRange.start}
                                onChange={handleDateChange}
                                className="text-xs font-bold text-neutral-700 bg-transparent outline-none cursor-pointer hover:text-primary-600 transition-colors"
                            />
                            <span className="text-neutral-300">/</span>
                            <input
                                type="date"
                                name="end"
                                value={dateRange.end}
                                onChange={handleDateChange}
                                className="text-xs font-bold text-neutral-700 bg-transparent outline-none cursor-pointer hover:text-primary-600 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 shadow-inner-subtle w-full sm:w-auto justify-center">
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex-1 sm:flex-none", activeTab === 'insights' ? "bg-white text-primary-600 shadow-premium-sm" : "text-neutral-500 hover:text-neutral-800")}
                        >
                            INSIGHTS
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex-1 sm:flex-none", activeTab === 'activity' ? "bg-white text-primary-600 shadow-premium-sm" : "text-neutral-500 hover:text-neutral-800")}
                        >
                            ACTIVIDAD
                        </button>
                    </div>
                </div>
            </div>

            {/* Top KPI Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

                {/* Ventas Card */}
                <div className="bg-white p-6 rounded-3xl shadow-premium border border-neutral-100 group hover:shadow-premium-lg transition-all border-l-4 border-l-primary-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                            <ShoppingCart size={24} />
                        </div>
                        <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-full">{rentabilidad.cantidad_ventas || 0} op.</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Ventas {getPeriodLabel()}</p>
                        <h3 className="text-3xl font-black text-neutral-900">${formatNumber(rentabilidad.ventas)}</h3>
                    </div>
                </div>

                {/* Compras Card */}
                <div className="bg-white p-6 rounded-3xl shadow-premium border border-neutral-100 group hover:shadow-premium-lg transition-all border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Truck size={24} />
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-indigo-600 block">Movimiento Real</span>
                            <span className="text-sm font-bold text-neutral-900">
                                {kpi.cantidad_compras || 0} facturas
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Compras {getPeriodLabel()}</p>
                        <h3 className="text-3xl font-black text-neutral-900">${formatNumber(kpi.total_compras || 0)}</h3>
                    </div>
                </div>

                {/* Caja Card */}
                <div className="bg-white p-6 rounded-3xl shadow-premium border border-neutral-100 group hover:shadow-premium-lg transition-all border-l-4 border-l-success-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-success-50 rounded-2xl text-success-600">
                            <Wallet size={24} />
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-success-600 block">Ingresos Hoy</span>
                            <span className="text-sm font-bold text-neutral-900">${formatNumber(kpi.ingresos_caja_hoy || 0)}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Caja Disponible</p>
                        <h3 className="text-3xl font-black text-neutral-900">${formatNumber(kpi.caja_hoy)}</h3>
                    </div>
                </div>

                {/* Pendientes Card */}
                <div
                    onClick={() => navigate('/pedidos?estado=PENDIENTE,PREPARACION')}
                    className="bg-white p-6 rounded-3xl shadow-premium border border-neutral-100 group hover:shadow-premium-lg transition-all border-l-4 border-l-warning-500 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-warning-50 rounded-2xl text-warning-600">
                            <Clock size={24} />
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-warning-600 block">Por cobrar</span>
                            <span className="text-sm font-bold text-neutral-900">${formatNumber(kpi.monto_pedidos_pendientes || 0)}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Pedidos Pendientes</p>
                        <h3 className="text-3xl font-black text-neutral-900">{kpi.pedidos_pendientes}</h3>
                    </div>
                </div>

                {/* Stock Alerta Card */}
                <div
                    onClick={() => navigate('/productos?stock=bajo')}
                    className="bg-white p-6 rounded-3xl shadow-premium border border-neutral-100 group hover:shadow-premium-lg transition-all border-l-4 border-l-error-500 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-error-50 rounded-2xl text-error-600">
                            <AlertTriangle size={24} />
                        </div>
                        <span className="text-[10px] font-bold bg-error-100 text-error-700 px-2 py-1 rounded-full">URGENTE</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Stock bajo Mínimo</p>
                        <h3 className="text-3xl font-black text-neutral-900">{kpi.stock_bajo} <span className="text-sm font-normal text-neutral-400 ml-1">prod.</span></h3>
                    </div>
                </div>
            </div>

            {/* Main Insights Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 🎯 Intelligent Performance Graph (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 text-neutral-900 shadow-premium border border-neutral-100 relative">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    Estadísticas de Ventas <Activity size={20} className="text-primary-500" />
                                </h3>
                                <p className="text-neutral-500 text-sm font-medium">Historial de facturación de los últimos 6 meses</p>
                            </div>
                        </div>

                        {/* Area de Visualización Inteligente */}
                        <div className="flex-grow flex items-end pt-8">
                            <PremiumAreaChart
                                data={stats.chart?.data || []}
                                costData={stats.chart?.datasets?.[1]?.data || []}
                                labels={stats.chart?.labels || []}
                                height={220}
                            />
                        </div>
                    </div>
                </div>

                {/* 🏆 Top de Productos (1/3 width) */}
                <div className="bg-white rounded-[2rem] p-8 shadow-premium border border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                        Productos Líderes <Target className="text-primary-500" />
                    </h3>
                    <div className="space-y-6">
                        {top_productos.slice(0, 5).map((prod, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                        #{i + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-neutral-800 line-clamp-1">{prod.producto}</span>
                                        <div className="w-32 h-1 bg-neutral-100 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${100 - (i * 15)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm font-black text-neutral-900">{prod.total} <span className="text-[10px] text-neutral-400 font-medium">u.</span></span>
                            </div>
                        ))}
                    </div>
                    <Link to="/reportes" className="block w-full text-center mt-8 py-3 text-xs font-bold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors uppercase tracking-widest">
                        Analítica Completa
                    </Link>
                </div>
            </div>

            {/* Content Bottom Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Monitor de Actividad Reciente */}
                <div className="bg-white rounded-[2rem] p-8 shadow-premium border border-neutral-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            Flujo de Actividad <Activity className="text-primary-500" />
                        </h3>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">TIEMPO REAL</span>
                    </div>
                    <div className="space-y-4">
                        {actividad_reciente.slice(0, 6).map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 hover:bg-neutral-50 rounded-2xl transition-colors border border-transparent hover:border-neutral-100">
                                <div className={cn("p-2 rounded-xl mt-1",
                                    item.color === 'primary' ? "bg-primary-50 text-primary-600" :
                                        item.color === 'success' ? "bg-success-50 text-success-600" : "bg-neutral-100 text-neutral-600"
                                )}>
                                    {item.tipo === 'VENTA' ? <ShoppingCart size={16} /> : <FileText size={16} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-neutral-800">{item.texto}</span>
                                        <span className="text-[10px] font-bold text-neutral-600">{item.fecha.split(' ')[1]}</span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 mt-1">{item.subtexto}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alertas Inteligentes (Stock Crítico) */}
                <div className="bg-white rounded-[2rem] p-8 shadow-premium border border-neutral-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            Alertas de Inventario <AlertTriangle className="text-error-500" />
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {stock_bajo_list && stock_bajo_list.length > 0 ? (
                            stock_bajo_list.slice(0, 6).map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-error-50/50 rounded-2xl border border-error-100 group transition-all hover:bg-error-50">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-neutral-900">{p.nombre}</span>
                                        <span className="text-[10px] text-error-600 font-bold uppercase tracking-widest mt-1">Stock: {p.stock} (Mín: {p.minimo})</span>
                                    </div>
                                    <Link to={`/ajuste-stock?id=${p.id}`} className="p-2 bg-error-100 text-error-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                        <PlusCircle size={18} />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <Package size={40} className="mx-auto text-neutral-200 mb-4" />
                                <p className="text-sm text-neutral-500">Perfecto. No hay alertas de stock bajo.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
