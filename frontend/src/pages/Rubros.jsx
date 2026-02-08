import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layers, Plus, Search, Edit2, Trash2, Tag, Box, Info, CheckCircle2, Save } from 'lucide-react';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { BtnAdd } from '../components/CommonButtons';
import { PremiumTable, TableCell } from '../components/premium/PremiumTable';
import { BentoCard, StatCard, BentoGrid } from '../components/premium/BentoCard';
import PremiumFilterBar from '../components/premium/PremiumFilterBar';
import TablePagination from '../components/common/TablePagination';
import { cn } from '../utils/cn';

const Rubros = () => {
    const [rubros, setRubros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '' });
    const [saving, setSaving] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchRubros();
    }, []);

    const fetchRubros = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/rubros/listar/');
            const data = await response.json();
            if (data.ok) setRubros(data.data || []);
        } catch (error) {
            console.error("Error fetching rubros:", error);
            showErrorAlert("Error", "No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!formData.nombre.trim()) return showWarningAlert("Atención", "El nombre es obligatorio.");

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

            const response = await fetch('/api/rubros/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.ok) {
                showSuccessAlert(formData.id ? "Ajuste Guardado" : "Rubro Registrado", `El rubro "${formData.nombre}" ha sido actualizado.`);
                setShowModal(false);
                fetchRubros();
            } else {
                showErrorAlert("Error", data.error || "No se pudo guardar el registro.");
            }
        } catch (error) {
            console.error("Error saving rubro:", error);
            showErrorAlert("Fallo Crítico", "Error interno al intentar guardar.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await showConfirmationAlert(
            `¿Eliminar Rubro?`,
            `Se eliminará "${nombre}". Todos los productos asociados perderán esta clasificación.`,
            "SÍ, ELIMINAR",
            "danger"
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

                const response = await fetch(`/api/rubros/${id}/eliminar/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCookie('csrftoken') }
                });

                const data = await response.json();
                if (data.ok) {
                    showSuccessAlert("Eliminado", "Clasificación removida correctamente.");
                    fetchRubros();
                } else {
                    showErrorAlert("Error", data.error || "No se pudo eliminar the registro.");
                }
            } catch (error) {
                console.error("Error deleting rubro:", error);
                showErrorAlert("Error", "No se pudo procesar la solicitud.");
            }
        }
    };

    const openModal = (rubro = null) => {
        if (rubro) setFormData({ id: rubro.id, nombre: rubro.nombre, descripcion: rubro.descripcion || '' });
        else setFormData({ id: null, nombre: '', descripcion: '' });
        setShowModal(true);
    };

    const filteredData = useMemo(() => {
        return rubros.filter(r =>
            r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.descripcion && r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [rubros, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, page, itemsPerPage]);

    const stats = useMemo(() => ({
        total: rubros.length,
        mostUsed: rubros.length > 0 ? rubros[0].nombre : 'N/A'
    }), [rubros]);

    const columns = [
        {
            key: 'nombre',
            label: 'Nombre del Rubro',
            render: (v) => <TableCell.Primary value={v} />
        },
        {
            key: 'descripcion',
            label: 'Descripción / Detalles',
            render: (v) => <TableCell.Secondary value={v || 'Sin descripción'} />
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'right',
            width: '120px',
            render: (_, row) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => openModal(row)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id, row.nombre)}
                        className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 flex flex-col p-6 gap-6">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <Layers size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Rubros de Productos
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Categorización y estructura de inventario.
                    </p>
                </div>

                <BtnAdd
                    label="NUEVO RUBRO"
                    onClick={() => openModal()}
                    className="!bg-slate-900 !rounded-xl !px-8 !py-3.5 !font-black !tracking-widest !text-[11px] !shadow-xl !shadow-slate-900/20 active:scale-95 transition-all text-white"
                />
            </header>

            {/* Stats */}
            <BentoGrid cols={4}>
                <StatCard label="Total Rubros" value={stats.total} icon={Layers} color="primary" />
                <StatCard label="Categorizados" value="100%" icon={CheckCircle2} color="success" />
            </BentoGrid>

            {/* Filters Area */}
            <PremiumFilterBar
                busqueda={searchTerm}
                setBusqueda={(v) => { setSearchTerm(v); setPage(1); }}
                showQuickFilters={false}
                showDateRange={false}
                onClear={() => { setSearchTerm(''); setPage(1); }}
                placeholder="Filtrar por nombre o descripción..."
            />

            <div className="flex-grow flex flex-col min-h-0">
                <PremiumTable
                    columns={columns}
                    data={paginatedData}
                    loading={loading}
                    className="flex-grow shadow-lg"
                />

                <div className="bg-white border-x border-b border-neutral-200 rounded-b-[2rem] px-6 py-1 shadow-premium">
                    <TablePagination
                        currentPage={page}
                        totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setPage}
                        onItemsPerPageChange={(newVal) => {
                            setItemsPerPage(newVal);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Premium Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-slate-900 px-8 py-10 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Layers size={120} strokeWidth={1} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                                        <Tag size={20} className="text-indigo-400" />
                                    </div>
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-400">Rubros / Clasificación</span>
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tight font-outfit">
                                    {formData.id ? 'Editar Rubro' : 'Nuevo Registro'}
                                </h2>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Box size={14} /> Nombre del Rubro
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all uppercase"
                                    placeholder="Ej: Lácteos, Panadería..."
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Info size={14} /> Notas Adicionales
                                </label>
                                <textarea
                                    rows="3"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-medium text-slate-600 transition-all resize-none"
                                    placeholder="Opcional: Detalles sobre este rubro..."
                                    value={formData.descripcion}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                                    {formData.id ? 'ACTUALIZAR' : 'REGISTRAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rubros;

