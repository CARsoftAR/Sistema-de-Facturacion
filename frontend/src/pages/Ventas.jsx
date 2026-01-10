import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Search, Printer, XCircle, AlertCircle, CheckCircle, Trash2, Filter, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BtnAdd, BtnDelete, BtnPrint, BtnAction, BtnClear } from '../components/CommonButtons';

const Ventas = () => {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        // Cargar configuración global de paginación
        fetch('/api/config/obtener/')
            .then(res => res.json())
            .then(data => {
                if (data.items_por_pagina) {
                    setItemsPerPage(data.items_por_pagina);
                }
            })
            .catch(err => console.error("Error loading config:", err));
    }, []);

    const fetchVentas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ventas/listar/');
            const data = await response.json();

            if (data.ok) {
                let allVentas = data.data || [];

                if (busqueda) {
                    const q = busqueda.toLowerCase();
                    allVentas = allVentas.filter(v =>
                        v.cliente.toLowerCase().includes(q) ||
                        v.id.toString().includes(q) ||
                        (v.tipo_comprobante && v.tipo_comprobante.toLowerCase().includes(q))
                    );
                }

                setTotalItems(allVentas.length);
                setTotalPages(Math.ceil(allVentas.length / itemsPerPage));

                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                setVentas(allVentas.slice(start, end));
            } else {
                console.error("Error backend:", data.error);
                setVentas([]);
            }
        } catch (error) {
            console.error("Error al cargar ventas:", error);
            setVentas([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, busqueda]);

    useEffect(() => {
        if (itemsPerPage) {
            fetchVentas();
        }
    }, [fetchVentas, itemsPerPage]);

    const handleAnular = async (id) => {
        if (!window.confirm("¿Estás seguro de anular esta venta?")) return;
        alert("La funcionalidad de anular aún no está implementada en el backend.");
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <ShoppingCart className="me-2 inline-block" size={32} />
                        Historial de Ventas
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestiona y consulta todas las operaciones comerciales.
                    </p>
                </div>
                <BtnAdd
                    label="Nueva Venta"
                    className="btn-lg shadow-sm"
                    onClick={() => navigate('/ventas/nuevo')}
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
                                    placeholder="Buscar por cliente, comprobante o ID..."
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                        <div className="col-md-2 ms-auto">
                            <BtnClear onClick={() => { setBusqueda(''); setPage(1); }} className="w-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card border-0 shadow mb-4 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 overflow-auto">
                        <table className="table align-middle mb-0">
                            <thead className="bg-white border-bottom">
                                <tr>
                                    <th className="ps-4 py-3 text-dark fw-bold"># Venta</th>
                                    <th className="py-3 text-dark fw-bold">Fecha</th>
                                    <th className="py-3 text-dark fw-bold">Cliente</th>
                                    <th className="py-3 text-dark fw-bold">Comprobante</th>
                                    <th className="py-3 text-dark fw-bold">Total</th>
                                    <th className="py-3 text-dark fw-bold">Estado</th>
                                    <th className="text-end pe-4 py-3 text-dark fw-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : ventas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            <div className="mb-3 opacity-50"><ShoppingCart size={40} /></div>
                                            No se encontraron ventas registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    ventas.map(v => (
                                        <tr key={v.id} className="border-bottom-0">
                                            <td className="ps-4 fw-bold text-primary py-3">#{v.id}</td>
                                            <td className="py-3">
                                                <span className="text-dark fw-medium">{v.fecha}</span>
                                            </td>
                                            <td className="fw-medium py-3">{v.cliente}</td>
                                            <td className="py-3">
                                                <span className="badge bg-white text-dark border shadow-sm">
                                                    {v.tipo_comprobante || '-'}
                                                </span>
                                            </td>
                                            <td className="fw-bold text-success py-3">
                                                $ {parseFloat(v.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3">
                                                {v.estado === 'Emitida' ? (
                                                    <span className="badge rounded-pill bg-success-subtle text-success border border-success px-3 py-2"><CheckCircle size={14} className="me-1 inline-block" /> Emitida</span>
                                                ) : (
                                                    <span className="badge rounded-pill bg-secondary px-3 py-2">{v.estado}</span>
                                                )}
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        onClick={() => window.open(`/invoice/print/${v.id}/`, '_blank')}
                                                        className="btn btn-info text-white btn-sm d-flex align-items-center gap-2 px-3 fw-bold shadow-sm"
                                                        title="Imprimir Comprobante"
                                                    >
                                                        <Printer size={16} /> Imprimir
                                                    </button>
                                                    <button
                                                        onClick={() => handleAnular(v.id)}
                                                        className="btn btn-danger btn-sm d-flex align-items-center justify-content-center px-2"
                                                        title="Anular Venta"
                                                        style={{ width: '34px' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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
                                <span className="text-muted small">Mostrando {ventas.length} de {totalItems} registros</span>
                                <span className="text-muted small">Mostrando {ventas.length} de {totalItems} registros</span>
                            </div>

                            <nav>
                                <ul className="pagination mb-0 align-items-center gap-2">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link border-0 text-secondary bg-transparent p-0"
                                            onClick={() => setPage(page - 1)}
                                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            &lt;
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => {
                                        if (totalPages > 10 && Math.abs(page - (i + 1)) > 2 && i !== 0 && i !== totalPages - 1) return null;
                                        return (
                                            <li key={i} className="page-item">
                                                <button
                                                    className={`page-link border-0 rounded-circle fw-bold ${page === i + 1 ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary'}`}
                                                    onClick={() => setPage(i + 1)}
                                                    style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {i + 1}
                                                </button>
                                            </li>
                                        );
                                    })}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link border-0 text-secondary bg-transparent p-0"
                                            onClick={() => setPage(page + 1)}
                                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            &gt;
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Ventas;
