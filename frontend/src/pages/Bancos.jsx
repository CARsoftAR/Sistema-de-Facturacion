import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Search, Edit2, Trash2, Wallet } from 'lucide-react';
import { showDeleteAlert, showToast } from '../utils/alerts';
import { BtnAdd, BtnEdit, BtnDelete } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import StandardModal from '../components/common/StandardModal';

const Bancos = () => {
    const [bancos, setBancos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        banco: '',
        cbu: '',
        alias: '',
        moneda: 'ARS',
        saldo_inicial: 0
    });
    const [saving, setSaving] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchBancos();
    }, []);

    const fetchBancos = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/bancos/listar/');
            const data = await response.json();
            if (data.ok) {
                setBancos(data.cuentas || []);
            } else {
                setBancos([]);
                console.error("Error loading bancos:", data.error);
            }
        } catch (error) {
            console.error("Error fetching bancos:", error);
            showToast('Error al cargar bancos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);

        const url = formData.id
            ? `/api/bancos/${formData.id}/editar/`
            : '/api/bancos/crear/';

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

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.ok) {
                showToast(formData.id ? 'Cuenta actualizada' : 'Cuenta creada', 'success');
                setShowModal(false);
                fetchBancos();
            } else {
                const errorMsg = data.errors ? Object.values(data.errors).flat().join(', ') : (data.error || 'Error al guardar');
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error("Error saving banco:", error);
            showToast('Error de conexión', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await showDeleteAlert(
            '¿Eliminar Cuenta Bancaria?',
            `Se eliminará la cuenta "${nombre}".`,
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

                const response = await fetch(`/api/bancos/${id}/eliminar/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCookie('csrftoken') }
                });

                const data = await response.json();
                if (data.ok) {
                    showToast('Cuenta eliminada', 'success');
                    fetchBancos();
                } else {
                    showToast(data.error || 'Error al eliminar', 'error');
                }
            } catch (error) {
                console.error("Error deleting banco:", error);
                showToast('Error de conexión', 'error');
            }
        }
    };

    const openNew = () => {
        setFormData({
            id: null,
            banco: '',
            cbu: '',
            alias: '',
            moneda: 'ARS',
            saldo_inicial: 0
        });
        setShowModal(true);
    };

    const openEdit = (banco) => {
        setFormData({
            id: banco.id,
            banco: banco.banco,
            cbu: banco.cbu,
            alias: banco.alias,
            moneda: banco.moneda,
            saldo_inicial: 0 // Saldo inicial isn't editable for logic reasons, kept as 0 in edit
        });
        setShowModal(true);
    };

    // Filtering
    const filteredBancos = bancos.filter(b =>
        b.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.alias && b.alias.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const totalItems = filteredBancos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBancos.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Landmark className="me-2 inline-block" size={32} />
                        Bancos y Cajas
                    </h2>
                    <p className="text-muted mb-0 ps-1">Gestión de cuentas y tesorería</p>
                </div>
                <BtnAdd label="Nueva Cuenta" onClick={openNew} className="btn-lg shadow-sm" />
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body p-2">
                    <div className="position-relative" style={{ maxWidth: '400px' }}>
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input
                            type="text"
                            className="form-control ps-5 border-0 bg-light"
                            placeholder="Buscar por banco o alias..."
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
                                    <th className="ps-4 py-3">Banco / Entidad</th>
                                    <th className="py-3">Alias / CBU</th>
                                    <th className="py-3">Moneda</th>
                                    <th className="text-end py-3">Saldo Actual</th>
                                    <th className="text-end pe-4 py-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            No se encontraron cuentas bancarias.
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map(banco => (
                                        <tr key={banco.id}>
                                            <td className="ps-4 fw-bold text-primary">{banco.banco}</td>
                                            <td className="text-muted small">
                                                {banco.alias && <div className="fw-bold text-dark">{banco.alias}</div>}
                                                <div className="font-monospace text-secondary" style={{ fontSize: '0.85rem' }}>{banco.cbu || '-'}</div>
                                            </td>
                                            <td>
                                                <span className={`badge ${banco.moneda === 'USD' ? 'bg-success' : 'bg-info'} bg-opacity-10 text-dark border border-opacity-10`}>
                                                    {banco.moneda}
                                                </span>
                                            </td>
                                            <td className="text-end fw-bold">
                                                $ {banco.saldo?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnEdit onClick={() => openEdit(banco)} title="Editar" />
                                                    <BtnDelete onClick={() => handleDelete(banco.id, banco.banco)} title="Eliminar" />
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
                title={formData.id ? 'Editar Cuenta' : 'Nueva Cuenta Bancaria'}
                onSubmit={handleSave}
                isLoading={saving}
                headerIcon={<Wallet size={20} />}
            >
                <form id="banco-form" onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre del Banco / Entidad</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 text-base font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                required
                                autoFocus
                                placeholder="Ej: Banco Galicia, MercadoPago, Caja Fuerte"
                                value={formData.banco}
                                onChange={e => setFormData({ ...formData, banco: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Moneda</label>
                            <select
                                className="w-full px-4 py-2 text-base text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={formData.moneda}
                                onChange={e => setFormData({ ...formData, moneda: e.target.value })}
                            >
                                <option value="ARS">Pesos Argentinos (ARS)</option>
                                <option value="USD">Dólares Estadounidenses (USD)</option>
                            </select>
                        </div>

                        {!formData.id && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Saldo Inicial</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-2 text-base text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-end"
                                    placeholder="0.00"
                                    value={formData.saldo_inicial}
                                    onChange={e => setFormData({ ...formData, saldo_inicial: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Alias (Opcional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="Ej: mi.empresa.banco"
                                value={formData.alias}
                                onChange={e => setFormData({ ...formData, alias: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CBU / CVU (Opcional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-monospace"
                                placeholder="22 dígitos"
                                value={formData.cbu}
                                onChange={e => setFormData({ ...formData, cbu: e.target.value })}
                            />
                        </div>
                    </div>
                </form>
            </StandardModal>
        </div>
    );
};

export default Bancos;
