import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Printer, Eye, FileText, Calendar, Search,
    Truck, Plus, FilterX, ChevronRight, ListFilter
} from 'lucide-react';
import { BtnView, BtnPrint, BtnClear, BtnAdd } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';
import TablePagination from '../components/common/TablePagination';
import { PremiumTable, TableCell, PremiumFilterBar } from '../components/premium';
import { cn } from '../utils/cn';

const STORAGE_KEY = 'table_prefs_remitos_items';

const Remitos = () => {
    const navigate = useNavigate();
    const [remitos, setRemitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
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

    const [filters, setFilters] = useState({
        busqueda: ''
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

    const fetchRemitos = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                per_page: itemsPerPage,
                q: filters.busqueda,
                fecha_start: dateRange.start,
                fecha_end: dateRange.end
            });
            const response = await fetch(`/api/remitos/listar/?${params}`);
            const data = await response.json();

            if (data.remitos) {
                setRemitos(data.remitos);
                setTotalPages(data.total_pages);
                setTotalItems(data.total);
            } else {
                setRemitos([]);
            }
        } catch (error) {
            console.error("Error al cargar remitos:", error);
            setRemitos([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters, dateRange]);

    useEffect(() => {
        fetchRemitos();
    }, [fetchRemitos]);

    const handlePrint = (id) => {
        window.open(`/comprobantes/remito/${id}/imprimir/`, '_blank');
    };

    const handleView = (id) => {
        navigate(`/remitos/${id}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

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

    const clearFilters = () => {
        setFilters({ busqueda: '' });
        setDateRange({
            start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
            end: getLocalDate()
        });
        setPage(1);
    };

    const columns = [
        {
            key: 'numero',
            label: '# Número',
            width: '180px',
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
            key: 'venta_str',
            label: 'Venta Asoc.',
            width: '180px',
            render: (v, row) => (
                row.venta_id ? (
                    <TableCell.Status value={`FC: ${v}`} variant="default" />
                ) : <span className="text-neutral-300">-</span>
            )
        },
        {
            key: 'estado',
            label: 'Estado',
            width: '150px',
            align: 'center',
            render: (v) => {
                const variantMap = {
                    'ENTREGADO': 'success',
                    'EN_CAMINO': 'warning',
                    'GENERADO': 'info',
                    'ANULADO': 'error'
                };
                return <TableCell.Status value={v === 'EN_CAMINO' ? 'EN CAMINO' : v} variant={variantMap[v] || 'default'} />;
            }
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '150px',
            align: 'right',
            sortable: false,
            render: (_, row) => (
                <div className="flex justify-end items-center gap-1">
                    <button
                        onClick={() => handleView(row.id)}
                        className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-primary-600 transition-all"
                        title="Ver Detalle"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => handlePrint(row.id)}
                        className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-900 transition-all"
                        title="Imprimir"
                    >
                        <Printer size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                        <Truck className="text-blue-600" size={32} strokeWidth={2.5} />
                        Remitos
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1">
                        Gestión de entregas y traslados de mercadería.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-sm hover:bg-neutral-50 transition-all shadow-sm">
                        <Printer size={18} /> Exportar
                    </button>
                </div>
            </header>

            <PremiumFilterBar
                busqueda={filters.busqueda}
                setBusqueda={(val) => setFilters(prev => ({ ...prev, busqueda: val }))}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onClear={clearFilters}
                placeholder="Buscar por cliente o número..."
            />

            {/* Table Container */}
            <div className="flex-grow flex flex-col min-h-0">
                <PremiumTable
                    columns={columns}
                    data={remitos}
                    loading={loading}
                    className={cn("flex-grow shadow-lg", remitos.length > 0 ? "rounded-b-none" : "")}
                    emptyState={
                        <EmptyState
                            icon={Truck}
                            title="Sin Remitos"
                            description="No se encontraron remitos que coincidan con los filtros."
                        />
                    }
                />

                {/* Pagination */}
                {remitos.length > 0 && (
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
                )}
            </div>
        </div>
    );
};

export default Remitos;
