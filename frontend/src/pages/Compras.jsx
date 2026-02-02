import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Plus,
    Search,
    ListFilter,
    Download,
    Trash2,
    Eye,
    Truck,
    XCircle,
    ShoppingBag,
    ShoppingCart,
    FilterX,
    CheckCircle2,
    Clock,
    Check,
    DollarSign,
    FileText,
    Banknote,
    Calendar,
    Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { BtnAdd } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';
import TablePagination from '../components/common/TablePagination';
import PaymentModal from '../components/common/PaymentModal';
import { StatCard, PremiumTable, TableCell, SearchInput, PremiumFilterBar } from '../components/premium';
import { BentoGrid, BentoCard } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';
import { formatNumber } from '../utils/formats';

const STORAGE_KEY = 'table_prefs_compras_items';

const Compras = () => {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('TODOS');

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [ordenARecibir, setOrdenARecibir] = useState(null);

    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successOrderData, setSuccessOrderData] = useState(null);

    const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancelando, setCancelando] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setItemsPerPage(Number(saved));
        } else {
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => {
                    if (data.items_por_pagina) setItemsPerPage(data.items_por_pagina);
                })
                .catch(err => console.error(err));
        }
    }, []);

    const fetchCompras = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                fecha_start: dateRange.start,
                fecha_end: dateRange.end
            });
            const response = await fetch(`/api/compras/listar/?${params}`);
            const data = await response.json();
            if (data.ordenes) {
                setOrdenes(data.ordenes);
            }
        } catch (error) {
            console.error('Error cargando compras:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompras();
    }, [fetchCompras, dateRange]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const setToday = () => {
        const today = getLocalDate();
        setDateRange({ start: today, end: today });
        setPage(1);
    };

    const setYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDate(yesterday);
        setDateRange({ start: yesterdayStr, end: yesterdayStr });
        setPage(1);
    };

    const handleRecibir = (orden) => {
        setOrdenARecibir(orden);
        setShowPaymentModal(true);
    };

    const handlePaymentConfirm = async (paymentData) => {
        if (!ordenARecibir) return;

        const medioPagoBackend = paymentData.metodo_pago === 'EFECTIVO' ? 'CONTADO' : paymentData.metodo_pago;
        const datosChequeBackend = paymentData.metodo_pago === 'CHEQUE' ? {
            banco: paymentData.cheque.bank,
            numero: paymentData.cheque.number,
            fechaVto: paymentData.cheque.paymentDate
        } : null;

        try {
            const response = await fetch(`/api/compras/orden/${ordenARecibir.id}/recibir/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
                },
                body: JSON.stringify({
                    medio_pago: medioPagoBackend,
                    datos_cheque: datosChequeBackend
                })
            });
            const data = await response.json();
            if (data.ok) {
                setShowPaymentModal(false);
                setOrdenARecibir(null);
                fetchCompras();
                setSuccessOrderData({ orden_id: ordenARecibir.id });
                setShowSuccessModal(true);
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Error desconocido' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al recibir la orden' });
        }
    };

    const handleEliminar = (orden) => {
        setOrderToCancel(orden);
        setShowCancelConfirmModal(true);
    };

    const confirmCancelar = async () => {
        if (!orderToCancel) return;
        setCancelando(true);
        try {
            const response = await fetch(`/api/compras/orden/${orderToCancel.id}/cancelar/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
                }
            });
            const data = await response.json();
            if (data.ok) {
                setShowCancelConfirmModal(false);
                fetchCompras();
                setSuccessOrderData({ orden_id: orderToCancel.id, msg: 'La orden ha sido cancelada correctamente.' });
                setShowSuccessModal(true);
                setOrderToCancel(null);
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Error desconocido' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cancelar la orden' });
        } finally {
            setCancelando(false);
        }
    };

    // Filtros
    const ordenesFiltradas = useMemo(() => {
        return ordenes.filter(orden => {
            if (!searchTerm && filterEstado === 'TODOS') return true;
            const provName = orden.proveedor || '';
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                provName.toLowerCase().includes(searchLower) ||
                orden.id.toString().includes(searchTerm) ||
                (orden.fecha && orden.fecha.toLowerCase().includes(searchLower));
            const matchesEstado = filterEstado === 'TODOS' || orden.estado === filterEstado;
            return matchesSearch && matchesEstado;
        });
    }, [ordenes, searchTerm, filterEstado]);

    // KPI Calculations
    const stats = useMemo(() => {
        const totalAmount = ordenesFiltradas.reduce((acc, o) => acc + parseFloat(o.total_estimado || 0), 0);
        const pendientes = ordenesFiltradas.filter(o => o.estado === 'PENDIENTE').length;
        const recibidas = ordenesFiltradas.filter(o => o.estado === 'RECIBIDA').length;

        return {
            total: totalAmount,
            pendientes: pendientes,
            recibidas: recibidas,
            count: ordenesFiltradas.length
        };
    }, [ordenesFiltradas]);

    // Paginación
    const totalItems = ordenesFiltradas.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    const itemsToShow = useMemo(() => {
        return ordenesFiltradas.slice(
            (page - 1) * itemsPerPage,
            page * itemsPerPage
        );
    }, [ordenesFiltradas, page, itemsPerPage]);

    const columns = [
        {
            key: 'id',
            label: '# ORDEN',
            width: '120px',
            render: (v) => <TableCell.ID value={v} />
        },
        {
            key: 'fecha',
            label: 'FECHA',
            width: '180px',
            render: (v) => <TableCell.Date value={v} />
        },
        {
            key: 'proveedor',
            label: 'PROVEEDOR',
            render: (v) => <TableCell.Primary value={v} />
        },
        {
            key: 'total_estimado',
            label: 'TOTAL EST.',
            align: 'right',
            width: '180px',
            render: (v) => <TableCell.Currency value={v} />
        },
        {
            key: 'estado',
            label: 'ESTADO',
            width: '150px',
            render: (v) => (
                <TableCell.Status
                    value={v}
                    variant={v === 'RECIBIDA' ? 'success' : v === 'PENDIENTE' ? 'warning' : v === 'CANCELADA' ? 'error' : 'default'}
                />
            )
        },
        {
            key: 'acciones',
            label: 'ACCIONES',
            align: 'right',
            width: '180px',
            sortable: false,
            render: (_, row) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => navigate(`/compras/${row.id}`)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Ver Detalle"
                    >
                        <Eye size={18} />
                    </button>
                    {row.estado === 'PENDIENTE' && (
                        <>
                            <button
                                onClick={() => handleRecibir(row)}
                                className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Recibir Mercadería"
                            >
                                <Truck size={18} />
                            </button>
                            <button
                                onClick={() => handleEliminar(row)}
                                className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                                title="Cancelar Orden"
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3 uppercase font-outfit">
                        <ShoppingBag className="text-primary-600" size={32} strokeWidth={2.5} />
                        Gestión de Compras
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1">
                        Control de abastecimiento y órdenes de compra externas.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <BtnAdd
                        label="NUEVA COMPRA"
                        onClick={() => navigate('/compras/nueva')}
                        className="!bg-primary-600 !hover:bg-primary-700 !rounded-xl !px-6 !py-3 !font-black !tracking-widest !text-xs !shadow-lg !shadow-primary-600/20"
                    />
                </div>
            </header>

            <BentoGrid cols={4}>
                <StatCard label="Abastecimiento Total" value={`$${formatNumber(stats.total)}`} icon={DollarSign} color="primary" />
                <StatCard label="Ordenes Pendientes" value={stats.pendientes} icon={Clock} color="warning" />
                <StatCard label="Material Recibido" value={stats.recibidas} icon={CheckCircle2} color="success" />
                <StatCard label="Registros Totales" value={stats.count} icon={Hash} color="primary" />
            </BentoGrid>

            {/* Filtration Section (Compact/No Panel) */}
            <div className="flex flex-col flex-grow gap-4 min-h-0">
                <PremiumFilterBar
                    busqueda={searchTerm}
                    setBusqueda={setSearchTerm}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    onClear={() => {
                        setSearchTerm('');
                        setFilterEstado('TODOS');
                        setDateRange({
                            start: getLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
                            end: getLocalDate()
                        });
                        setPage(1);
                    }}
                    placeholder="Buscar por proveedor o N° de orden..."
                >
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="bg-white border border-neutral-200 rounded-full px-6 h-[52px] text-[10px] font-black uppercase tracking-widest text-neutral-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm cursor-pointer appearance-none pr-12 min-w-[200px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                    >
                        <option value="TODOS">TODOS LOS ESTADOS</option>
                        <option value="PENDIENTE">PENDIENTES</option>
                        <option value="RECIBIDA">RECIBIDAS</option>
                        <option value="CANCELADA">CANCELADAS</option>
                    </select>
                </PremiumFilterBar>

                <div className="flex-grow flex flex-col min-h-0">
                    <div className="flex-grow overflow-hidden flex flex-col bg-white rounded-t-[2rem] border-x border-t border-neutral-200 shadow-lg mt-2">
                        <PremiumTable
                            columns={columns}
                            data={itemsToShow}
                            loading={loading}
                            emptyState={
                                <EmptyState
                                    title="Sin órdenes de compra"
                                    description="No se encontraron compras que coincidan con la búsqueda."
                                />
                            }
                        />
                    </div>

                    <div className="bg-white border-x border-b border-neutral-200 rounded-b-[2rem] px-6 py-1 shadow-premium relative z-10">
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

                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onConfirm={handlePaymentConfirm}
                    total={ordenARecibir ? parseFloat(ordenARecibir.total_estimado) : 0}
                    mode="purchase"
                    clientName={ordenARecibir ? `Proveedor: ${ordenARecibir.proveedor}` : ''}
                    allowedMethods={['EFECTIVO', 'CTACTE', 'CHEQUE']}
                    initialMethod="EFECTIVO"
                />

                {showSuccessModal && (
                    <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden text-center p-10 border border-neutral-200 animate-in zoom-in-95">
                            <div className="mx-auto bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 text-emerald-600 shadow-sm">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h4 className="text-2xl font-black text-neutral-900 mb-2 tracking-tight uppercase font-outfit">
                                {successOrderData?.msg ? '¡Completado!' : '¡Orden Recibida!'}
                            </h4>
                            <p className="text-neutral-500 font-medium mb-10 leading-relaxed text-sm">
                                {successOrderData?.msg || `La orden #${successOrderData?.orden_id} fue recibida y procesada con éxito.`}
                            </p>
                            <button
                                className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs"
                                onClick={() => setShowSuccessModal(false)}
                            >
                                CONTINUAR
                            </button>
                        </div>
                    </div>
                )}

                {showCancelConfirmModal && (
                    <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden text-center p-10 border border-neutral-200 animate-in zoom-in-95">
                            <div className="mx-auto bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-sm">
                                <XCircle size={40} strokeWidth={2} />
                            </div>
                            <h4 className="text-2xl font-black text-neutral-900 mb-2 tracking-tight uppercase font-outfit">¿Anular Orden?</h4>
                            <p className="text-neutral-500 font-medium mb-10 leading-relaxed text-sm">
                                Esta acción es irreversible. La orden de compra quedará anulada permanentemente.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    className="flex-1 py-4 bg-neutral-100 text-neutral-400 font-black rounded-2xl hover:bg-neutral-200 transition-all uppercase tracking-widest text-xs"
                                    onClick={() => setShowCancelConfirmModal(false)}
                                    disabled={cancelando}
                                >
                                    VOLVER
                                </button>
                                <button
                                    className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center"
                                    onClick={confirmCancelar}
                                    disabled={cancelando}
                                >
                                    {cancelando ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'CONFIRMAR'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Compras;
