import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ListFilter, Download, ArrowUp, ArrowDown, Package, Calendar, RefreshCcw, FilterX } from 'lucide-react';
import axios from 'axios';
import TablePagination from '../components/common/TablePagination';
import PremiumTable from '../components/premium/PremiumTable';
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
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

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
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta
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
    }, [currentPage, itemsPerPage, searchTerm, tipoFiltro, fechaDesde, fechaHasta]);

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
        setFechaDesde('');
        setFechaHasta('');
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
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-neutral-50/30">
            {/* Header / Toolbar Area */}
            <div className="p-8 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
                                <RefreshCcw size={24} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Movimientos de Stock</h1>
                        </div>
                        <p className="text-neutral-500 font-medium ml-1">Historial completo detallado de entradas y salidas.</p>
                    </div>

                    <button
                        onClick={handleExportExcel}
                        disabled={movimientos.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={20} strokeWidth={3} />
                        Exportar Excel
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/60">
                    <div className="flex flex-col md:flex-row gap-3 items-end">
                        <div className="relative flex-1 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1 ml-1">Búsqueda</label>
                            <SearchInput
                                placeholder="Buscar por código, descripción, referencia..."
                                value={searchTerm}
                                onSearch={setSearchTerm}
                                className="!py-3 border-neutral-200"
                            />
                        </div>

                        <div className="w-full md:w-48">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1 ml-1">Tipo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <ListFilter size={18} className="text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <select
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all font-bold text-neutral-800 appearance-none cursor-pointer shadow-sm"
                                    value={tipoFiltro}
                                    onChange={(e) => setTipoFiltro(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="IN">Entradas</option>
                                    <option value="OUT">Salidas</option>
                                </select>
                            </div>
                        </div>

                        <div className="w-full md:w-48">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1 ml-1">Desde</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Calendar size={18} className="text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all font-bold text-neutral-800 shadow-sm"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-48">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1 ml-1">Hasta</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Calendar size={18} className="text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all font-bold text-neutral-800 shadow-sm"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={limpiarFiltros}
                            className="p-4 bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-300 rounded-2xl transition-all shadow-sm"
                            title="Limpiar Filtros"
                        >
                            <FilterX size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 px-8 pb-8 overflow-hidden min-h-0">
                <div className="h-full bg-white rounded-[2.5rem] border border-neutral-200 shadow-xl shadow-neutral-200/50 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-hidden">
                        <PremiumTable
                            columns={columns}
                            data={movimientos}
                            loading={loading}
                            emptyMessage={
                                <EmptyState
                                    icon={Package}
                                    title="No se encontraron movimientos"
                                    description="Intenta ajustar los filtros para encontrar lo que buscas."
                                    iconColor="text-emerald-500"
                                    bgIconColor="bg-emerald-50"
                                />
                            }
                        />
                    </div>

                    <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
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
                </div>
            </div>
        </div>
    );
};

export default MovimientosStock;
