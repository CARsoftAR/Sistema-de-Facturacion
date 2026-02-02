// Presupuestos.jsx - Rediseño Premium 2025
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FileText, Plus, Search, Check, AlertCircle, ShoppingCart,
    CheckCircle, Clock, Trash2, Printer, Eye, FilterX,
    ListFilter, DollarSign, Hash, TrendingUp, Activity, Download
} from 'lucide-react';

// Premium UI Components
import { BentoCard, StatCard, PremiumTable, TableCell, SearchInput, PremiumFilterBar } from '../components/premium';
import { BentoGrid } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';
import { showDeleteAlert, showSuccessAlert, showErrorAlert, showConfirmationAlert } from '../utils/alerts';
import { BtnAdd } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';

const STORAGE_KEY = 'table_prefs_presupuestos_items';

const Presupuestos = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [presupuestos, setPresupuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = parseInt(saved, 10);
            return (parsed && parsed > 0) ? parsed : 10;
        }
        return 10;
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

    // Filtros
    const [filters, setFilters] = useState({
        busqueda: searchParams.get('busqueda') || '',
        estado: searchParams.get('estado') || '',
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => {
                    if (data.items_por_pagina) setItemsPerPage(data.items_por_pagina);
                })
                .catch(console.error);
        }
    }, []);

    const fetchPresupuestos = useCallback(async (signal) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: itemsPerPage,
                q: filters.busqueda,
                estado: filters.estado,
                fecha_start: dateRange.start,
                fecha_end: dateRange.end
            });

            const response = await fetch(`/api/presupuestos/listar/?${params}`, { signal });
            const data = await response.json();

            if (data.ok) {
                setPresupuestos(data.data || []);
                setTotalItems(data.total || 0);
                setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
            } else {
                setPresupuestos([]);
            }
        } catch (error) {
            if (error.name !== 'AbortError') setPresupuestos([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters]);

    useEffect(() => {
        const controller = new AbortController();
        fetchPresupuestos(controller.signal);
        return () => controller.abort();
    }, [fetchPresupuestos]);

    // KPI Calculations
    const stats = useMemo(() => {
        const totalAmount = presupuestos.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);
        // Contamos tanto PENDIENTE como VENCIDO como "Pendientes" para los KPIs
        const pendientes = presupuestos.filter(p => p.estado === 'PENDIENTE' || p.estado === 'VENCIDO').length;
        const aprobados = presupuestos.filter(p => p.estado === 'APROBADO').length;

        return {
            total: totalAmount,
            count: totalItems,
            pendientes: pendientes,
            aprobados: aprobados
        };
    }, [presupuestos, totalItems]);

    const handleClear = () => {
        setFilters({ busqueda: '', estado: '' });
        setDateRange({
            start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
            end: getLocalDate()
        });
        setSearchParams({});
        setPage(1);
    };

    const handleConvertToPedido = async (presupuesto) => {
        const result = await showConfirmationAlert(
            '¿Convertir a Pedido?',
            `Se generará un nuevo pedido a partir del presupuesto #${presupuesto.id} `,
            'primary',
            { icon: 'question', confirmText: 'Sí, convertir' }
        );

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/presupuesto/convertir-pedido/${presupuesto.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
                }
            });
            const data = await response.json();

            if (data.ok) {
                await showSuccessAlert(
                    '¡Convertido!',
                    `El presupuesto se convirtió en el pedido #${data.pedido_id}.`
                );
                navigate(`/pedidos/${data.pedido_id}`);
            } else {
                showErrorAlert('Error', data.error || 'No se pudo convertir el presupuesto.');
            }
        } catch (error) {
            showErrorAlert('Error', 'Error de conexión al convertir el presupuesto.');
        }
    };

    const handlePrint = (id) => {
        window.open(`/presupuesto/pdf/${id}/`, '_blank');
    };

    const handleDelete = async (id) => {
        const result = await showDeleteAlert(
            "¿Eliminar presupuesto?",
            "Esta acción cancelará el presupuesto.",
            'Eliminar'
        );
        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/presupuesto/cancelar/${id}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
                }
            });
            const data = await response.json();

            if (data.ok) {
                fetchPresupuestos();
            } else {
                showErrorAlert('Error', data.error || 'No se pudo cancelar el presupuesto.');
            }
        } catch (e) {
            console.error(e);
            showErrorAlert('Error', 'Error al intentar cancelar.');
        }
    };

    const columns = [
        {
            key: 'id',
            label: '# ID',
            width: '100px',
            render: (v) => <TableCell.ID value={v} />
        },
        {
            key: 'fecha',
            label: 'Fecha',
            width: '180px',
            render: (v) => <TableCell.Date value={v} />
        },
        {
            key: 'cliente',
            label: 'Cliente',
            render: (v) => <TableCell.Primary value={v} />
        },
        {
            key: 'vencimiento',
            label: 'Vencimiento',
            width: '180px',
            render: (v) => <TableCell.Date value={v} />
        },
        {
            key: 'total',
            label: 'Total',
            align: 'right',
            width: '150px',
            render: (v) => <TableCell.Currency value={v} />
        },
        {
            key: 'estado',
            label: 'Estado',
            width: '150px',
            render: (v) => (
                <TableCell.Status
                    value={v}
                    variant={
                        v === 'APROBADO' ? 'success' :
                            v === 'PENDIENTE' ? 'warning' :
                                v === 'VENCIDO' ? 'secondary' :
                                    v === 'CANCELADO' ? 'error' : 'default'
                    }
                />
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'right',
            width: '200px',
            sortable: false,
            render: (_, p) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => navigate(`/presupuestos/${p.id}`)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Ver Detalle"
                    >
                        <Eye size={18} />
                    </button>
                    {p.estado === 'PENDIENTE' && (
                        <button
                            onClick={() => handleConvertToPedido(p)}
                            className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Convertir a Pedido"
                        >
                            <ShoppingCart size={18} />
                        </button>
                    )}
                    {p.estado !== 'VENCIDO' && (
                        <button
                            onClick={() => handlePrint(p.id)}
                            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
                            title="Imprimir"
                        >
                            <Printer size={18} />
                        </button>
                    )}
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
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                        <FileText className="text-blue-600" size={32} strokeWidth={2.5} />
                        Historial de Presupuestos
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1">
                        Gestión de Presupuestos y Cotizaciones.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-sm hover:bg-neutral-50 transition-all shadow-sm">
                        <Download size={18} /> Exportar
                    </button>
                    <BtnAdd
                        label="NUEVO PRESUPUESTO"
                        onClick={() => navigate('/presupuestos/nuevo')}
                        className="!bg-blue-600 !hover:bg-blue-700 !rounded-xl !px-6 !py-3 !font-black !tracking-widest !text-xs !shadow-lg !shadow-blue-600/20"
                    />
                </div>
            </header>

            {/* KPI Section */}
            <BentoGrid cols={4}>
                <StatCard
                    label="Volume Presupuestado"
                    value={`$${stats.total.toLocaleString()}`}
                    icon={DollarSign}
                    color="primary"
                />
                <StatCard
                    label="Presupuestos Pendientes"
                    value={stats.pendientes}
                    icon={Clock}
                    color="warning"
                />
                <StatCard
                    label="Presupuestos Aprobados"
                    value={stats.aprobados}
                    icon={CheckCircle}
                    color="success"
                />
                <StatCard
                    label="Total Operaciones"
                    value={stats.count}
                    icon={Hash}
                    color="primary"
                />
            </BentoGrid>

            <PremiumFilterBar
                busqueda={filters.busqueda}
                setBusqueda={(val) => { setFilters(prev => ({ ...prev, busqueda: val })); setPage(1); }}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onClear={handleClear}
                placeholder="Buscar por cliente, ID o estado..."
            >
                <select
                    className="bg-white border border-neutral-200 rounded-full px-6 h-[52px] text-[10px] font-black uppercase tracking-widest text-neutral-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm cursor-pointer appearance-none pr-12 min-w-[200px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                    value={filters.estado}
                    onChange={(e) => { setFilters(prev => ({ ...prev, estado: e.target.value })); setPage(1); }}
                >
                    <option value="">TODOS LOS ESTADOS</option>
                    <option value="PENDIENTE">PENDIENTES</option>
                    <option value="APROBADO">APROBADOS</option>
                    <option value="VENCIDO">VENCIDOS</option>
                    <option value="CANCELADO">CANCELADOS</option>
                </select>
            </PremiumFilterBar>

            {/* Table Container */}
            <div className="flex-grow flex flex-col min-h-0">
                <PremiumTable
                    columns={columns}
                    data={presupuestos}
                    loading={loading}
                    className="flex-grow shadow-lg"
                    emptyState={
                        <EmptyState
                            title="No hay presupuestos registrados"
                            description="Los presupuestos aparecerán aquí una vez generados en la terminal."
                        />
                    }
                />

                {/* Pagination */}
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
            </div>
        </div>
    );
};

export default Presupuestos;
