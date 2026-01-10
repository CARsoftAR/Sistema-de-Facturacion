import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Search, Printer, XCircle, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate if needed for consistency, though Link is used for New Sale
import { BtnAdd, BtnDelete, BtnPrint, BtnAction } from '../components/CommonButtons';

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [busqueda, setBusqueda] = useState('');

    const fetchVentas = useCallback(async () => {
        setLoading(true);
        try {
            // Nota: El endpoint original no parece soportar paginación server-side basada en query params de la misma forma que Productos
            // pero vamos a intentar usar la misma lógica o filtrar en cliente si es necesario.
            // Según ventas.js legacy, llama a /api/ventas/listar/ y devuelve data.data con TODAS las ventas.
            // Haremos lo mismo y paginaremos en cliente por ahora para mantener compatibilidad, 
            // o idealmente actualizaremos el backend después si es muy lento.

            const response = await fetch('/api/ventas/listar/');
            const data = await response.json();

            if (data.ok) {
                let allVentas = data.data || [];

                // Filtrado en cliente (ya que el endpoint parece traer todo)
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

                // Slice para paginación actual
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
        fetchVentas();
    }, [fetchVentas]);

    const handleAnular = async (id) => {
        if (!window.confirm("¿Estás seguro de anular esta venta?")) return;
        alert("La funcionalidad de anular aún no está implementada en el backend.");
    };

    return (
        <div className="container-fluid px-4 mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2.2rem' }}>
                        <ShoppingCart className="me-2 inline-block" size={32} />
                        Ventas
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
                        Gestiona el histórico de transacciones.
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
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por cliente, comprobante o ID..."
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                        {/* 
                        <div className="col-md-3">
                             Placeholder para filtro de estado o fecha si se requiere a futuro
                        </div> 
                        */}
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card border-0 shadow mb-5">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4 py-3"># Venta</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Comprobante</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th className="text-end pe-4">Acciones</th>
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
                                        <td colSpan="7" className="text-center py-5 text-muted small">
                                            No se encontraron ventas registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    ventas.map(v => (
                                        <tr key={v.id}>
                                            <td className="ps-4 fw-bold text-primary">#{v.id}</td>
                                            <td>{v.fecha}</td>
                                            <td className="fw-medium">{v.cliente}</td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {v.tipo_comprobante || '-'}
                                                </span>
                                            </td>
                                            <td className="fw-bold text-success">
                                                $ {parseFloat(v.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                {v.estado === 'Emitida' ? (
                                                    <span className="badge rounded-pill bg-success"><CheckCircle size={14} className="me-1 inline-block" /> Emitida</span>
                                                ) : (
                                                    <span className="badge rounded-pill bg-secondary">{v.estado}</span>
                                                )}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <BtnPrint onClick={() => window.open(`/invoice/print/${v.id}/`, '_blank')} />
                                                        <BtnDelete onClick={() => handleAnular(v.id)} title="Anular" />
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
                                <select
                                    className="form-select form-select-sm border-secondary-subtle"
                                    style={{ width: '70px' }}
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <span className="text-muted small">por pág.</span>
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
