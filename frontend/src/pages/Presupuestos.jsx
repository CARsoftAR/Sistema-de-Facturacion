import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Search, Calendar, RefreshCw, Check, AlertCircle, ShoppingCart, Trash2, CheckCircle2, Clock, Eye, Briefcase } from 'lucide-react';
import { BtnAdd, BtnDelete, BtnAction, BtnClear, BtnView, BtnPrint, BtnTableAction } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';

const Presupuestos = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [presupuestos, setPresupuestos] = useState([]);
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

    // Filtros
    const [filters, setFilters] = useState({
        busqueda: searchParams.get('busqueda') || '',
        estado: searchParams.get('estado') || '',
    });

    useEffect(() => {
        setFilters({
            busqueda: searchParams.get('busqueda') || '',
            estado: searchParams.get('estado') || '',
        });
        setPage(1);
    }, [searchParams]);

    const fetchPresupuestos = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: itemsPerPage,
                q: filters.busqueda,
                estado: filters.estado
            });

            const response = await fetch(`/api/presupuestos/listar/?${params}`);
            const data = await response.json();

            if (data.ok) {
                setPresupuestos(data.data);
                setTotalItems(data.total);
                setTotalPages(Math.ceil(data.total / itemsPerPage));
            } else {
                console.error("Error fetching presupuestos:", data.error);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters]);

    useEffect(() => {
        fetchPresupuestos();
    }, [fetchPresupuestos]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ ...filters }); // Update URL params needed?
        fetchPresupuestos();
    };

    const handleClear = () => {
        setFilters({ busqueda: '', estado: '' });
        setSearchParams({});
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'APROBADO':
                return <span className="badge rounded-pill bg-success-subtle text-success border border-success px-3 py-2"><CheckCircle2 size={16} className="me-1 inline-block" /> Aprobado</span>;
            case 'PENDIENTE':
                return <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2"><Clock size={16} className="me-1 inline-block" /> Pendiente</span>;
            case 'VENCIDO':
                return <span className="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary px-3 py-2"><AlertCircle size={16} className="me-1 inline-block" /> Vencido</span>;
            case 'CANCELADO':
                return <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger px-3 py-2"><AlertCircle size={16} className="me-1 inline-block" /> Cancelado</span>;
            default:
                return <span className="badge rounded-pill bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-2">{estado}</span>;
        }
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-3 main-content-container bg-light fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Briefcase className="me-2 inline-block" size={32} />
                        Presupuestos
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestión de Presupuestos y Cotizaciones
                    </p>
                </div>
                <BtnAdd onClick={() => navigate('/presupuestos/nuevo')} label="Nuevo Presupuesto" />
            </div>

            {/* Filtros */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <form onSubmit={handleSearch} className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar cliente, ID..."
                                    value={filters.busqueda}
                                    onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filters.estado}
                                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                            >
                                <option value="">Todos los Estados</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="APROBADO">Aprobado</option>
                                <option value="VENCIDO">Vencido</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        </div>
                        <div className="col-md-4 d-flex gap-2">
                            <BtnAction onClick={fetchPresupuestos} label="Filtrar" icon={Search} color="primary" />
                            <BtnClear onClick={handleClear} />
                        </div>
                    </form>
                </div>
            </div>

            {/* Tabla */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold"># ID</th>
                                    <th className="py-3 fw-bold">Fecha</th>
                                    <th className="py-3 fw-bold">Cliente</th>
                                    <th className="py-3 fw-bold">Vencimiento</th>
                                    <th className="py-3 fw-bold text-end">Total</th>
                                    <th className="py-3 fw-bold text-center">Estado</th>
                                    <th className="pe-4 py-3 fw-bold text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : presupuestos.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-5">
                                            <EmptyState
                                                title="No se encontraron presupuestos"
                                                description="Intenta con otros filtros o crea uno nuevo"
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    presupuestos.map((p) => (
                                        <tr key={p.id} className="border-bottom-0">
                                            <td className="ps-4 fw-bold text-primary py-3">#{p.id}</td>
                                            <td className="py-3"><span className="text-dark fw-medium">{p.fecha}</span></td>
                                            <td className="fw-medium py-3">{p.cliente}</td>
                                            <td className="py-3">{p.vencimiento}</td>
                                            <td className="text-end fw-bold text-success py-3">$ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(p.total)}</td>
                                            <td className="text-center py-3">{getEstadoBadge(p.estado)}</td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnView onClick={() => navigate(`/presupuestos/${p.id}`)} />
                                                    {p.estado === 'PENDIENTE' && (
                                                        <BtnTableAction
                                                            icon={ShoppingCart}
                                                            label="A Pedido"
                                                            color="success"
                                                            onClick={() => handleConvertToPedido(p)}
                                                            title="Convertir a Pedido"
                                                        />
                                                    )}
                                                    <BtnPrint onClick={() => handlePrint(p.id)} />
                                                    <BtnDelete onClick={() => handleDelete(p.id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {!loading && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Mostrando {presupuestos.length} de {totalItems} registros</span>
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
        </div>
    );
};

export default Presupuestos;
