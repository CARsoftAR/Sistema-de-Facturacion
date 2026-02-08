// Pedidos.jsx - Rediseño Premium 2025
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ShoppingCart, Plus, Search, Printer, XCircle,
    CheckCircle, Trash2, ListFilter, FilterX, Eye,
    Calendar, FileText, Download, TrendingUp,
    Hash, User, Tag, DollarSign, Activity, Clock
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showDeleteAlert, showConfirmationAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';

// Premium UI Components
import { BentoCard, StatCard, PremiumTable, TableCell, SearchInput, PremiumFilterBar } from '../components/premium';
import { BentoGrid } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';
import { formatNumber } from '../utils/formats';
import { BtnAdd } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';

const Pedidos = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal State
    const [showModalFacturar, setShowModalFacturar] = useState(false);
    const [pedidoFacturar, setPedidoFacturar] = useState(null);

    const getLocalDate = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Si viene un filtro de estado desde la URL (ej: desde dashboard), no aplicar filtro de fechas por defecto
    const hasStatusFilter = searchParams.get('estado');

    const [dateRange, setDateRange] = useState({
        start: searchParams.get('fecha_desde') || (hasStatusFilter ? '' : getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))),
        end: searchParams.get('fecha_hasta') || (hasStatusFilter ? '' : getLocalDate())
    });

    const STORAGE_KEY = 'table_prefs_pedidos_items';

    const [filters, setFilters] = useState({
        busqueda: searchParams.get('busqueda') || '',
        estado: searchParams.get('estado') || ''
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setItemsPerPage(Number(saved));
    }, []);

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: itemsPerPage,
                ...filters,
                fecha_desde: dateRange.start,
                fecha_hasta: dateRange.end
            });

            const response = await fetch(`/api/pedidos/lista/?${params}`);
            const data = await response.json();

            setPedidos(data.pedidos || []);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error("Error al cargar pedidos:", error);
            setPedidos([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters, itemsPerPage, dateRange]);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const setToday = () => {
        const today = getLocalDate();
        setDateRange({ start: today, end: today });
        setPage(1);
    };

    const setYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDate(yesterday);
        setDateRange({ start: yesterdayStr, end: yesterdayStr });
        setPage(1);
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    // KPI Calculations (Based on current page/total items)
    const stats = useMemo(() => {
        const totalAmount = pedidos.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);
        const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
        const facturados = pedidos.filter(p => p.estado === 'FACTURADO').length;

        return {
            total: totalAmount,
            count: totalItems,
            pendientes: pendientes,
            facturados: facturados
        };
    }, [pedidos, totalItems]);

    const handleFacturar = (id) => {
        setPedidoFacturar(id);
        setShowModalFacturar(true);
    };

    const confirmFacturar = async () => {
        if (!pedidoFacturar) return;
        try {
            const res = await fetch(`/api/pedidos/facturar/${pedidoFacturar}/`, { method: 'POST' });
            const data = await res.json();

            if (data.ok) {
                setShowModalFacturar(false);
                setPedidoFacturar(null);
                await showSuccessAlert('Facturado', `Pedido convertido en Venta #${data.venta_id}`);
                fetchPedidos();
            } else {
                showErrorAlert('Error', data.error);
            }
        } catch (e) {
            showErrorAlert('Error', 'Error de conexión al facturar.');
        }
    };

    const handleDelete = async (id) => {
        const result = await showDeleteAlert(
            "¿Eliminar pedido?",
            "Esta acción eliminará el pedido de forma permanente. Si el pedido ya fue facturado, esta acción no revertirá la venta.",
            'ELIMINAR PEDIDO'
        );
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/pedidos/eliminar/${id}/`, { method: 'POST' });
            const data = await res.json();
            if (res.ok && !data.error) {
                showSuccessAlert('Eliminado', 'El pedido ha sido removido.');
                fetchPedidos();
            } else {
                showErrorAlert('Error', data.error || "No se pudo eliminar el pedido.");
            }
        } catch (e) {
            showErrorAlert('Error', 'Error de conexión');
        }
    };

    const columns = [
        {
            key: 'id',
            label: '# PEDIDO',
            width: '100px',
            render: (v) => <TableCell.ID value={v} />
        },
        {
            key: 'fecha',
            label: 'FECHA',
            width: '180px',
            render: (v) => <TableCell.Date value={v} />
        },
        {
            key: 'cliente_nombre',
            label: 'CLIENTE',
            render: (v) => <TableCell.Primary value={v} />
        },
        {
            key: 'total',
            label: 'TOTAL',
            align: 'right',
            width: '150px',
            render: (v) => <TableCell.Currency value={v} />
        },
        {
            key: 'estado',
            label: 'ESTADO',
            width: '150px',
            render: (v) => (
                <TableCell.Status
                    value={v}
                    variant={v === 'FACTURADO' ? 'success' : v === 'PENDIENTE' ? 'warning' : 'default'}
                />
            )
        },
        {
            key: 'acciones',
            label: 'ACCIONES',
            align: 'right',
            width: '200px',
            sortable: false,
            render: (_, p) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => navigate(`/pedidos/${p.id}`)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Ver Detalle"
                    >
                        <Eye size={18} />
                    </button>
                    {p.estado !== 'FACTURADO' && p.estado !== 'CANCELADO' && (
                        <button
                            onClick={() => handleFacturar(p.id)}
                            className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Facturar Pedido"
                        >
                            <FileText size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => window.open(`/api/pedidos/${p.id}/pdf/`, '_blank')}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
                        title="Imprimir"
                    >
                        <Printer size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-full overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3 font-outfit uppercase">
                        <ShoppingCart className="text-blue-600" size={32} strokeWidth={2.5} />
                        Gestión de Pedidos
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1">
                        Seguimiento y facturación de órdenes pendientes.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <BtnAdd
                        label="NUEVO PEDIDO"
                        onClick={() => navigate('/pedidos/nuevo')}
                        className="!bg-blue-600 !hover:bg-blue-700 !rounded-xl !px-6 !py-3 !font-black !tracking-widest !text-xs !shadow-lg !shadow-blue-600/20"
                    />
                </div>
            </header>

            {/* KPI Section */}
            <BentoGrid cols={4}>
                <StatCard
                    label="Volume de Pedidos"
                    value={`$${formatNumber(stats.total)}`}
                    icon={DollarSign}
                    color="primary"
                />
                <StatCard
                    label="Pedidos Pendientes"
                    value={stats.pendientes}
                    icon={Clock}
                    color="warning"
                />
                <StatCard
                    label="Facturados"
                    value={stats.facturados}
                    icon={CheckCircle}
                    color="success"
                />
                <StatCard
                    label="Total Órdenes"
                    value={stats.count}
                    icon={Hash}
                    color="primary"
                />
            </BentoGrid>

            {/* Filtration & Content */}
            {/* Filtration & Content */}
            <PremiumFilterBar
                busqueda={filters.busqueda}
                setBusqueda={(val) => handleFilterChange('busqueda', val)}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onClear={() => {
                    setFilters({ busqueda: '', estado: '' });
                    setDateRange({
                        start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
                        end: getLocalDate()
                    });
                    setPage(1);
                }}
                placeholder="Buscar por cliente o ID de pedido..."
            >
                <select
                    className="bg-white border border-neutral-200 rounded-full px-6 h-[52px] text-[10px] font-black uppercase tracking-widest text-neutral-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm cursor-pointer appearance-none pr-12 min-w-[200px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                    value={filters.estado}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                    <option value="">TODOS LOS ESTADOS</option>
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="FACTURADO">FACTURADO</option>
                </select>
            </PremiumFilterBar>

            {/* Table */}
            <div className="flex-grow flex flex-col min-h-0">
                <PremiumTable
                    columns={columns}
                    data={pedidos}
                    loading={loading}
                    className={cn("flex-grow shadow-lg", pedidos.length > 0 ? "rounded-b-none" : "")}
                    emptyState={
                        <EmptyState
                            title="No hay pedidos pendientes"
                            description="Los pedidos de clientes aparecerán aquí una vez generados."
                        />
                    }
                />

                {/* Pagination */}
                {pedidos.length > 0 && (
                    <div className="bg-white border-x border-b border-neutral-200 rounded-b-[2rem] px-6 py-1 shadow-premium relative z-10">
                        <TablePagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setPage}
                            onItemsPerPageChange={(newVal) => {
                                setItemsPerPage(newVal);
                                setPage(1);
                                localStorage.setItem(STORAGE_KEY, newVal);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Modal de Facturación */}
            {showModalFacturar && (
                <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 transform scale-100 border border-neutral-200 text-center animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                            <FileText size={40} strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl font-black text-neutral-900 mb-2 uppercase tracking-tight font-outfit">Facturar Pedido</h3>
                        <p className="text-neutral-500 font-medium mb-10 leading-relaxed">
                            ¿Confirmas la facturación de este pedido? Se generará una venta oficial y se descontará el stock de los productos.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowModalFacturar(false)} className="flex-1 py-4 bg-neutral-100 text-neutral-400 font-black rounded-2xl hover:bg-neutral-200 transition-all uppercase tracking-widest text-xs">
                                CANCELAR
                            </button>
                            <button onClick={confirmFacturar} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all uppercase tracking-widest text-xs">
                                SÍ, FACTURAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pedidos;
