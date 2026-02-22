
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Truck, Plus, Search, Trash2, Phone, Mail, MapPin, X, Save, Building2, CreditCard, RotateCcw, Users, Star, ShieldCheck, Pencil, AlertCircle, Box, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BtnAdd, BtnEdit, BtnDelete, BtnAction, BtnClear, BtnGuardar, BtnCancelar } from '../components/CommonButtons';
import { showDeleteAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';
import { StatCard, PremiumTable, TableCell, PremiumFilterBar } from '../components/premium';
import { BentoCard, BentoGrid } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';

const Proveedores = () => {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const STORAGE_KEY = 'table_prefs_proveedores_items';
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
                    if (data.items_por_pagina) {
                        setItemsPerPage(data.items_por_pagina);
                    }
                })
                .catch(console.error);
        }
    }, []);
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

    const fetchProveedores = useCallback(async (signal) => {
        setLoading(true);
        try {
            const response = await fetch('/api/proveedores/lista/', { signal });
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
            if (error.name !== 'AbortError') setProveedores([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, busqueda]);

    useEffect(() => {
        const controller = new AbortController();
        fetchProveedores(controller.signal);
        return () => controller.abort();
    }, [fetchProveedores]);

    const handleEliminar = async (id) => {
        const result = await showDeleteAlert(
            "¿Eliminar proveedor?",
            "Esta acción eliminará al proveedor. Su historial de compras se conservará, pero no podrá asociarse a nuevos comprobantes.",
            'Eliminar',
            {
                iconComponent: (
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger mx-auto" style={{ width: '80px', height: '80px' }}>
                        <Truck size={40} strokeWidth={1.5} />
                    </div>
                )
            }
        );
        if (!result.isConfirmed) return;
        try {
            const response = await fetch(`/api/proveedores/${id}/eliminar/`, { method: 'POST' });
            const data = await response.json();
            if (data.ok || response.ok) {
                fetchProveedores();
            } else {
                showErrorAlert("Error", data.error || "No se pudo eliminar el proveedor.");
            }
        } catch (e) {
            showErrorAlert("Error", "Error de conexión.");
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
                    showErrorAlert("Error", "No se pudo cargar el proveedor.");
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
        if (e) e.preventDefault();

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
                showSuccessAlert("Guardado", "Proveedor guardado correctamente");
            } else {
                showErrorAlert("Error", data.error || "No se pudo guardar");
            }
        } catch (error) {
            console.error(error);
            showErrorAlert("Error", "Error de conexión al guardar");
        }
    };

    const columns = [
        {
            key: 'nombre',
            label: 'Proveedor',
            render: (v, p) => (
                <div className="flex flex-col">
                    <TableCell.Primary value={v} />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={10} /> {p.direccion || 'Sin dirección registrada'}
                    </span>
                </div>
            )
        },
        {
            key: 'cuit',
            label: 'Identificación',
            width: '180px',
            render: (v, p) => (
                <div className="flex flex-col">
                    {v ? (
                        <TableCell.Secondary
                            value={v}
                            className="font-mono bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200 w-fit"
                        />
                    ) : <span className="text-neutral-300">---</span>}
                    <span className="text-[10px] font-black text-primary-500 mt-1 uppercase tracking-widest">{p.condicion_fiscal || 'CF'}</span>
                </div>
            )
        },
        {
            key: 'contacto',
            label: 'Contacto',
            width: '240px',
            render: (_, p) => (
                <div className="flex flex-col gap-0.5">
                    {p.telefono && (
                        <span className="text-xs font-bold text-neutral-600 flex items-center gap-1.5">
                            <Phone size={12} className="text-neutral-400" /> {p.telefono}
                        </span>
                    )}
                    {p.email && (
                        <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5 lowercase">
                            <Mail size={12} className="text-neutral-300" /> {p.email}
                        </span>
                    )}
                    {!p.telefono && !p.email && <span className="text-neutral-300">---</span>}
                </div>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'right',
            width: '120px',
            sortable: false,
            render: (_, p) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 transition-all">
                    <button
                        onClick={() => openModal(p)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => handleEliminar(p.id)}
                        className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2.5 rounded-2xl text-white shadow-lg shadow-primary-600/20">
                            <Truck size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Proveedores
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Gestión centralizada de suministros y convenios.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/contabilidad/cuentas-corrientes-proveedores')} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all shadow-sm">
                        <CreditCard size={18} /> Cta. Corriente
                    </button>
                    <BtnAdd
                        label="NUEVO PROVEEDOR"
                        onClick={() => openModal()}
                        className="!bg-primary-600 !border-none !hover:bg-primary-700 !rounded-xl !px-8 !py-3.5 !font-black !tracking-widest !text-[11px] !shadow-xl !shadow-primary-600/20 active:scale-95 transition-all text-white"
                    />
                </div>
            </header>

            {/* Stats */}
            <BentoGrid cols={3}>
                <StatCard
                    label="Total Proveedores"
                    value={totalItems}
                    icon={Truck}
                    color="primary"
                />
                <StatCard
                    label="Compras del Mes"
                    value="-- "
                    icon={ShieldCheck}
                    color="emerald"
                />
                <StatCard
                    label="Calificación Media"
                    value="Excelente"
                    icon={Star}
                    color="amber"
                />
            </BentoGrid>

            {/* Filtration & Content */}
            {/* Filtration & Content */}
            <PremiumFilterBar
                busqueda={busqueda}
                setBusqueda={(v) => { setBusqueda(v); setPage(1); }}
                showQuickFilters={false}
                showDateRange={false}
                onClear={() => { setBusqueda(''); setPage(1); }}
                placeholder="Buscar por nombre, CUIT o email..."
            />

            <div className="flex-grow flex flex-col min-h-0">
                <PremiumTable
                    columns={columns}
                    data={proveedores}
                    loading={loading}
                    className={cn("flex-grow shadow-lg", proveedores.length > 0 ? "rounded-b-none" : "")}
                    emptyState={
                        <EmptyState
                            title="No se encontraron proveedores"
                            description="Verifica los filtros o agrega un nuevo proveedor a tu base de datos."
                            icon={Truck}
                        />
                    }
                />

                {proveedores.length > 0 && (
                    <div className="bg-white border-x border-b border-neutral-200 rounded-b-[2rem] px-6 py-1 shadow-premium">
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
                )}
            </div>

            {/* Modal Premium (Tailwind) */}
            {showModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        {/* Header Premium */}
                        <div className="bg-slate-900 px-8 py-10 text-white relative flex-shrink-0">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Truck size={160} strokeWidth={1} />
                            </div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                                            <Building2 size={20} className="text-primary-400" />
                                        </div>
                                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary-400">Proveedores / Suministros</span>
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight font-outfit">
                                        {editingProvider ? 'Editar Proveedor' : 'Ficha de Proveedor'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-8 overflow-y-auto bg-white flex-1 scrollbar-premium">
                            <form id="proveedor-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* SECCIÓN 1: DATOS PRINCIPALES */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                        <Box size={14} className="text-primary-600" /> Identificación Comercial
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-8 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Razón Social / Nombre Comercial</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-slate-700 transition-all uppercase"
                                                placeholder="Ej: DISTRIBUIDORA NORTE S.A."
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">CUIT / Identificación</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-slate-700 transition-all font-mono"
                                                name="cuit"
                                                value={formData.cuit}
                                                onChange={handleInputChange}
                                                placeholder="30-XXXXXXXX-X"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 2: FISCAL Y BANCARIO */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                        <CreditCard size={14} className="text-primary-600" /> Configuración Fiscal y Pagos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Condición Frente al IVA</label>
                                            <select
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
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
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">CBU de Cobro (22 dígitos)</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-slate-700 transition-all font-mono"
                                                name="cbu"
                                                value={formData.cbu}
                                                onChange={handleInputChange}
                                                placeholder="000000..."
                                                maxLength="22"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Alias Bancario</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-slate-700 transition-all uppercase"
                                                name="alias"
                                                value={formData.alias}
                                                onChange={handleInputChange}
                                                placeholder="LUNA.SOL.NUBE"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 3: CONTACTO */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                        <Phone size={14} className="text-primary-600" /> Medios de Contacto y Logística
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 text-primary-600">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                                <Phone size={12} /> Teléfono Directo
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleInputChange}
                                                placeholder="Ej: +54 9 11..."
                                            />
                                        </div>
                                        <div className="space-y-2 text-primary-600">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                                <Mail size={12} /> Casilla de Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-slate-700 transition-all lowercase"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="proveedor@empresa.com"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2 text-primary-600">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                                <MapPin size={12} /> Dirección de Despacho / Depósito
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                                name="direccion"
                                                value={formData.direccion}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Av. Rivadavia 1234, CABA"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                                <Info size={12} /> Observaciones y Notas Internas
                                            </label>
                                            <textarea
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-medium text-slate-600 transition-all resize-none"
                                                name="notas"
                                                rows="3"
                                                value={formData.notas}
                                                onChange={handleInputChange}
                                                placeholder="Información adicional relevante..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer Premium */}
                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="proveedor-form"
                                className="px-10 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-primary-700 shadow-xl shadow-primary-600/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Save size={18} />
                                {editingProvider ? 'ACTUALIZAR FICHA' : 'REGISTRAR PROVEEDOR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Proveedores;
