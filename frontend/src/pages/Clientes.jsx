import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, User, Edit, Trash2, ArrowRightLeft, CreditCard } from 'lucide-react';
import ClienteForm from '../components/clientes/ClienteForm';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); // Aunque la API actual no pagina, preparamos la estructura
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filtros
    const [filters, setFilters] = useState({
        busqueda: '',
        condicion_fiscal: '',
    });

    // Modal Form
    const [showForm, setShowForm] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);

    const fetchClientes = useCallback(async () => {
        setLoading(true);
        try {
            // Nota: La API /api/clientes/buscar/?q= devuelve una lista plana (sin paginación metadata por ahora en el backend legacy).
            // Simularemos paginación en frontend si es necesario, o usaremos lo que devuelva.
            const params = new URLSearchParams({
                q: filters.busqueda
            });

            const response = await fetch(`/api/clientes/buscar/?${params}`);
            const data = await response.json();

            // Si la API devuelve array directo
            let allClientes = Array.isArray(data) ? data : (data.results || []);

            // Filtrado adicional en cliente si la API es muy básica
            if (filters.condicion_fiscal) {
                // Nota: La API de búsqueda es muy simple, filtramos local por si acaso
                // Esto es temporal hasta mejorar el backend
            }

            setTotalItems(allClientes.length);
            setTotalPages(Math.ceil(allClientes.length / itemsPerPage));

            // Paginación "Frontend" por ahora ya que la API no soporta page param
            const start = (page - 1) * itemsPerPage;
            setClientes(allClientes.slice(start, start + itemsPerPage));

        } catch (error) {
            console.error("Error al cargar clientes:", error);
            setClientes([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters, itemsPerPage]);

    useEffect(() => {
        fetchClientes();
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
        if (!window.confirm("¿Está seguro de eliminar este cliente?")) return;

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
        <div className="container-fluid px-4 mt-4">

            {/* HEADER: Idéntico estilo a Ventas/Productos */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2.2rem' }}>
                        <i className="bi bi-people-fill me-2" style={{ fontSize: '0.8em' }}></i>
                        Clientes
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
                        Administra tu cartera de clientes y cuentas corrientes.
                    </p>
                </div>
                <button className="btn btn-primary btn-lg shadow-sm" onClick={handleCreate}>
                    <i className="bi bi-plus-circle-fill me-2"></i> Nuevo Cliente
                </button>
            </div>

            {/* FILTROS */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
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
                            <button className="btn btn-outline-secondary w-100" onClick={fetchClientes} title="Actualizar">
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div className="card border-0 shadow mb-5">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4 py-3">Cliente</th>
                                    <th>Identificación</th>
                                    <th>Teléfono / Email</th>
                                    <th>Cta. Cte.</th>
                                    <th className="text-end pe-4">Acciones</th>
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
                                        <td colSpan="5" className="text-center py-5 text-muted small">
                                            No se encontraron clientes.
                                        </td>
                                    </tr>
                                ) : (
                                    clientes.map(c => (
                                        <tr key={c.id}>
                                            <td className="ps-4 fw-bold text-secondary">{c.nombre}</td>
                                            <td>
                                                {c.cuit ? <span className="font-monospace small">{c.cuit}</span> : <span className="text-muted small">-</span>}
                                            </td>
                                            <td className="small text-muted">
                                                {c.telefono && <div><i className="bi bi-telephone me-1"></i>{c.telefono}</div>}
                                                {c.email && <div><i className="bi bi-envelope me-1"></i>{c.email}</div>}
                                                {!c.telefono && !c.email && '-'}
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    Normal
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-1">
                                                    <button className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(c)} title="Editar">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(c.id)} title="Eliminar">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN (Estilo Ventas) */}
                    {!loading && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Mostrando {clientes.length} de {totalItems} registros</span>
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
                    )}
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
