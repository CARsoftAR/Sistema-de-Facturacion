
import React, { useState, useEffect, useMemo } from 'react';
import {
    BookOpen, Search, Maximize2, Minimize2, Layers, Plus,
    Edit2, Trash2, FileText, Folder, FolderOpen,
    ChevronRight, ChevronDown, Check, X,
    Hash, Type, Tag, Activity, ListChecks,
    TrendingUp, TrendingDown, Wallet, Target, Download
} from 'lucide-react';
import { BtnAdd, BtnCancel, BtnSave } from '../components/CommonButtons';
import { showDeleteAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { BentoCard, StatCard } from '../components/premium';
import { BentoGrid } from '../components/premium/BentoCard';
import { PremiumInput, PremiumSelect, SearchInput } from '../components/premium/PremiumInput';
import { cn } from '../utils/cn';

// ROW COMPONENT (Premium Tree Row)
const CuentaRow = ({ cuenta, level, expanded, hasChildren, onToggle, onEdit, onDelete, onAddChild }) => {
    const paddingLeft = level * 28 + 24;

    const typeColors = {
        'ACTIVO': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'PASIVO': 'bg-rose-50 text-rose-700 border-rose-200',
        'PN': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'R_POS': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'R_NEG': 'bg-rose-50 text-rose-700 border-rose-200',
    };

    return (
        <tr className="group hover:bg-primary-50/30 transition-all duration-150 border-b border-neutral-100 last:border-0 relative">
            {/* Cuenta / Estructura */}
            <td className="py-2 px-6">
                <div className="flex items-center" style={{ paddingLeft: `${paddingLeft}px` }}>
                    {/* Vertical line connector */}
                    {level > 0 && (
                        <div className="absolute top-0 bottom-0 border-l border-neutral-200/60" style={{ left: `${paddingLeft - 14}px` }} />
                    )}

                    <div className="w-6 mr-1.5 flex shrink-0 justify-center z-10">
                        {hasChildren && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggle(cuenta.id); }}
                                className="p-1 rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-all bg-white border border-neutral-100"
                            >
                                {expanded ? <ChevronDown size={12} strokeWidth={3} /> : <ChevronRight size={12} strokeWidth={3} />}
                            </button>
                        )}
                    </div>

                    <div className={cn(
                        "p-1.5 rounded-lg mr-3 shadow-sm z-10 border transition-all duration-300 group-hover:scale-110",
                        cuenta.imputable
                            ? "bg-white text-neutral-500 border-neutral-200"
                            : "bg-primary-50 text-primary-600 border-primary-100"
                    )}>
                        {cuenta.imputable ? (
                            <FileText size={14} strokeWidth={2.5} />
                        ) : (
                            expanded ? <FolderOpen size={14} strokeWidth={2.5} /> : <Folder size={14} strokeWidth={2.5} />
                        )}
                    </div>

                    <div className="flex flex-col min-w-0 z-10">
                        <span className="text-[10px] font-black text-neutral-400 font-mono tracking-wider uppercase mb-0.5 leading-none">
                            {cuenta.codigo}
                        </span>
                        <span className={cn(
                            "text-sm truncate transition-all",
                            !cuenta.imputable ? "font-bold text-neutral-900" : "font-medium text-neutral-600 group-hover:text-primary-600"
                        )}>
                            {cuenta.nombre}
                        </span>
                    </div>
                </div>
            </td>

            {/* Rubro */}
            <td className="text-center py-2 px-6">
                <span className={cn(
                    "px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all",
                    typeColors[cuenta.tipo] || "bg-neutral-50 text-neutral-600 border-neutral-200"
                )}>
                    {cuenta.tipo}
                </span>
            </td>

            {/* Imputable */}
            <td className="text-center py-2 px-6">
                {cuenta.imputable ? (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                        <Check size={14} strokeWidth={3} />
                    </div>
                ) : (
                    <div className="w-6 h-6 mx-auto rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center opacity-30">
                        <Layers size={12} />
                    </div>
                )}
            </td>

            {/* Acciones */}
            <td className="text-right pr-6 py-2">
                <div className="flex justify-end gap-1 transition-all duration-150">
                    {!cuenta.imputable && (
                        <button
                            onClick={() => onAddChild(cuenta)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Agregar Subcuenta"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(cuenta)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Editar"
                    >
                        <Edit2 size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => onDelete(cuenta.id, cuenta.nombre)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Eliminar"
                    >
                        <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const PlanCuentas = () => {
    const [originalCuentas, setOriginalCuentas] = useState([]);
    const [filteredCuentas, setFilteredCuentas] = useState([]);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalCount, setTotalCount] = useState(0);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null, codigo: '', nombre: '', tipo: 'ACTIVO',
        imputable: true, padre_id: null, nivel: 1
    });

    const fetchCuentas = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/contabilidad/plan-cuentas/?t=${Date.now()}`);
            const data = await res.json();
            if (data.success) {
                setOriginalCuentas(data.cuentas);
                setFilteredCuentas(data.cuentas);

                const allIds = new Set();
                const countNodes = (nodes) => {
                    let count = 0;
                    nodes.forEach(n => {
                        count++;
                        allIds.add(n.id);
                        if (n.hijos && n.hijos.length > 0) count += countNodes(n.hijos);
                    });
                    return count;
                };
                setTotalCount(countNodes(data.cuentas));
                setExpandedIds(allIds);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCuentas();
    }, []);

    const kpiStats = useMemo(() => {
        let stats = { activos: 0, pasivos: 0, pn: 0, resultados: 0 };
        const traverse = (nodes) => {
            nodes.forEach(n => {
                if (n.tipo === 'ACTIVO') stats.activos++;
                else if (n.tipo === 'PASIVO') stats.pasivos++;
                else if (n.tipo === 'PN') stats.pn++;
                else stats.resultados++;
                if (n.hijos) traverse(n.hijos);
            });
        };
        traverse(originalCuentas);
        return stats;
    }, [originalCuentas]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCuentas(originalCuentas);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filterTree = (nodes) => {
            return nodes.reduce((acc, node) => {
                const matches = node.nombre.toLowerCase().includes(lowerTerm) || node.codigo.includes(lowerTerm);
                const filteredChildren = node.hijos ? filterTree(node.hijos) : [];

                if (matches || filteredChildren.length > 0) {
                    acc.push({ ...node, hijos: filteredChildren });
                }
                return acc;
            }, []);
        };

        const filtered = filterTree(originalCuentas);
        setFilteredCuentas(filtered);

        const getAllIds = (nodes) => {
            let ids = [];
            nodes.forEach(n => {
                ids.push(n.id);
                if (n.hijos) ids = ids.concat(getAllIds(n.hijos));
            });
            return ids;
        };
        setExpandedIds(new Set(getAllIds(filtered)));
    }, [searchTerm, originalCuentas]);

    const getVisibleRows = (nodes, depth = 0) => {
        let rows = [];
        nodes.forEach(node => {
            rows.push({ ...node, visualLevel: depth });
            if (expandedIds.has(node.id) && node.hijos && node.hijos.length > 0) {
                rows = rows.concat(getVisibleRows(node.hijos, depth + 1));
            }
        });
        return rows;
    };

    const visibleRows = getVisibleRows(filteredCuentas);

    const toggleExpand = (id) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        setExpandedIds(newSet);
    };

    const handleExpandAll = () => {
        const allIds = new Set();
        const traverse = (nodes) => {
            nodes.forEach(n => {
                allIds.add(n.id);
                if (n.hijos) traverse(n.hijos);
            });
        };
        traverse(filteredCuentas);
        setExpandedIds(allIds);
    };

    const handleCollapseAll = () => setExpandedIds(new Set(filteredCuentas.map(c => c.id)));

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        const url = formData.id
            ? `/api/contabilidad/plan-cuentas/${formData.id}/editar/`
            : `/api/contabilidad/plan-cuentas/crear/`;

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

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.ok || data.success) {
                setShowModal(false);
                fetchCuentas();
                showSuccessAlert("¡Éxito!", "La cuenta ha sido guardada correctamente.");
            } else {
                showErrorAlert("Error", data.error || "No se pudo guardar la cuenta.");
            }
        } catch (error) {
            showErrorAlert("Error", "Error de conexión con el servidor.");
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await showDeleteAlert(
            `¿Eliminar cuenta ${nombre}?`,
            "Esta acción eliminará la cuenta contable. Si tiene movimientos asociados, no podrá ser eliminada.",
            'Eliminar'
        );
        if (!result.isConfirmed) return;

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

            const res = await fetch(`/api/contabilidad/plan-cuentas/${id}/eliminar/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            });
            const data = await res.json();
            if (data.ok) {
                fetchCuentas();
                showSuccessAlert("Eliminado", "La cuenta ha sido eliminada.");
            } else {
                showErrorAlert("Error", data.error);
            }
        } catch (error) {
            showErrorAlert("Error", "No se pudo eliminar la cuenta.");
        }
    };

    const openNew = (parent = null) => {
        setFormData({
            id: null,
            codigo: parent ? `${parent.codigo}.` : '',
            nombre: '',
            tipo: parent ? parent.tipo : 'ACTIVO',
            imputable: true,
            padre_id: parent ? parent.id : null,
            nivel: parent ? parent.nivel + 1 : 1
        });
        setShowModal(true);
    };

    const openEdit = (cuenta) => {
        setFormData({
            id: cuenta.id,
            codigo: cuenta.codigo,
            nombre: cuenta.nombre,
            tipo: cuenta.tipo,
            imputable: cuenta.imputable,
            padre_id: cuenta.padre_id,
            nivel: cuenta.nivel
        });
        setShowModal(true);
    };

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-100px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-500/30">
                            <BookOpen size={30} strokeWidth={2.5} />
                        </div>
                        Plan de Cuentas
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1 flex items-center gap-2">
                        <Activity size={14} className="text-primary-500" /> Estructura jerárquica para la imputación comercial y contable.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-50 transition-all shadow-sm">
                        <Download size={18} /> Exportar
                    </button>
                    <BtnAdd
                        label="NUEVA CUENTA RAÍZ"
                        onClick={() => openNew(null)}
                        className="!bg-primary-600 !hover:bg-primary-700 !rounded-xl !px-8 !py-4 !font-black !tracking-widest !text-xs !shadow-xl !shadow-primary-600/20"
                    />
                </div>
            </header>

            {/* KPI Section */}
            <BentoGrid cols={4} className="shrink-0">
                <StatCard
                    label="Activos"
                    value={kpiStats.activos}
                    icon={TrendingUp}
                    color="success"
                    description="Cuentas de Activo"
                />
                <StatCard
                    label="Pasivos"
                    value={kpiStats.pasivos}
                    icon={TrendingDown}
                    color="error"
                    description="Deudas y Obligaciones"
                />
                <StatCard
                    label="Patrimonio"
                    value={kpiStats.pn}
                    icon={Wallet}
                    color="primary"
                    description="Capital y Reservas"
                />
                <StatCard
                    label="Total Cuentas"
                    value={totalCount}
                    icon={Target}
                    color="warning"
                    description="Estructura Completa"
                />
            </BentoGrid>

            {/* Toolbar */}
            <BentoCard className="p-3 shrink-0 !bg-white/80 backdrop-blur-md border-neutral-200/60 shadow-lg">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-neutral-400">
                                <Search size={20} strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por cuenta, código o rubro..."
                                className="w-full h-12 pl-12 pr-4 bg-neutral-100 border-0 rounded-xl text-sm font-bold text-neutral-700 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExpandAll}
                            className="h-12 px-5 rounded-xl bg-white text-neutral-600 border border-neutral-200 font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                        >
                            <Maximize2 size={16} strokeWidth={2.5} /> Expandir
                        </button>
                        <button
                            onClick={handleCollapseAll}
                            className="h-12 px-5 rounded-xl bg-white text-neutral-600 border border-neutral-200 font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                        >
                            <Minimize2 size={16} strokeWidth={2.5} /> Contraer
                        </button>
                    </div>
                </div>
            </BentoCard>

            {/* Tree Table */}
            <BentoCard className="flex-1 min-h-0 p-0 overflow-hidden flex flex-col border border-neutral-200/60 shadow-2xl shadow-neutral-200/40 !bg-white">
                <div className="overflow-auto flex-1 no-scrollbar">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-neutral-50 border-b border-neutral-200 backdrop-blur-sm bg-neutral-50/95">
                                <th className="text-left px-8 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700">Cuenta / Estructura Jerárquica</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 w-40">Rubro</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 w-32">Imputable</th>
                                <th className="text-right px-8 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 w-56">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 px-2">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-14 h-14 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                                            <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] animate-pulse">Sincronizando Plan de Cuentas...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : visibleRows.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-40">
                                            <div className="p-10 bg-neutral-50 rounded-[3rem] shadow-inner">
                                                <Search size={64} className="text-neutral-300" strokeWidth={1} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-neutral-800">Búsqueda sin resultados</h3>
                                                <p className="text-neutral-400 font-bold text-sm uppercase tracking-widest">Ajusta los términos para encontrar la cuenta</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visibleRows.map(c => (
                                    <CuentaRow
                                        key={c.id}
                                        cuenta={c}
                                        level={c.visualLevel}
                                        expanded={expandedIds.has(c.id)}
                                        hasChildren={c.hijos && c.hijos.length > 0}
                                        onToggle={toggleExpand}
                                        onEdit={openEdit}
                                        onDelete={handleDelete}
                                        onAddChild={openNew}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && (
                    <div className="px-8 py-5 bg-neutral-50/80 backdrop-blur-sm border-t border-neutral-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                                {visibleRows.length} Cuentas Desplegadas de {totalCount} totales
                            </span>
                        </div>
                        <div className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">
                            Sistema Contable Pro v4.0
                        </div>
                    </div>
                )}
            </BentoCard>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowModal(false)} />
                    <BentoCard className="relative w-full max-w-xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-0 animate-in zoom-in duration-300 !bg-white !rounded-[3rem]">
                        <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "p-4 rounded-[1.5rem] shadow-lg transition-all transform hover:rotate-3",
                                    formData.id ? "bg-primary-600 text-white shadow-primary-500/30" : "bg-emerald-600 text-white shadow-emerald-500/30"
                                )}>
                                    <BookOpen size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-neutral-900 leading-tight">
                                        {formData.id ? 'Modificar Cuenta' : 'Nueva Cuenta Contable'}
                                    </h2>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1">
                                        {formData.id ? 'Actualización de parámetros operativos' : 'Registro de nuevo nodo en estructura'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-neutral-400 hover:text-rose-500">
                                <X size={24} strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-1">
                                    <PremiumInput
                                        label="Código de Imputación"
                                        icon={Hash}
                                        required
                                        value={formData.codigo}
                                        onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                                        placeholder="Ej: 1.1.01.001"
                                        className="font-mono !text-lg !font-black !tracking-tighter !text-primary-700"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <PremiumSelect
                                        label="Rubro / Tipo"
                                        value={formData.tipo}
                                        onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                        options={[
                                            { value: 'ACTIVO', label: 'ACTIVO' },
                                            { value: 'PASIVO', label: 'PASIVO' },
                                            { value: 'PN', label: 'PATRIMONIO NETO' },
                                            { value: 'R_POS', label: 'RESULTADO POSITIVO' },
                                            { value: 'R_NEG', label: 'RESULTADO NEGATIVO' },
                                        ]}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <PremiumInput
                                        label="Denominación de la Cuenta"
                                        icon={Type}
                                        required
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Ej: Caja Moneda Nacional"
                                        className="!text-lg !font-bold"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="relative flex items-center gap-6 p-6 rounded-[2.5rem] bg-neutral-50/50 border-2 border-dashed border-neutral-200 hover:border-emerald-400 group cursor-pointer transition-all overflow-hidden">
                                        <div className={cn(
                                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 transform group-hover:scale-110",
                                            formData.imputable
                                                ? "bg-emerald-600 text-white shadow-[0_12px_24px_-8px_rgba(16,185,129,0.5)]"
                                                : "bg-neutral-200 text-neutral-400"
                                        )}>
                                            <Activity size={32} strokeWidth={3} className={cn(formData.imputable && "animate-pulse")} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-lg font-black text-neutral-900">¿Es Cuenta Imputable?</span>
                                                <div className={cn(
                                                    "w-12 h-6 rounded-full relative transition-all duration-300",
                                                    formData.imputable ? "bg-emerald-500" : "bg-neutral-300"
                                                )}>
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                                        formData.imputable ? "left-7" : "left-1"
                                                    )} />
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.imputable}
                                                    onChange={e => setFormData({ ...formData, imputable: e.target.checked })}
                                                />
                                            </div>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-tight">
                                                Las cuentas imputables permiten el registro de asientos y movimientos directos.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <BtnCancel
                                    label="Descartar"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 !h-16 !rounded-[1.5rem] !font-black !text-xs !tracking-[0.2em] !bg-neutral-100 hover:!bg-neutral-200 text-neutral-700 border-0"
                                />
                                <BtnSave
                                    label={formData.id ? 'Actualizar Cuenta' : 'Registrar Cuenta'}
                                    className="flex-1 !h-16 !rounded-[1.5rem] !font-black !text-xs !tracking-[0.2em] !shadow-2xl !bg-primary-600 hover:!bg-primary-700 border-0"
                                />
                            </div>
                        </form>
                    </BentoCard>
                </div>
            )}
        </div>
    );
};

export default PlanCuentas;
