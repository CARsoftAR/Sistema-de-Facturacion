
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Plus, Search, Calendar, RefreshCw, Check, AlertCircle, FileText, Trash2, CheckCircle2, Clock, Eye } from 'lucide-react';
import { BtnAdd, BtnDelete, BtnAction, BtnClear, BtnVertical } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';

const Pedidos = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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

    const handlePrint = (id) => {
        window.open(`/pedidos/imprimir/${id}/?model=modern`, '_blank');
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

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'FACTURADO':
                return <span className="badge rounded-pill bg-success-subtle text-success border border-success"><CheckCircle2 size={12} className="me-1 inline-block" /> Facturado</span>;
            case 'PENDIENTE':
                return <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle"><Clock size={12} className="me-1 inline-block" /> Pendiente</span>;
            case 'CANCELADO':
                return <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger"><AlertCircle size={12} className="me-1 inline-block" /> Cancelado</span>;
            default:
                return <span className="badge rounded-pill bg-info-subtle text-info-emphasis border border-info-subtle">{estado}</span>;
        }
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-3 main-content-container bg-light fade-in">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <ShoppingCart className="me-2 inline-block" size={32} />
                        Pedidos
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestiona los pedidos de clientes pendientes de facturación.
                    </p>
                </div>
                <BtnAdd
                    label="Nuevo Pedido"
                    className="btn-lg shadow-sm"
                    onClick={() => navigate('/pedidos/nuevo')}
                />
            </div>

            {/* FILTROS */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3 align-items-center">
                        {/* Buscador - Izquierda */}
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
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

                        {/* Filtros - Centro/Derecha */}
                        <div className="col-md-3">
                            <select className="form-select" name="estado" value={filters.estado} onChange={handleFilterChange}>
                                <option value="">Todos los Estados</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="PREPARACION">En Preparación</option>
                                <option value="LISTO">Listo</option>
                                <option value="FACTURADO">Facturado</option>
                            </select>
                        </div>

                        {/* Fechas */}
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

                        {/* Botón Refrescar/Limpiar - Derecha Extrema */}
                        <div className="col-md-1 ms-auto text-end">
                            <BtnClear onClick={() => { setFilters({ busqueda: '', estado: '', fecha_desde: '', fecha_hasta: '' }); setPage(1); }} className="w-100" label="Limpiar" />
                        </div>
                    </div>
                </div>
            </div>


            {/* TABLA */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="bg-white border-bottom">
                                <tr>
                                    <th className="ps-4 py-3 text-dark fw-bold"># Pedido</th>
                                    <th className="py-3 text-dark fw-bold">Fecha</th>
                                    <th className="py-3 text-dark fw-bold">Cliente</th>
                                    <th className="py-3 text-dark fw-bold">Items</th>
                                    <th className="py-3 text-dark fw-bold">Total</th>
                                    <th className="text-center py-3 text-dark fw-bold">Estado</th>
                                    <th className="text-end pe-4 py-3 text-dark fw-bold">Acciones</th>
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
                                        <td colSpan="7" className="py-5">
                                            <EmptyState
                                                title="No hay pedidos pendientes"
                                                description="Los pedidos de clientes aparecerán aquí."
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    pedidos.map(p => (
                                        <tr key={p.id} className="border-bottom-0">
                                            <td className="ps-4 fw-bold text-primary py-3">#{p.id}</td>
                                            <td className="py-3">{p.fecha}</td>
                                            <td className="fw-medium py-3">{p.cliente_nombre}</td>
                                            <td className="py-3"><span className="badge bg-light text-dark border">{p.num_items} items</span></td>
                                            <td className="fw-bold text-success py-3">{formatCurrency(p.total)}</td>
                                            <td className="text-center py-3">
                                                {getEstadoBadge(p.estado)}
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnVertical
                                                        icon={Eye}
                                                        label="Ver"
                                                        color="primary"
                                                        onClick={() => navigate(`/pedidos/${p.id}`)}
                                                        title="Ver Detalle del Pedido"
                                                    />
                                                    {p.estado !== 'FACTURADO' && (
                                                        <BtnVertical
                                                            icon={FileText}
                                                            label="Facturar"
                                                            color="success"
                                                            onClick={() => handleFacturar(p.id)}
                                                            title="Facturar (Convertir a Venta)"
                                                        />
                                                    )}
                                                    <BtnVertical
                                                        icon={FileText}
                                                        label="Imprimir"
                                                        color="info"
                                                        onClick={() => handlePrint(p.id)}
                                                        title="Imprimir Presupuesto / Pedido"
                                                    />
                                                    {p.estado !== 'FACTURADO' && (
                                                        <BtnVertical
                                                            icon={Trash2}
                                                            label="Eliminar"
                                                            color="danger"
                                                            onClick={() => handleDelete(p.id)}
                                                            title="Eliminar Pedido"
                                                        />
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
            {/* Modal Custom de Facturación */}
            {
                showModalFacturar && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 border border-slate-200">
                            <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                <FileText size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">Facturar Pedido</h4>
                            <p className="text-muted text-sm mb-6">
                                ¿Confirma que desea facturar este pedido? <br />
                                <span className="text-xs">Se generará una venta y se descontará stock.</span>
                            </p>
                            <div className="flex gap-3">
                                <button className="flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2" onClick={confirmFacturar}>
                                    <Check size={18} /> Facturar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Modal Success */}
            {
                showSuccessModal && successData && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 border border-slate-200">
                            <div className="mx-auto bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <CheckCircle2 size={36} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">¡Facturado con Éxito!</h4>
                            <p className="text-slate-500 text-sm mb-6 px-2">
                                El pedido se ha convertido en la Venta <strong className="text-slate-800">#{successData.venta_id}</strong>.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-colors" onClick={closeSuccessModal}>
                                    Aceptar
                                </button>
                                <a href={`/ventas/${successData.venta_id}/`} className="w-full py-2.5 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition-colors text-sm">
                                    Ver Venta
                                </a>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Pedidos;
