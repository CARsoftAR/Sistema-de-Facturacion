
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, User, ArrowRightLeft, CreditCard, RotateCcw, Users, Pencil, Trash2 } from 'lucide-react';
import ClienteForm from '../components/clientes/ClienteForm';
import { BtnAdd, BtnEdit, BtnDelete, BtnAction, BtnClear, BtnVertical } from '../components/CommonButtons';
import { showDeleteAlert } from '../utils/alerts';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const STORAGE_KEY = 'table_prefs_clientes_items';
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

    // Filtros
    const [filters, setFilters] = useState({
        busqueda: '',
        condicion_fiscal: '',
    });

    // Modal Form
    const [showForm, setShowForm] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);

    const fetchClientes = useCallback(async (signal) => {
        if (itemsPerPage === 0) return;
        setLoading(true);
        try {
            // Use 'buscar' endpoint with large per_page for client-side pagination
            const params = new URLSearchParams({
                q: filters.busqueda,
                per_page: 10000
            });

            const response = await fetch(`/api/clientes/buscar/?${params}`, { signal });
            const data = await response.json();

            // Normalize data: Dictionary keys from api_clientes_buscar are 'clientes', 'total', etc.
            let allClientes = [];
            if (Array.isArray(data)) {
                allClientes = data;
            } else if (data.clientes) {
                allClientes = data.clientes;
            } else if (data.data) {
                allClientes = data.data;
            } else if (data.results) {
                allClientes = data.results;
            }

            // Client-side filtering
            if (filters.busqueda) {
                const q = filters.busqueda.toLowerCase();
                allClientes = allClientes.filter(c =>
                    c.nombre.toLowerCase().includes(q) ||
                    (c.cuit && c.cuit.includes(q)) ||
                    (c.email && c.email.toLowerCase().includes(q))
                );
            }

            // Client-side filtering for fiscal condition
            if (filters.condicion_fiscal) {
                allClientes = allClientes.filter(c => c.condicion_fiscal === filters.condicion_fiscal);
            }

            setTotalItems(allClientes.length);
            setTotalPages(Math.ceil(allClientes.length / itemsPerPage));

            const start = (page - 1) * itemsPerPage;
            setClientes(allClientes.slice(start, start + itemsPerPage));

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Error al cargar clientes:", error);
            }
            setClientes([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters, itemsPerPage]);

    useEffect(() => {
        // Debounce effect removed for 'lista' fetch, but kept for consistency if restoring search
        if (itemsPerPage === 0) return;
        const controller = new AbortController();
        fetchClientes(controller.signal);
        return () => controller.abort();
    }, [fetchClientes]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleCreate = () => {
        setEditingCliente(null);
        setShowForm(true);
    };

    const handleEdit = async (cliente) => {
        try {
            const res = await fetch(`/api/clientes/${cliente.id}/`);
            const completeData = await res.json();
            setEditingCliente(completeData);
            setShowForm(true);
        } catch (e) {
            console.error("Error al cargar detalle", e);
            alert("No se pudo cargar el detalle del cliente.");
        }
    };

    const handleDelete = async (id) => {
        const result = await showDeleteAlert(
            "¿Eliminar cliente?",
            "Esta acción eliminará al cliente. Su historial de ventas se conservará, pero no podrá asociarse a nuevos comprobantes.",
            'Eliminar',
            {
                iconComponent: (
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger mx-auto" style={{ width: '80px', height: '80px' }}>
                        <Users size={40} strokeWidth={1.5} />
                    </div>
                )
            }
        );
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/clientes/${id}/eliminar/`, { method: 'POST' });
            if (res.ok) {
                fetchClientes();
            } else {
                alert("No se pudo eliminar el cliente.");
            }
        } catch (e) {
            console.error("Error eliminado", e);
        }
    };

    const handleSave = () => {
        fetchClientes();
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 bg-light fade-in main-content-container">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Users className="me-2 inline-block" size={32} />
                        Clientes
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Administra tu cartera de clientes y cuentas corrientes.
                    </p>
                </div>
                <BtnAdd label="Nuevo Cliente" icon={Users} onClick={handleCreate} className="btn-lg shadow-sm" />
            </div>

            {/* Filtros */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por nombre, CUIT..."
                                    name="busqueda"
                                    value={filters.busqueda}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" name="condicion_fiscal" value={filters.condicion_fiscal} onChange={handleFilterChange}>
                                <option value="">Todas las Condiciones</option>
                                <option value="CF">Consumidor Final</option>
                                <option value="RI">Responsable Inscripto</option>
                                <option value="MT">Monotributo</option>
                            </select>
                        </div>
                        <div className="col-md-1 ms-auto">
                            <button onClick={fetchClientes} className="btn btn-light w-100 border text-secondary" title="Actualizar Listado">
                                <RotateCcw size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card border-0 shadow mb-4 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold">Cliente</th>
                                    <th className="py-3 fw-bold">Identificación</th>
                                    <th className="py-3 fw-bold">Teléfono / Email</th>
                                    <th className="py-3 fw-bold">Cta. Cte.</th>
                                    <th className="text-end pe-4 py-3 fw-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : clientes.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-5">
                                            <EmptyState
                                                icon={Users}
                                                title="No hay clientes registrados"
                                                description="Las clientes que agregues aparecerán aquí."
                                                iconColor="text-blue-500"
                                                bgIconColor="bg-blue-50"
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    clientes.map(c => (
                                        <tr key={c.id} className="border-bottom-0">
                                            <td className="ps-4 py-3">
                                                <div className="fw-bold text-dark">{c.nombre}</div>
                                                <div className="small text-muted">{c.direccion || 'Sin dirección'}</div>
                                            </td>
                                            <td className="py-3">
                                                {c.cuit ? <span className="font-monospace small bg-light border px-2 py-1 rounded text-dark">{c.cuit}</span> : <span className="text-muted small">-</span>}
                                            </td>
                                            <td className="small text-muted py-3">
                                                {c.telefono && <div className="d-flex align-items-center gap-1"><span className="opacity-75">Tel:</span> {c.telefono}</div>}
                                                {c.email && <div className="d-flex align-items-center gap-1"><span className="opacity-75">Mail:</span> {c.email}</div>}
                                                {!c.telefono && !c.email && '-'}
                                            </td>
                                            <td className="py-3">
                                                <span className="badge bg-light text-dark border">Normal</span>
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <BtnEdit onClick={() => handleEdit(c)} />
                                                        <BtnDelete onClick={() => handleDelete(c.id)} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
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

            {/* Formulario Overlay */}
            {showForm && (
                <ClienteForm
                    cliente={editingCliente}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default Clientes;
