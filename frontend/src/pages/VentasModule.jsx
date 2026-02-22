
import React from 'react';
import {
    ShoppingCart,
    Users,
    FileText,
    ClipboardList,
    Calculator,
    ChevronRight,
    TrendingUp,
    Plus,
    Receipt,
    Truck,
    Clock,
    Zap,
    Target,
    BarChart3,
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

            <div className="mt-auto pt-6 flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest text-${color}-600 bg-${color}-50 px-3 py-1 rounded-full`}>
                    Acceder Módulo
                </span>
            </div>
        </div>
    </NavLink>
);

const VentasModule = () => {
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch today's stats from the dashboard API
                const today = new Date().toISOString().split('T')[0];
                const response = await fetch(`/api/dashboard/stats/?fecha_start=${today}&fecha_end=${today}`);
                if (!response.ok) throw new Error('Error al cargar estadísticas');
                const data = await response.json();
                setStats(data.kpi);
            } catch (err) {
                console.error("Error fetching Ventas stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="min-h-full bg-slate-50/50 p-6 md:p-10 font-sans overflow-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-200">
                            <ShoppingCart size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-neutral-900 uppercase">
                                Ventas & Facturación
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Facturación en Tiempo Real</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NavLink
                        to="/ventas/nuevo"
                        className="flex h-14 items-center gap-3 rounded-2xl bg-primary-600 px-8 font-black text-white shadow-xl shadow-primary-200 transition-all hover:bg-primary-700 active:scale-95 no-underline uppercase tracking-widest text-sm"
                    >
                        <Zap size={20} fill="currentColor" />
                        Nueva Venta (F2)
                    </NavLink>
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <QuickAction
                    title="Terminal de Ventas"
                    description="Punto de venta optimizado para carga rápida de artículos y facturación inmediata."
                    to="/ventas/nuevo"
                    icon={Zap}
                    color="primary"
                />
                <QuickAction
                    title="Historial de Ventas"
                    description="Consulta, anulación e impresión de todos los comprobantes emitidos."
                    to="/ventas/lista"
                    icon={ClipboardList}
                    color="blue"
                />
                {/* 
                <QuickAction
                    title="Gestión de Clientes"
                    description="Administra la base de datos de clientes, saldos y condiciones fiscales."
                    to="/clientes"
                    icon={Users}
                    color="indigo"
                /> 
                */}
                <QuickAction
                    title="Pedidos de Clientes"
                    description="Gestión de órdenes de pedido pendientes de facturación o entrega."
                    to="/pedidos"
                    icon={FileText}
                    color="amber"
                />
                <QuickAction
                    title="Notas de Crédito"
                    description="Emisión y seguimiento de devoluciones y créditos a clientes."
                    to="/notas-credito"
                    icon={Receipt}
                    color="rose"
                />
                <QuickAction
                    title="Notas de Débito"
                    description="Ajustes de facturación por cargos adicionales o errores."
                    to="/notas-debito"
                    icon={Calculator}
                    color="orange"
                />
                <QuickAction
                    title="Presupuestos"
                    description="Cotizaciones y presupuestos formales para clientes."
                    to="/presupuestos"
                    icon={Target}
                    color="yellow"
                />
                <QuickAction
                    title="Remitos de Entrega"
                    description="Documentos de traslado de mercadería sin valor fiscal."
                    to="/remitos"
                    icon={Truck}
                    color="emerald"
                />
            </div>

            {/* Bottom Section: Insights */}
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-[2.5rem] border border-neutral-100 bg-white p-10 shadow-premium flex items-center justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-neutral-900 mb-2 flex items-center gap-2 uppercase tracking-tight">
                            Analítica de Ventas <TrendingUp className="text-primary-500" />
                        </h3>
                        <p className="text-neutral-500 font-medium max-w-md mb-8">
                            Visualiza tendencias, productos más vendidos y rendimiento de vendedores en tiempo real.
                        </p>
                        <NavLink to="/reportes" className="inline-flex items-center gap-2 text-sm font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 px-6 py-3 rounded-xl transition-all no-underline">
                            Ver Reportes Premium <ChevronRight size={18} />
                        </NavLink>
                    </div>
                    <div className="hidden md:block opacity-20">
                        <BarChart3 size={180} className="text-primary-600" />
                    </div>
                    {/* Decorative bubble */}
                    <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary-50 blur-3xl" />
                </div>

                <div className="rounded-[2.5rem] border border-neutral-100 bg-white p-10 shadow-premium text-neutral-900 flex flex-col justify-center">
                    <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
                        Estado Actual <Clock size={20} className="text-primary-500" />
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <span className="text-neutral-600 font-bold text-[12px] uppercase tracking-widest">Pedidos Hoy</span>
                            <span className="text-2xl font-black">
                                {loading ? '...' : (stats?.cantidad_pedidos_hoy || 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <span className="text-neutral-600 font-bold text-[12px] uppercase tracking-widest">Facturación Hoy</span>
                            <span className="text-2xl font-black text-emerald-600">
                                {loading ? '...' : formatCurrency(stats?.ventas_hoy || 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-600 font-bold text-[12px] uppercase tracking-widest">Ctes. Activos</span>
                            <span className="text-2xl font-black text-primary-600">
                                {loading ? '...' : (stats?.clientes_activos || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VentasModule;
