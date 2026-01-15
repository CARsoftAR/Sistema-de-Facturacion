import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Printer, Eye, FileText, Calendar, Search,
    ArrowUpDown, Filter, X
} from 'lucide-react';
import { BtnView, BtnPrint, BtnClear } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';
import TablePagination from '../components/common/TablePagination';

const STORAGE_KEY = 'table_prefs_remitos_items';

const Remitos = () => {
    const navigate = useNavigate();
    const [remitos, setRemitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? parseInt(saved, 10) : 10;
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

    const fetchRemitos = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                per_page: itemsPerPage,
                q: filters.busqueda,
                fecha: filters.fecha
            });
            const response = await fetch(`/api/remitos/listar/?${params}`);
            const data = await response.json();

            if (data.remitos) {
                setRemitos(data.remitos);
                setTotalPages(data.total_pages);
                setTotalItems(data.total);
            } else {
                setRemitos([]);
            }
        } catch (error) {
            console.error("Error al cargar remitos:", error);
            setRemitos([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters]);

    useEffect(() => {
        fetchRemitos();
    }, [fetchRemitos]);

    const handlePrint = (id) => {
        window.open(`/comprobantes/remito/${id}/imprimir/?model=modern`, '_blank');
    };

    const handleView = (id) => {
        navigate(`/comprobantes/remito/${id}/`);
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
        <div className="container-fluid px-4 pt-4 pb-3 main-content-container bg-light fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <FileText className="me-2 inline-block" size={32} />
                        Remitos
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestión de entregas y remitos.
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
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold">Fecha</th>
                                    <th className="py-3 fw-bold">Número</th>
                                    <th className="py-3 fw-bold">Cliente</th>
                                    <th className="py-3 fw-bold">Venta Asoc.</th>
                                    <th className="py-3 fw-bold">Estado</th>
                                    <th className="pe-4 py-3 text-end fw-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && remitos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : remitos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-5">
                                            <EmptyState
                                                icon={FileText}
                                                title="No hay remitos"
                                                description="Los remitos generados aparecerán aquí."
                                                iconColor="text-blue-500"
                                                bgIconColor="bg-blue-50"
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    remitos.map((remito) => (
                                        <tr key={remito.id} className="border-bottom-0">
                                            <td className="ps-4 fw-medium text-dark py-3">{remito.fecha}</td>
                                            <td className="text-primary fw-bold font-monospace py-3">{remito.numero}</td>
                                            <td className="fw-medium text-dark py-3">{remito.cliente}</td>
                                            <td className="py-3">
                                                {remito.venta_id ? (
                                                    <span className="badge bg-light text-dark border fw-medium">
                                                        FC: {remito.venta_str}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted small">-</span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <span className={`badge rounded-pill px-3 py-2 fw-medium ${remito.estado === 'ENTREGADO' ? 'bg-success-subtle text-success border border-success' :
                                                    remito.estado === 'ANULADO' ? 'bg-danger-subtle text-danger border border-danger' :
                                                        'bg-warning-subtle text-warning-emphasis border border-warning'
                                                    }`}>
                                                    {remito.estado}
                                                </span>
                                            </td>
                                            <td className="pe-4 text-end py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnView onClick={() => navigate(`/remitos/${remito.id}`)} />
                                                    <BtnPrint onClick={() => window.open(`/api/remitos/${remito.id}/pdf/`, '_blank')} />
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

export default Remitos;
