import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Search, Printer, XCircle, AlertCircle, CheckCircle, Trash2, Filter, RotateCcw, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { showDeleteAlert } from '../utils/alerts';
import { BtnAdd, BtnDelete, BtnAction, BtnClear, BtnView, BtnPrint, BtnTableAction } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';

const Ventas = () => {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(0); // 0 means not yet loaded
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        // Cargar configuración global de paginación
        fetch('/api/config/obtener/')
            .then(res => res.json())
            .then(data => {
                setItemsPerPage(data.items_por_pagina || 10);
            })
            .catch(err => {
                console.error("Error loading config:", err);
                setItemsPerPage(10); // Fallback
            });
    }, []);

    const fetchVentas = useCallback(async (signal) => {
        if (itemsPerPage === 0) return;
        setLoading(true);
        try {
            const response = await fetch('/api/ventas/listar/', { signal });
            const data = await response.json();

            if (data.ok || Array.isArray(data) || data.ventas) {
                let allVentas = data.data || data.ventas || [];
                // Fallback if data itself is the array (legacy)
                if (Array.isArray(data)) allVentas = data;

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
            if (error.name !== 'AbortError') {
                console.error("Error al cargar ventas:", error);
                setVentas([]);
            }
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, busqueda]);

    useEffect(() => {
        const controller = new AbortController();
        fetchVentas(controller.signal);
        return () => controller.abort();
    }, [fetchVentas]);

    const handleAnular = async (id) => {
        const result = await showDeleteAlert(
            '¿Anular Venta?',
            "Se generará una NOTA DE CRÉDITO automática y se devolverá el stock. Esta acción no se puede deshacer.",
            'Sí, anular venta'
        );

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/notas-credito/crear/${id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();

            if (data.ok) {
                Swal.fire(
                    '¡Anulada!',
                    `Venta anulada correctamente.<br>Nota de Crédito generada: <b>${data.message || '#' + data.id}</b>`,
                    'success'
                );
                fetchVentas(); // Refresh list
            } else {
                Swal.fire(
                    'Error',
                    `No se pudo anular la venta: ${data.error}`,
                    'error'
                );
            }
        } catch (error) {
            console.error("Error anular:", error);
            Swal.fire(
                'Error',
                'Error de conexión al intentar anular la venta.',
                'error'
            );
        }
    };

    const handlePrint = (id) => {
        window.open(`/invoice/print/${id}/?model=modern`, '_blank');
    };

    const handleNotaDebito = async (id) => {
        const { value: formValues } = await Swal.fire({
            title: 'Crear Nota de Débito',
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Monto" type="number" step="0.01">' +
                '<input id="swal-input2" class="swal2-input" placeholder="Motivo (ej: Interés, Error Facturación)">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const monto = document.getElementById('swal-input1').value;
                const motivo = document.getElementById('swal-input2').value;
                if (!monto || monto <= 0) {
                    Swal.showValidationMessage('Por favor ingrese un monto válido');
                    return false;
                }
                if (!motivo) {
                    Swal.showValidationMessage('Por favor ingrese un motivo');
                    return false;
                }
                return { monto, motivo };
            }
        });

        if (formValues) {
            try {
                const response = await fetch(`/api/notas-debito/crear/${id}/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValues)
                });
                const data = await response.json();

                if (data.ok) {
                    Swal.fire('¡Creada!', data.message, 'success');
                    fetchVentas();
                } else {
                    Swal.fire('Error', data.error, 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo crear la Nota de Débito', 'error');
            }
        }
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-3 main-content-container bg-light fade-in">
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
                    icon={ShoppingCart}
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
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold"># Venta</th>
                                    <th className="py-3 fw-bold">Fecha</th>
                                    <th className="py-3 fw-bold">Cliente</th>
                                    <th className="py-3 fw-bold">Comprobante</th>
                                    <th className="py-3 fw-bold">Total</th>
                                    <th className="py-3 fw-bold">Estado</th>
                                    <th className="text-end pe-4 py-3 fw-bold">Acciones</th>
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
                                        <td colSpan="7" className="py-5">
                                            <EmptyState
                                                title="No hay ventas registradas"
                                                description="Las ventas que realices aparecerán en este listado."
                                            />
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
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <BtnPrint onClick={() => handlePrint(v.id)} />
                                                        <BtnView onClick={() => navigate(`/ventas/${v.id}`)} />
                                                        <BtnTableAction
                                                            icon={Plus}
                                                            label="Nota Débito"
                                                            color="warning"
                                                            onClick={() => handleNotaDebito(v.id)}
                                                        />
                                                        <BtnDelete
                                                            label="Anular"
                                                            onClick={() => handleAnular(v.id)}
                                                            title="Anular Venta"
                                                        />
                                                    </div>
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
