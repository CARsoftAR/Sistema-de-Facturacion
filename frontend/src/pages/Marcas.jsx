import React, { useState, useEffect } from 'react';
import { Tag, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { showConfirmationAlert, showDeleteAlert, showToast } from '../utils/alerts';
import { BtnAdd, BtnEdit, BtnDelete } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import StandardModal from '../components/common/StandardModal';

const Marcas = () => {
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '' });
    const [saving, setSaving] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchMarcas();
    }, []);

    const fetchMarcas = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/marcas/listar/');
            const data = await response.json();
            // API returns { data: [...] }
            setMarcas(data.data || []);
        } catch (error) {
            console.error("Error fetching marcas:", error);
            showToast('Error al cargar marcas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const getCookie = (name) => {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            };

            const response = await fetch('/api/marcas/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.ok) {
                showToast(formData.id ? 'Marca actualizada' : 'Marca creada', 'success');
                setShowModal(false);
                fetchMarcas();
            } else {
                const errorMsg = data.errors ? Object.values(data.errors).flat().join(', ') : 'Error al guardar';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error("Error saving marca:", error);
            showToast('Error de conexión', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await showDeleteAlert(
            '¿Eliminar Marca?',
            `Se eliminará la marca "${nombre}".`,
            'Eliminar'
        );

        if (result.isConfirmed) {
            try {
                const getCookie = (name) => {
                    let cookieValue = null;
                    if (document.cookie && document.cookie !== '') {
                        const cookies = document.cookie.split(';');
                        for (let i = 0; i < cookies.length; i++) {
                            const cookie = cookies[i].trim();
                            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                break;
                            }
                        }
                    }
                    return cookieValue;
                };

                const response = await fetch(`/api/marcas/${id}/eliminar/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCookie('csrftoken') }
                });

                const data = await response.json();
                if (data.ok) {
                    showToast('Marca eliminada', 'success');
                    fetchMarcas();
                } else {
                    showToast(data.error || 'Error al eliminar', 'error');
                }
            } catch (error) {
                console.error("Error deleting marca:", error);
                showToast('Error de conexión', 'error');
            }
        }
    };

    const openNew = () => {
        setFormData({ id: null, nombre: '', descripcion: '' });
        setShowModal(true);
    };

    const openEdit = (marca) => {
        setFormData({ id: marca.id, nombre: marca.nombre, descripcion: marca.descripcion });
        setShowModal(true);
    };

    // Filtering
    const filteredMarcas = marcas.filter(m =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.descripcion && m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const totalItems = filteredMarcas.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMarcas.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Tag className="me-2 inline-block" size={32} />
                        Marcas
                    </h2>
                    <p className="text-muted mb-0 ps-1">Gestión de marcas de productos</p>
                </div>
                <BtnAdd label="Nueva Marca" onClick={openNew} className="btn-lg shadow-sm" />
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body p-2">
                    <div className="position-relative" style={{ maxWidth: '400px' }}>
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input
                            type="text"
                            className="form-control ps-5 border-0 bg-light"
                            placeholder="Buscar marcas..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1">
                        <table className="table align-middle mb-0 table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th className="ps-4 py-3">Nombre</th>
                                    <th className="py-3">Descripción</th>
                                    <th className="text-end pe-4 py-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5 text-muted">
                                            No se encontraron marcas.
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map(marca => (
                                        <tr key={marca.id}>
                                            <td className="ps-4 fw-bold">{marca.nombre}</td>
                                            <td className="text-muted small">{marca.descripcion || '-'}</td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnEdit onClick={() => openEdit(marca)} title="Editar" />
                                                    <BtnDelete onClick={() => handleDelete(marca.id, marca.nombre)} title="Eliminar" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </div>

            {/* Standard Modal */}
            <StandardModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={formData.id ? 'Editar Marca' : 'Nueva Marca'}
                onSubmit={handleSave}
                isLoading={saving}
                headerIcon={<Tag size={20} />}
            >
                <form id="marca-form" onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 text-base font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            required
                            autoFocus
                            placeholder="Ej: Coca Cola, Pepsi, etc."
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción (Opcional)</label>
                        <textarea
                            className="w-full px-4 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                            rows="3"
                            placeholder="Detalles adicionales..."
                            value={formData.descripcion}
                            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                        ></textarea>
                    </div>
                </form>
            </StandardModal>
        </div>
    );
};

export default Marcas;
