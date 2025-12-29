import React, { useState } from 'react';
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
    CreditCard
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, href, subItems, isOpen, activeSubItem, onToggle }) => {
    const hasSubItems = subItems && subItems.length > 0;
    // If we have subItems, we use the passed isOpen state, otherwise false
    const isExpanded = isOpen;

    return (
        <div className="mb-1">
            <div
                className={`flex items-center justify-between px-4 py-2 text-gray-300 hover:text-white hover:bg-sidebar-hover cursor-pointer transition-colors rounded-lg ${isExpanded ? 'bg-sidebar-hover text-white' : ''}`}
                onClick={() => hasSubItems ? onToggle() : (window.location.href = href)}
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="font-medium text-sm">{label}</span>
                </div>
                {hasSubItems && (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                )}
            </div>

            {hasSubItems && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                    {subItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar = () => {
    const [openSection, setOpenSection] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <>
            {/* Mobile Trigger */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar-bg text-white rounded-md"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar-bg border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Logo Area */}
                <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-800">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">CARSOFT</span>
                </div>

                {/* Scrollable Menu Area */}
                <div className="h-[calc(100vh-4rem)] overflow-y-auto py-6 px-3 custom-scrollbar">

                    <div className="mb-6 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Comercial
                    </div>

                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        href="/dashboard"
                    />

                    <SidebarItem
                        icon={ShoppingCart}
                        label="Ventas"
                        isOpen={openSection === 'ventas'}
                        onToggle={() => toggleSection('ventas')}
                        subItems={[
                            { label: 'Nueva Venta', href: '/ventas/nuevo' },
                            { label: 'Listado de Ventas', href: '/ventas' },
                            { label: 'Pedidos', href: '/pedidos' },
                            { label: 'Remitos', href: '/remitos' },
                            { label: 'Notas de Crédito', href: '/notas-credito' },
                        ]}
                    />

                    <SidebarItem
                        icon={Package}
                        label="Productos"
                        isOpen={openSection === 'productos'}
                        onToggle={() => toggleSection('productos')}
                        subItems={[
                            { label: 'Catálogo', href: '/productos' },
                            { label: 'Actualizar Precios', href: '/actualizar-precios' },
                        ]}
                    />

                    <SidebarItem
                        icon={Users}
                        label="Clientes"
                        href="/clientes"
                    />

                    <div className="mt-8 mb-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tesorería
                    </div>

                    <SidebarItem
                        icon={Banknote}
                        label="Caja"
                        href="/caja"
                    />

                    <SidebarItem
                        icon={CreditCard}
                        label="Cheques"
                        href="/cheques"
                    />

                    <SidebarItem
                        icon={FileText}
                        label="Ctas. Corrientes"
                        isOpen={openSection === 'ctacte'}
                        onToggle={() => toggleSection('ctacte')}
                        subItems={[
                            { label: 'Clientes', href: '/cc/clientes' },
                            { label: 'Proveedores', href: '/cc/proveedores' },
                        ]}
                    />

                    <div className="mt-8 mb-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Contabilidad
                    </div>

                    <SidebarItem
                        icon={BookOpen}
                        label="Contabilidad"
                        href="/contabilidad"
                    />

                    <div className="mt-8 mb-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Sistema
                    </div>

                    <SidebarItem
                        icon={Settings}
                        label="Configuración"
                        isOpen={openSection === 'config'}
                        onToggle={() => toggleSection('config')}
                        subItems={[
                            { label: 'General', href: '/configuracion' },
                            { label: 'Usuarios', href: '/usuarios' },
                            { label: 'Backups', href: '/backups' },
                        ]}
                    />

                </div>
            </div>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
