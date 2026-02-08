
import React from 'react';
import {
    Banknote,
    Landmark,
    CreditCard,
    Calculator,
    ChevronRight,
    TrendingUp,
    Wallet,
    History,
    FileText,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    Zap,
    Scale,
    Activity,
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

const TesoreriaModule = () => {
    return (
        <div className="min-h-full bg-slate-50/50 p-6 md:p-10 font-sans overflow-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-200">
                            <Banknote size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-neutral-900 uppercase">
                                Centro de Tesorería <span className="text-emerald-600">ERP</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Flujo de Fondos y Valores</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NavLink
                        to="/caja"
                        className="flex h-14 items-center gap-3 rounded-2xl bg-emerald-600 px-8 font-black text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95 no-underline uppercase tracking-widest text-sm"
                    >
                        <Wallet size={20} />
                        Movimientos de Caja
                    </NavLink>
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <QuickAction
                    title="Control de Caja"
                    description="Gestión de ingresos, egresos y arqueo de caja diario en efectivo."
                    to="/caja"
                    icon={Wallet}
                    color="emerald"
                />
                <QuickAction
                    title="Cuentas Bancarias"
                    description="Administración de saldos bancarios, transferencias y movimientos."
                    to="/bancos"
                    icon={Landmark}
                    color="blue"
                />
                <QuickAction
                    title="Cartera de Cheques"
                    description="Control de cheques propios y de terceros, fechas de cobro y depósito."
                    to="/cheques"
                    icon={CreditCard}
                    color="amber"
                />
                <QuickAction
                    title="Ctas. Corrientes Clientes"
                    description="Seguimiento de saldos deudores, recibos y aplicaciones de pago."
                    to="/ctas-corrientes/clientes"
                    icon={ArrowUpRight}
                    color="indigo"
                />
                <QuickAction
                    title="Ctas. Corrientes Prov."
                    description="Gestión de deudas con proveedores, pagos y retenciones."
                    to="/ctas-corrientes/proveedores"
                    icon={ArrowDownLeft}
                    color="rose"
                />
                <QuickAction
                    title="Conciliación Bancaria"
                    description="Herramientas para punteo y cruce de extractos bancarios."
                    to="/bancos/conciliacion"
                    icon={Scale}
                    color="violet"
                />
                <QuickAction
                    title="Reportes Financieros"
                    description="Cash flow, proyección de fondos y estados de cuenta."
                    to="/reportes"
                    icon={Activity}
                    color="slate"
                />
                <QuickAction
                    title="Histórico Pagos"
                    description="Consulta de recibos y órdenes de pago emitidas."
                    to="/caja"
                    icon={History}
                    color="orange"
                />
            </div>

            {/* Bottom Section: Insights */}
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-[2.5rem] border border-neutral-100 bg-white p-10 shadow-premium flex items-center justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-neutral-900 mb-2 flex items-center gap-2 uppercase tracking-tight">
                            Cash Flow Inteligente <TrendingUp className="text-emerald-500" />
                        </h3>
                        <p className="text-neutral-500 font-medium max-w-md mb-8">
                            Proyecta tus ingresos y egresos para tomar decisiones financieras basadas en datos reales.
                        </p>
                        <div className="flex gap-4">
                            <NavLink to="/caja" className="inline-flex items-center gap-2 text-sm font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-xl transition-all no-underline">
                                Ver Caja Hoy <ChevronRight size={18} />
                            </NavLink>
                        </div>
                    </div>
                    <div className="hidden md:block opacity-20">
                        <Activity size={180} className="text-emerald-600" />
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-neutral-100 bg-neutral-900 p-10 shadow-premium text-white flex flex-col justify-center">
                    <h3 className="text-xl font-black mb-4 uppercase tracking-tight flex items-center gap-2">
                        Resumen Financiero <Clock size={20} className="text-emerald-400" />
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Saldo en Bancos</span>
                            <span className="text-2xl font-black text-emerald-400">$1.240.000</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Cheques en Cartera</span>
                            <span className="text-2xl font-black text-amber-400">$840.000</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Saldo en Caja</span>
                            <span className="text-2xl font-black text-primary-400">$45.800</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TesoreriaModule;
