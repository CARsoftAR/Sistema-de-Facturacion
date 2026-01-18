import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    ClipboardList,
    LogOut,
    Landmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, href, subItems, isOpen, activeSubItem, onToggle, standalone, permission }) => {
    const { hasPermission } = useAuth();
    const isExpanded = isOpen;
    const hasSubItems = subItems && subItems.length > 0;
    const location = useLocation();

    // Check permissions for main item
    if (permission && !hasPermission(permission)) {
        return null;
    }

    // Filter subItems based on permissions
    const visibleSubItems = subItems ? subItems.filter(item => !item.permission || hasPermission(item.permission)) : [];

    if (hasSubItems && visibleSubItems.length === 0) {
        return null;
    }

    const handleClick = (e) => {
        if (hasSubItems) {
            e.preventDefault();
            onToggle();
        } else {
            if (standalone) {
                // Dejar que el <a> funcione normalmente o usar window.location
                return;
            }
            // For internal links without subitems, NavLink handles it.
            // If we had an onClick to close mobile menu, we'd add it here.
        }
    };

    // Check if this item is active (including subitems)
    const isActive = location.pathname === href || (visibleSubItems && visibleSubItems.some(item => location.pathname === item.href));

    return (
        <div className="mb-1">
            {/* Main Item */}
            {hasSubItems ? (
                <div
                    className={`d-flex align-items-center justify-content-between px-3 py-2 rounded pointer user-select-none transition-all ${isExpanded || isActive ? 'bg-primary text-white shadow-sm' : 'text-white hover-bg-dark-subtle'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={handleClick}
                >
                    <div className="d-flex align-items-center gap-3">
                        <Icon size={20} />
                        <span className="fw-medium">{label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
            ) : standalone ? (
                <a
                    href={href}
                    className={`d-flex align-items-center justify-content-between px-3 py-2 rounded pointer user-select-none transition-all text-white hover-bg-dark-subtle text-decoration-none`}
                    style={{ transition: 'all 0.2s ease' }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <Icon size={20} />
                        <span className="fw-medium">{label}</span>
                    </div>
                </a>
            ) : (
                <NavLink
                    to={href}
                    className={({ isActive }) => `d-flex align-items-center justify-content-between px-3 py-2 rounded pointer user-select-none transition-all text-decoration-none ${isActive ? 'bg-primary text-white shadow-sm' : 'text-white hover-bg-dark-subtle'}`}
                    style={{ transition: 'all 0.2s ease' }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <Icon size={20} />
                        <span className="fw-medium">{label}</span>
                    </div>
                </NavLink>
            )}

            {/* Sub Items */}
            {hasSubItems && isExpanded && (
                <div className="ms-4 mt-1 border-start border-light border-opacity-25 ps-3">
                    <div className="d-flex flex-column gap-1">
                        {visibleSubItems.map((item, index) => (
                            standalone ? (
                                <a
                                    key={index}
                                    href={item.href}
                                    className={`d-block px-2 py-1 text-decoration-none rounded transition-all text-white text-opacity-75 hover:bg-white hover:bg-opacity-10`}
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <NavLink
                                    key={index}
                                    to={item.href}
                                    className={({ isActive }) => `d-block px-2 py-1 text-decoration-none rounded transition-all ${isActive ? 'text-white fw-bold bg-white bg-opacity-10' : 'text-white text-opacity-75 hover:bg-white hover:bg-opacity-10'}`}
                                >
                                    {item.label}
                                </NavLink>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ standalone = false }) => {
    const { hasPermission } = useAuth();
    const [openSection, setOpenSection] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hideScroll, setHideScroll] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axios.get('/api/config/obtener/');
                if (response.data) {
                    // Default to true if undefined, otherwise use the actual boolean value
                    const scrollValue = response.data.ocultar_barra_scroll ?? true;
                    console.log('Sidebar: Configuración cargada desde servidor - ocultar_barra_scroll:', scrollValue);
                    setHideScroll(scrollValue);
                }
            } catch (error) {
                console.error("Error loading sidebar config:", error);
            }
        };

        fetchConfig();

        const handleConfigUpdate = (event) => {
            // If event has detail (instant preview), use it directly
            if (event.detail && 'ocultar_barra_scroll' in event.detail) {
                const newValue = event.detail.ocultar_barra_scroll ?? true;
                console.log('Sidebar: Preview instantáneo - ocultar_barra_scroll:', newValue);
                setHideScroll(newValue);
            } else {
                // Otherwise fetch from server (after save)
                console.log('Sidebar: Recargando configuración desde servidor');
                fetchConfig();
            }
        };
        window.addEventListener('configUpdated', handleConfigUpdate);

        return () => {
            window.removeEventListener('configUpdated', handleConfigUpdate);
        };
    }, []);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <>
            {/* Mobile Trigger */}
            <button
                className="d-lg-none position-fixed top-0 start-0 m-3 btn btn-dark z-3 shadow"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ zIndex: 1050 }}
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <div
                className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-black position-fixed h-100 top-0 start-0 shadow-lg`}
                style={{
                    width: '300px',
                    zIndex: 1040,
                    transition: 'transform 0.3s ease-in-out',
                    transform: mobileOpen ? 'translateX(0)' : 'translateX(0)', // Default for desktop
                }}
            >
                {/* Logo Area */}
                <div className="d-flex align-items-center gap-3 px-2 mb-4 pb-3 border-bottom border-light border-opacity-25">
                    <div className="bg-primary rounded d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px' }}>
                        <span className="text-white fw-bold fs-5">G</span>
                    </div>
                    <span className="fs-5 fw-bold tracking-tight text-white">Distribuidora GANY</span>
                </div>

                {/* Scrollable Menu Area */}
                <div className={`flex-grow-1 overflow-auto custom-scrollbar ${hideScroll ? 'hide-scrollbar' : ''}`}>

                    {(hasPermission('reportes') || hasPermission('ventas') || hasPermission('compras') || hasPermission('productos') || hasPermission('clientes') || hasPermission('proveedores')) && (
                        <div className="mb-2 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            Comercial
                        </div>
                    )}

                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        href="/dashboard"
                        standalone={standalone}
                        permission="reportes"
                    />

                    <SidebarItem
                        icon={ClipboardList}
                        label="Operaciones"
                        isOpen={openSection === 'operaciones'}
                        onToggle={() => toggleSection('operaciones')}
                        standalone={standalone}
                        subItems={[
                            { label: 'Ventas', href: '/ventas', permission: 'ventas' },
                            { label: 'Compras', href: '/compras', permission: 'compras' },
                            { label: 'Pedidos', href: '/pedidos', permission: 'pedidos' },
                            { label: 'Presupuestos', href: '/presupuestos', permission: 'presupuestos' },
                            { label: 'Remitos', href: '/remitos', permission: 'remitos' },
                            { label: 'Notas de Crédito', href: '/notas-credito', permission: 'ventas' },
                            { label: 'Notas de Débito', href: '/notas-debito', permission: 'ventas' },
                        ]}
                    />

                    <SidebarItem
                        icon={Package}
                        label="Gestión de Productos"
                        isOpen={openSection === 'productos'}
                        onToggle={() => toggleSection('productos')}
                        standalone={standalone}
                        permission="productos"
                        subItems={[
                            { label: 'Productos', href: '/productos' },
                            { label: 'Actualizar Precios', href: '/precios/actualizar' },
                        ]}
                    />

                    <SidebarItem
                        icon={Users}
                        label="Clientes"
                        href="/clientes"
                        standalone={standalone}
                        permission="clientes"
                    />

                    <SidebarItem
                        icon={Users}
                        label="Proveedores"
                        href="/proveedores"
                        standalone={standalone}
                        permission="proveedores"
                    />

                    {(hasPermission('configuracion')) && (
                        <div className="my-3 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            Datos Varios
                        </div>
                    )}

                    <SidebarItem
                        icon={BookOpen}
                        label="Maestros"
                        isOpen={openSection === 'maestros'}
                        onToggle={() => toggleSection('maestros')}
                        standalone={standalone}
                        permission="configuracion"
                        subItems={[
                            { label: 'Marcas', href: '/marcas' },
                            { label: 'Categorías', href: '/categorias' },
                            { label: 'Rubros', href: '/rubros' },
                            { label: 'Unidades', href: '/unidades' },
                            { label: 'Localidades', href: '/localidades' },
                        ]}
                    />

                    {(hasPermission('caja') || hasPermission('bancos') || hasPermission('ctacte')) && (
                        <div className="my-3 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            Tesorería
                        </div>
                    )}

                    <SidebarItem
                        icon={Banknote}
                        label="Caja"
                        href="/caja"
                        standalone={standalone}
                        permission="caja"
                    />

                    <SidebarItem
                        icon={Landmark}
                        label="Bancos"
                        href="/bancos"
                        standalone={standalone}
                        permission="bancos"
                    />

                    <SidebarItem
                        icon={CreditCard}
                        label="Ctas. Corrientes"
                        isOpen={openSection === 'ctas-corrientes'}
                        onToggle={() => toggleSection('ctas-corrientes')}
                        standalone={standalone}
                        subItems={[
                            { label: 'De Clientes', href: '/ctas-corrientes/clientes', permission: 'ctacte' },
                            { label: 'De Proveedores', href: '/ctas-corrientes/proveedores', permission: 'ctacte' },
                        ]}
                    />

                    {(hasPermission('contabilidad')) && (
                        <div className="my-3 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            Contabilidad
                        </div>
                    )}

                    <SidebarItem
                        icon={FileText}
                        label="Contabilidad"
                        isOpen={openSection === 'contabilidad'}
                        onToggle={() => toggleSection('contabilidad')}
                        standalone={standalone}
                        permission="contabilidad"
                        subItems={[
                            { label: 'Plan de Cuentas', href: '/contabilidad/plan-cuentas/' },
                            { label: 'Ejercicios Contables', href: '/contabilidad/ejercicios/' },
                            { label: 'Asientos Manuales', href: '/contabilidad/asientos/' },
                            { label: 'Libro Mayor', href: '/contabilidad/mayor/' },
                            { label: 'Balance', href: '/contabilidad/balance/' },
                            { label: 'Conciliación Bancaria', href: '/bancos/conciliacion' },
                            { label: 'Gestión de Cheques', href: '/cheques' },
                            { label: 'Reportes', href: '/contabilidad/reportes/' },
                        ]}
                    />

                    {(hasPermission('usuarios') || hasPermission('configuracion')) && (
                        <div className="my-3 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            Sistema
                        </div>
                    )}
                    <SidebarItem
                        icon={Settings}
                        label="Configuración"
                        isOpen={openSection === 'configuracion'}
                        onToggle={() => toggleSection('configuracion')}
                        standalone={standalone}
                        subItems={[
                            { label: 'Datos de Empresa', href: '/configuracion/empresa', permission: 'configuracion' },
                            { label: 'Parámetros', href: '/parametros', permission: 'configuracion' },
                            { label: 'Usuarios', href: '/usuarios', permission: 'usuarios' },
                            { label: 'Respaldos', href: '/backups', permission: 'configuracion' },
                        ]}
                    />

                    <div className="my-3 border-top border-light border-opacity-10"></div>

                    <SidebarItem
                        icon={LogOut}
                        label="Cerrar Sesión"
                        href="/logout/"
                        standalone={true}
                    />

                </div>
            </div>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-2"
                    style={{ zIndex: 1030 }}
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}

            {/* CSS hack for responsive transform behavior not fully covered by BS utility classes */}
            <style>{`
                @media (max-width: 991.98px) {
                    .d-flex.flex-column.position-fixed {
                        transform: translateX(-100%);
                    }
                }
                
                /* Base Scrollbar (Visible by default if not hidden) */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #475569 #000000;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #000000;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #475569;
                    border-radius: 4px;
                    border: 2px solid #000000;
                }

                /* Hidden variant */
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none !important;  /* Firefox */
                }
            `}</style>
        </>
    );
};

export default Sidebar;
