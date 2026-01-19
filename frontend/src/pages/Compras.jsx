import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Download,
    Trash2,
    Eye,
    Truck,
    XCircle,
    ShoppingBag,
    ShoppingCart,
    RotateCcw,
    CheckCircle2,
    Clock,
    X,
    Check,
    DollarSign,
    FileText,
    Banknote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { BtnAdd, BtnDelete, BtnAction, BtnClear, BtnView } from '../components/CommonButtons';
import { showDeleteAlert } from '../utils/alerts';
import EmptyState from '../components/EmptyState';
import TablePagination from '../components/common/TablePagination';
import PaymentModal from '../components/common/PaymentModal';

const Compras = () => {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('TODOS');

    // Estado para modal de Recepción (Usando PaymentModal)
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [ordenARecibir, setOrdenARecibir] = useState(null);

    // Estado para paginación
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(0);

    // Modal de Éxito Manual (Estándar Premium)
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successOrderData, setSuccessOrderData] = useState(null);

    // Modal de Cancelación Manual (Estándar Premium)
    const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancelando, setCancelando] = useState(false);

    const STORAGE_KEY = 'table_prefs_compras_items';

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setItemsPerPage(Number(saved));
        } else {
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => {
                    if (data.items_por_pagina) setItemsPerPage(data.items_por_pagina);
                    else setItemsPerPage(10);
                })
                .catch(err => {
                    console.error(err);
                    setItemsPerPage(10); // Fallback
                });
        }
    }, []);

    useEffect(() => {
        fetchCompras();
    }, []);

    const fetchCompras = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/compras/listar/?_=${new Date().getTime()}`);
            const data = await response.json();
            if (data.ordenes) {
                setOrdenes(data.ordenes);
            }
        } catch (error) {
            console.error('Error cargando compras:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecibir = (orden) => {
        setOrdenARecibir(orden);
        setShowPaymentModal(true);
    };

    const handlePaymentConfirm = async (paymentData) => {
        if (!ordenARecibir) return;

        // Map PaymentModal data to Backend expected format
        // PaymentModal uses 'EFECTIVO' -> Backend expects 'CONTADO'
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
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'Error desconocido'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al recibir la orden'
            });
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
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'Error desconocido'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cancelar la orden'
            });
        } finally {
            setCancelando(false);
        }
    };

    // Filtros
    const ordenesFiltradas = ordenes.filter(orden => {
        if (!searchTerm && filterEstado === 'TODOS') return true;

        const provName = orden.proveedor || '';
        const matchesSearch =
            provName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orden.id.toString().includes(searchTerm);
        const matchesEstado = filterEstado === 'TODOS' || orden.estado === filterEstado;
        return matchesSearch && matchesEstado;
    });

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle"><Clock size={12} className="me-1 inline-block" /> Pendiente</span>;
            case 'RECIBIDA': return <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle"><CheckCircle2 size={12} className="me-1 inline-block" /> Recibida</span>;
            case 'CANCELADA': return <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger"><XCircle size={12} className="me-1 inline-block" /> Cancelada</span>;
            default: return <span className="badge rounded-pill bg-secondary">{estado}</span>;
        }
    };

    // Paginación
    const totalItems = ordenesFiltradas.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [ordenesFiltradas, totalPages, page]);

    const itemsToShow = ordenesFiltradas.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="container-fluid px-4 pt-4 pb-3 main-content-container bg-light fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <ShoppingBag className="me-2 inline-block" size={32} />
                        Compras y Proveedores
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestiona y consulta tus órdenes de compra.
                    </p>
                </div>
                <BtnAdd
                    label="Nueva Compra"
                    icon={ShoppingCart}
                    className="btn-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 active:scale-95 transition-all"
                    onClick={() => navigate('/compras/nueva')}
                />
            </div>

            {/* Filtros */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por proveedor o N° Orden..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                            >
                                <option value="TODOS">Todos los Estados</option>
                                <option value="PENDIENTE">Pendientes</option>
                                <option value="RECIBIDA">Recibidas</option>
                                <option value="CANCELADA">Canceladas</option>
                            </select>
                        </div>
                        <div className="col-md-2 ms-auto">
                            <div className="d-flex gap-2">
                                <BtnClear label="Limpiar" onClick={() => { setSearchTerm(''); setFilterEstado('TODOS'); }} className="flex-grow-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold text-nowrap" style={{ width: '140px' }}>N° Orden</th>
                                    <th className="py-3 fw-bold">Proveedor</th>
                                    <th className="py-3 fw-bold">Fecha</th>
                                    <th className="py-3 fw-bold text-center">Estado</th>
                                    <th className="py-3 fw-bold text-end pe-4">Total Est.</th>
                                    <th className="py-3 fw-bold text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && ordenes.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></td></tr>
                                ) : itemsToShow.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-5">
                                            <EmptyState
                                                icon={ShoppingBag}
                                                title="No hay órdenes de compra"
                                                description="Las compras a proveedores aparecerán aquí."
                                                iconColor="text-blue-500"
                                                bgIconColor="bg-blue-50"
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    itemsToShow.map((orden) => (
                                        <tr key={orden.id} className="border-bottom-0">
                                            <td className="ps-4 fw-bold text-primary py-3">#{orden.id}</td>
                                            <td className="fw-medium py-3">{orden.proveedor}</td>
                                            <td className="py-3 fw-medium text-dark">{orden.fecha}</td>
                                            <td className="text-center py-3">{getEstadoBadge(orden.estado)}</td>
                                            <td className="text-end pe-4 fw-bold text-success py-3">
                                                $ {parseFloat(orden.total_estimado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    {orden.estado === 'PENDIENTE' && (
                                                        <BtnAction
                                                            icon={Truck}
                                                            label="Recibir"
                                                            color="success"
                                                            onClick={() => handleRecibir(orden)}
                                                            title="Recibir Mercadería"
                                                        />
                                                    )}
                                                    <BtnView onClick={() => navigate(`/compras/${orden.id}`)} />
                                                    {orden.estado === 'PENDIENTE' && (
                                                        <BtnDelete
                                                            onClick={() => handleEliminar(orden)}
                                                            disabled={orden.estado === 'RECIBIDA' || orden.estado === 'CANCELADA'}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

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

            {/* Modal Payment (Standardized Recibir) */}
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


            {/* ==================== MODAL EXITO (MANUAL) ==================== */}
            {
                showSuccessModal && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 border border-slate-200">
                            <div className="mx-auto bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <Check size={32} strokeWidth={2} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">
                                {successOrderData?.msg ? '¡Completado!' : '¡Orden Recibida!'}
                            </h4>
                            <p className="text-slate-500 text-sm mb-6">
                                {successOrderData?.msg || `La orden #${successOrderData?.orden_id} fue recibida y procesada contablemente con éxito.`}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors outline-none"
                                    onClick={() => setShowSuccessModal(false)}
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ==================== MODAL CONFIRMAR CANCELACION (MANUAL) ==================== */}
            {
                showCancelConfirmModal && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 border border-slate-200">
                            <div className="mx-auto bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-red-500">
                                <ShoppingBag size={48} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">¿Cancelar Orden?</h4>
                            <p className="text-slate-500 text-sm mb-8 px-2">
                                Esta acción cancelará la orden de compra. Si ya fue recibida, no podrá cancelarse.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors outline-none"
                                    onClick={() => setShowCancelConfirmModal(false)}
                                    disabled={cancelando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-colors outline-none flex items-center justify-center"
                                    onClick={confirmCancelar}
                                    disabled={cancelando}
                                >
                                    {cancelando ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Sí, cancelar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Compras;
