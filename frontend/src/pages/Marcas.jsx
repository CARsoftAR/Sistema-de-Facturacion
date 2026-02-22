import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Plus, Search, Edit2, Trash2, Box, Info, CheckCircle2, Bookmark, Save } from 'lucide-react';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { BtnAdd } from '../components/CommonButtons';
import { PremiumTable, TableCell } from '../components/premium/PremiumTable';
import { BentoCard, StatCard, BentoGrid } from '../components/premium/BentoCard';
import PremiumFilterBar from '../components/premium/PremiumFilterBar';
import TablePagination from '../components/common/TablePagination';
import { cn } from '../utils/cn';

const Marcas = () => {
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '' });
    const [saving, setSaving] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchMarcas();
    }, []);

    const fetchMarcas = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/marcas/listar/');
            const data = await response.json();
            if (data.ok || Array.isArray(data.data)) {
                setMarcas(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching marcas:", error);
            showErrorAlert("Error", "No se pudo obtener el listado de marcas.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!formData.nombre.trim()) return;

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
                showSuccessAlert(formData.id ? "Marca Actualizada" : "Nueva Marca", `"${formData.nombre}" se guardó correctamente.`);
                setShowModal(false);
                fetchMarcas();
            } else {
                showErrorAlert("Error", data.error || "No se pudo guardar la marca.");
            }
        } catch (error) {
            console.error("Error saving marca:", error);
            showErrorAlert("Error", "Fallo en la comunicación con el servidor.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await showConfirmationAlert(
            `¿Eliminar Marca?`,
            `Se eliminará "${nombre}". Los productos vinculados quedarán sin marca asignada.`,
            "ELIMINAR AHORA",
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

                const response = await fetch(`/api/marcas/${id}/eliminar/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCookie('csrftoken') }
                });

                const data = await response.json();
                if (data.ok) {
                    showSuccessAlert("Eliminado", "La marca ha sido removida del sistema.");
                    fetchMarcas();
                } else {
                    showErrorAlert("Error", data.error || "No se pudo eliminar.");
                }
            } catch (error) {
                console.error("Error deleting marca:", error);
                showErrorAlert("Error", "No se pudo procesar la eliminación.");
            }
        }
    };

    const openModal = (marca = null) => {
        if (marca) setFormData({ id: marca.id, nombre: marca.nombre, descripcion: marca.descripcion || '' });
        else setFormData({ id: null, nombre: '', descripcion: '' });
        setShowModal(true);
    };

    const filteredData = useMemo(() => {
        return marcas.filter(m =>
            m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.descripcion && m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [marcas, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, page, itemsPerPage]);

    const columns = [
        {
            key: 'nombre',
            label: 'Nombre Comercial',
            render: (v) => <TableCell.Primary value={v} />
        },
        {
            key: 'descripcion',
            label: 'Descripción / Notas',
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
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-2xl text-white shadow-lg shadow-amber-600/20">
                            <Bookmark size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Marcas
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Identidad de productos y fabricantes.
                    </p>
                </div>

                <BtnAdd
                    label="NUEVA MARCA"
                    onClick={() => openModal()}
                    className="!bg-amber-500 !border-none !rounded-xl !px-8 !py-3.5 !font-black !tracking-widest !text-[11px] !shadow-xl !shadow-amber-500/20 hover:!bg-amber-600 active:scale-95 transition-all text-white"
                />
            </header>

            {/* Stats */}
            <BentoGrid cols={4}>
                <StatCard label="Total Marcas" value={marcas.length} icon={Bookmark} color="primary" />
                <StatCard label="Consistencia" value="Óptima" icon={CheckCircle2} color="success" />
            </BentoGrid>

            {/* Filters */}
            <PremiumFilterBar
                busqueda={searchTerm}
                setBusqueda={(v) => { setSearchTerm(v); setPage(1); }}
                showQuickFilters={false}
                showDateRange={false}
                onClear={() => { setSearchTerm(''); setPage(1); }}
                placeholder="Buscar marcas por nombre o descripción..."
            />

            {/* Content Area */}
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

            {/* Modal Premium */}
            {showModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 px-8 py-10 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Bookmark size={120} strokeWidth={1} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                                        <Bookmark size={20} className="text-amber-200" />
                                    </div>
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-amber-200">Branding / Identidad</span>
                                </div>
                                <h1 className="text-3xl font-black uppercase tracking-tight font-outfit">Formulario de Marca</h1>
                            </div>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Box size={14} /> Nombre Comercial
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none font-bold text-slate-700 transition-all uppercase"
                                    placeholder="Ej: Coca Cola, Nike..."
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Info size={14} /> Información de Marca
                                </label>
                                <textarea
                                    rows="3"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none font-medium text-slate-600 transition-all resize-none"
                                    placeholder="Opcional: Detalles o descripción..."
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
                                    className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-amber-600 shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
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

export default Marcas;

