import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { CreditCard, Search, Eye, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';
import { BtnAction, BtnClear } from '../components/CommonButtons';
import { showConfirmationAlert } from '../utils/alerts';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';

const CuentasCorrientesClientes = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
    });
    const [totales, setTotales] = useState({ total_deuda: 0, cantidad_deudores: 0 });

    const STORAGE_KEY = 'table_prefs_ctacte_items';

    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => {
                    if (data.items_por_pagina) setItemsPerPage(data.items_por_pagina);
                })
                .catch(console.error);
        }
    }, []);

    const handleItemsPerPageChange = (e) => {
        const newValue = Number(e.target.value);
        setItemsPerPage(newValue);
        setPage(1);
        localStorage.setItem(STORAGE_KEY, newValue);
    };

    // Filtros
    const [filters, setFilters] = useState({
        busqueda: '',
        estado_deuda: 'todos' // todos, con_deuda, al_dia
    });

    // Helper para formatear moneda
    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    const fetchClientes = useCallback(async (signal) => {
        if (itemsPerPage === 0) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: itemsPerPage,
                busqueda: filters.busqueda,
                type: 'ctacte', // Indicar al backend que es para Cta Cte si es necesario
                ...filters
            });

            // Usamos la API de clientes buscar existente
            const response = await fetch(`/api/clientes/buscar/?${params}`, { signal });
            const data = await response.json();

            // Asumiendo que la API devuelve { clientes: [], total_pages: ... }
            setClientes(data.clientes || []);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || 0);

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Error al cargar clientes:", error);
            }
        } finally {
            setLoading(false);
        }
    }, [page, filters, itemsPerPage]);

    useEffect(() => {
        const controller = new AbortController();
        fetchClientes(controller.signal);
        return () => controller.abort();
    }, [fetchClientes]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleVerHistorial = (cliente) => {
        // Navegar al detalle (Próximo paso)
        console.log("Ver historial de:", cliente);
        // navigate(`/ctas-corrientes/clientes/${cliente.id}`);
        showConfirmationAlert(
            "Próximamente",
            `Ver historial de ${cliente.nombre}`,
            "Entendido",
            { icon: 'info' }
        );
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 bg-light fade-in main-content-container">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <CreditCard className="me-2 inline-block" size={32} />
                        Cuentas Corrientes
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestión de saldos y movimientos de clientes.
                    </p>
                </div>
            </div>

            {/* KPI CARDS (Opcional, para darle toque premium) */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm border-start border-4 border-primary">
                        <div className="card-body">
                            <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Clientes Visualizados</h6>
                            <h3 className="fw-bold text-dark mb-0">{totalItems}</h3>
                        </div>
                    </div>
                </div>
                {/* Placeholder para Total Deuda cuando el backend lo soporte */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm border-start border-4 border-danger">
                        <div className="card-body">
                            <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Estado General</h6>
                            <h3 className="fw-bold text-dark mb-0 d-flex align-items-center">
                                <ActivityIndicator />
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTROS */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar cliente por nombre, CUIT..."
                                    name="busqueda"
                                    value={filters.busqueda}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" name="estado_deuda" value={filters.estado_deuda} onChange={handleFilterChange}>
                                <option value="todos">Todos los Estados</option>
                                <option value="con_deuda">Con Deuda (Saldo Mayor a $0)</option>
                                <option value="al_dia">Al Día (Saldo $0)</option>
                                <option value="saldo_favor">A Favor (Saldo Menor a $0)</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <BtnClear onClick={() => { setFilters({ busqueda: '', estado_deuda: 'todos' }); setPage(1); }} className="w-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div className="card border-0 shadow mb-4 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold">Cliente</th>
                                    <th className="py-3 fw-bold">Documento</th>
                                    <th className="py-3 fw-bold">Contacto</th>
                                    <th className="text-end py-3 fw-bold" style={{ minWidth: '150px' }}>Saldo Actual</th>
                                    <th className="text-center py-3 fw-bold">Estado</th>
                                    <th className="text-end pe-4 py-3 fw-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : clientes.length === 0 ? (
                                    <td colSpan="6" className="py-5">
                                        <EmptyState
                                            icon={Users}
                                            title="No hay clientes"
                                            description="No se encontraron clientes en cuenta corriente."
                                            iconColor="text-blue-500"
                                            bgIconColor="bg-blue-50"
                                        />
                                    </td>
                                ) : (
                                    clientes.map(c => {
                                        const saldo = parseFloat(c.saldo_actual || 0);
                                        const tieneDeuda = saldo > 0;
                                        const saldoAFavor = saldo < 0;

                                        return (
                                            <tr key={c.id} className="border-bottom-0 hover-bg-light">
                                                <td className="ps-4 py-3">
                                                    <div className="fw-bold text-dark">{c.nombre} {c.apellido}</div>
                                                    <div className="small text-muted fw-medium">{c.direccion || 'Sin dirección'}</div>
                                                </td>
                                                <td className="py-3 font-monospace text-secondary fw-medium">{c.dni || c.cuit || '-'}</td>
                                                <td className="py-3 text-muted small fw-medium">{c.telefono || '-'}</td>

                                                <td className={`text-end py-3 fw-bold ${tieneDeuda ? 'text-danger' : saldoAFavor ? 'text-success' : 'text-secondary'}`} style={{ fontSize: '1.1rem' }}>
                                                    {formatCurrency(saldo)}
                                                </td>

                                                <td className="text-center py-3">
                                                    {tieneDeuda ? (
                                                        <span className="badge bg-danger-subtle text-danger border border-danger px-3 py-2 rounded-pill">
                                                            <TrendingDown size={14} className="me-1 mb-1" /> Deudor
                                                        </span>
                                                    ) : saldoAFavor ? (
                                                        <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
                                                            <TrendingUp size={14} className="me-1 mb-1" /> A Favor
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                                                            <CheckCircle size={14} className="me-1 mb-1" /> Al Día
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="text-end pe-4 py-3">
                                                    <BtnAction
                                                        icon={Eye}
                                                        onClick={() => handleVerHistorial(c)}
                                                        className="btn-outline-primary btn-sm"
                                                        tooltip="Ver Historial"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* PAGINACIÓN */}
                    {/* PAGINACIÓN */}
                    {/* PAGINACIÓN */}
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

// Componente simple para animar "Online"
const ActivityIndicator = () => (
    <div className="d-flex align-items-center gap-2">
        <span className="position-relative d-flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
        </span>
        <span className="text-muted small fw-normal">Sistema Activo</span>
    </div>
);

export default CuentasCorrientesClientes;
