import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    LogOut
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, href, subItems, isOpen, activeSubItem, onToggle, standalone }) => {
    const isExpanded = isOpen;
    const hasSubItems = subItems && subItems.length > 0;
    const location = useLocation();

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
    const isActive = location.pathname === href || (subItems && subItems.some(item => location.pathname === item.href));

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
                        <span className="fw-medium small">{label}</span>
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
                        <span className="fw-medium small">{label}</span>
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
                        <span className="fw-medium small">{label}</span>
                    </div>
                </NavLink>
            )}

            {/* Sub Items */}
            {hasSubItems && isExpanded && (
                <div className="ms-4 mt-1 border-start border-light border-opacity-25 ps-3">
                    <div className="d-flex flex-column gap-1">
                        {subItems.map((item, index) => (
                            standalone ? (
                                <a
                                    key={index}
                                    href={item.href}
                                    className={`d-block px-2 py-1 small text-decoration-none rounded transition-all text-white text-opacity-75 hover:bg-white hover:bg-opacity-10`}
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <NavLink
                                    key={index}
                                    to={item.href}
                                    className={({ isActive }) => `d-block px-2 py-1 small text-decoration-none rounded transition-all ${isActive ? 'text-white fw-bold bg-white bg-opacity-10' : 'text-white text-opacity-75 hover:bg-white hover:bg-opacity-10'}`}
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
    const [openSection, setOpenSection] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

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
                    width: '260px',
                    zIndex: 1040,
                    transition: 'transform 0.3s ease-in-out',
                    transform: mobileOpen ? 'translateX(0)' : 'translateX(0)', // Default for desktop
                }}
            >
                {/* Logo Area */}
                <div className="d-flex align-items-center gap-3 px-2 mb-4 pb-3 border-bottom border-light border-opacity-25">
                    <div className="bg-primary rounded d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px' }}>
                        <span className="text-white fw-bold fs-5">C</span>
                    </div>
                    <span className="fs-4 fw-bold tracking-tight text-white">CARSOFT</span>
                </div>

                {/* Scrollable Menu Area */}
                <div className="flex-grow-1 overflow-auto custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #000000' }}>

                    <div className="mb-2 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Comercial
                    </div>

                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        href="/dashboard"
                        standalone={standalone}
                    />

                    <SidebarItem
                        icon={ClipboardList}
                        label="Operaciones"
                        isOpen={openSection === 'operaciones'}
                        onToggle={() => toggleSection('operaciones')}
                        standalone={standalone}
                        subItems={[
                            { label: 'Ventas', href: '/ventas' },
                            { label: 'Compras', href: '/compras' },
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
                        standalone={standalone}
                        subItems={[
                            { label: 'Gestión de Productos', href: '/productos' },
                            { label: 'Actualizar Precios', href: '/precios/actualizar' },
                        ]}
                    />

                    <SidebarItem
                        icon={Users}
                        label="Clientes"
                        href="/clientes"
                        standalone={standalone}
                    />

                    <SidebarItem
                        icon={Users}
                        label="Proveedores"
                        href="/proveedores"
                        standalone={standalone}
                    />

                    <div className="my-3 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Datos Varios
                    </div>

                    <SidebarItem
                        icon={BookOpen}
                        label="Maestros"
                        isOpen={openSection === 'maestros'}
                        onToggle={() => toggleSection('maestros')}
                        standalone={standalone}
                        subItems={[
                            { label: 'Categorías', href: '/categorias' },
                            { label: 'Marcas', href: '/marcas' },
                            { label: 'Rubros', href: '/rubros' },
                            { label: 'Sucursales', href: '/sucursales' },
                        ]}
                    />

                    <div className="my-3 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Tesorería
                    </div>

                    <SidebarItem
                        icon={Banknote}
                        label="Caja"
                        href="/caja"
                        standalone={standalone}
                    />
                    <SidebarItem
                        icon={Wallet}
                        label="Cheques"
                        href="/cheques"
                        standalone={standalone}
                    />
                    <SidebarItem
                        icon={CreditCard}
                        label="Ctas. Corrientes"
                        isOpen={openSection === 'ctas-corrientes'}
                        onToggle={() => toggleSection('ctas-corrientes')}
                        standalone={standalone}
                        subItems={[
                            { label: 'De Clientes', href: '/ctas-corrientes/clientes' },
                            { label: 'De Proveedores', href: '/ctas-corrientes/proveedores' },
                        ]}
                    />

                    <div className="my-3 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Contabilidad
                    </div>

                    <SidebarItem
                        icon={FileText}
                        label="Contabilidad"
                        isOpen={openSection === 'contabilidad'}
                        onToggle={() => toggleSection('contabilidad')}
                        standalone={standalone}
                        subItems={[
                            { label: 'Plan de Cuentas', href: '/contabilidad/plan-cuentas/' },
                            { label: 'Ejercicios Contables', href: '/contabilidad/ejercicios/' },
                            { label: 'Asientos Manuales', href: '/contabilidad/asientos/' },
                            { label: 'Libro Mayor', href: '/contabilidad/mayor/' },
                            { label: 'Balance', href: '/contabilidad/balance/' },
                            { label: 'Reportes', href: '/contabilidad/reportes/' },
                        ]}
                    />

                    <div className="my-3 px-2 small fw-bold text-uppercase text-light text-opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Sistema
                    </div>
                    <SidebarItem
                        icon={Settings}
                        label="Configuración"
                        isOpen={openSection === 'configuracion'}
                        onToggle={() => toggleSection('configuracion')}
                        standalone={standalone}
                        subItems={[
                            { label: 'Datos de Empresa', href: '/configuracion/empresa' },
                            { label: 'Parámetros', href: '/parametros' },
                            { label: 'Usuarios', href: '/usuarios' },
                            { label: 'Permisos', href: '/permisos' },
                            { label: 'Respaldos', href: '/backups' },
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
                    .d-flex.flex-column.position-fixed.translate-x-0 {
                        transform: translateX(0) !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Sidebar;
