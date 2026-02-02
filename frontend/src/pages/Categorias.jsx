import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Plus, Search, Edit2, Trash2, Box, Info, CheckCircle2, Bookmark, Save, Layers } from 'lucide-react';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { BtnAdd, BtnEdit, BtnDelete } from '../components/CommonButtons';
import { PremiumTable, TableCell } from '../components/premium/PremiumTable';
import { BentoCard, StatCard, BentoGrid } from '../components/premium/BentoCard';
import { SearchInput } from '../components/premium/PremiumInput';
import { cn } from '../utils/cn';

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/categorias/listar/');
            const data = await response.json();
            if (data.ok) setCategorias(data.data || []);
        } catch (error) {
            console.error("Error fetching categorias:", error);
            showErrorAlert("Error", "No se pudo conectar con el servidor para obtener las categorías.");
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

            const response = await fetch('/api/categorias/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.ok) {
                showSuccessAlert(formData.id ? "Categoría Actualizada" : "Categoría Creada", `"${formData.nombre}" se guardó correctamente.`);
                setShowModal(false);
                fetchCategorias();
            } else {
                showErrorAlert("Error", data.error || "No se pudo guardar la categoría.");
            }
        } catch (error) {
            console.error("Error saving categoria:", error);
            showErrorAlert("Error", "Fallo técnico al intentar guardar.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await showConfirmationAlert(
            `¿Eliminar Categoría?`,
            `Se removerá la categoría "${nombre}". Los productos asociados perderán esta sub-clasificación.`,
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

                const response = await fetch(`/api/categorias/${id}/eliminar/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCookie('csrftoken') }
                });

                const data = await response.json();
                if (data.ok) {
                    showSuccessAlert("Eliminado", "La categoría ha sido removida con éxito.");
                    fetchCategorias();
                } else {
                    showErrorAlert("Error", data.error || "No se pudo eliminar.");
                }
            } catch (error) {
                console.error("Error deleting categoria:", error);
                showErrorAlert("Error", "No se pudo procesar la eliminación.");
            }
        }
    };

    const openModal = (cat = null) => {
        if (cat) setFormData({ id: cat.id, nombre: cat.nombre, descripcion: cat.descripcion || '' });
        else setFormData({ id: null, nombre: '', descripcion: '' });
        setShowModal(true);
    };

    const filteredData = useMemo(() => {
        return categorias.filter(c =>
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [categorias, searchTerm]);

    const columns = [
        {
            key: 'nombre',
            label: 'Nombre de Categoría',
            render: (v) => <span className="font-black text-slate-800 uppercase tracking-tight">{v}</span>
        },
        {
            key: 'descripcion',
            label: 'Notas / Descripción',
            render: (v) => <span className="text-slate-500 font-medium italic text-xs">{v || 'Sin descripción adicional'}</span>
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'right',
            width: '120px',
            render: (_, row) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 opacity-0 transition-all">
                    <button onClick={() => openModal(row)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(row.id, row.nombre)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
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
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2.5 rounded-2xl text-white shadow-lg shadow-purple-600/20">
                            <Layers size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categorías Secundarias</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Niveles adicionales de organización jerárquica.
                    </p>
                </div>

                <BtnAdd label="NUEVA CATEGORÍA" onClick={() => openModal()} className="!bg-slate-900 !rounded-xl !px-8 !font-black !tracking-widest !text-[10px] !shadow-xl !shadow-slate-900/20" />
            </header>

            {/* Stats */}
            <BentoGrid cols={4}>
                <StatCard label="Total Categorías" value={categorias.length} icon={Bookmark} color="purple" />
                <StatCard label="Estado" value="Activo" icon={CheckCircle2} color="emerald" />
            </BentoGrid>

            {/* Main Area */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
                <BentoCard className="p-4 bg-white/80 backdrop-blur-md border-slate-100 shadow-premium">
                    <SearchInput
                        placeholder="Filtrar categorías por nombre..."
                        onSearch={setSearchTerm}
                        className="!py-3 border-slate-200"
                    />
                </BentoCard>

                <div className="flex-1 flex flex-col min-h-0">
                    <PremiumTable
                        columns={columns}
                        data={filteredData}
                        loading={loading}
                        className="flex-1 shadow-lg"
                    />
                </div>
            </div>

            {/* Modal Premium */}
            {showModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="bg-slate-900 px-8 py-10 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Bookmark size={120} strokeWidth={1} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                                        <Tag size={20} className="text-purple-400" />
                                    </div>
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-purple-400">Jerarquía / Productos</span>
                                </div>
                                <h1 className="text-3xl font-black uppercase tracking-tight">Datos de Categoría</h1>
                            </div>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Box size={14} /> Nombre de Categoría
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-500 focus:bg-white outline-none font-bold text-slate-700 transition-all uppercase"
                                    placeholder="Ej: Ofertas, Importados, Premium..."
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <Info size={14} /> Notas Descriptivas
                                </label>
                                <textarea
                                    rows="3"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-500 focus:bg-white outline-none font-medium text-slate-600 transition-all resize-none"
                                    placeholder="Opcional: Detalles sobre esta categoría..."
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
                                    className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-purple-700 shadow-xl shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
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

export default Categorias;
