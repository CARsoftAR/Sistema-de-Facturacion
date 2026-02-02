
import React, { useState, useEffect } from 'react';
import { formatNumber } from '../utils/formats';
// Usaremos iconos de Bootstrap como en Productos.jsx

const flattenCuentas = (nodes, result = []) => {
    nodes.forEach(node => {
        result.push(node);
        if (node.hijos && node.hijos.length > 0) {
            flattenCuentas(node.hijos, result);
        }
    });
    return result;
};

const LibroMayor = () => {
    const [loading, setLoading] = useState(false);
    const [movimientos, setMovimientos] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [cuenta, setCuenta] = useState(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Filtros
    const [filtros, setFiltros] = useState({
        cuenta_id: '',
        ejercicio_id: '',
        fecha_desde: '',
        fecha_hasta: ''
    });

    const [cuentas, setCuentas] = useState([]);
    const [ejercicios, setEjercicios] = useState([]);

    useEffect(() => {
        Promise.all([
            fetch('/api/contabilidad/plan-cuentas/').then(r => r.json()),
            fetch('/api/contabilidad/ejercicios/').then(r => r.json())
        ]).then(([resCuentas, resEj]) => {
            if (resCuentas.success) setCuentas(flattenCuentas(resCuentas.cuentas));
            if (resEj.success) {
                setEjercicios(resEj.ejercicios);
                const active = resEj.ejercicios.find(e => !e.cerrado);
                if (active) {
                    setFiltros(prev => ({
                        ...prev,
                        ejercicio_id: active.id,
                        fecha_desde: active.fecha_inicio,
                        fecha_hasta: active.fecha_fin
                    }));
                }
            }
        });
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!filtros.cuenta_id) return alert("Seleccione una cuenta");

        setLoading(true);
        try {
            const params = new URLSearchParams(filtros).toString();
            const res = await fetch(`/api/contabilidad/mayor/consultar/?${params}`);
            const data = await res.json();

            if (data.success) {
                setMovimientos(data.movimientos);
                setResumen(data.resumen);
                setCuenta(data.cuenta);
                setCurrentPage(1);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!filtros.cuenta_id) return;
        const params = new URLSearchParams(filtros).toString();
        window.open(`/api/contabilidad/mayor/exportar/?${params}`, '_blank');
    };

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = movimientos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(movimientos.length / itemsPerPage);

    // Filter change handler specific updates
    const handleFilterChange = (field, value) => {
        const newFiltros = { ...filtros, [field]: value };

        // Auto-update dates if exercise changes
        if (field === 'ejercicio_id') {
            const ej = ejercicios.find(x => x.id == value);
            if (ej) {
                newFiltros.fecha_desde = ej.fecha_inicio;
                newFiltros.fecha_hasta = ej.fecha_fin;
            } else {
                newFiltros.fecha_desde = '';
                newFiltros.fecha_hasta = '';
            }
        }

        setFiltros(newFiltros);
    };

    // Helper para formato de fecha
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="container-fluid px-4 mt-4">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2.2rem' }}>
                        <i className="bi bi-book-half me-2" style={{ fontSize: '0.8em' }}></i>
                        Libro Mayor
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
                        Consulta de movimientos y saldos por cuenta.
                    </p>
                </div>
            </div>

            {/* FILTROS (Estilo Productos.jsx) */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <form onSubmit={handleSearch}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                    <select
                                        className="form-select border-start-0"
                                        value={filtros.cuenta_id}
                                        onChange={e => handleFilterChange('cuenta_id', e.target.value)}
                                    >
                                        <option value="">Seleccionar cuenta...</option>
                                        {cuentas.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.codigo} - {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    value={filtros.ejercicio_id}
                                    onChange={e => handleFilterChange('ejercicio_id', e.target.value)}
                                >
                                    <option value="">Todos los Ejercicios</option>
                                    {ejercicios.map(e => <option key={e.id} value={e.id}>{e.descripcion}</option>)}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filtros.fecha_desde}
                                    onChange={e => handleFilterChange('fecha_desde', e.target.value)}
                                    title="Fecha Desde"
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filtros.fecha_hasta}
                                    onChange={e => handleFilterChange('fecha_hasta', e.target.value)}
                                    title="Fecha Hasta"
                                />
                            </div>
                            <div className="col-md-2">
                                <button type="submit" className="btn btn-primary w-100 rounded-2 shadow-sm fw-bold">
                                    <i className="bi bi-funnel-fill me-1"></i> Ver
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* RESULTADOS */}
            {resumen && (
                <>
                    {/* Tarjetas de Resumen Modernas */}
                    <div className="row g-3 mb-4">
                        {/* Saldo Inicial */}
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-3 h-100 position-relative overflow-hidden">
                                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Saldo Inicial</p>
                                        <h4 className="fw-bold text-secondary mb-0 text-truncate" title={`$ ${formatNumber(resumen.saldo_inicial)}`}>
                                            $ {formatNumber(resumen.saldo_inicial)}
                                        </h4>
                                    </div>
                                    <div className="bg-secondary bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                        <i className="bi bi-wallet2 text-secondary fs-4"></i>
                                    </div>
                                </div>
                                <div className="position-absolute bottom-0 start-0 w-100 bg-secondary" style={{ height: '3px' }}></div>
                            </div>
                        </div>

                        {/* Total Debe */}
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-3 h-100 position-relative overflow-hidden">
                                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Total Debe</p>
                                        <h4 className="fw-bold text-success mb-0 text-truncate" title={`$ ${formatNumber(resumen.total_debe)}`}>
                                            $ {formatNumber(resumen.total_debe)}
                                        </h4>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                        <i className="bi bi-arrow-down-circle-fill text-success fs-4"></i>
                                    </div>
                                </div>
                                <div className="position-absolute bottom-0 start-0 w-100 bg-success" style={{ height: '3px' }}></div>
                            </div>
                        </div>

                        {/* Total Haber */}
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-3 h-100 position-relative overflow-hidden">
                                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Total Haber</p>
                                        <h4 className="fw-bold text-primary mb-0 text-truncate" title={`$ ${formatNumber(resumen.total_haber)}`}>
                                            $ {formatNumber(resumen.total_haber)}
                                        </h4>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                        <i className="bi bi-arrow-up-circle-fill text-primary fs-4"></i>
                                    </div>
                                </div>
                                <div className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px' }}></div>
                            </div>
                        </div>

                        {/* Saldo Final */}
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-3 h-100 position-relative overflow-hidden">
                                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                    <div className="overflow-hidden me-2">
                                        <p className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Saldo Final</p>
                                        <h4 className={`fw-bold mb-0 text-truncate ${resumen.saldo_final < 0 ? 'text-danger' : 'text-dark'}`} title={`$ ${formatNumber(resumen.saldo_final)}`}>
                                            $ {formatNumber(resumen.saldo_final)}
                                        </h4>
                                    </div>
                                    <div className="d-flex flex-column gap-1">
                                        <div className={`bg-opacity-10 p-2 rounded-circle d-flex align-items-center justify-content-center ${resumen.saldo_final < 0 ? 'bg-danger' : 'bg-dark'}`} style={{ width: '40px', height: '40px' }}>
                                            <i className={`bi bi-cash-coin fs-5 ${resumen.saldo_final < 0 ? 'text-danger' : 'text-dark'}`}></i>
                                        </div>
                                        <button onClick={handleExport} className="btn btn-success text-white btn-sm p-1 d-flex align-items-center justify-content-center rounded-circle border-0 shadow-sm" style={{ width: '30px', height: '30px', margin: '0 auto' }} title="Exportar Excel">
                                            <i className="bi bi-file-earmark-excel-fill"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className={`position-absolute bottom-0 start-0 w-100 ${resumen.saldo_final < 0 ? 'bg-danger' : 'bg-dark'}`} style={{ height: '3px' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* TABLA (Estilo Productos.jsx) - ESTÁNDAR */}
                    <div className="card border-0 shadow mb-4 flex-grow-1 overflow-hidden d-flex flex-column" style={{ minHeight: '400px' }}>
                        <div className="card-body p-0 d-flex flex-column overflow-hidden">
                            <div className="table-responsive flex-grow-1 overflow-auto">
                                <table className="table align-middle mb-0">
                                    <thead className="bg-white border-bottom">
                                        <tr>
                                            <th className="ps-4 py-3 text-dark fw-bold">Fecha</th>
                                            <th className="py-3 text-dark fw-bold">Asiento</th>
                                            <th className="py-3 text-dark fw-bold">Descripción</th>
                                            <th className="text-end py-3 text-dark fw-bold">Debe</th>
                                            <th className="text-end py-3 text-dark fw-bold">Haber</th>
                                            <th className="text-end pe-4 py-3 text-dark fw-bold">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movimientos.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5">
                                                    <div className="text-muted opacity-50 mb-3">
                                                        <i className="bi bi-journal-x fs-1"></i>
                                                    </div>
                                                    <p className="text-muted mb-0">No hay movimientos en el período seleccionado.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentItems.map((mov) => (
                                                <tr key={mov.id} className="border-bottom-0">
                                                    <td className="ps-4 text-dark fw-medium py-3">{formatDate(mov.fecha)}</td>
                                                    <td className="fw-bold text-primary py-3">#{mov.asiento_numero}</td>
                                                    <td className="text-secondary py-3">{mov.descripcion}</td>
                                                    <td className="text-end text-success fw-bold py-3">
                                                        {mov.debe > 0 ? `$ ${formatNumber(mov.debe)}` : '-'}
                                                    </td>
                                                    <td className="text-end text-danger fw-bold py-3">
                                                        {mov.haber > 0 ? `$ ${formatNumber(mov.haber)}` : '-'}
                                                    </td>
                                                    <td className="text-end pe-4 fw-bold text-dark py-3">
                                                        $ {formatNumber(mov.saldo)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINACIÓN */}
                            {!loading && movimientos.length > 0 && (
                                <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="text-muted small">
                                            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, movimientos.length)} de {movimientos.length} registros
                                        </span>
                                        <select
                                            className="form-select form-select-sm border-secondary-subtle"
                                            style={{ width: '70px' }}
                                            value={itemsPerPage}
                                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        >
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </select>
                                        <span className="text-muted small">por pág.</span>
                                    </div>

                                    <nav>
                                        <ul className="pagination mb-0 align-items-center gap-2">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link border-0 text-secondary bg-transparent p-0"
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <i className="bi bi-chevron-left"></i>
                                                </button>
                                            </li>

                                            {[...Array(totalPages)].map((_, i) => {
                                                if (totalPages > 10 && Math.abs(currentPage - (i + 1)) > 2 && i !== 0 && i !== totalPages - 1) return null;
                                                return (
                                                    <li key={i} className="page-item">
                                                        <button
                                                            className={`page-link border-0 rounded-circle fw-bold ${currentPage === i + 1 ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary'}`}
                                                            onClick={() => setCurrentPage(i + 1)}
                                                            style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    </li>
                                                );
                                            })}

                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link border-0 text-secondary bg-transparent p-0"
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <i className="bi bi-chevron-right"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LibroMayor;
