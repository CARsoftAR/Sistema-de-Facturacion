
import React from 'react';
import {
    Package,
    Layers,
    Bookmark,
    Ruler,
    Activity,
    ChevronRight,
    Search,
    Database,
    Clock,
    Zap,
    Scale,
    TrendingUp,
    Box,
    Globe,
    Building2,
    Settings,
    Shield,
    Archive,
    History as HistoryIcon,
    RefreshCcw,
    Truck,
    Plus,
    ChevronDown
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const QuickAction = ({ icon: Icon, title, description, to, color = "primary" }) => (
    <NavLink
        to={to}
        className="group relative overflow-hidden rounded-[2rem] p-8 transition-all hover:scale-[1.02] active:scale-[0.98] h-full no-underline flex flex-col"
    >
        {/* Background / Backdrop */}
        <div className={`absolute inset-0 bg-white opacity-90 transition-all group-hover:opacity-100 shadow-premium border border-neutral-100 group-hover:border-${color}-200 group-hover:shadow-premium-xl transition-all duration-300`} />

        {/* Decorative Element */}
        <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-${color}-500/5 blur-3xl transition-all group-hover:bg-${color}-500/10 group-hover:scale-150 transition-all duration-500`} />

        <div className="relative flex flex-col h-full z-10">
            <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-${color}-50 text-${color}-600 ring-1 ring-${color}-100 transition-all duration-500 group-hover:scale-110 group-hover:bg-${color}-100 group-hover:rotate-6 shadow-sm`}>
                <Icon size={32} strokeWidth={2.2} />
            </div>

            <h3 className="mb-2 text-xl font-black text-neutral-900 group-hover:text-neutral-950 flex items-center gap-2 tracking-tight uppercase">
                {title}
                <ChevronRight size={20} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </h3>
            <p className="text-sm font-medium leading-relaxed text-neutral-500 group-hover:text-neutral-600">
                {description}
            </p>
        </div>
    </NavLink>
);

const StockModule = () => {
    const [stats, setStats] = React.useState({
        total_productos: 0,
        valorizacion_total: 0,
        cantidad_stock_bajo: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/estadisticas/stock/');
                const data = await response.json();
                if (data.ok) {
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching stock stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="min-h-full bg-slate-50/50 p-6 md:p-10 font-sans overflow-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-200">
                            <Package size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-neutral-900 uppercase">
                                Gestión de Stock
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Gestión de Inventario y Almacén</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NavLink
                        to="/productos/nuevo"
                        className="flex h-14 items-center gap-3 rounded-2xl bg-orange-600 px-8 font-black text-white shadow-xl shadow-orange-200 transition-all hover:bg-orange-700 active:scale-95 no-underline uppercase tracking-widest text-sm"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Alta de Producto
                    </NavLink>
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <QuickAction
                    title="Catálogo General"
                    description="Visualización maestra de todos los artículos, precios y existencias."
                    to="/productos"
                    icon={Archive}
                    color="orange"
                />
                <QuickAction
                    title="Ajustes de Stock"
                    description="Carga de inventario físico, correcciones de stock y mermas."
                    to="/ajuste-stock"
                    icon={RefreshCcw}
                    color="blue"
                />
                <QuickAction
                    title="Movimientos"
                    description="Trazabilidad histórica de entradas, salidas y transferencias."
                    to="/movimientos-stock"
                    icon={HistoryIcon}
                    color="indigo"
                />
                <QuickAction
                    title="Actualizar Precios"
                    description="Dolarización, márgenes de utilidad y cambios masivos de precios."
                    to="/precios/actualizar"
                    icon={TrendingUp}
                    color="success"
                />
                <QuickAction
                    title="Stock Crítico"
                    description="Monitoreo de productos bajo el stock mínimo de seguridad."
                    to="/productos?stock=bajo"
                    icon={Activity}
                    color="error"
                />
            </div>

            {/* Bottom Section: Insights */}
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-[2.5rem] border border-neutral-100 bg-white p-10 shadow-premium flex items-center justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-neutral-900 mb-2 flex items-center gap-2 uppercase tracking-tight">
                            Valorización de Inventario <Scale className="text-orange-500" />
                        </h3>
                        <p className="text-neutral-500 font-medium max-w-md mb-8">
                            Conoce el valor real de tu almacén a precio de costo y precio de venta actualizados.
                        </p>
                        <NavLink to="/productos" className="inline-flex items-center gap-2 text-sm font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest bg-orange-50 px-6 py-3 rounded-xl transition-all no-underline">
                            Ver Catálogo Completo <ChevronRight size={18} />
                        </NavLink>
                    </div>
                    <div className="hidden md:block opacity-20">
                        <Box size={180} className="text-orange-600" />
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-neutral-100 bg-neutral-900 p-10 shadow-premium text-white flex flex-col justify-center">
                    <h3 className="text-xl font-black mb-4 uppercase tracking-tight flex items-center gap-2">
                        Resumen de Almacén <Clock size={20} className="text-orange-400" />
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Items Totales</span>
                            <span className="text-2xl font-black">{loading ? '...' : stats.total_productos}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Valor de Stock (Costo)</span>
                            <span className="text-2xl font-black text-orange-400">{loading ? '...' : formatCurrency(stats.valorizacion_total)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Stock Crítico</span>
                            <span className="text-2xl font-black text-error-400">{loading ? '...' : stats.cantidad_stock_bajo}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockModule;
