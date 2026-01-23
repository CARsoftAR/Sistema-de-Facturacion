import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Download, ArrowUp, ArrowDown, Package, Calendar, RefreshCcw, Eraser } from 'lucide-react';
import axios from 'axios';
import TablePagination from '../components/common/TablePagination';
import { BtnBack, BtnClear } from '../components/CommonButtons';
import EmptyState from '../components/EmptyState';
import * as XLSX from 'xlsx';

const MovimientosStock = () => {
    const navigate = useNavigate();
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(0);

    const STORAGE_KEY = 'table_prefs_movimientos_items';

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setItemsPerPage(Number(saved));
        } else {
            axios.get('/api/config/obtener/')
                .then(res => {
                    setItemsPerPage(res.data.items_por_pagina || 20);
                })
                .catch(err => {
                    console.error("Error loading config:", err);
                    setItemsPerPage(20);
                });
        }
    }, []);

    const fetchMovimientos = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: itemsPerPage,
                search: searchTerm,
                tipo: tipoFiltro,
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta
            };

            const response = await axios.get('/api/stock/movimientos/', { params });

            setMovimientos(response.data.movimientos || []);
            setTotalPages(response.data.total_pages || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error('Error cargando movimientos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (itemsPerPage > 0) {
            fetchMovimientos();
        }
    }, [currentPage, tipoFiltro, fechaDesde, fechaHasta, itemsPerPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                fetchMovimientos();
            } else {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleExportExcel = () => {
        const data = movimientos.map(mov => ({
            'Fecha': new Date(mov.fecha).toLocaleString('es-AR'),
            'Producto': `${mov.producto_codigo} - ${mov.producto_descripcion}`,
            'Tipo': mov.tipo_display,
            'Cantidad': mov.cantidad,
            'Referencia': mov.referencia,
            'Observaciones': mov.observaciones
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Movimientos Stock');
        XLSX.writeFile(wb, `movimientos_stock_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setTipoFiltro('');
        setFechaDesde('');
        setFechaHasta('');
        setCurrentPage(1);
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-3 main-content-container bg-light fade-in d-flex flex-column" style={{ minHeight: 'calc(100vh - 80px)' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div>
                        <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                            <RefreshCcw className="me-2 inline-block" size={32} />
                            Movimientos de Stock
                        </h2>
                        <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                            Historial completo detallado de entradas y salidas.
                        </p>
                    </div>
                </div>
                <button
                    className="btn btn-success btn-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/40 active:scale-95 transition-all d-flex align-items-center gap-2 rounded-3xl font-bold border-0 px-4"
                    onClick={handleExportExcel}
                    disabled={movimientos.length === 0}
                    style={{ backgroundColor: '#10b981' }}
                >
                    <Download size={20} />
                    Exportar Excel
                </button>
            </div>

            {/* Filtros */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por código, descripción, referencia..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-2">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Filter size={18} className="text-muted" /></span>
                                <select
                                    className="form-select border-start-0"
                                    value={tipoFiltro}
                                    onChange={(e) => setTipoFiltro(e.target.value)}
                                >
                                    <option value="">Todos los Tipos</option>
                                    <option value="IN">Entradas</option>
                                    <option value="OUT">Salidas</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Calendar size={18} className="text-muted" /></span>
                                <input
                                    type="date"
                                    className="form-control border-start-0"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-2">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Calendar size={18} className="text-muted" /></span>
                                <input
                                    type="date"
                                    className="form-control border-start-0"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-2">
                            <BtnClear onClick={limpiarFiltros} className="w-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold" style={{ width: '12%' }}>Fecha</th>
                                    <th className="py-3 fw-bold" style={{ width: '25%' }}>Producto</th>
                                    <th className="py-3 fw-bold text-center" style={{ width: '10%' }}>Tipo</th>
                                    <th className="py-3 fw-bold text-end" style={{ width: '10%' }}>Cant.</th>
                                    <th className="py-3 fw-bold" style={{ width: '15%' }}>Referencia</th>
                                    <th className="pe-4 py-3 fw-bold" style={{ width: '28%' }}>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-5 text-center">
                                            <div className="spinner-border text-primary" role="status"></div>
                                            <div className="mt-2 text-muted fw-bold">Cargando movimientos...</div>
                                        </td>
                                    </tr>
                                ) : movimientos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-5">
                                            <EmptyState
                                                icon={Package}
                                                title="No se encontraron movimientos"
                                                description="Intenta ajustar los filtros para encontrar lo que buscas."
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    movimientos.map(mov => (
                                        <tr key={mov.id} className="hover:bg-light transition-colors">
                                            <td className="ps-4 py-3">
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-dark">
                                                        {new Date(mov.fecha).toLocaleDateString('es-AR')}
                                                    </span>
                                                    <small className="text-muted font-monospace">
                                                        {new Date(mov.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                    </small>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex flex-column">
                                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace mb-1 w-fit" style={{ fontSize: '0.7rem' }}>
                                                        {mov.producto_codigo}
                                                    </span>
                                                    <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '250px' }} title={mov.producto_descripcion}>
                                                        {mov.producto_descripcion}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                {mov.tipo === 'IN' ? (
                                                    <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold d-inline-flex align-items-center gap-1">
                                                        <ArrowUp size={14} strokeWidth={3} />
                                                        ENTRADA
                                                    </span>
                                                ) : (
                                                    <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 fw-bold d-inline-flex align-items-center gap-1">
                                                        <ArrowDown size={14} strokeWidth={3} />
                                                        SALIDA
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-end">
                                                <span className={`fw-black px-2 py-1 rounded ${mov.tipo === 'IN' ? 'text-success bg-success-subtle' : 'text-danger bg-danger-subtle'
                                                    }`} style={{ fontSize: '1.1rem' }}>
                                                    {mov.tipo === 'IN' ? '+' : '-'}{mov.cantidad}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle text-uppercase" style={{ fontSize: '0.75rem' }}>
                                                    {mov.referencia}
                                                </span>
                                            </td>
                                            <td className="pe-4 py-3">
                                                <div className="text-muted small italic text-truncate" style={{ maxWidth: '250px' }} title={mov.observaciones}>
                                                    {mov.observaciones || '—'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer / Paginación */}
                {itemsPerPage > 0 && (
                    <div className="card-footer bg-white border-top p-0">
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={(newVal) => {
                                setItemsPerPage(newVal);
                                setCurrentPage(1);
                                localStorage.setItem(STORAGE_KEY, newVal);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovimientosStock;
