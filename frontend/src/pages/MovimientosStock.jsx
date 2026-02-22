import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ListFilter, Download, ArrowUp, ArrowDown, Package, Calendar, RefreshCcw, FilterX, History as HistoryIcon } from 'lucide-react';
import axios from 'axios';
import TablePagination from '../components/common/TablePagination';
import PremiumTable from '../components/premium/PremiumTable';
import PremiumFilterBar from '../components/premium/PremiumFilterBar';
import { BtnBack, BtnClear } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';
import { cn } from '../utils/cn';
import { SearchInput } from '../components/premium/PremiumInput';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'table_prefs_movimientos_items';

const MovimientosStock = () => {
    const navigate = useNavigate();
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
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

    const fetchMovimientos = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: itemsPerPage,
                search: searchTerm,
                tipo: tipoFiltro,
                fecha_desde: dateRange.start,
                fecha_hasta: dateRange.end
            };

            const response = await axios.get('/api/stock/movimientos/', { params });

            setMovimientos(response.data.movimientos || []);
            setTotalPages(response.data.total_pages || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error('Error cargando movimientos:', error);
            setMovimientos([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, tipoFiltro, dateRange]);

    useEffect(() => {
        fetchMovimientos();
    }, [fetchMovimientos]);

    const handleExportExcel = () => {
        const data = movimientos.map(mov => ({
            'Fecha': new Date(mov.fecha).toLocaleString('es-AR'),
            'Producto': `${mov.producto_codigo} - ${mov.producto_descripcion}`,
            'Tipo': mov.tipo_display,
            'Cantidad': mov.cantidad,
            'Referencia': mov.referencia,
            'Observaciones': mov.observaciones
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Movimientos Stock');
        XLSX.writeFile(wb, `movimientos_stock_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setTipoFiltro('');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };

    const columns = [
        {
            key: 'fecha',
            label: 'Fecha',
            width: '160px',
            render: (value) => (
                <div className="flex flex-col">
                    <span className="font-bold text-neutral-800">
                        {new Date(value).toLocaleDateString('es-AR')}
                    </span>
                    <span className="text-neutral-400 text-xs font-medium">
                        {new Date(value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        },
        {
            key: 'producto',
            label: 'Producto',
            width: '280px',
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="inline-block w-fit mb-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                        {row.producto_codigo}
                    </span>
                    <span className="font-bold text-neutral-700 truncate" title={row.producto_descripcion}>
                        {row.producto_descripcion}
                    </span>
                </div>
            )
        },
        {
            key: 'tipo',
            label: 'Tipo',
            width: '140px',
            align: 'center',
            render: (value) => (
                value === 'IN' ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border bg-emerald-50 text-emerald-600 border-emerald-100 gap-1">
                        <ArrowUp size={12} strokeWidth={3} />
                        ENTRADA
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border bg-rose-50 text-rose-600 border-rose-100 gap-1">
                        <ArrowDown size={12} strokeWidth={3} />
                        SALIDA
                    </span>
                )
            )
        },
        {
            key: 'cantidad',
            label: 'Cant.',
            width: '100px',
            align: 'right',
            render: (value, row) => (
                <span className={`font-black text-lg ${row.tipo === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.tipo === 'IN' ? '+' : '-'}{value}
                </span>
            )
        },
        {
            key: 'referencia',
            label: 'Referencia',
            width: '200px',
            render: (value) => (
                <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-neutral-100 text-neutral-600 border border-neutral-200 uppercase truncate max-w-full">
                    {value}
                </span>
            )
        },
        {
            key: 'observaciones',
            label: 'Observaciones',
            width: '250px',
            render: (value) => (
                <div className="text-neutral-500 text-sm italic truncate" title={value}>
                    {value || '—'}
                </div>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <HistoryIcon size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Movimientos
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Historial completo detallado de entradas y salidas.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        disabled={movimientos.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-sm hover:bg-neutral-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} /> Exportar Excel
                    </button>
                </div>
            </header>

            <PremiumFilterBar
                busqueda={searchTerm}
                setBusqueda={setSearchTerm}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onClear={limpiarFiltros}
                placeholder="Buscar por código, descripción, referencia..."
            >
                <select
                    className="bg-white border border-neutral-200 rounded-full px-6 h-[52px] text-[10px] font-black uppercase tracking-widest text-neutral-600 focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm cursor-pointer appearance-none pr-12 min-w-[200px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                >
                    <option value="">TODOS</option>
                    <option value="IN">ENTRADAS</option>
                    <option value="OUT">SALIDAS</option>
                </select>
            </PremiumFilterBar>

            <div className="flex-grow flex flex-col min-h-0">
                <PremiumTable
                    columns={columns}
                    data={movimientos}
                    loading={loading}
                    className={cn("flex-grow shadow-lg", movimientos.length > 0 ? "rounded-b-none" : "")}
                    emptyState={
                        <EmptyState
                            icon={Package}
                            title="No se encontraron movimientos"
                            description="Intenta ajustar los filtros para encontrar lo que buscas."
                            iconColor="text-emerald-500"
                            bgIconColor="bg-emerald-50"
                        />
                    }
                />

                {movimientos.length > 0 && (
                    <div className="bg-white border-x border-b border-neutral-200 rounded-b-[2rem] px-6 py-1 shadow-premium">
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(newVal) => {
                                setItemsPerPage(newVal);
                                setCurrentPage(1);
                                localStorage.setItem(STORAGE_KEY, newVal);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovimientosStock;
