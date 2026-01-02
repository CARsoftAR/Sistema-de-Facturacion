import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Plus, Search, Trash2, Edit, Phone, Mail, MapPin, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [busqueda, setBusqueda] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        cuit: '',
        telefono: '',
        email: '',
        direccion: '',
        condicion_fiscal: 'CF',
        cbu: '',
        alias: '',
        notas: ''
    });

    const fetchProveedores = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/proveedores/lista/');
            const data = await response.json();
            let allProveedores = Array.isArray(data) ? data : (data.data || []);

            if (busqueda) {
                const q = busqueda.toLowerCase();
                allProveedores = allProveedores.filter(p =>
                    p.nombre.toLowerCase().includes(q) ||
                    (p.cuit && p.cuit.includes(q)) ||
                    (p.email && p.email.toLowerCase().includes(q))
                );
            }

            setTotalItems(allProveedores.length);
            setTotalPages(Math.ceil(allProveedores.length / itemsPerPage));

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            setProveedores(allProveedores.slice(start, end));

        } catch (error) {
            console.error("Error al cargar proveedores:", error);
            setProveedores([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, busqueda]);

    useEffect(() => {
        fetchProveedores();
    }, [fetchProveedores]);

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este proveedor?")) return;
        try {
            const response = await fetch(`/api/proveedores/${id}/eliminar/`, { method: 'POST' });
            const data = await response.json();
            if (data.ok || response.ok) {
                fetchProveedores();
            } else {
                alert("Error al eliminar: " + (data.error || "Desconocido"));
            }
        } catch (e) {
            alert("No se pudo eliminar el proveedor.");
        }
    };

    const openModal = (provider = null) => {
        if (provider) {
            setEditingProvider(provider);
            fetch(`/api/proveedores/${provider.id}/`)
                .then(r => r.json())
                .then(data => {
                    setFormData({
                        nombre: data.nombre || '',
                        cuit: data.cuit || '',
                        telefono: data.telefono || '',
                        email: data.email || '',
                        direccion: data.direccion || '',
                        condicion_fiscal: data.condicion_fiscal || 'CF',
                        cbu: data.cbu || '',
                        alias: data.alias || '',
                        notas: data.notas || ''
                    });
                    setShowModal(true);
                })
                .catch(() => {
                    alert("Error al cargar datos del proveedor");
                });
        } else {
            setEditingProvider(null);
            setFormData({
                nombre: '',
                cuit: '',
                telefono: '',
                email: '',
                direccion: '',
                condicion_fiscal: 'CF',
                cbu: '',
                alias: '',
                notas: ''
            });
            setShowModal(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingProvider
            ? `/api/proveedores/${editingProvider.id}/editar/`
            : `/api/proveedores/nuevo/`;

        const formPayload = new FormData();
        Object.keys(formData).forEach(key => formPayload.append(key, formData[key]));

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formPayload
            });
            const data = await response.json();

            if (data.ok || (!data.error && response.ok)) {
                setShowModal(false);
                fetchProveedores();
            } else {
                alert("Error: " + (data.error || "No se pudo guardar"));
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión al guardar");
        }
    };

    return (
        <div className="container-fluid px-4 mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2.2rem' }}>
                        <Truck className="me-2 inline-block" size={32} />
                        Proveedores
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
                        Administra tus proveedores y contactos.
                    </p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary btn-lg shadow-sm">
                    <Plus className="me-2 inline-block" size={20} />
                    Nuevo Proveedor
                </button>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por nombre, CUIT o email..."
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow mb-5">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4 py-3">Proveedor</th>
                                    <th>CUIT</th>
                                    <th>Contacto</th>
                                    <th>Email</th>
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
                                ) : proveedores.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted small">
                                            No se encontraron proveedores.
                                        </td>
                                    </tr>
                                ) : (
                                    proveedores.map(p => (
                                        <tr key={p.id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{p.nombre}</div>
                                                {p.direccion && <div className="text-muted small"><MapPin size={12} className="inline me-1" />{p.direccion}</div>}
                                            </td>
                                            <td className="font-monospace">{p.cuit || '-'}</td>
                                            <td>
                                                {p.telefono ? (
                                                    <div className="text-muted"><Phone size={14} className="inline me-1" />{p.telefono}</div>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {p.email ? (
                                                    <div className="text-muted"><Mail size={14} className="inline me-1" />{p.email}</div>
                                                ) : '-'}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-1">
                                                    <button onClick={() => openModal(p)} className="btn btn-outline-primary btn-sm" title="Editar">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleEliminar(p.id)} title="Eliminar">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Mostrando {proveedores.length} de {totalItems} registros</span>
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
                                        <button className="page-link border-0 text-secondary bg-transparent p-0" onClick={() => setPage(page - 1)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt;</button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => {
                                        if (totalPages > 10 && Math.abs(page - (i + 1)) > 2 && i !== 0 && i !== totalPages - 1) return null;
                                        return (
                                            <li key={i} className="page-item">
                                                <button className={`page-link border-0 rounded-circle fw-bold ${page === i + 1 ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary'}`} onClick={() => setPage(i + 1)} style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</button>
                                            </li>
                                        );
                                    })}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link border-0 text-secondary bg-transparent p-0" onClick={() => setPage(page + 1)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&gt;</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Premium */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                            <div className="modal-header bg-primary text-white px-4 py-3" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <h5 className="modal-title fw-bold mb-0" style={{ fontSize: '1.25rem' }}>
                                        {editingProvider ? <Edit className="inline mb-1 me-2" size={24} /> : <Plus className="inline mb-1 me-2" size={24} />}
                                        {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                                    </h5>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4 bg-light">
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body p-4">
                                            <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">Datos Principales</h6>
                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <label className="form-label fw-semibold text-secondary small text-uppercase">Nombre / Razón Social <span className="text-danger">*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-lg border-light-subtle shadow-sm"
                                                        style={{ fontSize: '1.1rem' }}
                                                        name="nombre"
                                                        value={formData.nombre}
                                                        onChange={handleInputChange}
                                                        required
                                                        autoFocus
                                                        placeholder="Ej: Distribuidora S.A."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body p-4">
                                            <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">Información Fiscal y Bancaria</h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-secondary small">Condición Fiscal</label>
                                                    <select
                                                        className="form-select border-light-subtle shadow-sm"
                                                        name="condicion_fiscal"
                                                        value={formData.condicion_fiscal}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="RI">Responsable Inscripto</option>
                                                        <option value="MO">Monotributista</option>
                                                        <option value="EX">Exento</option>
                                                        <option value="CF">Consumidor Final</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-secondary small">CUIT</label>
                                                    <input
                                                        type="text"
                                                        className="form-control border-light-subtle shadow-sm"
                                                        name="cuit"
                                                        value={formData.cuit}
                                                        onChange={handleInputChange}
                                                        placeholder="XX-XXXXXXXX-X"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-secondary small">CBU / CVU</label>
                                                    <input
                                                        type="text"
                                                        className="form-control border-light-subtle shadow-sm"
                                                        name="cbu"
                                                        value={formData.cbu}
                                                        onChange={handleInputChange}
                                                        placeholder="22 dígitos"
                                                        maxLength="22"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-secondary small">Alias</label>
                                                    <input
                                                        type="text"
                                                        className="form-control border-light-subtle shadow-sm"
                                                        name="alias"
                                                        value={formData.alias}
                                                        onChange={handleInputChange}
                                                        placeholder="ej: MI.EMPRESA.ALIAS"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body p-4">
                                            <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">Datos de Contacto</h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-secondary small">Teléfono</label>
                                                    <div className="input-group shadow-sm">
                                                        <span className="input-group-text bg-white border-end-0 border-light-subtle"><Phone size={16} className="text-muted" /></span>
                                                        <input
                                                            type="text"
                                                            className="form-control border-start-0 border-light-subtle"
                                                            name="telefono"
                                                            value={formData.telefono}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-secondary small">Email</label>
                                                    <div className="input-group shadow-sm">
                                                        <span className="input-group-text bg-white border-end-0 border-light-subtle"><Mail size={16} className="text-muted" /></span>
                                                        <input
                                                            type="email"
                                                            className="form-control border-start-0 border-light-subtle"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label fw-semibold text-secondary small">Dirección</label>
                                                    <input
                                                        type="text"
                                                        className="form-control border-light-subtle shadow-sm"
                                                        name="direccion"
                                                        value={formData.direccion}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label fw-semibold text-secondary small">Notas</label>
                                                    <textarea
                                                        className="form-control border-light-subtle shadow-sm"
                                                        name="notas"
                                                        rows="2"
                                                        value={formData.notas}
                                                        onChange={handleInputChange}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-white border-top-0 py-3 px-4" style={{ borderRadius: '0 0 1rem 1rem' }}>
                                    <button type="button" className="btn btn-light text-secondary border-0 px-4" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm rounded-pill fw-bold" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                                        <Save size={18} className="me-2 inline-block mb-1" />
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Proveedores;
