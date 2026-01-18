import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Printer, Eye, FileText, Calendar, Search,
    Truck, Plus, X, ChevronRight, Filter
} from 'lucide-react';
import { BtnView, BtnPrint, BtnClear, BtnAdd } from '../components/CommonButtons';
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
        window.open(`/api/remitos/${id}/pdf/`, '_blank');
    };

    const handleView = (id) => {
        navigate(`/remitos/${id}`);
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

    // Helper para badge de estado (Similar a Compras pero con estados de Remito)
    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'ENTREGADO': return <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle">Entregado</span>;
            case 'ANULADO': return <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger">Anulado</span>;
            case 'GENERADO': return <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">Generado</span>;
            case 'EN_CAMINO': return <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle">En Camino</span>;
            default: return <span className="badge rounded-pill bg-secondary">{estado}</span>;
        }
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-3 main-content-container bg-light fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Truck className="me-2 inline-block" size={32} />
                        Remitos
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestión de entregas y traslados de mercadería.
                    </p>
                </div>
                <BtnAdd
                    label="Nuevo Remito"
                    icon={Plus}
                    className="btn-lg shadow-sm"
                    onClick={() => navigate('/remitos/nuevo')}
                />
            </div>

            {/* Filtros */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por cliente o número..."
                                    name="busqueda"
                                    value={filters.busqueda}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <input
                                type="date"
                                className="form-control"
                                name="fecha"
                                value={filters.fecha}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-2 ms-auto">
                            <div className="d-flex gap-2">
                                <BtnClear label="Limpiar" onClick={clearFilters} className="flex-grow-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold text-nowrap" style={{ width: '160px' }}>Número</th>
                                    <th className="py-3 fw-bold">Fecha</th>
                                    <th className="py-3 fw-bold">Cliente</th>
                                    <th className="py-3 fw-bold">Venta Asoc.</th>
                                    <th className="py-3 fw-bold text-center">Estado</th>
                                    <th className="py-3 fw-bold text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && remitos.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></td></tr>
                                ) : remitos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-5">
                                            <EmptyState
                                                icon={Truck}
                                                title="No se encontraron remitos"
                                                description="Intenta ajustando los filtros de búsqueda."
                                                iconColor="text-blue-500"
                                                bgIconColor="bg-blue-50"
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    remitos.map((remito) => (
                                        <tr key={remito.id} className="border-bottom-0 hover:bg-slate-50 transition-colors">
                                            <td className="ps-4 fw-bold text-primary py-3">
                                                {remito.numero}
                                            </td>
                                            <td className="py-3 fw-medium text-dark">{remito.fecha}</td>
                                            <td className="fw-medium py-3 font-bold text-slate-700">{remito.cliente}</td>
                                            <td className="py-3">
                                                {remito.venta_id ? (
                                                    <span className="badge bg-light text-dark border font-mono">
                                                        FC: {remito.venta_str}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td className="text-center py-3">{getEstadoBadge(remito.estado)}</td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnView onClick={() => handleView(remito.id)} />
                                                    <BtnPrint onClick={() => handlePrint(remito.id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

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
