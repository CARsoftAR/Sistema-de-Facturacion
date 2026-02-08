
import React, { useState, useEffect } from 'react';
import {
    Calendar, Trash2, Edit2, CheckCircle2, XCircle, Plus,
    CalendarCheck, FileText, BarChart3, ChevronRight, X, Clock, AlertCircle, Save
} from 'lucide-react';
import axios from 'axios';
import { BtnAdd, BtnSave, BtnCancel } from '../components/CommonButtons';
import { showDeleteAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { BentoCard } from '../components/premium/BentoCard';
import { PremiumTable, TableCell } from '../components/premium/PremiumTable';
import { PremiumInput } from '../components/premium/PremiumInput';
import { cn } from '../utils/cn';

const Ejercicios = () => {
    const [ejercicios, setEjercicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        cerrado: false
    });

    const fetchEjercicios = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/contabilidad/ejercicios/');
            if (res.data.success) {
                setEjercicios(res.data.ejercicios);
            }
        } catch (error) {
            console.error("Error fetching ejercicios:", error);
            showErrorAlert("Error", "No se pudieron cargar los ejercicios contables");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEjercicios();
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();

        if (!formData.descripcion || !formData.fecha_inicio || !formData.fecha_fin) {
            showErrorAlert("Campos Incompletos", "Por favor complete todos los campos obligatorios.");
            return;
        }

        setSaving(true);
        const url = formData.id
            ? `/api/contabilidad/ejercicios/${formData.id}/editar/`
            : `/api/contabilidad/ejercicios/crear/`;

        try {
            const res = await axios.post(url, formData, {
                headers: { 'X-CSRFToken': document.cookie.split('csrftoken=')[1]?.split(';')[0] }
            });

            if (res.data.ok || res.data.success) {
                setModalOpen(false);
                fetchEjercicios();
                showSuccessAlert("¡Enhorabuena!", "El ejercicio contable ha sido guardado con éxito.");
            } else {
                showErrorAlert("Error", res.data.error || "No se pudo guardar el ejercicio.");
            }
        } catch (error) {
            showErrorAlert("Error", "Error de comunicación con el servidor.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (ej) => {
        const result = await showDeleteAlert(
            `¿Eliminar ejercicio ${ej.descripcion}?`,
            "Esta acción eliminará el ejercicio contable y todos sus asientos asociados de forma permanente. ¡No se puede deshacer!",
            'Sí, eliminar todo'
        );
        if (!result.isConfirmed) return;

        try {
            const res = await axios.post(`/api/contabilidad/ejercicios/${ej.id}/eliminar/`, {}, {
                headers: { 'X-CSRFToken': document.cookie.split('csrftoken=')[1]?.split(';')[0] }
            });

            if (res.data.ok || res.data.success) {
                showSuccessAlert("Eliminado", "El ejercicio y sus datos asociados han sido borrados.");
                fetchEjercicios();
            } else {
                showErrorAlert("Error", res.data.error || "No se pudo eliminar el ejercicio.");
            }
        } catch (error) {
            showErrorAlert("Error", "Error al intentar eliminar.");
        }
    };

    const openEdit = (ej) => {
        setFormData({
            id: ej.id,
            descripcion: ej.descripcion,
            fecha_inicio: ej.fecha_inicio.split(' ')[0],
            fecha_fin: ej.fecha_fin.split(' ')[0],
            cerrado: ej.cerrado
        });
        setModalOpen(true);
    };

    const openNew = () => {
        setFormData({
            id: null,
            descripcion: '',
            fecha_inicio: '',
            fecha_fin: '',
            cerrado: false
        });
        setModalOpen(true);
    };

    const columns = [
        {
            key: 'descripcion',
            label: 'Descripción del Período',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg",
                        row.cerrado ? "bg-neutral-100 text-neutral-400" : "bg-primary-50 text-primary-600"
                    )}>
                        <CalendarCheck size={18} />
                    </div>
                    <div>
                        <span className="font-black text-neutral-800 tracking-tight block">{val}</span>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                            Período Fiscal
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'fecha_inicio',
            label: 'Inicio',
            width: '150px',
            render: (val) => <TableCell.Date value={val} />
        },
        {
            key: 'fecha_fin',
            label: 'Cierre',
            width: '150px',
            render: (val) => <TableCell.Date value={val} />
        },
        {
            key: 'cerrado',
            label: 'Estado',
            width: '150px',
            align: 'center',
            render: (val) => val ? (
                <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200">
                    <XCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cerrado</span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Abierto</span>
                </div>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '120px',
            align: 'right',
            sortable: false,
            render: (_, row) => (
                <div className="flex justify-end gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); openEdit(row); }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                        title="Modificar"
                    >
                        <Edit2 size={18} />
                    </button>
                    {!row.cerrado && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Eliminar"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] p-6 gap-6 overflow-hidden bg-neutral-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-neutral-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
                            <Calendar size={28} strokeWidth={2.5} />
                        </div>
                        Ejercicios Contables
                    </h1>
                    <p className="text-neutral-500 mt-1 font-medium flex items-center gap-2">
                        <Clock size={14} /> Gestión de períodos fiscales y aperturas/cierres de libros
                    </p>
                </div>
                <BtnAdd
                    label="Nuevo Ejercicio"
                    icon={Plus}
                    onClick={openNew}
                    className="!h-[52px] !px-8 !rounded-full shadow-xl shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 transition-all text-white border-0 bg-primary-600"
                />
            </div>

            {/* Content Container */}
            <div className="flex-1 min-h-0">
                <PremiumTable
                    columns={columns}
                    data={ejercicios}
                    loading={loading}
                    className="h-full border border-neutral-200/60 shadow-2xl shadow-neutral-200/50"
                />
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-200/50">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                                    <CalendarCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-neutral-800">
                                        {formData.id ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                                    </h3>
                                    <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Definición de Período Fiscal</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 hover:bg-neutral-100 rounded-full transition-all text-neutral-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <PremiumInput
                                    label="Nombre del Ejercicio"
                                    placeholder="Ej: Ejercicio 2024"
                                    icon={<FileText size={18} />}
                                    value={formData.descripcion}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <PremiumInput
                                        label="Fecha de Inicio"
                                        type="date"
                                        value={formData.fecha_inicio}
                                        onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                    />
                                    <PremiumInput
                                        label="Fecha de Cierre"
                                        type="date"
                                        value={formData.fecha_fin}
                                        onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                                    />
                                </div>

                                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-black text-neutral-800">Estado del Ejercicio</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ejercicios cerrados no permiten ajustes</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.cerrado}
                                            onChange={e => setFormData({ ...formData, cerrado: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <BtnCancel
                                    label="Cancelar"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 !h-[56px] !rounded-2xl"
                                />
                                <BtnSave
                                    label={saving ? "Guardando..." : "Guardar Cambios"}
                                    icon={Save}
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 !h-[56px] !rounded-2xl shadow-lg shadow-primary-500/20"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ejercicios;
