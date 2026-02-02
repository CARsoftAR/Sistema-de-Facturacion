// TopNavbar Component - Intelligent Redesign 2025
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Search, Maximize, Minimize, Plus, Zap, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const TopNavbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Optimización de Stock', detail: 'IA sugiere reponer Producto #104', path: '/productos' },
        { id: 2, title: 'Venta Inusual Detectada', detail: 'Nueva operación por $150,000', path: '/ventas' }
    ]);
    const dropdownRef = useRef(null);

    // Track scroll for glass effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    const handleNotificationClick = (id, path) => {
        if (id) setNotifications(notifications.filter(n => n.id !== id));
        navigate(path);
        setShowNotifications(false);
    };

    return (
        <nav className={cn(
            "sticky top-0 z-40 px-6 py-3 transition-all duration-300",
            scrolled ? "bg-white/70 backdrop-blur-xl border-b border-neutral-200/50 shadow-premium" : "bg-transparent"
        )}>
            <div className="flex items-center justify-between">

                {/* 🔍 Intelligent Search */}
                <div className="hidden md:flex items-center flex-1 max-w-md group focus-within:max-w-xl transition-all duration-500">
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Comando rápido... (Ctrl + K)"
                            className="block w-full pl-11 pr-4 py-2.5 bg-neutral-100 hover:bg-neutral-200/50 focus:bg-white border-transparent focus:border-primary-500/30 text-sm rounded-2xl transition-all duration-300 shadow-inner-subtle focus:ring-4 focus:ring-primary-500/10 placeholder-neutral-400"
                        />
                    </div>
                </div>

                {/* ⚡ Action Icons */}
                <div className="flex items-center gap-4">

                    {/* Plus Quick Action */}
                    <button className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-600/20 transition-all active:scale-95 group">
                        <Plus size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-sm font-bold tracking-tight hidden sm:block">Nuevo</span>
                    </button>

                    <div className="h-6 w-px bg-neutral-200 mx-1 hidden sm:block"></div>

                    {/* Notification Center */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={cn(
                                "p-2.5 rounded-xl transition-all duration-200 relative",
                                showNotifications ? "bg-neutral-100 text-primary-600" : "text-neutral-500 hover:bg-neutral-100"
                            )}
                        >
                            <Bell size={20} />
                            {notifications.length > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error-500 border-2 border-white rounded-full animate-pulse"></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-premium-2xl border border-neutral-100 overflow-hidden">
                                <div className="p-4 border-b border-neutral-50 bg-neutral-50/50 flex justify-between items-center">
                                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Novedades</span>
                                    <Zap size={14} className="text-primary-600" />
                                </div>
                                <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Heart size={32} className="mx-auto text-neutral-200 mb-2" />
                                            <p className="text-xs text-neutral-400">Todo en orden por ahora</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div
                                                key={n.id}
                                                className="p-4 hover:bg-neutral-50 border-l-4 border-transparent hover:border-primary-500 cursor-pointer transition-all"
                                                onClick={() => handleNotificationClick(n.id, n.path)}
                                            >
                                                <p className="text-sm font-bold text-neutral-800 mb-0.5">{n.title}</p>
                                                <p className="text-[11px] text-neutral-500 leading-normal">{n.detail}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 bg-neutral-50/50 border-t border-neutral-50 text-center">
                                    <button className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:text-primary-800 transition-colors">Ver Todo el Historial</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* System View Controls */}
                    <button
                        onClick={toggleFullScreen}
                        className="hidden md:flex p-2.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all"
                        title="Expandir Espacio de Trabajo"
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>

                    <div className="h-6 w-px bg-neutral-200 mx-1"></div>

                    {/* Mini Profile Info */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-neutral-900 leading-none mb-0.5">{user?.username}</p>
                            <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-tighter">Acceso Total</p>
                        </div>
                        <button
                            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 p-0.5 shadow-lg shadow-primary-600/20 active:scale-90 transition-transform"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                                {user?.imagen_url ? (
                                    <img src={user.imagen_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-primary-600" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;
