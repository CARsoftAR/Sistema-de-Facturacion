
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Pencil, Trash2, Search, Plus, RotateCcw, Package, AlertTriangle, CheckCircle } from 'lucide-react';
// import ProductoForm from '../components/productos/ProductoForm'; // Removed as we use page now
import { BtnAdd, BtnEdit, BtnDelete, BtnAction, BtnClear, BtnVertical } from '../components/CommonButtons';
import { showDeleteAlert } from '../utils/alerts';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';
import { useNavigate } from 'react-router-dom';

const Productos = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const STORAGE_KEY = 'table_prefs_productos_items';
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
    });
    const [alertaStockMinimo, setAlertaStockMinimo] = useState(true);

    useEffect(() => {
        if (true) { // Siempre cargamos para obtener otras config como alertaStockMinimo
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => {
                    if (data.items_por_pagina && !localStorage.getItem(STORAGE_KEY)) {
                        setItemsPerPage(data.items_por_pagina);
                    }
                    if (data.alerta_stock_minimo !== undefined) {
                        setAlertaStockMinimo(data.alerta_stock_minimo);
                    }
                })
                .catch(console.error);
        }
    }, []);

    // Filtros - Inicializar con valores de la URL actual
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

    // Auxiliares para filtros
    const [marcas, setMarcas] = useState([]);
    const [rubros, setRubros] = useState([]);

    // Sincronizar filtros con la URL cuando cambia location.search
    useEffect(() => {
        setFilters(getFiltersFromURL());
        setPage(1);
    }, [location.search]);

    // Modal Form (Deprecated for Page)
    // const [showForm, setShowForm] = useState(false);
    // const [editingProduct, setEditingProduct] = useState(null);

    const fetchProductos = useCallback(async (signal) => {
        if (itemsPerPage === 0) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: itemsPerPage,
                ...filters
            });

            const response = await fetch(`/api/productos/lista/?${params}`, { signal });
            const data = await response.json();

            setProductos(data.productos || []);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || 0);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Error al cargar productos:", error);
            }
        } finally {
            setLoading(false);
        }
    }, [page, filters, itemsPerPage]);

    // Cargar filtros auxiliares (solo una vez)
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [mRes, rRes] = await Promise.all([
                    fetch('/api/marcas/listar/'),
                    fetch('/api/rubros/listar/')
                ]);
                const mData = await mRes.json();
                const rData = await rRes.json();
                setMarcas(mData.data || []);
                setRubros(rData.length ? rData : []);
            } catch (e) {
                console.error("Error cargando filtros", e);
            }
        };
        loadFilters();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchProductos(controller.signal);
        return () => controller.abort();
    }, [fetchProductos]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleCreate = () => {
        navigate('/productos/nuevo');
    };

    const handleEdit = (producto) => {
        navigate(`/productos/editar/${producto.id}`);
    };

    const handleDelete = async (id) => {
        const result = await showDeleteAlert(
            "¿Eliminar producto?",
            "Esta acción eliminará el producto del catálogo. El historial de ventas no se borra, pero dejará de estar disponible para nuevas operaciones.",
            'Eliminar',
            {
                iconComponent: (
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger mx-auto" style={{ width: '80px', height: '80px' }}>
                        <Package size={40} strokeWidth={1.5} />
                    </div>
                )
            }
        );
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/productos/${id}/eliminar/`);
            if (res.ok) {
                fetchProductos();
            } else {
                alert("No se pudo eliminar el producto.");
            }
        } catch (e) {
            console.error("Error eliminado", e);
        }
    };

    const handleSave = () => {
        fetchProductos();
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    return (
        <div className="container-fluid px-4 pt-4 pb-0 bg-light fade-in main-content-container">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Package className="me-2 inline-block" size={32} />
                        Productos
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestiona el catálogo completo de productos y servicios.
                    </p>
                </div>
                <BtnAdd label="Nuevo Producto" icon={Package} onClick={handleCreate} className="btn-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 active:scale-95 transition-all" />
            </div>

            {/* FILTROS */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por código, descripción..."
                                    name="busqueda"
                                    value={filters.busqueda}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" name="marca" value={filters.marca} onChange={handleFilterChange}>
                                <option value="">Todas las Marcas</option>
                                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" name="rubro" value={filters.rubro} onChange={handleFilterChange}>
                                <option value="">Todos los Rubros</option>
                                {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" name="stock" value={filters.stock} onChange={handleFilterChange}>
                                <option value="todos">Todo el Stock</option>
                                <option value="con_stock">Con Stock</option>
                                <option value="sin_stock">Sin Stock</option>
                                <option value="bajo">Stock Bajo</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <BtnClear onClick={() => { setFilters({ busqueda: '', marca: '', rubro: '', stock: 'todos' }); setPage(1); }} className="w-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div className="card border-0 shadow mb-4 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold">Código</th>
                                    <th className="py-3 fw-bold">Descripción</th>
                                    <th className="py-3 fw-bold">Marca / Rubro</th>
                                    <th className="py-3 fw-bold">Precio</th>
                                    <th className="text-center py-3 fw-bold">IVA</th>
                                    <th className="text-center py-3 fw-bold">Stock</th>
                                    <th className="text-end pe-4 py-3 fw-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : productos.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-5">
                                            <EmptyState
                                                icon={Package}
                                                title="No hay productos"
                                                description="Agrega nuevos productos para gestionar tu inventario."
                                                iconColor="text-blue-500"
                                                bgIconColor="bg-blue-50"
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    productos.map(p => (
                                        <tr key={p.id} className="border-bottom-0">
                                            <td className="ps-4 py-3">
                                                <span className="font-monospace small bg-light border px-2 py-1 rounded text-dark fw-medium">{p.codigo || '-'}</span>
                                            </td>
                                            <td className="py-3">
                                                <div className="fw-bold text-dark">{p.nombre || p.descripcion}</div>
                                                <div className="text-muted small fw-medium">{p.descripcion || 'Sin descripción'}</div>
                                            </td>
                                            <td className="py-3">
                                                <div className="badge bg-light text-dark border me-1 fw-medium">{p.marca_nombre || p.marca || 'Sin Marca'}</div>
                                                <div className="badge bg-light text-secondary border fw-medium">{p.rubro_nombre || p.rubro || 'Sin Rubro'}</div>
                                            </td>
                                            <td className="fw-bold text-success py-3">
                                                $ {parseFloat(p.precio_venta || p.precio_efectivo).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-center py-3">
                                                <span className="badge bg-slate-100 text-slate-600 border fw-bold">
                                                    {p.iva_alicuota}%
                                                </span>
                                            </td>
                                            <td className="text-center py-3">
                                                <span className={`badge rounded-pill fw-medium px-3 py-2 ${(!alertaStockMinimo || p.stock_actual > p.stock_minimo || p.stock > p.stock_minimo) ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                                                    {p.stock_actual !== undefined ? p.stock_actual : p.stock}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <BtnEdit onClick={() => handleEdit(p)} />
                                                        <BtnDelete onClick={() => handleDelete(p.id)} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    {/* PAGINACIÓN */}
                    {/* PAGINACIÓN */}
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

            {/* Modal Form Overlay - Removed */}
            {/* {showForm && (
                <ProductoForm
                    producto={editingProduct}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                />
            )} */}
        </div>
    );
};

export default Productos;
