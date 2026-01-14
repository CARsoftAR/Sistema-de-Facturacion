import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Search, Maximize, Minimize } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopNavbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Nueva venta registrada', detail: 'Venta #1045 por $12,500', path: '/ventas' },
        { id: 2, title: 'Stock bajo detectado', detail: 'Hay productos con stock bajo mínimo', path: '/productos?stock=bajo' },
        { id: 3, title: 'Pedido recibido', detail: 'Proveedor CARSOFT envió pedido #88', path: '/pedidos?estado=PENDIENTE' }
    ]);
    const dropdownRef = useRef(null);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                });
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Auto-Fullscreen on first interaction (Browser restriction workaround)
        const attemptAutoFullscreen = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {
                    // Silent fail if browser blocks it
                });
            }
            // Remove listener after first interaction to avoid repeated attempts
            document.removeEventListener('click', attemptAutoFullscreen);
            document.removeEventListener('keydown', attemptAutoFullscreen);
        };

        document.addEventListener('click', attemptAutoFullscreen);
        document.addEventListener('keydown', attemptAutoFullscreen);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('click', attemptAutoFullscreen);
            document.removeEventListener('keydown', attemptAutoFullscreen);
        };
    }, []);

    const handleLogout = () => {
        window.location.href = '/logout/';
    };

    const handleNotificationClick = (id, path) => {
        if (id) {
            setNotifications(notifications.filter(n => n.id !== id));
        }
        navigate(path);
        setShowNotifications(false);
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="bg-white border-bottom border-light-subtle shadow-sm px-4 py-2 d-flex align-items-center justify-content-between position-sticky top-0 z-3" style={{ height: '64px' }}>
            {/* Global Search */}
            <div className="d-none d-md-flex align-items-center bg-light rounded-pill px-3 py-1 border border-light-subtle" style={{ width: '300px' }}>
                <Search size={18} className="text-muted me-2" />
                <input
                    type="text"
                    placeholder="Buscar en el sistema..."
                    className="form-control form-control-sm border-0 bg-transparent shadow-none"
                    style={{ outline: 'none' }}
                />
            </div>

            {/* User Actions */}
            <div className="d-flex align-items-center gap-3 ms-auto">
                {/* Fullscreen Toggle */}
                <button
                    onClick={toggleFullScreen}
                    className="btn btn-link text-secondary p-2 rounded-circle hover-bg-light border-0 shadow-none d-none d-md-flex align-items-center justify-content-center"
                    title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>

                {/* Notifications */}
                <div className="position-relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="btn btn-link text-secondary p-2 rounded-circle hover-bg-light border-0 shadow-none position-relative"
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style={{ fontSize: '10px' }}>
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="position-absolute end-0 mt-2 bg-white shadow-lg border border-light-subtle rounded-3 p-0 z-3" style={{ width: '300px', overflow: 'hidden' }}>
                            <div className="bg-light px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0 small text-dark">Notificaciones</h6>
                                <span className="badge bg-primary-subtle text-primary smaller">{notifications.length} {notifications.length === 1 ? 'nueva' : 'nuevas'}</span>
                            </div>
                            <div className="p-0" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center">
                                        <Bell size={32} className="text-muted mb-2 opacity-25" />
                                        <p className="mb-0 small text-muted">No tienes notificaciones pendientes</p>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className="p-3 border-bottom hover-bg-light cursor-pointer transition-all"
                                            onClick={() => handleNotificationClick(n.id, n.path)}
                                        >
                                            <p className="mb-0 small fw-bold text-dark">{n.title}</p>
                                            <p className="mb-0 smaller text-muted">{n.detail}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="bg-light text-center py-2 px-3 border-top">
                                <button
                                    className="btn btn-link btn-sm text-primary text-decoration-none fw-bold p-0 smaller"
                                    onClick={() => handleNotificationClick(null, '/dashboard')}
                                >
                                    Ver todas
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="vr d-none d-md-block mx-2 text-secondary opacity-25" style={{ height: '24px' }}></div>

                {/* User Profile */}
                <div className="d-flex align-items-center gap-3" ref={dropdownRef}>
                    <div className="text-end d-none d-sm-block">
                        <p className="mb-0 fw-bold text-dark small leading-none">{user?.username || 'Invitado'}</p>
                        <p className="mb-0 text-muted small" style={{ fontSize: '0.75rem' }}>{user?.rol || 'Rol'}</p>
                    </div>

                    <div className="position-relative">
                        <button
                            className="btn btn-white border shadow-sm p-1 rounded-circle d-flex align-items-center justify-content-center dropdown-trigger"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{ width: '40px', height: '40px' }}
                        >
                            <div className="w-100 h-100 bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center transition-all overflow-hidden">
                                {user?.imagen_url ? (
                                    <img src={user.imagen_url} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <ul className="position-absolute end-0 mt-2 bg-white shadow-lg border border-light-subtle rounded-3 p-2 list-unstyled z-3" style={{ minWidth: '220px' }}>
                                <li className="px-3 py-2 border-bottom mb-2 bg-light rounded-top-2">
                                    <p className="mb-0 fw-bold text-dark small leading-tight">Panel de Usuario</p>
                                    <p className="mb-0 text-muted small" style={{ fontSize: '0.75rem' }}>{user?.email || ''}</p>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item rounded-2 py-2 d-flex align-items-center gap-2 px-3 transition-all hover-bg-primary-subtle border-0 bg-transparent text-start w-100 small"
                                        onClick={() => { setIsDropdownOpen(false); navigate('/perfil'); }}
                                    >
                                        <User size={16} /> Perfil
                                    </button>
                                </li>
                                <li>
                                    <hr className="dropdown-divider opacity-50 my-2" />
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="dropdown-item rounded-2 py-2 d-flex align-items-center gap-2 px-3 text-danger transition-all hover-bg-danger-subtle border-0 bg-transparent text-start w-100 small fw-bold"
                                    >
                                        <LogOut size={16} /> Cerrar Sesión
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .hover-bg-light:hover { background-color: rgba(0,0,0,0.03); }
                .hover-bg-primary-subtle:hover { background-color: #e7f1ff; color: #0056b3; }
                .hover-bg-danger-subtle:hover { background-color: #f8d7da; color: #b02a37; }
                .cursor-pointer { cursor: pointer; }
                .smaller { font-size: 0.8rem; }
                .transition-all { transition: all 0.2s ease; }
                .dropdown-trigger:hover .bg-opacity-10 { background-color: rgba(13, 110, 253, 0.2) !important; }
            `}</style>
        </nav>
    );
};

export default TopNavbar;
