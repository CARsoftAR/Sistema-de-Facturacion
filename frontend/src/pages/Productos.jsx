// Productos.jsx - Rediseño Premium 2025
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Package, Plus, Search, FilterX, Pencil, Trash2,
    AlertTriangle, CheckCircle, ListFilter, Tag,
    Hash, DollarSign, Activity, ChevronRight, Layers,
    Archive
} from 'lucide-react';

// Premium UI Components
import { StatCard, PremiumTable, TableCell, PremiumFilterBar } from '../components/premium';
import { BentoCard, BentoGrid } from '../components/premium/BentoCard';
import { Alert, showConfirmationAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { BtnAdd } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';
import { cn } from '../utils/cn';

const Productos = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [alertaStockMinimo, setAlertaStockMinimo] = useState(true);

    const STORAGE_KEY = 'table_prefs_productos_items';
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
    });

    // Filtros Auxiliares
    const [marcas, setMarcas] = useState([]);
    const [rubros, setRubros] = useState([]);

    const getFiltersFromURL = () => {
        const params = new URLSearchParams(location.search);
        return {
            busqueda: params.get('busqueda') || '',
            marca: params.get('marca') || '',
            rubro: params.get('rubro') || '',
            stock: params.get('stock') || 'todos'
        };
    };

    const [filters, setFilters] = useState(getFiltersFromURL());

    useEffect(() => {
        const loadConfigAndFilters = async () => {
            try {
                const [cRes, mRes, rRes] = await Promise.all([
                    fetch('/api/config/obtener/'),
                    fetch('/api/marcas/listar/'),
                    fetch('/api/rubros/listar/')
                ]);
                const cData = await cRes.json();
                const mData = await mRes.json();
                const rData = await rRes.json();

                if (cData.items_por_pagina && !localStorage.getItem(STORAGE_KEY)) {
                    setItemsPerPage(cData.items_por_pagina);
                }
                setAlertaStockMinimo(cData.alerta_stock_minimo !== false);
                setMarcas(mData.data || []);
                setRubros(rData.length ? rData : []);
            } catch (e) { console.error("Error loading initial data", e); }
        };
        loadConfigAndFilters();
    }, []);

    const fetchProductos = useCallback(async (signal) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                per_page: itemsPerPage,
                busqueda: filters.busqueda,
                marca: filters.marca,
                rubro: filters.rubro,
                stock: filters.stock
            });
            const response = await fetch(`/api/productos/lista/?${params}`, { signal });
            const data = await response.json();
            setProductos(data.productos || []);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || 0);
        } catch (error) {
            if (error.name !== 'AbortError') console.error(error);
        } finally { setLoading(false); }
    }, [page, filters, itemsPerPage]);

    useEffect(() => {
        const controller = new AbortController();
        fetchProductos(controller.signal);
        return () => controller.abort();
    }, [fetchProductos]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleDelete = async (id) => {
        const result = await showConfirmationAlert(
            "¿Eliminar Producto?",
            "Esta acción quitará el producto del catálogo activo. No afectará reportes de ventas pasadas.",
            "SÍ, ELIMINAR",
            "danger"
        );
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/productos/${id}/eliminar/`);
            if (res.ok) fetchProductos();
            else showErrorAlert("Error", "No se pudo eliminar el producto.");
        } catch (e) { showErrorAlert("Error", "Error de servidor"); }
    };

    // Stats calculation
    const stockStats = useMemo(() => {
        const sinStock = productos.filter(p => (p.stock_actual || p.stock) <= 0).length;
        const bajoStock = productos.filter(p => {
            const current = p.stock_actual || p.stock;
            return current <= p.stock_minimo && current > 0;
        }).length;
        return { sin: sinStock, bajo: bajoStock };
    }, [productos]);

    const handleEdit = (p) => navigate(`/productos/editar/${p.id}`);

    // Table Columns
    const columns = [
        {
            key: 'codigo',
            label: '# Cód.',
            width: '180px',
            render: (v) => <TableCell.ID value={v} />
        },
        {
            key: 'descripcion',
            label: 'Producto / Concepto',
            render: (v, p) => <TableCell.Primary value={p.nombre || v} />
        },
        {
            key: 'marca_nombre',
            label: 'Marca',
            width: '150px',
            render: (v, p) => (
                <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-black tracking-widest uppercase border border-neutral-200 inline-block">
                    {v || p.marca || 'Genérico'}
                </span>
            )
        },
        {
            key: 'rubro_nombre',
            label: 'Rubro',
            width: '150px',
            render: (v, p) => (
                <span className="px-2.5 py-0.5 bg-neutral-50 text-neutral-500 rounded-full text-[10px] font-black tracking-widest uppercase border border-neutral-100 inline-block">
                    {v || p.rubro || 'Sin Rubro'}
                </span>
            )
        },
        {
            key: 'precio_venta',
            label: 'Precio Unit.',
            align: 'right',
            width: '150px',
            render: (v, p) => {
                const precio = v || p.precio_efectivo || p.precio_tarjeta || p.precio_lista || 0;
                return <TableCell.Currency value={precio} />;
            }
        },
        {
            key: 'iva_alicuota',
            label: 'IVA',
            align: 'center',
            width: '100px',
            render: (v) => <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest border bg-neutral-50 text-neutral-500 border-neutral-200 uppercase">{v}%</span>
        },
        {
            key: 'stock_actual',
            label: 'Stock',
            align: 'center',
            width: '120px',
            render: (v, p) => {
                const stock = v !== undefined ? v : p.stock;
                const isLow = alertaStockMinimo && stock <= p.stock_minimo;
                const isEmpty = stock <= 0;
                return (
                    <div className="flex flex-col items-center gap-1">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-black border",
                            isEmpty ? "bg-red-50 text-red-600 border-red-200" :
                                isLow ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100" :
                                    "bg-emerald-50 text-emerald-600 border-emerald-200"
                        )}>
                            {stock}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'right',
            width: '120px',
            sortable: false,
            render: (_, p) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 transition-all">
                    <button
                        onClick={() => handleEdit(p)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                        <Package className="text-primary-600" size={32} strokeWidth={2.5} />
                        Catálogo de Productos
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1">
                        Visualización maestra de inventario, precios y stock en tiempo real.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-sm hover:bg-neutral-50 transition-all shadow-sm">
                        <Layers size={18} /> Categorías
                    </button>
                    <BtnAdd
                        label="NUEVO PRODUCTO"
                        onClick={() => navigate('/productos/nuevo')}
                        className="!bg-primary-600 !hover:bg-primary-700 !rounded-xl !px-6 !py-3 !font-black !tracking-widest !text-xs !shadow-lg !shadow-primary-600/20"
                    />
                </div>
            </header>

            {/* Stats */}
            <BentoGrid cols={4}>
                <StatCard
                    label="Items Totales"
                    value={totalItems}
                    icon={Archive}
                    color="primary"
                />
                <StatCard
                    label="Valorizado Ventas"
                    value={formatCurrency(productos.reduce((a, p) => a + ((p.stock_actual || p.stock) * (p.precio_venta || p.precio_efectivo || 0)), 0))}
                    icon={DollarSign}
                    color="success"
                />
                <StatCard
                    label="Stock Bajo"
                    value={stockStats.bajo}
                    icon={AlertTriangle}
                    color="warning"
                />
                <StatCard
                    label="Sin Stock"
                    value={stockStats.sin}
                    icon={Activity}
                    color="error"
                />
            </BentoGrid>

            {/* Main Content Area */}
            <div className="flex flex-col flex-grow gap-4 min-h-0">
                <PremiumFilterBar
                    busqueda={filters.busqueda}
                    setBusqueda={(v) => handleFilterChange('busqueda', v)}
                    showQuickFilters={false}
                    showDateRange={false}
                    onClear={() => { setFilters({ busqueda: '', marca: '', rubro: '', stock: 'todos' }); setPage(1); }}
                    placeholder="Buscar por nombre, código o rubro..."
                >
                    <select
                        className="bg-white border border-neutral-200 rounded-full px-6 h-[52px] text-[10px] font-black uppercase tracking-widest text-neutral-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm cursor-pointer appearance-none pr-12 min-w-[160px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                        value={filters.marca}
                        onChange={(e) => handleFilterChange('marca', e.target.value)}
                    >
                        <option value="">T. LAS MARCAS</option>
                        {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre.toUpperCase()}</option>)}
                    </select>

                    <select
                        className="bg-white border border-neutral-200 rounded-full px-6 h-[52px] text-[10px] font-black uppercase tracking-widest text-neutral-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm cursor-pointer appearance-none pr-12 min-w-[160px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                        value={filters.rubro}
                        onChange={(e) => handleFilterChange('rubro', e.target.value)}
                    >
                        <option value="">T. LOS RUBROS</option>
                        {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre.toUpperCase()}</option>)}
                    </select>

                    <select
                        className="bg-white border border-neutral-200 rounded-full px-6 h-[52px] text-[10px] font-black uppercase tracking-widest text-neutral-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm cursor-pointer appearance-none pr-12 min-w-[160px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                        value={filters.stock}
                        onChange={(e) => handleFilterChange('stock', e.target.value)}
                    >
                        <option value="todos">TODO EL STOCK</option>
                        <option value="con_stock">CON STOCK</option>
                        <option value="sin_stock">SIN STOCK</option>
                        <option value="bajo">STOCK BAJO</option>
                    </select>
                </PremiumFilterBar>

                <div className="flex-grow flex flex-col min-h-0">
                    <PremiumTable
                        columns={columns}
                        data={productos}
                        loading={loading}
                        className="flex-grow shadow-lg"
                        emptyState={
                            <EmptyState
                                title="No hay resultados"
                                description="Ajusta los filtros o agrega una nueva referencia al catálogo."
                                icon={Package}
                            />
                        }
                    />

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

const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

export default Productos;
