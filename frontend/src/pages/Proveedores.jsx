import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Plus, Search, Trash2, Edit, Phone, Mail, MapPin, X, Save, Building2, CreditCard, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BtnAdd, BtnEdit, BtnDelete, BtnCancel, BtnSave } from '../components/CommonButtons';

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
                <BtnAdd label="Nuevo Proveedor" onClick={() => openModal()} className="btn-lg shadow-sm" />
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
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnEdit onClick={() => openModal(p)} />
                                                    <BtnDelete onClick={() => handleEliminar(p.id)} />
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

            {/* Modal Premium (Tailwind) */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowModal(false)}
                    ></div>

                    <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100 z-10">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <Truck size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                        {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {editingProvider ? 'Modificar datos del proveedor' : 'Dar de alta un nuevo proveedor'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
                            <form id="proveedor-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

                                {/* SECCIÓN 1: DATOS PRINCIPALES */}
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Building2 size={16} /> Datos Principales
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">RAZÓN SOCIAL / NOMBRE <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all placeholder:font-normal"
                                                placeholder="Ej: Distribuidora S.A."
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 2: INFORMACIÓN FISCAL Y BANCARIA */}
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CreditCard size={16} /> Información Fiscal
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CONDICIÓN FISCAL</label>
                                            <select
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-medium transition-all"
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
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CUIT</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all font-mono"
                                                name="cuit"
                                                value={formData.cuit}
                                                onChange={handleInputChange}
                                                placeholder="XX-XXXXXXXX-X"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CBU / CVU</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all font-mono"
                                                name="cbu"
                                                value={formData.cbu}
                                                onChange={handleInputChange}
                                                placeholder="22 dígitos"
                                                maxLength="22"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">ALIAS</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all uppercase"
                                                name="alias"
                                                value={formData.alias}
                                                onChange={handleInputChange}
                                                placeholder="MI.ALIAS"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 3: CONTACTO Y NOTAS */}
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Phone size={16} /> Contacto
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">TELÉFONO</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all"
                                                    name="telefono"
                                                    value={formData.telefono}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">EMAIL</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">DIRECCIÓN</label>
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all"
                                                    name="direccion"
                                                    value={formData.direccion}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">NOTAS</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-normal transition-all"
                                                name="notas"
                                                rows="2"
                                                value={formData.notas}
                                                onChange={handleInputChange}
                                                placeholder="Información adicional..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                            <BtnCancel onClick={() => setShowModal(false)} />
                            <BtnSave label="Guardar" onClick={() => { }} form="proveedor-form" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Proveedores;
