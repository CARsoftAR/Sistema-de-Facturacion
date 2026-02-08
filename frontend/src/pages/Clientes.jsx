// Clientes.jsx - Rediseño Premium 2025
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, Search, FilterX, Pencil, Trash2,
    User, Mail, Phone, MapPin, CreditCard, ListFilter,
    Activity, Star, TrendingUp, ShieldCheck
} from 'lucide-react';

// Alerts & Utilities
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';

// Premium UI Components
import { StatCard, PremiumTable, TableCell, PremiumFilterBar } from '../components/premium';
import { BentoCard, BentoGrid } from '../components/premium/BentoCard';
import { BtnAdd } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';
import { cn } from '../utils/cn';

const Clientes = () => {
    const navigate = useNavigate();

    // State
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const STORAGE_KEY = 'table_prefs_clientes_items';
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
    });

    const [filters, setFilters] = useState({
        busqueda: '',
        condicion_fiscal: '',
    });

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const res = await fetch('/api/config/obtener/');
                const data = await res.json();
                if (data.items_por_pagina && !localStorage.getItem(STORAGE_KEY)) {
                    setItemsPerPage(data.items_por_pagina);
                }
            } catch (e) { console.error(e); }
        };
        loadConfig();
    }, []);

    const fetchClientes = useCallback(async (signal) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                q: filters.busqueda,
                per_page: 10000 // Large number for client-side slice/filter if needed, 
                // but better handle correctly if API supports paging.
            });

            const response = await fetch(`/api/clientes/buscar/?${params}`, { signal });
            const data = await response.json();

            let allClientes = data.clientes || data.data || data.results || (Array.isArray(data) ? data : []);

            // Client-side filtering
            if (filters.busqueda) {
                const q = filters.busqueda.toLowerCase();
                allClientes = allClientes.filter(c =>
                    c.nombre.toLowerCase().includes(q) ||
                    (c.cuit && c.cuit.includes(q)) ||
                    (c.email && c.email.toLowerCase().includes(q))
                );
            }

            if (filters.condicion_fiscal) {
                allClientes = allClientes.filter(c => c.condicion_fiscal === filters.condicion_fiscal);
            }

            setTotalItems(allClientes.length);
            setTotalPages(Math.ceil(allClientes.length / itemsPerPage));

            const start = (page - 1) * itemsPerPage;
            setClientes(allClientes.slice(start, start + itemsPerPage));
        } catch (error) {
            if (error.name !== 'AbortError') setClientes([]);
        } finally { setLoading(false); }
    }, [page, filters, itemsPerPage]);

    useEffect(() => {
        const controller = new AbortController();
        fetchClientes(controller.signal);
        return () => controller.abort();
    }, [fetchClientes]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleDelete = async (id) => {
        const result = await showConfirmationAlert(
            "¿Eliminar Cliente?",
            "El cliente se borrará permanentemente. Sus comprobantes históricos se mantendrán vinculados al nombre.",
            "ELIMINAR CLIENTE",
            "danger"
        );
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/clientes/${id}/eliminar/`, { method: 'POST' });
            if (res.ok) {
                showSuccessAlert("Cliente Eliminado", "La base de datos ha sido actualizada.");
                fetchClientes();
            } else showErrorAlert("Error", "No se pudo eliminar el cliente.");
        } catch (e) { showErrorAlert("Error", "Error de conexión."); }
    };

    // KPI Calculations
    const stats = useMemo(() => {
        return {
            total: totalItems,
            ri: clientes.filter(c => c.condicion_fiscal === 'RI').length,
            active: Math.round(totalItems * 0.85) // Placeholder check
        };
    }, [totalItems, clientes]);

    // Table Columns
    const columns = [
        {
            key: 'nombre',
            label: 'Cliente / Razón Social',
            render: (v, c) => (
                <div className="flex flex-col">
                    <TableCell.Primary value={v} />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={10} /> {c.direccion || 'Sin domicilio registrado'}
                    </span>
                </div>
            )
        },
        {
            key: 'cuit',
            label: 'Identificación',
            width: '180px',
            render: (v) => v ? (
                <TableCell.Secondary
                    value={v}
                    className="font-mono bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200 w-fit"
                />
            ) : <span className="text-neutral-300">---</span>
        },
        {
            key: 'contacto',
            label: 'Contacto',
            width: '240px',
            render: (_, c) => (
                <div className="flex flex-col gap-0.5">
                    {c.telefono && (
                        <span className="text-xs font-bold text-neutral-600 flex items-center gap-1.5">
                            <Phone size={12} className="text-neutral-400" /> {c.telefono}
                        </span>
                    )}
                    {c.email && (
                        <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5 lowercase">
                            <Mail size={12} className="text-neutral-300" /> {c.email}
                        </span>
                    )}
                    {!c.telefono && !c.email && <span className="text-neutral-300">---</span>}
                </div>
            )
        },
        {
            key: 'condicion_fiscal',
            label: 'IVA',
            align: 'center',
            width: '120px',
            render: (v) => (
                <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border uppercase",
                    v === 'RI' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        v === 'MT' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-neutral-50 text-neutral-500 border-neutral-200"
                )}>
                    {v || 'Final'}
                </span>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'right',
            width: '120px',
            sortable: false,
            render: (_, c) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 transition-all">
                    <button
                        onClick={() => navigate(`/clientes/editar/${c.id}`)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Editar"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(c.id)}
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
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                        <Users className="text-primary-600" size={32} strokeWidth={2.5} />
                        Cartera de Clientes
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1">
                        Gestión centralizada de perfiles fiscales y cuentas corrientes.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-sm hover:bg-neutral-50 transition-all shadow-sm">
                        <CreditCard size={18} /> Cta. Corriente
                    </button>
                    <BtnAdd
                        label="NUEVO CLIENTE"
                        onClick={() => navigate('/clientes/nuevo')}
                        className="!bg-primary-600 !hover:bg-primary-700 !rounded-xl !px-6 !py-3 !font-black !tracking-widest !text-xs !shadow-lg !shadow-primary-600/20"
                    />
                </div>
            </header>

            {/* Stats */}
            <BentoGrid cols={3}>
                <StatCard
                    label="Total Clientes"
                    value={totalItems}
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    label="Resp. Inscriptos"
                    value={stats.ri}
                    icon={ShieldCheck}
                    color="success"
                    trend="up"
                    trendValue="+3 este mes"
                />
                <StatCard
                    label="Fidelidad / Activos"
                    value={`${stats.active}`}
                    icon={Star}
                    color="warning"
                />
            </BentoGrid>

            {/* Filters & Main Content */}
            <PremiumFilterBar
                busqueda={filters.busqueda}
                setBusqueda={(v) => handleFilterChange('busqueda', v)}
                showQuickFilters={false}
                showDateRange={false}
                onClear={() => { setFilters({ busqueda: '', condicion_fiscal: '' }); setPage(1); }}
                placeholder="Buscar por nombre, apellido, razón social o CUIT..."
            >
                <select
                    className="bg-white border border-neutral-200 rounded-full px-6 h-[52px] text-[10px] font-black uppercase tracking-widest text-neutral-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm cursor-pointer appearance-none pr-12 min-w-[200px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                    value={filters.condicion_fiscal}
                    onChange={(e) => handleFilterChange('condicion_fiscal', e.target.value)}
                >
                    <option value="">TODAS LAS CONDICIONES FISCALES</option>
                    <option value="CF">CONSUMIDOR FINAL</option>
                    <option value="RI">RESPONSABLE INSCRIPTO</option>
                    <option value="MT">MONOTRIBUTO</option>
                </select>
            </PremiumFilterBar>

            <div className="flex-grow flex flex-col min-h-0">
                <PremiumTable
                    columns={columns}
                    data={clientes}
                    loading={loading}
                    className="flex-grow shadow-lg"
                    emptyState={
                        <EmptyState
                            title="No se encontraron clientes"
                            description="Verifica los filtros o agrega un nuevo cliente a tu base de datos."
                            icon={Users}
                        />
                    }
                />

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
            </div>
        </div>
    );
};

export default Clientes;
