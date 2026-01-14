import React, { useState, useEffect, useCallback } from 'react';
import {
    Banknote,
    Search,
    Filter,
    ArrowUpRight,  // For "A Pagar"
    ArrowDownLeft, // For "En Cartera" (Received)
    CheckCircle2,  // For "Depositados"
    AlertCircle,   // For "Rechazados"
    Calendar,
    RotateCcw,
    ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import { BtnEdit, BtnDelete, BtnAdd } from '../components/CommonButtons';

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

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (id) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null);
        } else {
            setOpenDropdownId(id);
        }
    };

    // Close dropdown when clicking outside (simple implementation using a invisible backdrop)
    const CloseBackdrop = () => (
        openDropdownId ? (
            <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{ zIndex: 998 }}
                onClick={() => setOpenDropdownId(null)}
            />
        ) : null
    );

    const handleEstadoChange = async (cheque, nuevoEstado) => {
        setOpenDropdownId(null); // Close dropdown
        const result = await Swal.fire({
            title: '¿Confirmar cambio de estado?',
            text: `El cheque ${cheque.numero} pasará a estado ${nuevoEstado}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/cheques/${cheque.id}/cambiar-estado/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ estado: nuevoEstado })
                });
                const data = await response.json();

                if (data.ok) {
                    Swal.fire('Actualizado', `El estado se actualizó a ${nuevoEstado}`, 'success');
                    fetchCheques();
                } else {
                    Swal.fire('Error', data.error || 'No se pudo actualizar el estado', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Error de conexión', 'error');
            }
        }
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in">
            <CloseBackdrop />
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
                <BtnAdd
                    label="Nuevo Cheque"
                    icon={Banknote}
                    className="btn-lg shadow-sm"
                    onClick={() => Swal.fire('Info', 'Funcionalidad de crear pendiente', 'info')}
                />
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                {/* En Cartera (Terceros) - Blue (Primary) */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #dbeafe 0%, #ffffff 100%)' }}>
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="text-muted xsmall fw-bold" style={{ fontSize: '0.7rem' }}>EN CARTERA (TERCEROS)</div>
                                <div className="p-2 bg-primary bg-opacity-10 rounded text-primary"><ArrowDownLeft size={18} /></div>
                            </div>
                            <h3 className="mb-0 fw-bold text-primary">{formatCurrency(kpis.cartera_terceros.total)}</h3>
                            <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>{kpis.cartera_terceros.count} cheques</div>
                        </div>
                    </div>
                </div>

                {/* A Pagar (Propios) - Yellow (Warning) */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #fef9c3 0%, #ffffff 100%)' }}>
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="text-muted xsmall fw-bold" style={{ fontSize: '0.7rem' }}>A PAGAR (PROPIOS)</div>
                                <div className="p-2 bg-warning bg-opacity-10 rounded text-warning"><ArrowUpRight size={18} /></div>
                            </div>
                            <h3 className="mb-0 fw-bold text-warning" style={{ color: '#d97706' }}>{formatCurrency(kpis.apagar_propios.total)}</h3>
                            <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>Pendientes de cobro</div>
                        </div>
                    </div>
                </div>

                {/* Depositados (Mes) - Green (Success) */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #dcfce7 0%, #ffffff 100%)' }}>
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="text-muted xsmall fw-bold" style={{ fontSize: '0.7rem' }}>DEPOSITADOS (MES)</div>
                                <div className="p-2 bg-success bg-opacity-10 rounded text-success"><CheckCircle2 size={18} /></div>
                            </div>
                            <h3 className="mb-0 fw-bold text-success">{formatCurrency(kpis.depositados_mes.total)}</h3>
                            <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>Este mes</div>
                        </div>
                    </div>
                </div>

                {/* Rechazados - Red (Danger) */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #fee2e2 0%, #ffffff 100%)' }}>
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="text-muted xsmall fw-bold" style={{ fontSize: '0.7rem' }}>RECHAZADOS</div>
                                <div className="p-2 bg-danger bg-opacity-10 rounded text-danger"><AlertCircle size={18} /></div>
                            </div>
                            <h3 className="mb-0 fw-bold text-danger">{formatCurrency(kpis.rechazados.total)}</h3>
                            <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>Total histórico</div>
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
                                            <div className="position-relative d-inline-block">
                                                <button
                                                    className={`btn btn-sm border shadow-sm d-flex align-items-center gap-1 ${openDropdownId === c.id ? 'btn-primary text-white' : 'btn-light'}`}
                                                    onClick={(e) => { e.stopPropagation(); toggleDropdown(c.id); }}
                                                >
                                                    Acciones <ChevronDown size={14} />
                                                </button>

                                                {openDropdownId === c.id && (
                                                    <div
                                                        className="position-absolute end-0 mt-1 bg-white border shadow rounded-3 py-2 fade-in"
                                                        style={{ zIndex: 1000, minWidth: '180px' }}
                                                    >
                                                        <ul className="list-unstyled mb-0">
                                                            {c.estado === 'CARTERA' && (
                                                                <>
                                                                    <li><button className="dropdown-item d-flex align-items-center py-2 px-3 text-success" onClick={() => handleEstadoChange(c, 'DEPOSITADO')}><CheckCircle2 size={16} className="me-2" />Depositar</button></li>
                                                                    <li><button className="dropdown-item d-flex align-items-center py-2 px-3 text-primary" onClick={() => handleEstadoChange(c, 'COBRADO')}><CheckCircle2 size={16} className="me-2" />Cobrar</button></li>
                                                                    <li><button className="dropdown-item d-flex align-items-center py-2 px-3 text-secondary" onClick={() => handleEstadoChange(c, 'ENTREGADO')}><ArrowUpRight size={16} className="me-2" />Entregar</button></li>
                                                                    <li><hr className="dropdown-divider mx-2" /></li>
                                                                </>
                                                            )}
                                                            {(c.estado === 'DEPOSITADO' || c.estado === 'ENTREGADO' || c.estado === 'COBRADO') && (
                                                                <>
                                                                    <li><button className="dropdown-item d-flex align-items-center py-2 px-3 text-warning" onClick={() => handleEstadoChange(c, 'CARTERA')}><ArrowDownLeft size={16} className="me-2" />Volver a Cartera</button></li>
                                                                    {c.estado === 'DEPOSITADO' && (
                                                                        <li><button className="dropdown-item d-flex align-items-center py-2 px-3 text-danger" onClick={() => handleEstadoChange(c, 'RECHAZADO')}><AlertCircle size={16} className="me-2" />Marcar Rechazado</button></li>
                                                                    )}
                                                                    <li><hr className="dropdown-divider mx-2" /></li>
                                                                </>
                                                            )}
                                                            {c.estado === 'RECHAZADO' && (
                                                                <li><button className="dropdown-item d-flex align-items-center py-2 px-3 text-primary" onClick={() => handleEstadoChange(c, 'CARTERA')}><RotateCcw size={16} className="me-2" />Recuperar (Cartera)</button></li>
                                                            )}

                                                            <li><button className="dropdown-item d-flex align-items-center py-2 px-3" onClick={() => Swal.fire('Info', 'Editar pendiente', 'info')}>Editar</button></li>
                                                            <li><button className="dropdown-item d-flex align-items-center py-2 px-3 text-danger" onClick={() => Swal.fire('Info', 'Eliminar pendiente', 'info')}>Eliminar</button></li>
                                                        </ul>
                                                    </div>
                                                )}
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
