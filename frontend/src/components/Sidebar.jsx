import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    ClipboardList
} from 'lucide-react';

// Rutas que son manejadas por React (SPA)
const REACT_ROUTES = ['/', '/dashboard', '/ventas/nuevo', '/clientes', '/productos'];

const SidebarItem = ({ icon: Icon, label, href, subItems, isOpen, activeSubItem, onToggle, standalone }) => {
    const navigate = useNavigate();
    const isExpanded = isOpen;
    const hasSubItems = subItems && subItems.length > 0;

    const handleClick = () => {
        if (hasSubItems) {
            onToggle();
        } else {
            if (standalone) {
                window.location.href = href;
                return;
            }
            if (REACT_ROUTES.includes(href)) {
                navigate(href);
            } else {
                window.location.href = href;
            }
        }
    };

    const handleSubItemClick = (e, itemHref) => {
        e.preventDefault();
        if (REACT_ROUTES.includes(itemHref)) {
            navigate(itemHref);
        } else {
            window.location.href = itemHref;
        }
    };

    return (
        <div className="mb-1">
            <div
                className={`d-flex align-items-center justify-content-between px-3 py-2 rounded pointer user-select-none transition-all ${isExpanded ? 'bg-primary text-white shadow-sm' : 'text-white hover-bg-dark-subtle'}`}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={handleClick}
                onMouseEnter={(e) => {
                    if (!isExpanded) {
                        e.currentTarget.classList.add('bg-secondary', 'bg-opacity-25');
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isExpanded) {
                        e.currentTarget.classList.remove('bg-secondary', 'bg-opacity-25');
                    }
                }}
            >
                <div className="d-flex align-items-center gap-3">
                    <Icon size={20} />
                    <span className="fw-medium small">{label}</span>
                </div>
                {hasSubItems && (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                )}
            </div>

            {hasSubItems && isExpanded && (
                <div className="ms-4 mt-1 border-start border-light border-opacity-25 ps-3">
                    <div className="d-flex flex-column gap-1">
                        {subItems.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                onClick={(e) => handleSubItemClick(e, item.href)}
                                className="d-block px-2 py-1 small text-decoration-none rounded transition-all text-white text-opacity-75"
                                style={{ transition: 'all 0.2s ease' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.classList.remove('text-opacity-75');
                                    e.currentTarget.classList.add('bg-secondary', 'bg-opacity-10');
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.classList.add('text-opacity-75');
                                    e.currentTarget.classList.remove('bg-secondary', 'bg-opacity-10');
                                }}
                            >
                                {item.label}
                            </a>
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
                            { label: 'Catálogo', href: '/catalogo' },
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
                            { label: 'Libro Diario', href: '/contabilidad/diario' },
                            { label: 'Balance', href: '/contabilidad/balance' },
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
                            { label: 'Usuarios', href: '/usuarios' },
                            { label: 'Permisos', href: '/permisos' },
                            { label: 'Respaldos', href: '/backups' },
                        ]}
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
