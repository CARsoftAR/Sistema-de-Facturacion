import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FilterX, FileText, ArrowUpCircle, Calendar, Eye, Printer, Trash2, ListFilter } from 'lucide-react';
import Swal from 'sweetalert2';
import EmptyState from '../components/EmptyState';
import { BtnView, BtnPrint, BtnDelete, BtnClear, BtnAdd } from '../components/CommonButtons';
import TablePagination from '../components/common/TablePagination';
import { showDeleteAlert, showToast } from '../utils/alerts';
import { PremiumTable, TableCell, PremiumFilterBar, StatCard } from '../components/premium';
import { BentoGrid } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';

const STORAGE_KEY = 'table_prefs_notasdebito_items';

const NotasDebito = () => {
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
    const getLocalDate = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [dateRange, setDateRange] = useState({
        start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        end: getLocalDate()
    });

    const [filters, setFilters] = useState({
        busqueda: ''
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
                fecha_start: dateRange.start,
                fecha_end: dateRange.end
            });
            const response = await fetch(`/api/notas-debito/listar/?${params}`);
            const data = await response.json();

            if (data.notas_debito) {
                setNotas(data.notas_debito);
                setTotalPages(data.total_pages);
                setTotalItems(data.total);
            } else {
                setNotas([]);
            }
        } catch (error) {
            console.error("Error al cargar notas de débito:", error);
            setNotas([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, filters]);

    useEffect(() => {
        fetchNotas();
    }, [fetchNotas, dateRange]);

    const handlePrint = (id) => {
        window.open(`/api/notas-debito/${id}/pdf/`, '_blank');
    };

    const handleView = (id) => {
        navigate(`/notas-debito/${id}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ busqueda: '' });
        setDateRange({
            start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
            end: getLocalDate()
        });
        setPage(1);
    };

    const handleDelete = async (id) => {
        const result = await showDeleteAlert(
            "¿Anular Nota de Débito?",
            "Esta acción anulará el comprobante y revertirá el cargo en la cuenta corriente del cliente. Se generará un asiento contable de reversión.",
            'Anular'
        );

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/notas-debito/${id}/anular/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.ok) {
                showToast(data.message, 'success');
                fetchNotas(); // Recargar lista
            } else {
                Swal.fire('Error', data.error || 'No se pudo anular la Nota de Débito', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Error de conexión al anular', 'error');
        }
    };

    const columns = [
        {
            key: 'numero',
            label: '# ID',
            width: '180px',
            render: (v) => <TableCell.ID value={v} />
        },
        {
            key: 'fecha',
            label: 'Fecha',
            width: '180px',
            render: (v) => <TableCell.Date value={v} />
        },
        {
            key: 'cliente',
            label: 'Cliente',
            render: (v) => <TableCell.Primary value={v} />
        },
        {
            key: 'venta_str',
            label: 'Venta Asoc.',
            width: '180px',
            render: (v, row) => (
                row.venta_id ? (
                    <TableCell.Status value={`FC: ${v}`} variant="default" />
                ) : <span className="text-neutral-300">-</span>
            )
        },
        {
            key: 'total',
            label: 'Total',
            width: '150px',
            align: 'right',
            render: (v) => <TableCell.Currency value={v} />
        },
        {
            key: 'estado',
            label: 'Estado',
            width: '150px',
            align: 'center',
            render: (v) => {
                const variant = v === 'EMITIDA' ? 'success' : v === 'ANULADA' ? 'error' : 'default';
                return <TableCell.Status value={v} variant={variant} />;
            }
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '150px',
            align: 'right',
            sortable: false,
            render: (_, row) => (
                <div className="flex justify-end items-center gap-1">
                    <button
                        onClick={() => handleView(row.id)}
                        className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-primary-600 transition-all"
                        title="Ver Detalle"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => handlePrint(row.id)}
                        className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-900 transition-all"
                        title="Imprimir"
                    >
                        <Printer size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-red-600 transition-all"
                        title="Anular"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-neutral-50/30">
            {/* Header / Toolbar Area */}
            <div className="p-8 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                                <ArrowUpCircle size={24} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tight whitespace-nowrap">Notas de Débito</h1>
                        </div>
                        <p className="text-neutral-500 font-medium ml-1">Gestión de recargos y ajustes financieros.</p>
                    </div>

                    <PremiumFilterBar
                        busqueda={filters.busqueda}
                        setBusqueda={(val) => setFilters(prev => ({ ...prev, busqueda: val }))}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        onClear={clearFilters}
                        placeholder="Buscar número o cliente..."
                        className="!px-0"
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 px-8 pb-8 overflow-hidden min-h-0">
                <div className="h-full bg-white rounded-[2.5rem] border border-neutral-200 shadow-xl shadow-neutral-200/50 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-hidden">
                        <PremiumTable
                            columns={columns}
                            data={notas}
                            loading={loading}
                            emptyMessage={
                                <EmptyState
                                    icon={ArrowUpCircle}
                                    title="Sin Notas de Débito"
                                    description="No se encontraron recargos que coincidan con los filtros."
                                    iconColor="text-indigo-500"
                                    bgIconColor="bg-indigo-50"
                                />
                            }
                        />
                    </div>

                    <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
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
        </div>
    );
};

export default NotasDebito;
