
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Printer, ArrowLeft, FileText, User, Calendar, DollarSign, CheckCircle, AlertTriangle
} from 'lucide-react';
import { BtnPrint, BtnBack } from '../components/CommonButtons';
import Swal from 'sweetalert2';

const DetalleNotaDebito = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nota, setNota] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const response = await fetch(`/api/notas-debito/${id}/`);
                const data = await response.json();

                if (data.ok) {
                    setNota(data.header);
                    setItems(data.items);
                } else {
                    setError(data.error || "No se pudo cargar la nota de débito");
                }
            } catch (err) {
                console.error(err);
                setError("Error de conexión");
            } finally {
                setLoading(false);
            }
        };

        fetchDetalle();
    }, [id]);

    const handlePrint = () => {
        window.open(`/comprobantes/nd/${id}/imprimir/?model=modern`, '_blank');
    };

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="p-5 text-center text-danger">Error: {error}</div>;
    if (!nota) return null;

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light" style={{ minHeight: '100vh', overflowY: 'auto' }}>
            {/* Header Standardized */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <FileText className="me-2 inline-block" size={32} />
                        Detalle de Nota de Débito
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        {nota.numero}
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <BtnBack onClick={() => navigate('/notas-debito')} />
                    <BtnPrint onClick={handlePrint} />
                </div>
            </div>

            <div className="row g-4">
                {/* Header Card */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="row g-4">
                                <div className="col-md-3 border-end">
                                    <h6 className="text-uppercase text-muted small fw-bold mb-2">Cliente</h6>
                                    <div className="d-flex align-items-center">
                                        <User className="text-primary me-2" size={20} />
                                        <span className="fw-bold text-dark">{nota.cliente}</span>
                                    </div>
                                </div>
                                <div className="col-md-3 border-end">
                                    <h6 className="text-uppercase text-muted small fw-bold mb-2">Fecha Emisión</h6>
                                    <div className="d-flex align-items-center">
                                        <Calendar className="text-primary me-2" size={20} />
                                        <span>{nota.fecha}</span>
                                    </div>
                                </div>
                                <div className="col-md-3 border-end">
                                    <h6 className="text-uppercase text-muted small fw-bold mb-2">Comprobante Orig.</h6>
                                    <div className="d-flex align-items-center">
                                        <FileText className="text-secondary me-2" size={20} />
                                        <span className="badge bg-light text-dark border">
                                            {nota.venta_asociada}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <h6 className="text-uppercase text-muted small fw-bold mb-2">Total Débito</h6>
                                    <div className="d-flex align-items-center">
                                        <DollarSign className="text-danger me-1" size={24} />
                                        <span className="fw-bold text-danger fs-4">
                                            $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(nota.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-top">
                                <span className="text-muted small me-2">Motivo:</span>
                                <span className="fst-italic">{nota.motivo || "Sin motivo especificado"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Items de la Nota de Débito</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Producto</th>
                                        <th className="text-center">Cantidad</th>
                                        <th className="text-end">Precio Unit.</th>
                                        <th className="text-end pe-4">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="ps-4 fw-medium">{item.producto}</td>
                                            <td className="text-center">{item.cantidad}</td>
                                            <td className="text-end text-muted">
                                                $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.precio_unitario)}
                                            </td>
                                            <td className="text-end fw-bold text-dark pe-4">
                                                $ {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleNotaDebito;
