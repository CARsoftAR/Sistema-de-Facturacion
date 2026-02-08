// Sidebar Component - Premium & Intelligent Redesign 2025
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Banknote,
    Wallet,
    FileText,
    BookOpen,
    Settings,
    Shield,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    CreditCard,
    Landmark,
    TrendingUp,
    TrendingDown,
    Briefcase,
    Sparkles,
    BarChart3,
    LogOut,
    Search,
    Bell,
    UserCircle,
    ClipboardList,
    Tags,
    Bookmark,
    ListFilter,
    Ruler,
    Database,
    MapPin,
    CheckCircle2,
    Ticket,
    Activity,
    HelpCircle,
    Info,
    Building2,
    Scale,
    Truck,
    Clock,
    Zap,
    Plus
} from 'lucide-react';


import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, href, subItems, isOpen, onToggle, permission, isExternal }) => {
    const location = useLocation();
    const { hasPermission } = useAuth();
    const isActive = location.pathname === href || subItems?.some(item => location.pathname === item.href);

    if (permission && !hasPermission(permission)) return null;

    if (subItems) {
        return (
            <div className="flex flex-col">
                <button
                    onClick={onToggle}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-neutral-100 text-neutral-400 group-hover:bg-white group-hover:text-neutral-900 shadow-sm'
                            }`}>
                            <Icon size={18} />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{label}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {isOpen && (
                    <div className="flex flex-col gap-1 ml-11 mt-1 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                        {subItems.map((item, index) => {
                            if (item.permission && !hasPermission(item.permission)) return null;
                            const isSubActive = location.pathname === item.href;

                            if (item.isExternal) {
                                return (
                                    <a
                                        key={index}
                                        href={item.href}
                                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${isSubActive
                                            ? 'text-primary-700 bg-primary-50'
                                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                                            }`}
                                    >
                                        {item.label}
                                    </a>
                                );
                            }

                            return (
                                <NavLink
                                    key={index}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive
                                            ? 'text-primary-700 bg-primary-50'
                                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    if (isExternal) {
        return (
            <a
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
            >
                <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 active:scale-95 ${isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'bg-neutral-100 text-neutral-400 group-hover:bg-white group-hover:text-neutral-900 shadow-sm'
                    }`}>
                    <Icon size={18} />
                </div>
                <span className="text-sm font-bold tracking-tight">{label}</span>
            </a>
        );
    }

    return (
        <NavLink
            to={href}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                }`
            }
        >
            <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 active:scale-95 ${isActive
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'bg-neutral-100 text-neutral-400 group-hover:bg-white group-hover:text-neutral-900 shadow-sm'
                }`}>
                <Icon size={18} />
            </div>
            <span className="text-sm font-bold tracking-tight">{label}</span>
        </NavLink>
    );
};

const Sidebar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openSection, setOpenSection] = useState(null);
    const [empresa, setEmpresa] = useState({ nombre: 'Sistema', logo: null });
    const { user } = useAuth();
    const [hideScrollbar, setHideScrollbar] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axios.get('/api/config/obtener/');
                if (response.data) {
                    setEmpresa({
                        nombre: response.data.nombre || 'Sistema',
                        logo: response.data.logo
                    });
                    setHideScrollbar(response.data.ocultar_barra_scroll ?? true);
                }
            } catch (error) {
                console.error("Error loading config:", error);
            }
        };
        fetchConfig();
    }, []);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-2xl shadow-premium border border-neutral-100"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Main Sidebar */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-neutral-100 flex flex-col transition-all duration-500 ease-in-out transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>

                {/* Header Section: Branding */}
                <div className="p-6">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/20 overflow-hidden">
                            {empresa.logo ? (
                                <img src={empresa.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                            ) : (
                                <Sparkles size={20} className="text-white" />
                            )}
                        </div>
                        <div className="flex flex-column">
                            <span className="text-sm font-bold text-neutral-900 tracking-tight text-truncate w-[160px]">{empresa.nombre}</span>
                            <span className="text-[10px] text-primary-600 font-mono tracking-widest uppercase">Intelligent Pro</span>
                        </div>
                    </div>
                </div>

                {/* Main Menu Sections */}
                <div className={`flex-1 overflow-y-auto px-2 pb-6 ${hideScrollbar ? 'no-scrollbar' : 'scrollbar-thin'}`}>
                    <div className="space-y-6">

                        {/* Section: Intelligence */}
                        <div className="space-y-1">
                            <span className="px-4 text-[12px] font-black text-neutral-400 uppercase tracking-[0.15em]">Inteligencia</span>
                            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" permission="reportes" />
                            <SidebarItem icon={BarChart3} label="Reportes" href="/reportes" permission="reportes" />
                        </div>

                        {/* Section: Operaciones */}
                        <div className="space-y-1">
                            <span className="px-4 text-[12px] font-black text-neutral-400 uppercase tracking-[0.15em]">Operaciones</span>
                            <SidebarItem icon={ShoppingCart} label="Central Ventas" href="/ventas" permission="ventas" />
                            <SidebarItem icon={Truck} label="Gestión Compras" href="/compras" permission="compras" />

                            <SidebarItem icon={Package} label="Central Stock" href="/stock" permission="productos" />

                            <SidebarItem
                                icon={LayoutDashboard}
                                label="Operativos"
                                isOpen={openSection === 'sub-operaciones'}
                                onToggle={() => toggleSection('sub-operaciones')}
                                subItems={[
                                    { label: 'Stock General', href: '/productos', permission: 'productos' },
                                    { label: 'Ajustes Manuales', href: '/ajuste-stock', permission: 'productos' },
                                    { label: 'Movimientos', href: '/movimientos-stock', permission: 'productos' },
                                    { label: 'Precios', href: '/precios/actualizar', permission: 'productos' },
                                ]}
                            />

                            <SidebarItem
                                icon={Users}
                                label="Entidades"
                                isOpen={openSection === 'entidades'}
                                onToggle={() => toggleSection('entidades')}
                                subItems={[
                                    { label: 'Clientes', href: '/clientes', permission: 'clientes' },
                                    { label: 'Proveedores', href: '/proveedores', permission: 'proveedores' },
                                ]}
                            />
                        </div>

                        {/* Section: Tesorería */}
                        <div className="space-y-1">
                            <span className="px-4 text-[12px] font-black text-neutral-400 uppercase tracking-[0.15em]">Finanzas</span>
                            <SidebarItem icon={Banknote} label="Centro Tesorería" href="/tesoreria" permission="caja" />
                            <SidebarItem
                                icon={Landmark}
                                label="Fondos y Bancos"
                                isOpen={openSection === 'bancos'}
                                onToggle={() => toggleSection('bancos')}
                                permission="bancos"
                                subItems={[
                                    { label: 'Movimientos Caja', href: '/caja' },
                                    { label: 'Cuentas Bancarias', href: '/bancos' },
                                    { label: 'Conciliación', href: '/bancos/conciliacion' },
                                    { label: 'Manejo Cheques', href: '/cheques' },
                                ]}
                            />

                            <SidebarItem
                                icon={CreditCard}
                                label="Saldos Ctes."
                                isOpen={openSection === 'ctas-corrientes'}
                                onToggle={() => toggleSection('ctas-corrientes')}
                                subItems={[
                                    { label: 'Clientes', href: '/ctas-corrientes/clientes', permission: 'ctacte' },
                                    { label: 'Proveedores', href: '/ctas-corrientes/proveedores', permission: 'ctacte' },
                                ]}
                            />
                        </div>

                        {/* Section: Contabilidad */}
                        <div className="space-y-1">
                            <span className="px-4 text-[12px] font-black text-neutral-400 uppercase tracking-[0.15em]">Gestión Profesional</span>
                            <SidebarItem icon={Scale} label="Central Contable" href="/contabilidad" permission="contabilidad" />
                            <SidebarItem
                                icon={FileText}
                                label="Módulos Contables"
                                isOpen={openSection === 'contabilidad'}
                                onToggle={() => toggleSection('contabilidad')}
                                permission="contabilidad"
                                subItems={[
                                    { label: 'Plan de Cuentas', href: '/contabilidad/plan-cuentas' },
                                    { label: 'Asientos', href: '/contabilidad/asientos' },
                                    { label: 'Libro Mayor', href: '/contabilidad/mayor' },
                                    { label: 'Balance', href: '/contabilidad/balance' },
                                    { label: 'Ejercicios', href: '/contabilidad/ejercicios' },
                                    { label: 'Reportes Contables', href: '/contabilidad/reportes' },
                                ]}
                            />
                        </div>

                        {/* Section: Administración */}
                        <div className="space-y-1">
                            <span className="px-4 text-[12px] font-black text-neutral-400 uppercase tracking-[0.15em]">Administración</span>
                            <SidebarItem icon={Settings} label="Central Maestro" href="/maestro" />
                            <SidebarItem icon={Building2} label="Mi Empresa" href="/configuracion/empresa" permission="configuracion" />
                            <SidebarItem icon={Shield} label="Seguridad/Auditoría" href="/auditoria" permission="auditoria" />
                            <SidebarItem icon={Activity} label="Estado Sistema" href="/estado" isExternal={true} />
                        </div>

                        {/* Section: Ayuda */}
                        <div className="space-y-1">
                            <span className="px-4 text-[12px] font-black text-neutral-400 uppercase tracking-[0.15em]">Soporte</span>
                            <SidebarItem icon={HelpCircle} label="Manual de Usuario" href="/manual" />

                        </div>


                    </div>
                </div>

                {/* Footer Section: User Profile & Logout */}
                <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm border border-neutral-100 group transition-all hover:shadow-premium-md">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center border border-primary-200">
                            <span className="text-primary-700 font-bold text-sm tracking-tighter">
                                {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                            </span>
                        </div>
                        <div className="flex flex-column flex-1 min-w-0">
                            <span className="text-sm font-bold text-neutral-900 truncate tracking-tight">{user?.username}</span>
                            <span className="text-[10px] text-neutral-400 font-medium">Administrador</span>
                        </div>
                        <a href="/logout/" className="p-2 text-neutral-400 hover:text-error-600 transition-colors">
                            <LogOut size={18} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Backdrop Mobile */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setMobileOpen(false)} />
            )}
        </>
    );
};

export default Sidebar;
