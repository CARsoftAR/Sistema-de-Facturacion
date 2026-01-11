
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
    RotateCcw,
    CheckCircle2,
    Clock,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BtnAdd, BtnEdit, BtnDelete, BtnAction, BtnIcon, BtnView, BtnCancel, BtnSave, BtnClear, BtnVertical } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';

const Compras = () => {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('TODOS');

    // Estado para modal de Recepción
    const [showModalRecibir, setShowModalRecibir] = useState(false);
    const [ordenARecibir, setOrdenARecibir] = useState(null);
    const [medioPago, setMedioPago] = useState('CONTADO');
    const [datosCheque, setDatosCheque] = useState({ banco: '', numero: '', fechaVto: '' });

    // Estado para paginación
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetch('/api/config/obtener/')
            .then(res => res.json())
            .then(data => {
                if (data.items_por_pagina) setItemsPerPage(data.items_por_pagina);
            })
            .catch(console.error);
    }, []);



    useEffect(() => {
        fetchCompras();
    }, []);

    const fetchCompras = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/compras/listar/');
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
        setMedioPago('CONTADO'); // Reset default
        setDatosCheque({ banco: '', numero: '', fechaVto: '' });
        setShowModalRecibir(true);
    };

    const confirmRecibir = async () => {
        if (!ordenARecibir) return;
        try {
            const response = await fetch(`/api/compras/orden/${ordenARecibir.id}/recibir/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    medio_pago: medioPago,
                    datos_cheque: medioPago === 'CHEQUE' ? datosCheque : null
                })
            });
            const data = await response.json();
            if (data.ok) {
                alert('Orden recibida y procesada contablemente.');
                setShowModalRecibir(false);
                setOrdenARecibir(null);
                fetchCompras();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Error al recibir la orden');
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de cancelar esta orden?')) return;
        try {
            const response = await fetch(`/api/compras/orden/${id}/cancelar/`, { method: 'POST' });
            const data = await response.json();
            if (data.ok) {
                fetchCompras();
            } else {
                alert(data.error || 'Error al cancelar');
            }
        } catch (error) {
            console.error(error);
        }
    };



    // Filtros
    const ordenesFiltradas = ordenes.filter(orden => {
        const matchesSearch =
            orden.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                    label="Nueva Orden"
                    className="btn-lg shadow-sm"
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
                                            <td className="py-3">{orden.fecha}</td>
                                            <td className="text-center py-3">{getEstadoBadge(orden.estado)}</td>
                                            <td className="text-end pe-4 fw-bold text-success py-3">
                                                $ {parseFloat(orden.total_estimado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    {orden.estado === 'PENDIENTE' && (
                                                        <BtnVertical
                                                            icon={Truck}
                                                            label="Recibir"
                                                            color="success"
                                                            onClick={() => handleRecibir(orden)}
                                                            title="Recibir Mercadería"
                                                        />
                                                    )}
                                                    <BtnVertical
                                                        icon={Eye}
                                                        label="Ver"
                                                        color="info"
                                                        onClick={() => navigate(`/compras/${orden.id}`)}
                                                        title="Ver Detalle"
                                                        className="text-white"
                                                    />
                                                    {orden.estado === 'PENDIENTE' && (
                                                        <BtnVertical
                                                            icon={Trash2}
                                                            label="Cancelar"
                                                            color="danger"
                                                            onClick={() => handleEliminar(orden.id)}
                                                            title="Cancelar Orden"
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

                    {/* Paginación */}
                    {!loading && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Mostrando {itemsToShow.length} de {totalItems} registros</span>
                            </div>
                            <nav>
                                <ul className="pagination mb-0 align-items-center gap-2">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link border-0 text-secondary bg-transparent p-0" onClick={() => setPage(page - 1)}>&lt;</button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i} className="page-item">
                                            <button
                                                className={`page-link border-0 rounded-circle fw-bold ${page === i + 1 ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary'}`}
                                                onClick={() => setPage(i + 1)}
                                                style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link border-0 text-secondary bg-transparent p-0" onClick={() => setPage(page + 1)}>&gt;</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Recibir */}
            {showModalRecibir && ordenARecibir && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Truck className="text-blue-600" size={22} /> Recibir Orden #{ordenARecibir.id}
                            </h2>
                            <button onClick={() => setShowModalRecibir(false)} className="text-slate-400 hover:text-red-500 hover:bg-slate-50 p-2 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <p className="text-muted small">Se actualizará el stock y se registrará la deuda/pago.</p>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Medio de Pago</label>
                                <select className="form-select" value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
                                    <option value="CONTADO">Contado (Caja)</option>
                                    <option value="CTACTE">Cuenta Corriente (Deuda)</option>
                                    <option value="CHEQUE">Cheque Propio</option>
                                </select>
                            </div>
                            {medioPago === 'CHEQUE' && (
                                <div className="p-3 bg-slate-50 rounded-xl space-y-3 border">
                                    <input type="text" className="form-control" placeholder="Banco" value={datosCheque.banco} onChange={(e) => setDatosCheque({ ...datosCheque, banco: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" className="form-control" placeholder="N° Cheque" value={datosCheque.numero} onChange={(e) => setDatosCheque({ ...datosCheque, numero: e.target.value })} />
                                        <input type="date" className="form-control" value={datosCheque.fechaVto} onChange={(e) => setDatosCheque({ ...datosCheque, fechaVto: e.target.value })} />
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowModalRecibir(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                                <button onClick={confirmRecibir} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors">Confirmar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Compras;
