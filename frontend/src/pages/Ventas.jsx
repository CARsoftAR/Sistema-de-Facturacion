// Ventas.jsx - Rediseño Premium 2025
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ShoppingCart, Plus, Search, Printer, XCircle,
    CheckCircle, Trash2, ListFilter, FilterX, Eye,
    Calendar, FileText, Download, TrendingUp,
    Hash, User, Tag, DollarSign, Activity, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Premium UI Components
import { BentoCard, StatCard, PremiumTable, TableCell, SearchInput, PremiumFilterBar } from '../components/premium';
import { BentoGrid } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';
import { formatNumber } from '../utils/formats';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { BtnAdd, BtnPrint, BtnTableAction } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';

const Ventas = () => {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const getLocalDate = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [busqueda, setBusqueda] = useState('');

    const [dateRange, setDateRange] = useState({
        start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        end: getLocalDate()
    });

    const STORAGE_KEY = 'table_prefs_ventas_items';

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setItemsPerPage(Number(saved));
        else {
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => setItemsPerPage(data.items_por_pagina || 10))
                .catch(() => setItemsPerPage(10));
        }
    }, []);

    const fetchVentas = useCallback(async (signal) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                q: busqueda,
                fecha_start: dateRange.start,
                fecha_end: dateRange.end
            });
            const response = await fetch(`/api/ventas/listar/?${params}`, { signal });
            const data = await response.json();

            let allVentas = data.data || data.ventas || [];
            if (Array.isArray(data)) allVentas = data;

            if (busqueda) {
                const q = busqueda.toLowerCase();
                allVentas = allVentas.filter(v =>
                    v.cliente.toLowerCase().includes(q) ||
                    v.id.toString().includes(q) ||
                    (v.fecha && v.fecha.toLowerCase().includes(q)) ||
                    (v.tipo_comprobante && v.tipo_comprobante.toLowerCase().includes(q))
                );
            }

            setTotalItems(allVentas.length);
            setTotalPages(Math.ceil(allVentas.length / itemsPerPage));

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            setVentas(allVentas.slice(start, end));
        } catch (error) {
            if (error.name !== 'AbortError') setVentas([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, busqueda, dateRange]);

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

    useEffect(() => {
        const controller = new AbortController();
        fetchVentas(controller.signal);
        return () => controller.abort();
    }, [fetchVentas]);

    // KPI Calculations
    const stats = useMemo(() => {
        const totalAmount = ventas.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
        const activeSales = ventas.filter(v => v.estado === 'Emitida').length;
        const averageTicket = totalItems > 0 ? (totalAmount / totalItems) : 0;

        return {
            total: totalAmount,
            count: totalItems,
            active: activeSales,
            average: averageTicket
        };
    }, [ventas, totalItems]);

    const handleAnular = async (id) => {
        const result = await showConfirmationAlert(
            '¿Anular Venta?',
            "Esta acción generará una NOTA DE CRÉDITO y devolverá el stock. No se puede revertir.",
            'SÍ, ANULAR VENTA',
            'danger'
        );

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/notas-credito/crear/${id}/`, { method: 'POST' });
            const data = await response.json();

            if (data.ok) {
                await showSuccessAlert('Venta Anulada', `Comprobante generado: ${data.message || '#' + data.id}`);
                fetchVentas();
            } else {
                showErrorAlert('Error', data.error);
            }
        } catch (error) {
            showErrorAlert('Error', 'Error de conexión');
        }
    };

    const handleNotaDebito = (id) => {
        navigate(`/notas-debito/nuevo?venta_id=${id}`);
    };

    // Table Column Definitions
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
            key: 'tipo_comprobante',
            label: 'Tipo',
            align: 'center',
            width: '100px',
            render: (v) => (
                <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest border uppercase",
                    v === 'A' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        v === 'B' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            v === 'C' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                "bg-neutral-50 text-neutral-600 border-neutral-200"
                )}>
                    {v || '-'}
                </span>
            )
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
                    variant={v === 'Emitida' ? 'success' : v === 'Anulada' ? 'error' : 'default'}
                />
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'right',
            width: '180px',
            sortable: false,
            render: (_, v) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => navigate(`/ventas/${v.id}`)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Ver Detalle"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => handleNotaDebito(v.id)}
                        className="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Agregar Nota Débito"
                    >
                        <Plus size={18} />
                    </button>
                    <button
                        onClick={() => window.open(`/invoice/print/${v.id}/`, '_blank')}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
                        title="Imprimir"
                    >
                        <Printer size={18} />
                    </button>
                    {v.estado !== 'Anulada' && (
                        <button
                            onClick={() => handleAnular(v.id)}
                            className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                            title="Anular"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
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
                        <ShoppingCart className="text-primary-600" size={32} strokeWidth={2.5} />
                        Historial de Ventas
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1">
                        Control exhaustivo de transacciones y estados administrativos.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-sm hover:bg-neutral-50 transition-all shadow-sm">
                        <Download size={18} /> Exportar
                    </button>
                    <BtnAdd
                        label="NUEVA VENTA"
                        onClick={() => navigate('/ventas/nuevo')}
                        className="!bg-primary-600 !hover:bg-primary-700 !rounded-xl !px-6 !py-3 !font-black !tracking-widest !text-xs !shadow-lg !shadow-primary-600/20"
                    />
                </div>
            </header>

            {/* KPI Section */}
            <BentoGrid cols={4}>
                <StatCard
                    label="Ventas Totales"
                    value={`$${formatNumber(stats.total)}`}
                    icon={DollarSign}
                    color="primary"
                    trend="up"
                    trendValue="+12% vs mes anterior"
                />
                <StatCard
                    label="Operaciones"
                    value={stats.count}
                    icon={Hash}
                    color="success"
                />
                <StatCard
                    label="Ticket Promedio"
                    value={`$${formatNumber(stats.average)}`}
                    icon={TrendingUp}
                    color="warning"
                />
                <StatCard
                    label="Ventas Activas"
                    value={stats.active}
                    icon={Activity}
                    color="error"
                />
            </BentoGrid>

            {/* Filtration & Main Content */}
            <div className="flex flex-col flex-grow gap-4 min-h-0">
                <PremiumFilterBar
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    onClear={() => {
                        setBusqueda('');
                        setDateRange({
                            start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
                            end: getLocalDate()
                        });
                        setPage(1);
                    }}
                    placeholder="Buscar por cliente, ID o tipo de comprobante..."
                />

                {/* Table Container */}
                <div className="flex-grow flex flex-col min-h-0">
                    <PremiumTable
                        columns={columns}
                        data={ventas}
                        loading={loading}
                        className="flex-grow shadow-lg"
                        emptyState={
                            <EmptyState
                                title="No hay ventas registradas"
                                description="Los registros aparecerán aquí una vez proceses transacciones en la terminal."
                            />
                        }
                    />

                    {/* Pagination - Aligned with Premium Style */}
                    <div className="bg-white border-x border-b border-neutral-200 rounded-b-[2rem] px-6 py-1 shadow-premium">
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
        </div>
    );
};

export default Ventas;
