import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, Truck, DollarSign, Hash, TrendingDown, TrendingUp } from 'lucide-react';

// Premium UI Components
import { BentoCard, StatCard, PremiumTable, TableCell, PremiumFilterBar } from '../components/premium';
import { BentoGrid } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';
import { formatNumber } from '../utils/formats';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';

const STORAGE_KEY = 'table_prefs_ctacte_prov_items';

const CuentasCorrientesProveedores = () => {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [busqueda, setBusqueda] = useState('');
    const [estadoDeuda, setEstadoDeuda] = useState('todos');

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setItemsPerPage(Number(saved));
        else {
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => setItemsPerPage(data.items_por_pagina || 10))
                .catch(() => setItemsPerPage(10));
        }
    }, []);

    const fetchProveedores = useCallback(async (signal) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                q: busqueda,
                estado_deuda: estadoDeuda
            });

            const response = await fetch(`/api/ctacte/proveedores/listar/?${params}`, { signal });
            const data = await response.json();

            let allProveedores = data.proveedores || data.data || [];
            if (Array.isArray(data)) allProveedores = data;

            // Client-side filtering
            if (busqueda) {
                const q = busqueda.toLowerCase();
                allProveedores = allProveedores.filter(p =>
                    p.nombre.toLowerCase().includes(q) ||
                    (p.cuit && p.cuit.toLowerCase().includes(q)) ||
                    (p.telefono && p.telefono.toLowerCase().includes(q)) ||
                    (p.email && p.email.toLowerCase().includes(q))
                );
            }

            if (estadoDeuda !== 'todos') {
                allProveedores = allProveedores.filter(p => {
                    const saldo = parseFloat(p.saldo_actual || 0);
                    if (estadoDeuda === 'con_deuda') return saldo > 0;
                    if (estadoDeuda === 'al_dia') return saldo === 0;
                    if (estadoDeuda === 'saldo_favor') return saldo < 0;
                    return true;
                });
            }

            setTotalItems(allProveedores.length);
            setTotalPages(Math.ceil(allProveedores.length / itemsPerPage));

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            setProveedores(allProveedores.slice(start, end));
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Error al cargar proveedores:", error);
                setProveedores([]);
            }
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, busqueda, estadoDeuda]);

    useEffect(() => {
        const controller = new AbortController();
        fetchProveedores(controller.signal);
        return () => controller.abort();
    }, [fetchProveedores]);

    // KPI Calculations
    const stats = useMemo(() => {
        const totalDeuda = proveedores.reduce((acc, p) => {
            const saldo = parseFloat(p.saldo_actual || 0);
            return saldo > 0 ? acc + saldo : acc;
        }, 0);

        const totalAFavor = proveedores.reduce((acc, p) => {
            const saldo = parseFloat(p.saldo_actual || 0);
            return saldo < 0 ? acc + Math.abs(saldo) : acc;
        }, 0);

        const conDeuda = proveedores.filter(p => parseFloat(p.saldo_actual || 0) > 0).length;

        return {
            totalDeuda,
            totalAFavor,
            conDeuda,
            count: totalItems
        };
    }, [proveedores, totalItems]);

    // Table Column Definitions
    const columns = [
        {
            key: 'nombre',
            label: 'Proveedor',
            render: (v, p) => (
                <div className="flex flex-col">
                    <TableCell.Primary value={v} />
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {p.direccion || 'Sin dirección'}
                    </span>
                </div>
            )
        },
        {
            key: 'cuit',
            label: 'Documento',
            width: '180px',
            render: (v) => (
                <span className="font-mono text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 w-fit">
                    {v || '-'}
                </span>
            )
        },
        {
            key: 'contacto',
            label: 'Contacto',
            width: '180px',
            render: (_, p) => (
                <span className="text-xs text-slate-500 font-medium">
                    {p.telefono || p.email || '-'}
                </span>
            )
        },
        {
            key: 'saldo_actual',
            label: 'Saldo Actual',
            align: 'right',
            width: '180px',
            render: (v) => {
                const saldo = parseFloat(v || 0);
                const tieneDeuda = saldo > 0;
                const saldoAFavor = saldo < 0;

                return (
                    <span className={cn(
                        "text-base font-black",
                        tieneDeuda ? "text-rose-600" :
                            saldoAFavor ? "text-emerald-600" :
                                "text-slate-400"
                    )}>
                        <TableCell.Currency value={saldo} />
                    </span>
                );
            }
        },
        {
            key: 'estado',
            label: 'Estado',
            width: '180px',
            align: 'center',
            render: (_, p) => {
                const saldo = parseFloat(p.saldo_actual || 0);
                const tieneDeuda = saldo > 0;
                const saldoAFavor = saldo < 0;

                return (
                    <TableCell.Status
                        value={tieneDeuda ? 'Deuda Pendiente' : saldoAFavor ? 'Saldo a Favor' : 'Al Día'}
                        variant={tieneDeuda ? 'error' : saldoAFavor ? 'success' : 'success'}
                    />
                );
            }
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'right',
            width: '100px',
            sortable: false,
            render: (_, p) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => navigate(`/ctas-corrientes/proveedores/${p.id}`)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Ver Historial"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-full overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-2.5 rounded-2xl text-white shadow-lg shadow-rose-600/20">
                            <CreditCard size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Cuentas Corrientes
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Gestión de saldos y deuda con proveedores.
                    </p>
                </div>
            </header>

            {/* KPI Section */}
            <BentoGrid cols={4}>
                <StatCard
                    label="Deuda Total"
                    value={`$${formatNumber(stats.totalDeuda)}`}
                    icon={TrendingDown}
                    color="error"
                />
                <StatCard
                    label="Saldo a Favor"
                    value={`$${formatNumber(stats.totalAFavor)}`}
                    icon={TrendingUp}
                    color="success"
                />
                <StatCard
                    label="Con Deuda"
                    value={stats.conDeuda}
                    icon={Hash}
                    color="warning"
                />
                <StatCard
                    label="Total Proveedores"
                    value={stats.count}
                    icon={Truck}
                    color="rose"
                />
            </BentoGrid>

            {/* Filtration & Main Content */}
            <div className="flex flex-col flex-grow gap-4 min-h-0">
                {/* Custom Filter Bar for Proveedores */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-premium p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Buscar proveedor por nombre, CUIT, teléfono..."
                                    className="w-full px-5 py-3.5 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-500 focus:bg-white outline-none font-bold text-slate-700 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-4">
                            <select
                                value={estadoDeuda}
                                onChange={(e) => {
                                    setEstadoDeuda(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-500 focus:bg-white outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                            >
                                <option value="todos">Todos los Estados</option>
                                <option value="con_deuda">Con Deuda (Saldo Mayor a $0)</option>
                                <option value="al_dia">Al Día (Saldo $0)</option>
                                <option value="saldo_favor">A Favor (Saldo Menor a $0)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <button
                                onClick={() => {
                                    setBusqueda('');
                                    setEstadoDeuda('todos');
                                    setPage(1);
                                }}
                                className="w-full px-5 py-3.5 bg-slate-100 border-2 border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="flex-grow flex flex-col min-h-0">
                    <PremiumTable
                        columns={columns}
                        data={proveedores}
                        loading={loading}
                        className={cn("flex-grow shadow-lg", proveedores.length > 0 ? "rounded-b-none" : "")}
                        emptyState={
                            <EmptyState
                                icon={Truck}
                                title="No hay proveedores"
                                description="No se encontraron proveedores en cuenta corriente."
                                iconColor="text-rose-500"
                                bgIconColor="bg-rose-50"
                            />
                        }
                    />

                    {/* Pagination */}
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
            </div>
        </div>
    );
};

export default CuentasCorrientesProveedores;
