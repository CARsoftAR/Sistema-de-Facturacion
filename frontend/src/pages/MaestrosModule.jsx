
import React from 'react';
import {
    Tag,
    Layers,
    Bookmark,
    Ruler,
    MapPin,
    ChevronRight,
    Search,
    Database,
    Clock,
    Zap,
    Scale,
    Activity,
    Box,
    Globe,
    Building2,
    Settings,
    Shield,
    Users,
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

const MaestrosModule = () => {
    return (
        <div className="min-h-full bg-slate-50/50 p-6 md:p-10 font-sans overflow-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                            <Database size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-neutral-900 uppercase">
                                Archivos Maestros
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Configuración Base del Sistema</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-sections Titles */}
            <div className="space-y-12">
                {/* Clasificación de Productos */}
                <section>
                    <h2 className="mb-6 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-neutral-400">
                        <Tag size={16} /> Clasificación de Productos
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <QuickAction title="Marcas" description="Define los fabricantes e identidades comerciales." to="/marcas" icon={Bookmark} color="amber" />
                        <QuickAction title="Rubros" description="Categorización principal para organización de catálogos." to="/rubros" icon={Layers} color="indigo" />
                        <QuickAction title="Categorías" description="Niveles secundarios de clasificación jerárquica." to="/categorias" icon={Tag} color="purple" />
                        <QuickAction title="Unidades" description="Unidades de medida (Bultos, Kg, Unidades, etc)." to="/unidades" icon={Ruler} color="emerald" />
                    </div>
                </section>

                {/* Localización y Geografía */}
                <section>
                    <h2 className="mb-6 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-neutral-400">
                        <Globe size={16} /> Localización y Geografía
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <QuickAction title="Localidades" description="Base de datos de ciudades y códigos postales." to="/localidades" icon={MapPin} color="rose" />
                        <QuickAction title="Sede Central" description="Datos de la empresa, sucursales y puntos de venta." to="/configuracion/empresa" icon={Building2} color="blue" />
                    </div>
                </section>

                {/* Configuración de Sistema */}
                <section>
                    <h2 className="mb-6 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-neutral-400">
                        <Settings size={16} /> Configuración de Sistema
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <QuickAction title="Parámetros" description="Parámetros globales y comportamiento del sistema." to="/parametros" icon={Settings} color="primary" />
                        <QuickAction title="Usuarios" description="Control de acceso y perfiles de usuario." to="/usuarios" icon={Users} color="slate" />
                        <QuickAction title="Auditoría" description="Registro histórico de acciones por usuario." to="/auditoria" icon={Shield} color="error" />
                        <QuickAction title="Estado" description="Monitoreo del servicio y latencia del servidor." to="/estado" icon={Activity} color="indigo" />
                        <QuickAction title="Copias Seguras" description="Gestión de backups y restauración de base de datos." to="/backups" icon={Database} color="emerald" />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MaestrosModule;
