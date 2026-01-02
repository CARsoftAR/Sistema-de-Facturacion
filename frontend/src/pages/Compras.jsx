
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Download,
    Trash2,
    Eye,
    Truck,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Link } from 'react-router-dom';

const Compras = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('TODOS');

    // Estado para modal de Recepción
    const [showModalRecibir, setShowModalRecibir] = useState(false);
    const [ordenARecibir, setOrdenARecibir] = useState(null);
    const [medioPago, setMedioPago] = useState('CONTADO');

    // Estado para paginación
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Estado para modal de Detalle
    const [showModalDetalle, setShowModalDetalle] = useState(false);
    const [ordenDetalle, setOrdenDetalle] = useState(null);


    useEffect(() => {
        fetchCompras();
    }, []);

    const fetchCompras = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/compras/listar/');
            const data = await response.json();
            // La API devuelve { ordenes: [...], compras: [...] }
            // Por ahora mostramos las Órdenes de Compra
            if (data.ordenes) {
                setOrdenes(data.ordenes);
            }
        } catch (error) {
            console.error('Error cargando compras:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecibir = (orden) => {
        setOrdenARecibir(orden);
        setMedioPago('CONTADO'); // Reset default
        setShowModalRecibir(true);
    };

    const confirmRecibir = async () => {
        if (!ordenARecibir) return;

        try {
            const response = await fetch(`/api/compras/orden/${ordenARecibir.id}/recibir/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'X-CSRFToken': getCookie('csrftoken') // Si fuera necesario, pero parece que las otras views no lo usan explícitamente en el fetch si la cookie viaja
                },
                body: JSON.stringify({ medio_pago: medioPago })
            });
            const data = await response.json();

            if (data.ok) {
                alert('Orden recibida y procesada contablemente.');
                setShowModalRecibir(false);
                setOrdenARecibir(null);
                fetchCompras();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Error al recibir la orden');
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de cancelar esta orden?')) return;

        try {
            const response = await fetch(`/api/compras/orden/${id}/cancelar/`, { method: 'POST' });
            const data = await response.json();
            if (data.ok) {
                fetchCompras();
            } else {
                alert(data.error || 'Error al cancelar');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleVerDetalle = async (orden) => {
        try {
            const response = await fetch(`/api/compras/orden/${orden.id}/detalle/`);
            const data = await response.json();
            if (data.error) {
                alert(data.error);
            } else {
                setOrdenDetalle(data);
                setShowModalDetalle(true);
            }
        } catch (error) {
            console.error(error);
            alert('Error al cargar detalle');
        }
    };

    // Filtros
    const ordenesFiltradas = ordenes.filter(orden => {
        const matchesSearch =
            orden.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orden.id.toString().includes(searchTerm);

        const matchesEstado = filterEstado === 'TODOS' || orden.estado === filterEstado;

        return matchesSearch && matchesEstado;
    });

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return <span className="badge rounded-pill bg-warning text-dark"><AlertCircle size={14} className="me-1" /> Pendiente</span>;
            case 'RECIBIDA': return <span className="badge rounded-pill bg-success"><CheckCircle size={14} className="me-1" /> Recibida</span>;
            case 'CANCELADA': return <span className="badge rounded-pill bg-danger"><XCircle size={14} className="me-1" /> Cancelada</span>;
            default: return <span className="badge rounded-pill bg-secondary">{estado}</span>;
        }
    };

    // Paginación lógica
    const totalItems = ordenesFiltradas.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Aseguramos que la página actual no exceda el total de páginas (ej: al filtrar)
    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [ordenesFiltradas, totalPages, page]);

    const itemsToShow = ordenesFiltradas.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    if (loading) {
        return <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
    }

    return (
        <div style={{ padding: '1.5rem' }}>
            <div className="container-fluid px-4 mt-4">
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2.2rem' }}>
                            <i className="bi bi-bag-check-fill me-2" style={{ fontSize: '0.8em' }}></i>
                            Compras
                        </h2>
                        <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
                            Administra órdenes de compra y recepciones de mercadería.
                        </p>
                    </div>
                    <Link to="/compras/nueva" className="btn btn-primary btn-lg shadow-sm">
                        <i className="bi bi-plus-circle-fill me-2"></i> Nueva Orden
                    </Link>
                </div>

                {/* FILTROS */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body bg-light rounded">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Buscar por proveedor o N° Orden..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                >
                                    <option value="TODOS">Todos los Estados</option>
                                    <option value="PENDIENTE">Pendientes</option>
                                    <option value="RECIBIDA">Recibidas</option>
                                    <option value="CANCELADA">Canceladas</option>
                                </select>
                            </div>
                            <div className="col-md-5 text-end">
                                {/* <button className="btn btn-outline-secondary me-2">
                                    <i className="bi bi-funnel me-2"></i>
                                    Más Filtros
                                </button> */}
                                <button className="btn btn-outline-secondary">
                                    <i className="bi bi-download me-2"></i>
                                    Exportar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4 py-3 text-secondary fw-bold" style={{ width: '100px' }}>N° Orden</th>
                                        <th className="py-3 text-secondary fw-bold">Proveedor</th>
                                        <th className="py-3 text-secondary fw-bold">Fecha</th>
                                        <th className="py-3 text-secondary fw-bold text-center">Estado</th>
                                        <th className="py-3 text-secondary fw-bold text-end pe-4">Total Est.</th>
                                        <th className="py-3 text-secondary fw-bold text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsToShow.length > 0 ? (
                                        itemsToShow.map((orden) => (
                                            <tr key={orden.id}>
                                                <td className="ps-4 fw-bold text-primary">#{orden.id}</td>
                                                <td className="fw-medium">{orden.proveedor}</td>
                                                <td className="">{orden.fecha}</td>
                                                <td className="text-center">{getEstadoBadge(orden.estado)}</td>
                                                <td className="text-end pe-4 fw-bold text-success">
                                                    $ {parseFloat(orden.total_estimado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        {orden.estado === 'PENDIENTE' && (
                                                            <button
                                                                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                                                title="Recibir Mercadería"
                                                                onClick={() => handleRecibir(orden)}
                                                            >
                                                                <Truck size={16} /> <span className="d-none d-md-inline">Recibir</span>
                                                            </button>
                                                        )}

                                                        <button
                                                            className="btn btn-sm btn-light text-secondary border hover:text-primary hover:bg-blue-50 transition-colors"
                                                            onClick={() => handleVerDetalle(orden)}
                                                            title="Ver Detalle"
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        {orden.estado === 'PENDIENTE' && (
                                                            <button
                                                                className="btn btn-sm btn-light text-danger border hover:bg-danger hover:text-white transition-colors"
                                                                onClick={() => handleEliminar(orden.id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                No se encontraron órdenes de compra.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINACIÓN */}
                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Mostrando {itemsToShow.length} de {totalItems} registros</span>
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
                    </div>
                </div>

                {/* Modal de Recepción */}
                {showModalRecibir && ordenARecibir && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div className="bg-white rounded p-4 shadow-lg" style={{ width: '400px', borderRadius: '1rem' }}>
                            <h4 className="fw-bold mb-3">Recibir Orden #{ordenARecibir.id}</h4>
                            <p className="text-muted small mb-4">
                                Se actualizará el stock y se registrará la deuda/pago.
                            </p>

                            <div className="mb-4">
                                <label className="form-label fw-bold small text-uppercase">Forma de Pago / Registro</label>
                                <select
                                    className="form-select"
                                    value={medioPago}
                                    onChange={(e) => setMedioPago(e.target.value)}
                                >
                                    <option value="CONTADO">Contado (Caja)</option>
                                    <option value="CTACTE">Cuenta Corriente (Deuda)</option>
                                </select>
                            </div>

                            <div className="d-flex gap-2">
                                <button className="btn btn-light border flex-fill fw-bold" onClick={() => setShowModalRecibir(false)}>
                                    Cancelar
                                </button>
                                <button className="btn btn-success flex-fill fw-bold text-white" onClick={confirmRecibir}>
                                    Confirmar Recepción
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Detalle */}
                {showModalDetalle && ordenDetalle && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div className="bg-white shadow-2xl animate-in fade-in zoom-in duration-200" style={{ width: '600px', borderRadius: '1rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            {/* Header */}
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                                <div>
                                    <h5 className="font-bold text-lg text-gray-800 m-0">Detalle de Compra #{ordenDetalle.id}</h5>
                                    <p className="text-sm text-gray-500 m-0">{ordenDetalle.proveedor} - {ordenDetalle.fecha}</p>
                                </div>
                                <button onClick={() => setShowModalDetalle(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 overflow-y-auto">
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Estado</span>
                                        {getEstadoBadge(ordenDetalle.estado)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total</span>
                                        <span className="text-xl font-bold text-green-600">$ {parseFloat(ordenDetalle.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <h6 className="font-bold text-sm text-gray-700 uppercase mb-3 border-b pb-2">Items</h6>
                                <div className="space-y-3">
                                    {ordenDetalle.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start text-sm">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800 m-0">{item.producto}</p>
                                                <p className="text-xs text-gray-500 m-0">Cant: {item.cantidad}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-700 m-0">$ {parseFloat(item.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                                <p className="text-xs text-gray-400 m-0">$ {parseFloat(item.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {ordenDetalle.observaciones && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Observaciones</p>
                                        <p className="text-sm text-gray-600 italic">{ordenDetalle.observaciones}</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t flex justify-end">
                                <button className="btn btn-secondary text-sm font-medium px-4" onClick={() => setShowModalDetalle(false)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Compras;
