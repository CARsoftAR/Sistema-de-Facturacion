
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, User, MapPin, Printer, ArrowLeft } from 'lucide-react';
import { BtnBack, BtnPrint } from '../components/CommonButtons';
import Swal from 'sweetalert2';

const DetalleRemito = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [remito, setRemito] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRemito();
    }, [id]);

    const fetchRemito = async () => {
        try {
            const response = await fetch(`/api/remitos/${id}/`);
            if (response.ok) {
                const data = await response.json();
                setRemito(data);
            } else {
                console.error("Error fetching remito");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.open(`/comprobantes/remito/${id}/imprimir/?model=modern`, '_blank');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!remito) {
        return <div className="text-center mt-5">Remito no encontrado.</div>;
    }

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light" style={{ minHeight: '100vh', overflowY: 'auto' }}>
            {/* Header Standardized */}
            <div className="mb-4">
                <div className="mb-4">
                    <BtnBack onClick={() => navigate('/remitos')} />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                            <FileText className="me-2 inline-block" size={32} />
                            Detalle de Remito
                        </h2>
                        <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                            {remito.numero}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <BtnPrint onClick={handlePrint} />
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Info Card */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                                <FileText size={20} className="text-primary" />
                                Información General
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-4">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Fecha</label>
                                <p className="mb-0 fw-bold fs-5 text-dark">{remito.fecha}</p>
                            </div>

                            <hr className="my-3 opacity-10" />

                            <div className="mb-3">
                                <label className="text-muted small text-uppercase fw-bold d-flex align-items-center gap-2 mb-1">
                                    <User size={14} /> Cliente
                                </label>
                                <p className="mb-0 fw-bold text-primary fs-5">{remito.cliente}</p>
                            </div>

                            <div className="mb-3">
                                <label className="text-muted small text-uppercase fw-bold d-flex align-items-center gap-2 mb-1">
                                    <MapPin size={14} /> Dirección de Entrega
                                </label>
                                <p className="mb-0 text-secondary">{remito.direccion || 'Sin dirección especificada'}</p>
                            </div>

                            <hr className="my-3 opacity-10" />

                            <div className="mb-3">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Venta Asociada</label>
                                <p className="mb-0 font-monospace">{remito.venta_asociada}</p>
                            </div>

                            <div className="mb-0">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Estado</label>
                                <div>
                                    <span className={`badge ${remito.estado === 'ENTREGADO' ? 'bg-success-subtle text-success border border-success' : 'bg-secondary'} px-3 py-2 rounded-pill`}>
                                        {remito.estado}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold text-dark">Items del Remito</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="py-3 ps-4 border-0 text-secondary fw-bold small text-uppercase">Producto</th>
                                            <th className="py-3 pe-4 border-0 text-secondary fw-bold small text-uppercase text-end" style={{ width: '150px' }}>Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {remito.items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="py-3 ps-4 fw-medium text-dark border-bottom-0">
                                                    {item.producto}
                                                </td>
                                                <td className="py-3 pe-4 text-end fw-bold text-dark border-bottom-0 fs-5">
                                                    {item.cantidad}
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
        </div>
    );
};

export default DetalleRemito;
