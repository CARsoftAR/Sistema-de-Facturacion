import React, { useState, useEffect, useCallback } from 'react';
import {
    Banknote,
    Search,
    Filter,
    ArrowUpRight,  // For "A Pagar"
    ArrowDownLeft, // For "En Cartera" (Received)
    CheckCircle2,  // For "Depositados"
    AlertCircle,   // For "Rechazados"
    Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';
import { BtnEdit, BtnDelete } from '../components/CommonButtons';

const Cheques = () => {
    const [loading, setLoading] = useState(true);
    const [cheques, setCheques] = useState([]);
    const [kpis, setKpis] = useState({
        cartera_terceros: { total: 0, count: 0 },
        apagar_propios: { total: 0 },
        depositados_mes: { total: 0 },
        rechazados: { total: 0 }
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filters
    const [filters, setFilters] = useState({
        busqueda: '',
        tipo: '',
        estado: ''
    });

    const fetchCheques = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                per_page: itemsPerPage,
                ...filters
            });
            const response = await fetch(`/api/cheques/listar/?${params}`);
            const data = await response.json();

            if (data.ok) {
                setCheques(data.data || []);
                setTotalPages(data.total_pages || 1);
                setTotalItems(data.total || 0);
                if (data.kpis) setKpis(data.kpis);
            } else {
                Swal.fire('Error', data.error || 'No se pudieron cargar los cheques', 'error');
            }
        } catch (error) {
            console.error("Error cargando cheques:", error);
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters]);

    useEffect(() => {
        fetchCheques();
    }, [fetchCheques]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'CARTERA': return <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 rounded-2">CARTERA</span>;
            case 'DEPOSITADO': return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-2">DEPOSITADO</span>;
            case 'COBRADO': return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-2">COBRADO</span>;
            case 'ENTREGADO': return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-2">ENTREGADO</span>;
            case 'RECHAZADO': return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-2">RECHAZADO</span>;
            case 'ANULADO': return <span className="badge bg-dark bg-opacity-10 text-dark border border-dark border-opacity-25 px-2 py-1 rounded-2">ANULADO</span>;
            default: return <span className="badge bg-light text-dark border px-2 py-1 rounded-2">{estado}</span>;
        }
    };

    const getTipoBadge = (tipo) => {
        if (tipo === 'PROPIO') return <span className="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning border-opacity-25 px-2 py-1 rounded-2">PROPIO</span>;
        return <span className="badge bg-light text-dark border px-2 py-1 rounded-2">TERCERO</span>;
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Banknote className="me-2 inline-block" size={32} />
                        Gestión de Cheques
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Control de cartera de cheques propios y de terceros
                    </p>
                </div>
                <button className="btn btn-primary fw-bold px-3 d-flex align-items-center gap-2 shadow-sm rounded-3">
                    <span className="fs-5">+</span> Nuevo Cheque
                </button>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                {/* En Cartera (Terceros) - Blue */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm text-white h-100 rounded-3" style={{ background: '#0d6efd' }}>
                        <div className="card-body p-3">
                            <h6 className="card-title mb-2 opacity-75 fw-bold" style={{ fontSize: '0.9rem' }}>En Cartera (Terceros)</h6>
                            <h3 className="mb-0 fw-bold">{formatCurrency(kpis.cartera_terceros.total)}</h3>
                            <small className="opacity-75 fw-medium">{kpis.cartera_terceros.count} cheques</small>
                        </div>
                    </div>
                </div>

                {/* A Pagar (Propios) - Yellow/Warning */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 rounded-3" style={{ background: '#ffc107', color: '#664d03' }}>
                        <div className="card-body p-3">
                            <h6 className="card-title mb-2 opacity-75 fw-bold" style={{ fontSize: '0.9rem' }}>A Pagar (Propios)</h6>
                            <h3 className="mb-0 fw-bold">{formatCurrency(kpis.apagar_propios.total)}</h3>
                            <small className="opacity-75 fw-medium">Pendientes de cobro</small>
                        </div>
                    </div>
                </div>

                {/* Depositados (Mes) - Green */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm text-white h-100 rounded-3" style={{ background: '#198754' }}>
                        <div className="card-body p-3">
                            <h6 className="card-title mb-2 opacity-75 fw-bold" style={{ fontSize: '0.9rem' }}>Depositados (Mes)</h6>
                            <h3 className="mb-0 fw-bold">{formatCurrency(kpis.depositados_mes.total)}</h3>
                            <small className="opacity-75 fw-medium">Este mes</small>
                        </div>
                    </div>
                </div>

                {/* Rechazados - Red */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm text-white h-100 rounded-3" style={{ background: '#dc3545' }}>
                        <div className="card-body p-3">
                            <h6 className="card-title mb-2 opacity-75 fw-bold" style={{ fontSize: '0.9rem' }}>Rechazados</h6>
                            <h3 className="mb-0 fw-bold">{formatCurrency(kpis.rechazados.total)}</h3>
                            <small className="opacity-75 fw-medium">Total histórico</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body p-2 d-flex flex-wrap gap-2 align-items-center">
                    <div className="position-relative flex-grow-1" style={{ minWidth: '200px' }}>
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input
                            type="text"
                            name="busqueda"
                            className="form-control ps-5 border-0 bg-light"
                            placeholder="Buscar por número, banco o cliente..."
                            value={filters.busqueda}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <select
                        name="tipo"
                        className="form-select border-0 bg-light"
                        style={{ width: 'auto', minWidth: '150px' }}
                        value={filters.tipo}
                        onChange={handleFilterChange}
                    >
                        <option value="">Todos los Tipos</option>
                        <option value="TERCERO">Terceros</option>
                        <option value="PROPIO">Propios</option>
                    </select>

                    <select
                        name="estado"
                        className="form-select border-0 bg-light"
                        style={{ width: 'auto', minWidth: '160px' }}
                        value={filters.estado}
                        onChange={handleFilterChange}
                    >
                        <option value="">Todos los Estados</option>
                        <option value="CARTERA">En Cartera</option>
                        <option value="DEPOSITADO">Depositado</option>
                        <option value="COBRADO">Cobrado</option>
                        <option value="ENTREGADO">Entregado</option>
                        <option value="RECHAZADO">Rechazado</option>
                    </select>

                    <button
                        className="btn btn-white border px-4 d-flex align-items-center gap-2 text-muted fw-bold hover:bg-light"
                        onClick={fetchCheques}
                    >
                        <Search size={16} /> Buscar
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden flex-grow-1 d-flex flex-column">
                <div className="card-body p-0 flex-grow-1 overflow-auto">
                    <table className="table table-hover align-middle mb-0 w-100" style={{ minWidth: '1000px' }}>
                        <thead className="bg-light sticky-top">
                            <tr>
                                <th className="border-0 py-3 ps-4 text-secondary small fw-bold text-uppercase" style={{ width: '15%' }}>Fecha Pago</th>
                                <th className="border-0 py-3 text-secondary small fw-bold text-uppercase" style={{ width: '15%' }}>Banco</th>
                                <th className="border-0 py-3 text-secondary small fw-bold text-uppercase" style={{ width: '12%' }}>N° Cheque</th>
                                <th className="border-0 py-3 text-secondary small fw-bold text-uppercase" style={{ width: '20%' }}>Origen/Destino</th>
                                <th className="border-0 py-3 text-end text-secondary small fw-bold text-uppercase" style={{ width: '15%' }}>Importe</th>
                                <th className="border-0 py-3 text-center text-secondary small fw-bold text-uppercase" style={{ width: '8%' }}>Tipo</th>
                                <th className="border-0 py-3 text-center text-secondary small fw-bold text-uppercase" style={{ width: '10%' }}>Estado</th>
                                <th className="border-0 py-3 pe-4 text-end text-secondary small fw-bold text-uppercase" style={{ width: '5%' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : cheques.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        No se encontraron cheques registrados.
                                    </td>
                                </tr>
                            ) : (
                                cheques.map((c) => (
                                    <tr key={c.id}>
                                        <td className="ps-4 fw-medium text-dark-emphasis">
                                            {c.fecha_pago}
                                        </td>
                                        <td>
                                            <span className="fw-medium text-dark">{c.banco}</span>
                                        </td>
                                        <td>
                                            <span className="font-monospace text-primary fw-bold" style={{ fontSize: '0.9rem' }}>{c.numero}</span>
                                        </td>
                                        <td>
                                            <span className="small text-muted fw-medium">{c.origen_destino}</span>
                                        </td>
                                        <td className="text-end fw-bold text-dark">
                                            {formatCurrency(c.monto)}
                                        </td>
                                        <td className="text-center">
                                            {getTipoBadge(c.tipo)}
                                        </td>
                                        <td className="text-center">
                                            {getEstadoBadge(c.estado)}
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <BtnEdit onClick={() => Swal.fire('Info', 'Funcionalidad de edición pendiente', 'info')} />
                                                <BtnDelete onClick={() => Swal.fire('Info', 'Funcionalidad de eliminar pendiente', 'info')} />
                                                {/* Could add Deposit/Deliver actions here later */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="border-top p-3 bg-white d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        Mostrando {cheques.length} de {totalItems} registros
                    </small>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-light text-dark border shadow-sm"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Anterior
                        </button>
                        <span className="d-flex align-items-center px-2 text-muted small">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            className="btn btn-sm btn-outline-light text-dark border shadow-sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cheques;
