import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Printer, Eye, Search, Filter, X, ArrowDownCircle, Plus
} from 'lucide-react';
import { BtnView, BtnPrint, BtnClear, BtnDelete } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';
import TablePagination from '../components/common/TablePagination';

const STORAGE_KEY = 'table_prefs_notascredito_items';

const NotasCredito = () => {
    const navigate = useNavigate();
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
    });
    const [filters, setFilters] = useState({
        busqueda: '',
        fecha: ''
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

    const fetchNotas = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                per_page: itemsPerPage,
                q: filters.busqueda,
                fecha: filters.fecha
            });
            const response = await fetch(`/api/notas-credito/listar/?${params}`);
            const data = await response.json();

            if (data.notas_credito) {
                setNotas(data.notas_credito);
                setTotalPages(data.total_pages);
                setTotalItems(data.total);
            } else {
                setNotas([]);
            }
        } catch (error) {
            console.error("Error al cargar notas de crédito:", error);
            setNotas([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters]);

    useEffect(() => {
        fetchNotas();
    }, [fetchNotas]);

    const handlePrint = (id) => {
        window.open(`/comprobantes/nc/${id}/imprimir/?model=modern`, '_blank');
    };

    const handleView = (id) => {
        navigate(`/comprobantes/nc/${id}/`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ busqueda: '', fecha: '' });
        setPage(1);
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <ArrowDownCircle className="me-2 inline-block" size={32} />
                        Notas de Crédito
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestión de devoluciones y anulaciones.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3">
                        <div className="col-12 col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <Search size={18} className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Buscar por cliente, número..."
                                    name="busqueda"
                                    value={filters.busqueda}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-3">
                            <input
                                type="date"
                                className="form-control"
                                name="fecha"
                                value={filters.fecha}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-12 col-md-4 d-flex gap-2 justify-content-end">
                            <BtnClear onClick={clearFilters} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow mb-4 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 overflow-auto">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold">Fecha</th>
                                    <th className="py-3 fw-bold">Número</th>
                                    <th className="py-3 fw-bold">Cliente</th>
                                    <th className="py-3 fw-bold">Venta Asoc.</th>
                                    <th className="py-3 fw-bold">Total</th>
                                    <th className="py-3 fw-bold">Estado</th>
                                    <th className="pe-4 py-3 text-end fw-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && notas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : notas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-5">
                                            <EmptyState
                                                title="No hay notas de crédito"
                                                description="Las notas de crédito generadas aparecerán aquí."
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    notas.map((nota) => (
                                        <tr key={nota.id} className="border-bottom-0">
                                            <td className="ps-4 fw-medium text-dark py-3">{nota.fecha}</td>
                                            <td className="text-primary fw-bold font-monospace py-3">{nota.numero}</td>
                                            <td className="fw-medium text-dark py-3">{nota.cliente}</td>
                                            <td className="py-3">
                                                {nota.venta_id ? (
                                                    <span className="badge bg-light text-dark border fw-medium">
                                                        FC: {nota.venta_str}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted small">-</span>
                                                )}
                                            </td>
                                            <td className="fw-bold text-danger py-3">
                                                $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(nota.total)}
                                            </td>
                                            <td className="py-3">
                                                <span className={`badge rounded-pill px-3 py-2 fw-medium ${nota.estado === 'EMITIDA' ? 'bg-success-subtle text-success border border-success' :
                                                    nota.estado === 'ANULADA' ? 'bg-danger-subtle text-danger border border-danger' :
                                                        'bg-warning-subtle text-warning-emphasis border border-warning'
                                                    }`}>
                                                    {nota.estado}
                                                </span>
                                            </td>
                                            <td className="pe-4 text-end py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnView onClick={() => navigate(`/notas-credito/${nota.id}`)} />
                                                    <BtnPrint onClick={() => window.open(`/api/notas-credito/${nota.id}/pdf/`, '_blank')} />
                                                    <BtnDelete onClick={() => handleDelete(nota.id)} label="Anular" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {/* Pagination */}
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
    );
};

export default NotasCredito;
