import React, { useState, useEffect, useCallback } from 'react';
import ProductoForm from '../components/productos/ProductoForm';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default per page

    // Filtros
    const [filters, setFilters] = useState({
        busqueda: '',
        marca: '',
        rubro: '',
        stock: 'todos'
    });

    // Auxiliares para filtros
    const [marcas, setMarcas] = useState([]);
    const [rubros, setRubros] = useState([]);

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

    // Helper para formato de moneda (aunque Ventas.html no lo muestra en el snippet, usamos el estándar)
    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    return (
        <div className="container-fluid px-4 mt-4">

            {/* HEADER: Título y Botón Principal (Idéntico a ventas.html) */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2.2rem' }}>
                        <i className="bi bi-box-seam-fill me-2" style={{ fontSize: '0.8em' }}></i>
                        Productos
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
                        Gestiona el catálogo completo de productos y servicios.
                    </p>
                </div>
                <button className="btn btn-primary btn-lg shadow-sm" onClick={handleCreate}>
                    <i className="bi bi-plus-circle-fill me-2"></i> Nuevo Producto
                </button>
            </div>

            {/* FILTROS (Idéntico a ventas.html) */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
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
                        <div className="col-md-3">
                            <select className="form-select" name="stock" value={filters.stock} onChange={handleFilterChange}>
                                <option value="todos">Todo el Stock</option>
                                <option value="con_stock">Con Stock</option>
                                <option value="sin_stock">Sin Stock</option>
                                <option value="stock_bajo">Stock Bajo</option>
                            </select>
                        </div>
                        <div className="col-md-1">
                            <button className="btn btn-outline-secondary w-100" onClick={fetchProductos} title="Actualizar">
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA (Idéntico a ventas.html) */}
            <div className="card border-0 shadow mb-5">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4 py-3">Código</th>
                                    <th>Descripción</th>
                                    <th>Marca / Rubro</th>
                                    <th>Precio</th>
                                    <th className="text-center">Stock</th>
                                    <th className="text-end pe-4">Acciones</th>
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
                                        <tr key={p.id}>
                                            <td className="ps-4 fw-bold text-secondary">{p.codigo}</td>
                                            <td>{p.descripcion}</td>
                                            <td className="text-muted small">
                                                {p.marca || '-'}<br />
                                                <span className="text-opacity-50">{p.rubro}</span>
                                            </td>
                                            <td className="fw-bold">{formatCurrency(p.precio_efectivo)}</td>
                                            <td className="text-center">
                                                <span className={`badge ${p.stock <= 0 ? 'bg-danger' : p.stock < 10 ? 'bg-warning text-dark' : 'bg-success'} rounded-pill`}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-1">
                                                    <button className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(p)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(p.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN Y CONTADOR (Idéntico a ventas.html) */}
                    {!loading && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Mostrando {productos.length} de {totalItems} registros</span>
                                <select
                                    className="form-select form-select-sm border-secondary-subtle"
                                    style={{ width: '70px' }}
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <span className="text-muted small">por pág.</span>
                            </div>

                            <nav>
                                <ul className="pagination mb-0 align-items-center gap-2">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link border-0 text-secondary bg-transparent p-0"
                                            onClick={() => setPage(page - 1)}
                                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <i className="bi bi-chevron-left"></i>
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
                                            <i className="bi bi-chevron-right"></i>
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
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1045 }} onClick={() => setShowForm(false)}></div>
                    <ProductoForm
                        producto={editingProduct}
                        onClose={() => setShowForm(false)}
                        onSave={handleSave}
                    />
                </>
            )}
        </div>
    );
};

export default Productos;
