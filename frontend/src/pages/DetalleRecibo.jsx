import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Printer,
    Trash2,
    FileText,
    Calendar,
    User,
    Target,
    DollarSign,
    CreditCard,
    CreditCard as BankIcon,
    CheckSquare
} from 'lucide-react';

const DetalleRecibo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recibo, setRecibo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecibo = async () => {
            try {
                const response = await fetch(`/api/recibos/${id}/`);
                if (!response.ok) throw new Error('No se pudo cargar el recibo');
                const data = await response.json();
                if (data.ok) {
                    setRecibo(data.recibo);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecibo();
    }, [id]);

    const handlePrint = () => {
        window.open(`/api/recibos/${id}/imprimir/`, '_blank');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error || !recibo) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger">
                    Error al cargar el recibo: {error || 'No encontrado'}
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="me-2" /> Volver
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 fade-in">
            {/* Header / Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-light shadow-sm" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="mb-0 fw-bold text-dark">Recibo #{recibo.numero}</h2>
                        <span className={`badge ${recibo.anulado ? 'bg-danger' : 'bg-primary'} shadow-sm`}>
                            {recibo.anulado ? 'ANULADO' : (recibo.tipo === 'CLIENTE' ? 'COBRO' : 'PAGO')}
                        </span>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-primary shadow-sm d-flex align-items-center gap-2" onClick={handlePrint}>
                        <Printer size={18} /> Imprimir
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* Information Card */}
                <div className="col-12 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                                <FileText size={20} /> Información General
                            </h5>

                            <div className="mb-4">
                                <small className="text-muted d-block mb-1">Entidad</small>
                                <div className="d-flex align-items-center gap-3 bg-light p-3 rounded-3">
                                    <div className="p-2 bg-white rounded-circle shadow-sm">
                                        <User size={20} className="text-secondary" />
                                    </div>
                                    <div>
                                        <p className="mb-0 fw-bold text-dark">{recibo.entidad.nombre}</p>
                                        <small className="text-muted">{recibo.entidad.cuit || 'Sin CUIT'}</small>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-6">
                                    <small className="text-muted d-block mb-1">Fecha</small>
                                    <div className="d-flex align-items-center gap-2">
                                        <Calendar size={16} className="text-primary" />
                                        <span className="fw-semibold text-dark">{new Date(recibo.fecha).toLocaleDateString('es-AR')}</span>
                                    </div>
                                </div>
                                <div className="col-6 text-end">
                                    <small className="text-muted d-block mb-1">Monto Total</small>
                                    <h4 className="fw-bold text-primary mb-0">${recibo.total.toLocaleString()}</h4>
                                </div>
                            </div>

                            {recibo.observaciones && (
                                <div className="mt-4">
                                    <small className="text-muted d-block mb-1">Observaciones</small>
                                    <div className="bg-light p-3 rounded-3 text-dark italic small border-start border-4 border-primary">
                                        "{recibo.observaciones}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items / Forms of Payment */}
                <div className="col-12 col-xl-8">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white p-4 border-0">
                            <h5 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
                                <Target size={20} /> Detalle de Pago
                            </h5>
                        </div>
                        <div className="table-responsive px-4 pb-4">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light bg-opacity-50">
                                    <tr>
                                        <th className="border-0 rounded-start">Forma de Pago</th>
                                        <th className="border-0">Detalles</th>
                                        <th className="border-0 text-end rounded-end">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recibo.items.map((item, index) => {
                                        const isEfectivo = item.forma_pago === 'EFECTIVO';
                                        const isCheque = item.forma_pago === 'CHEQUE';
                                        const isTransfer = item.forma_pago === 'TRANSFERENCIA';

                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className={`p-2 rounded-3 bg-opacity-10 ${isEfectivo ? 'bg-success text-success' : isCheque ? 'bg-warning text-warning' : 'bg-info text-info'}`}>
                                                            {isEfectivo ? <DollarSign size={16} /> : isCheque ? <CheckSquare size={16} /> : <BankIcon size={16} />}
                                                        </div>
                                                        <span className="fw-semibold text-dark">{item.forma_pago}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {isCheque && item.cheque ? (
                                                        <div className="text-dark">
                                                            <small className="text-muted d-block">Cheque</small>
                                                            <strong>Nº {item.cheque.numero}</strong> - {item.cheque.banco}
                                                        </div>
                                                    ) : isTransfer ? (
                                                        <div className="text-dark">
                                                            <small className="text-muted d-block">Referencia</small>
                                                            {item.referencia || 'N/A'} - {item.banco}
                                                        </div>
                                                    ) : item.referencia ? (
                                                        <span className="text-muted">{item.referencia}</span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td className="text-end fw-bold text-dark pe-3">
                                                    ${item.monto.toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2" className="text-end fw-bold py-3 text-muted">TOTAL PAGADO</td>
                                        <td className="text-end fw-bold py-3 text-primary fs-5 pe-3">${recibo.total.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleRecibo;
