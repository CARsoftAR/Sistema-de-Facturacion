import React, { useState, useEffect } from 'react';
import {
    History as HistoryIcon,
    Search,
    Filter,
    User,
    Layers,
    Calendar,
    ArrowUpCircle,
    ArrowDownCircle,
    Eye,
    RefreshCcw,
    ClipboardList,
    Activity
} from 'lucide-react';
import { BentoCard, BentoGrid, PremiumTable, TableCell, PremiumFilterBar } from '../components/premium';
import { StatCard } from '../components/premium/BentoCard';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { cn } from '../utils/cn';

const Auditoria = () => {
    const { hasPermission } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [metrics, setMetrics] = useState(null);
    const [filtros, setFiltros] = useState({
        username: '',
        module: '',
        action_type: ''
    });

    const getLocalDate = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [dateRange, setDateRange] = useState({
        start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        end: getLocalDate()
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...filtros,
                fecha_start: dateRange.start,
                fecha_end: dateRange.end,
                page: page,
                per_page: 20
            });
            const response = await axios.get(`/api/seguridad/bitacora/?${params}`);
            if (response.data.ok) {
                setLogs(response.data.data);
                setTotalPages(response.data.pages);
                setMetrics(response.data.metrics || null);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, dateRange, filtros.module, filtros.action_type]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    const getActionTypeColor = (type) => {
        switch (type) {
            case 'CREATE': return 'bg-success-100 text-success-700 border-success-200';
            case 'UPDATE': return 'bg-warning-100 text-warning-700 border-warning-200';
            case 'DELETE': return 'bg-error-100 text-error-700 border-error-200';
            case 'LOGIN': return 'bg-primary-100 text-primary-700 border-primary-200';
            case 'LOGOUT': return 'bg-neutral-100 text-neutral-600 border-neutral-200';
            default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        }
    };

    const modules = [
        { id: '', label: 'Todos los Módulos' },
        { id: 'PRODUCTOS', label: 'Productos' },
        { id: 'VENTAS', label: 'Ventas' },
        { id: 'COMPRAS', label: 'Compras' },
        { id: 'CLIENTES', label: 'Clientes' },
        { id: 'PROVEEDORES', label: 'Proveedores' },
        { id: 'USUARIOS', label: 'Usuarios' },
        { id: 'CAJA', label: 'Caja' },
        { id: 'CONTABILIDAD', label: 'Contabilidad' },
        { id: 'CONFIGURACION', label: 'Configuración' },
        { id: 'SEGURIDAD', label: 'Seguridad' },
        { id: 'SISTEMA', label: 'Sistema' },
    ];

    const actionTypes = [
        { id: '', label: 'Todas las Acciones' },
        { id: 'CREATE', label: 'Creación' },
        { id: 'UPDATE', label: 'Modificación' },
        { id: 'DELETE', label: 'Eliminación' },
        { id: 'LOGIN', label: 'Inicio de Sesión' },
        { id: 'LOGOUT', label: 'Cierre de Sesión' },
        { id: 'PASSWORD_CHANGE', label: 'Cambio de Clave' },
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 min-h-screen bg-neutral-50/50">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 rounded-2xl bg-primary-600 text-white shadow-premium-sm">
                            <HistoryIcon size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Auditoría
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium ml-1">Control y seguimiento de actividades de usuario</p>
                </div>

                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 rounded-2xl text-neutral-600 font-bold hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                >
                    <RefreshCcw size={18} className={cn(loading && "animate-spin")} />
                    Actualizar
                </button>
            </header>

            {/* Filtros */}
            <PremiumFilterBar
                busqueda={filtros.username}
                setBusqueda={(val) => setFiltros({ ...filtros, username: val })}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onClear={() => {
                    setFiltros({ username: '', module: '', action_type: '' });
                    setDateRange({
                        start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
                        end: getLocalDate()
                    });
                    setPage(1);
                }}
                placeholder="Buscar por usuario..."
            >
                <div className="flex items-center gap-3">
                    <select
                        className="h-[52px] px-6 bg-white border border-neutral-200 rounded-full focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-[10px] uppercase tracking-widest text-neutral-800 appearance-none pr-12 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat shadow-sm min-w-[180px]"
                        value={filtros.module}
                        onChange={(e) => setFiltros({ ...filtros, module: e.target.value })}
                    >
                        {modules.map(m => (
                            <option key={m.id} value={m.id}>{m.label.toUpperCase()}</option>
                        ))}
                    </select>

                    <select
                        className="h-[52px] px-6 bg-white border border-neutral-200 rounded-full focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-[10px] uppercase tracking-widest text-neutral-800 appearance-none pr-12 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat shadow-sm min-w-[180px]"
                        value={filtros.action_type}
                        onChange={(e) => setFiltros({ ...filtros, action_type: e.target.value })}
                    >
                        {actionTypes.map(at => (
                            <option key={at.id} value={at.id}>{at.label.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </PremiumFilterBar>

            {/* Dashboard Analítico de Auditoría */}
            {metrics && (
                <BentoGrid cols={3} className="mb-2">
                    <StatCard
                        label="Registros de Actividad (Filtro Actual)"
                        value={metrics.total_filtered || 0}
                        icon={ClipboardList}
                        color="indigo"
                        compact
                    />
                    <StatCard
                        label="Módulo Más Activo"
                        value={metrics.top_modules && metrics.top_modules.length > 0 ? metrics.top_modules[0].module : 'N/A'}
                        icon={Layers}
                        color="emerald"
                        compact
                    />
                    <StatCard
                        label="Acción Frecuente"
                        value={metrics.top_actions && metrics.top_actions.length > 0 ? metrics.top_actions[0].action_type : 'N/A'}
                        icon={Activity}
                        color="amber"
                        compact
                    />
                </BentoGrid>
            )}

            {/* Tabla de Logs */}
            <BentoCard className="flex-1 overflow-hidden p-0">
                <PremiumTable
                    headers={['Fecha/Hora', 'Usuario', 'Módulo', 'Acción', 'Descripción', 'IP']}
                    data={logs.map(log => ({
                        'Fecha/Hora': (
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-neutral-400" />
                                <span className="font-medium text-neutral-700">{log.timestamp}</span>
                            </div>
                        ),
                        'Usuario': (
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs border border-primary-200">
                                    {log.username.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-bold text-neutral-900">{log.username}</span>
                            </div>
                        ),
                        'Módulo': (
                            <span className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-bold border border-neutral-200 uppercase tracking-wider">
                                {log.module_display}
                            </span>
                        ),
                        'Acción': (
                            <span className={cn("px-3 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider", getActionTypeColor(log.action_type))}>
                                {log.action_type_display}
                            </span>
                        ),
                        'Descripción': (
                            <div className="max-w-md truncate text-neutral-600 font-medium italic" title={log.description}>
                                "{log.description}"
                            </div>
                        ),
                        'IP': (
                            <span className="font-mono text-xs text-neutral-400">{log.ip_address || '---'}</span>
                        )
                    }))}
                    loading={loading}
                    onNextPage={() => setPage(p => Math.min(totalPages, p + 1))}
                    onPrevPage={() => setPage(p => Math.max(1, p - 1))}
                    currentPage={page}
                    totalPages={totalPages}
                    hideActions={true}
                />
            </BentoCard>
        </div>
    );
};

export default Auditoria;
