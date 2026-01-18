import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Search, Truck } from 'lucide-react';
import { BtnView, BtnClear } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';

const STORAGE_KEY = 'table_prefs_ctacte_prov_items';

const CuentasCorrientesProveedores = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
    });

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

    const fetchProveedores = useCallback(async (signal) => {
        if (itemsPerPage === 0) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: itemsPerPage,
                busqueda: filters.busqueda,
                ...filters
            });

            // Usamos la API de Cta Cte Proveedores
            const response = await fetch(`/api/ctacte/proveedores/listar/?${params}`, { signal });
            const data = await response.json();

            // Asumiendo que la API devuelve { proveedores: [], total_pages: ... } o { data: [], ... }
            // Ajustamos según respuesta estándar
            const lista = data.proveedores || data.data || [];
            setProveedores(lista);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || 0);

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Error al cargar proveedores:", error);
            }
        } finally {
            setLoading(false);
        }
    }, [page, filters, itemsPerPage]);

    useEffect(() => {
        const controller = new AbortController();
        fetchProveedores(controller.signal);
        return () => controller.abort();
    }, [fetchProveedores]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    // TODO: Implement Detalle Screen
    const handleVerHistorial = (proveedor) => {
        // navigate(`/ctas-corrientes/proveedores/${proveedor.id}`);
        // For now preventing navigation until detail is ready, or let it 404/placeholder
        alert("Detalle de proveedor en construcción");
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 bg-light fade-in main-content-container">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Truck className="me-2 inline-block" size={32} />
                        Cta. Cte. Proveedores
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestión de saldos y deuda con proveedores.
                    </p>
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
                                    placeholder="Buscar proveedor por nombre, CUIT..."
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
                                    <th className="ps-4 py-3 fw-bold">Proveedor</th>
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
                                ) : proveedores.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-5">
                                            <EmptyState
                                                icon={Truck}
                                                title="No hay proveedores"
                                                description="No se encontraron proveedores en cuenta corriente."
                                                iconColor="text-blue-500"
                                                bgIconColor="bg-blue-50"
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    proveedores.map(p => {
                                        const saldo = parseFloat(p.saldo_actual || 0);
                                        const tieneDeuda = saldo > 0; // Deuda con proveedor (Le debemos)
                                        const saldoAFavor = saldo < 0; // A favor nuestro (Nos deben / anticipo)

                                        return (
                                            <tr key={p.id} className="border-bottom-0 hover-bg-light">
                                                <td className="ps-4 py-3">
                                                    <div className="fw-medium text-dark">{p.nombre}</div>
                                                    <div className="small text-muted">{p.direccion || 'Sin dirección'}</div>
                                                </td>
                                                <td className="py-3 font-monospace text-secondary">{p.cuit || '-'}</td>
                                                <td className="py-3 text-muted small">{p.telefono || p.email || '-'}</td>

                                                <td className={`text-end py-3 fw-bold ${tieneDeuda ? 'text-danger' : saldoAFavor ? 'text-success' : 'text-secondary'}`} style={{ fontSize: '1.1rem' }}>
                                                    {formatCurrency(saldo)}
                                                </td>

                                                <td className="text-center py-3">
                                                    {tieneDeuda ? (
                                                        <span className="badge bg-danger-subtle text-danger border border-danger px-3 py-2 rounded-pill">
                                                            Deuda Pendiente
                                                        </span>
                                                    ) : saldoAFavor ? (
                                                        <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
                                                            Saldo a Favor
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
                                                            Al Día
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="text-end pe-4 py-3">
                                                    <BtnView onClick={() => handleVerHistorial(p)} />
                                                </td>
                                            </tr>
                                        );
                                    })
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

export default CuentasCorrientesProveedores;
