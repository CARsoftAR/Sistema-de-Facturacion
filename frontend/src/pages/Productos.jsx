
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Search, Plus, RotateCcw, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import ProductoForm from '../components/productos/ProductoForm';
import { BtnAdd, BtnEdit, BtnDelete, BtnAction, BtnClear, BtnVertical } from '../components/CommonButtons';

const Productos = () => {
    const [searchParams] = useSearchParams();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default per page

    useEffect(() => {
        fetch('/api/config/obtener/')
            .then(res => res.json())
            .then(data => {
                if (data.items_por_pagina) setItemsPerPage(data.items_por_pagina);
            })
            .catch(console.error);
    }, []);

    // Filtros - Inicializar con valores de la URL si existen
    const [filters, setFilters] = useState({
        busqueda: searchParams.get('busqueda') || '',
        marca: searchParams.get('marca') || '',
        rubro: searchParams.get('rubro') || '',
        stock: searchParams.get('stock') || 'todos'
    });

    // Auxiliares para filtros
    const [marcas, setMarcas] = useState([]);
    const [rubros, setRubros] = useState([]);

    // Sincronizar filtros con la URL cuando cambien los parámetros
    useEffect(() => {
        setFilters({
            busqueda: searchParams.get('busqueda') || '',
            marca: searchParams.get('marca') || '',
            rubro: searchParams.get('rubro') || '',
            stock: searchParams.get('stock') || 'todos'
        });
        setPage(1);
    }, [searchParams]);

    // Modal Form
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProductos = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: itemsPerPage,
                ...filters
            });

            const response = await fetch(`/api/productos/lista/?${params}`);
            const data = await response.json();

            setProductos(data.productos || []);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error("Error al cargar productos:", error);
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
        fetchProductos();
    }, [fetchProductos]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEdit = async (producto) => {
        try {
            const res = await fetch(`/api/productos/${producto.id}/`);
            const completeData = await res.json();
            setEditingProduct(completeData);
            setShowForm(true);
        } catch (e) {
            console.error("Error al cargar detalle", e);
            alert("No se pudo cargar el detalle del producto.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este producto?")) return;

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
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in" style={{ maxHeight: '100vh', overflow: 'hidden' }}>

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
                <BtnAdd label="Nuevo Producto" onClick={handleCreate} className="btn-lg shadow-sm" />
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
                    <div className="table-responsive flex-grow-1 overflow-auto">
                        <table className="table align-middle mb-0">
                            <thead className="bg-white border-bottom">
                                <tr>
                                    <th className="ps-4 py-3 text-dark fw-bold">Código</th>
                                    <th className="py-3 text-dark fw-bold">Descripción</th>
                                    <th className="py-3 text-dark fw-bold">Marca / Rubro</th>
                                    <th className="py-3 text-dark fw-bold">Precio</th>
                                    <th className="text-center py-3 text-dark fw-bold">Stock</th>
                                    <th className="text-end pe-4 py-3 text-dark fw-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : productos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted small">
                                            No se encontraron productos.
                                        </td>
                                    </tr>
                                ) : (
                                    productos.map(p => (
                                        <tr key={p.id} className="border-bottom-0">
                                            <td className="ps-4 fw-bold text-secondary font-monospace py-3">{p.codigo}</td>
                                            <td className="fw-medium text-dark py-3">{p.descripcion}</td>
                                            <td className="text-muted small py-3">
                                                <div className="fw-bold text-secondary">{p.marca || '-'}</div>
                                                <span className="text-opacity-75">{p.rubro}</span>
                                            </td>
                                            <td className="fw-bold text-success py-3">{formatCurrency(p.precio_efectivo)}</td>
                                            <td className="text-center py-3">
                                                <span className={`badge rounded-pill border py-2 px-3 ${p.stock <= 0 ? 'bg-danger-subtle text-danger border-danger' : p.stock < 10 ? 'bg-warning-subtle text-warning-emphasis border-warning' : 'bg-success-subtle text-success border-success'}`}>
                                                    {p.stock <= 0 && <AlertTriangle size={12} className="me-1 inline" />}
                                                    {p.stock > 10 && <CheckCircle size={12} className="me-1 inline" />}
                                                    {p.stock} u.
                                                </span>
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnVertical
                                                        icon={Box}
                                                        label="Editar"
                                                        onClick={() => handleEdit(p)}
                                                        color="warning"
                                                        title="Editar Producto"
                                                    />
                                                    <BtnVertical
                                                        icon={Plus}
                                                        label="Eliminar"
                                                        onClick={() => handleDelete(p.id)}
                                                        color="danger"
                                                        title="Eliminar Producto"
                                                        className="rotate-icon-45"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    {!loading && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Mostrando {productos.length} de {totalItems} registros</span>
                            </div>

                            <nav>
                                <ul className="pagination mb-0 align-items-center gap-2">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link border-0 text-secondary bg-transparent p-0"
                                            onClick={() => setPage(page - 1)}
                                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            &lt;
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => {
                                        if (totalPages > 10 && Math.abs(page - (i + 1)) > 2 && i !== 0 && i !== totalPages - 1) return null;
                                        return (
                                            <li key={i} className="page-item">
                                                <button
                                                    className={`page-link border-0 rounded-circle fw-bold ${page === i + 1 ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary'}`}
                                                    onClick={() => setPage(i + 1)}
                                                    style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {i + 1}
                                                </button>
                                            </li>
                                        );
                                    })}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link border-0 text-secondary bg-transparent p-0"
                                            onClick={() => setPage(page + 1)}
                                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            &gt;
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form Overlay */}
            {showForm && (
                <ProductoForm
                    producto={editingProduct}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default Productos;
