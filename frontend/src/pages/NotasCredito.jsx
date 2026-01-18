import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Printer, Eye, Search, Filter, X, ArrowDownCircle, Plus, ChevronRight, Calendar, FileText
} from 'lucide-react';
import { BtnView, BtnPrint, BtnClear, BtnDelete } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';
import TablePagination from '../components/common/TablePagination';

const STORAGE_KEY = 'table_prefs_notascredito_items';

const NotasCredito = () => {
    const navigate = useNavigate();
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
    });
    const [filters, setFilters] = useState({
        busqueda: '',
        fecha: ''
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => {
                    if (data.items_por_pagina) setItemsPerPage(data.items_por_pagina);
                })
                .catch(console.error);
        }
    }, []);

    const fetchNotas = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                per_page: itemsPerPage,
                q: filters.busqueda,
                fecha: filters.fecha
            });
            const response = await fetch(`/api/notas-credito/listar/?${params}`);
            const data = await response.json();

            if (data.notas_credito) {
                setNotas(data.notas_credito);
                setTotalPages(data.total_pages);
                setTotalItems(data.total);
            } else {
                setNotas([]);
            }
        } catch (error) {
            console.error("Error al cargar notas de crédito:", error);
            setNotas([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters]);

    useEffect(() => {
        fetchNotas();
    }, [fetchNotas]);

    const handlePrint = (id) => {
        window.open(`/api/notas-credito/${id}/pdf/`, '_blank');
    };

    const handleView = (id) => {
        navigate(`/notas-credito/${id}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ busqueda: '', fecha: '' });
        setPage(1);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Anular Nota de Crédito?',
            text: "Esta acción anulará el comprobante y sus efectos contables.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Backend integration could go here
                Swal.fire('Atención', 'Acción no implementada en el backend aún.', 'info');
            }
        });
    };

    return (
        <div className="p-6 pb-10 max-w-7xl mx-auto fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <ArrowDownCircle className="text-red-600" size={32} strokeWidth={2.5} />
                        Notas de Crédito
                    </h1>
                    <p className="text-slate-500 font-medium ml-10">Gestión de devoluciones y anulaciones de ventas</p>
                </div>
                <button
                    onClick={() => navigate('/notas-credito/nuevo')}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-200 transition-all hover:-translate-y-1"
                >
                    <Plus size={20} strokeWidth={3} />
                    Nueva Nota de Crédito
                </button>
            </div>

            {/* Filtros Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-6 relative">
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Buscar Comprobante</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
                                placeholder="Cliente, número de NC..."
                                name="busqueda"
                                value={filters.busqueda}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Fecha</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700 font-mono"
                            name="fecha"
                            value={filters.fecha}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <X size={18} />
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Listado */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Fecha</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Número</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Cliente</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Venta Asoc.</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-widest text-[10px]">Total</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Estado</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-widest text-[10px]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && notas.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
                                        <p className="mt-4 text-slate-500 font-medium">Cargando notas de crédito...</p>
                                    </td>
                                </tr>
                            ) : notas.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20">
                                        <EmptyState
                                            icon={ArrowDownCircle}
                                            title="No hay notas de crédito"
                                            description="Las devoluciones generadas aparecerán aquí."
                                            iconColor="text-red-500"
                                            bgIconColor="bg-red-50"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                notas.map((nota) => (
                                    <tr key={nota.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span className="font-bold text-slate-700">{nota.fecha}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                                {nota.numero}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800">{nota.cliente}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {nota.venta_id ? (
                                                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs bg-slate-100 w-fit px-2.5 py-1 rounded-full border border-slate-200">
                                                    <FileText size={12} />
                                                    FC: {nota.venta_str}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <span className="font-black text-slate-900 text-base">
                                                ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(nota.total)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border ${nota.estado === 'EMITIDA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                nota.estado === 'ANULADA' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${nota.estado === 'EMITIDA' ? 'bg-emerald-500' :
                                                    nota.estado === 'ANULADA' ? 'bg-red-500' : 'bg-amber-500'
                                                    }`}></div>
                                                {nota.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <BtnView onClick={() => handleView(nota.id)} />
                                                <BtnPrint onClick={() => handlePrint(nota.id)} />
                                                <BtnDelete onClick={() => handleDelete(nota.id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
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

export default NotasCredito;
