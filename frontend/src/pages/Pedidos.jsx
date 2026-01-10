import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Pedidos = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filtros - Inicializar con valores de la URL si existen
    const [filters, setFilters] = useState({
        busqueda: searchParams.get('busqueda') || '',
        estado: searchParams.get('estado') || '',
        fecha_desde: searchParams.get('fecha_desde') || '',
        fecha_hasta: searchParams.get('fecha_hasta') || ''
    });

    // Sincronizar filtros con la URL
    useEffect(() => {
        setFilters({
            busqueda: searchParams.get('busqueda') || '',
            estado: searchParams.get('estado') || '',
            fecha_desde: searchParams.get('fecha_desde') || '',
            fecha_hasta: searchParams.get('fecha_hasta') || ''
        });
        setPage(1);
    }, [searchParams]);

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: itemsPerPage,
                ...filters
            });

            const response = await fetch(`/api/pedidos/lista/?${params}`);
            const data = await response.json();

            setPedidos(data.pedidos || []);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error("Error al cargar pedidos:", error);
        } finally {
            setLoading(false);
        }
    }, [page, filters, itemsPerPage]);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    // Modal Facturar State
    const [showModalFacturar, setShowModalFacturar] = useState(false);
    const [pedidoFacturar, setPedidoFacturar] = useState(null);

    // Modal Success State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const handleFacturar = (id) => {
        setPedidoFacturar(id);
        setShowModalFacturar(true);
    };

    const closeModal = () => {
        setShowModalFacturar(false);
        setPedidoFacturar(null);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setSuccessData(null);
    };

    const confirmFacturar = async () => {
        if (!pedidoFacturar) return;

        try {
            const res = await fetch(`/api/pedidos/facturar/${pedidoFacturar}/`, { method: 'POST' });
            const data = await res.json();

            if (data.ok) {
                closeModal();
                setSuccessData(data);
                setShowSuccessModal(true);
                fetchPedidos();
            } else {
                alert(`Error al facturar: ${data.error}`);
            }
        } catch (e) {
            console.error("Error facturando", e);
            alert("Error de conexión al facturar.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este pedido?")) return;

        try {
            const res = await fetch(`/api/pedidos/eliminar/${id}/`, { method: 'POST' });
            const data = await res.json();
            if (res.ok && !data.error) {
                fetchPedidos();
            } else {
                alert(data.error || "No se pudo eliminar el pedido.");
            }
        } catch (e) {
            console.error("Error eliminado", e);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    return (
        <div className="flex-grow-1 overflow-auto bg-light">
            <div className="container-fluid px-4 pt-4">
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                    <div>
                        <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2.2rem' }}>
                            <i className="bi bi-cart-check-fill me-2" style={{ fontSize: '0.8em' }}></i>
                            Pedidos
                        </h2>
                        <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
                            Gestiona los pedidos de clientes pendientes de facturación.
                        </p>
                    </div>
                    <button className="btn btn-primary btn-lg shadow-sm" onClick={() => navigate('/pedidos/nuevo')}>
                        <i className="bi bi-plus-circle-fill me-2"></i> Nuevo Pedido
                    </button>
                </div>

                {/* FILTROS */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body bg-light rounded">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Buscar por cliente, ID..."
                                        name="busqueda"
                                        value={filters.busqueda}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <select className="form-select" name="estado" value={filters.estado} onChange={handleFilterChange}>
                                    <option value="">Todos los Estados</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="PREPARACION">En Preparación</option>
                                    <option value="LISTO">Listo</option>
                                    <option value="FACTURADO">Facturado</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    name="fecha_desde"
                                    value={filters.fecha_desde}
                                    onChange={handleFilterChange}
                                    title="Fecha Desde"
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    name="fecha_hasta"
                                    value={filters.fecha_hasta}
                                    onChange={handleFilterChange}
                                    title="Fecha Hasta"
                                />
                            </div>
                            <div className="col-md-1">
                                <button className="btn btn-outline-primary w-100" onClick={fetchPedidos} title="Actualizar Lista">
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="card border-0 shadow mb-5">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-secondary">
                                    <tr>
                                        <th className="ps-4 py-3">#</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th className="text-center">Estado</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </td>
                                        </tr>
                                    ) : pedidos.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted small">
                                                No se encontraron pedidos.
                                            </td>
                                        </tr>
                                    ) : (
                                        pedidos.map(p => (
                                            <tr key={p.id}>
                                                <td className="ps-4 fw-bold text-secondary">#{p.id}</td>
                                                <td>{p.fecha}</td>
                                                <td className="fw-bold text-dark">{p.cliente_nombre}</td>
                                                <td>{p.num_items} items</td>
                                                <td className="fw-bold font-monospace text-primary">{formatCurrency(p.total)}</td>
                                                <td className="text-center">
                                                    <span className={`badge rounded-3 px-3 py-2 fw-bold shadow-sm ${p.estado === 'FACTURADO' ? 'bg-success' :
                                                        p.estado === 'PENDIENTE' ? 'bg-warning text-dark' :
                                                            p.estado === 'CANCELADO' ? 'bg-danger' : 'bg-info'
                                                        }`}>
                                                        {p.estado_display}
                                                    </span>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        {p.estado !== 'FACTURADO' && (
                                                            <button
                                                                className="btn btn-sm btn-success text-white rounded-2 shadow-sm px-2"
                                                                onClick={() => handleFacturar(p.id)}
                                                                title="Facturar (Convertir a Venta)"
                                                            >
                                                                <i className="bi bi-receipt"></i>
                                                            </button>
                                                        )}
                                                        {/* Editar podria ir aqui */}
                                                        {p.estado !== 'FACTURADO' && (
                                                            <button className="btn btn-sm btn-danger rounded-2 shadow-sm px-2" onClick={() => handleDelete(p.id)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        )}
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
                                    <span className="text-muted small">Mostrando {pedidos.length} de {totalItems} registros</span>
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
                                            // Logic to show limited pages
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
            </div>
            {/* Modal Custom de Facturación */}
            {showModalFacturar && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="bg-white rounded p-4 shadow-lg text-center" style={{ width: '400px', borderRadius: '1rem' }}>
                        <div className="mb-3">
                            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle" style={{ width: '60px', height: '60px' }}>
                                <i className="bi bi-receipt" style={{ fontSize: '1.8rem' }}></i>
                            </div>
                        </div>
                        <h4 className="fw-bold mb-2">Facturar Pedido</h4>
                        <p className="text-muted mb-4 px-3">
                            ¿Confirma que desea facturar este pedido? <br />
                            <small>Se generará una venta y se descontará stock inmediatamente.</small>
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-light border flex-fill fw-bold" onClick={closeModal}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary flex-fill fw-bold shadow-sm" onClick={confirmFacturar}>
                                <i className="bi bi-check-lg me-1"></i> Facturar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Success */}
            {showSuccessModal && successData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="bg-white rounded p-4 shadow-lg text-center" style={{ width: '400px', borderRadius: '1rem' }}>
                        <div className="mb-3">
                            <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style={{ width: '60px', height: '60px' }}>
                                <i className="bi bi-check-lg" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                        </div>
                        <h4 className="fw-bold mb-2">¡Facturado con Éxito!</h4>
                        <p className="text-secondary mb-4 px-3">
                            El pedido se ha convertido en la Venta <strong>#{successData.venta_id}</strong> y el stock ha sido actualizado.
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-success flex-fill fw-bold shadow-sm py-2" onClick={closeSuccessModal}>
                                Aceptar
                            </button>
                            <a href={`/ventas/${successData.venta_id}/`} className="btn btn-outline-primary flex-fill fw-bold py-2">
                                Ver Venta <i className="bi bi-arrow-right-short"></i>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pedidos;
