import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Activity } from 'lucide-react';
import { showToast } from '../utils/alerts';

const ReportesContables = () => {
    const [ejercicios, setEjercicios] = useState([]);
    const [loadingEjercicios, setLoadingEjercicios] = useState(true);
    const [selectedEjercicio, setSelectedEjercicio] = useState('');
    const [fechas, setFechas] = useState({ desde: '', hasta: '' });
    const [loadingDownload, setLoadingDownload] = useState(false);

    useEffect(() => {
        fetchEjercicios();
    }, []);

    const fetchEjercicios = async () => {
        try {
            const response = await fetch('/api/contabilidad/ejercicios/');
            const data = await response.json();
            // Data format: { data: [...] }
            if (data.data) {
                setEjercicios(data.data);
                if (data.data.length > 0) {
                    // Seleccionar el actual (abierto) o el último
                    const actual = data.data.find(e => e.estado === 'ABIERTO');
                    setSelectedEjercicio(actual ? actual.id : data.data[0].id);
                }
            }
        } catch (error) {
            console.error("Error loading ejercicios:", error);
            showToast('Error al cargar ejercicios', 'error');
        } finally {
            setLoadingEjercicios(false);
        }
    };

    const handleDownload = async (reportType) => {
        if (!selectedEjercicio) {
            showToast('Seleccione un ejercicio contable', 'warning');
            return;
        }

        setLoadingDownload(true);
        try {
            const params = new URLSearchParams({
                ejercicio_id: selectedEjercicio,
                fecha_desde: fechas.desde,
                fecha_hasta: fechas.hasta
            });

            // Map frontend report type to backend API endpoint
            let endpoint = '';
            let filename = 'reporte.xlsx';

            switch (reportType) {
                case 'diario':
                    endpoint = '/api/contabilidad/reportes/libro-diario/';
                    filename = 'libro_diario.xlsx';
                    break;
                case 'mayor':
                    endpoint = '/api/contabilidad/reportes/mayor/exportar/'; // Verify endpoint
                    // Actually checking urls.py: api/contabilidad/mayor/exportar/ 
                    endpoint = '/api/contabilidad/mayor/exportar/';
                    filename = 'libro_mayor.xlsx';
                    break;
                case 'balance':
                    endpoint = '/api/contabilidad/balance/exportar/';
                    filename = 'balance_general.xlsx';
                    break;
                case 'resultados':
                    endpoint = '/api/contabilidad/reportes/estado-resultados/';
                    filename = 'estado_resultados.xlsx';
                    break;
                default:
                    return;
            }

            const url = `${endpoint}?${params.toString()}`;

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast('Descarga iniciada', 'success');

        } catch (error) {
            console.error("Error downloading report:", error);
            showToast('Error al descargar reporte', 'error');
        } finally {
            setLoadingDownload(false);
        }
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <FileText className="me-2 inline-block" size={32} />
                        Reportes Contables
                    </h2>
                    <p className="text-muted mb-0 ps-1">Generación y exportación de libros contables.</p>
                </div>
            </div>

            {/* Controls */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted text-uppercase">Ejercicio Contable</label>
                            {loadingEjercicios ? (
                                <div className="spinner-border spinner-border-sm text-primary d-block" role="status"></div>
                            ) : (
                                <select
                                    className="form-select bg-light border-0 fw-bold"
                                    value={selectedEjercicio}
                                    onChange={(e) => setSelectedEjercicio(e.target.value)}
                                >
                                    {ejercicios.map(ej => (
                                        <option key={ej.id} value={ej.id}>
                                            {ej.descripcion} ({new Date(ej.fecha_inicio).toLocaleDateString()} - {new Date(ej.fecha_fin).toLocaleDateString()}) - {ej.estado}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted text-uppercase">Fecha Desde (Opcional)</label>
                            <input
                                type="date"
                                className="form-control bg-light border-0"
                                value={fechas.desde}
                                onChange={(e) => setFechas({ ...fechas, desde: e.target.value })}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted text-uppercase">Fecha Hasta (Opcional)</label>
                            <input
                                type="date"
                                className="form-control bg-light border-0"
                                value={fechas.hasta}
                                onChange={(e) => setFechas({ ...fechas, hasta: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="row g-4">
                {/* Libro Diario */}
                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                        <div className="card-body text-center p-4">
                            <div className="bg-blue-50 text-blue-600 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                                <FileText size={32} />
                            </div>
                            <h5 className="fw-bold text-dark mb-2">Libro Diario</h5>
                            <p className="text-muted small mb-4">Detalle cronológico de todos los asientos contables registrados.</p>
                            <button
                                className="btn btn-primary w-100 fw-bold"
                                onClick={() => handleDownload('diario')}
                                disabled={loadingDownload}
                            >
                                <Download size={18} className="me-2" />
                                Descargar Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Libro Mayor */}
                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                        <div className="card-body text-center p-4">
                            <div className="bg-indigo-50 text-indigo-600 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                                <Calendar size={32} />
                            </div>
                            <h5 className="fw-bold text-dark mb-2">Libro Mayor</h5>
                            <p className="text-muted small mb-4">Saldos y movimientos acumulados por cada cuenta contable.</p>
                            <button
                                className="btn btn-primary w-100 fw-bold"
                                onClick={() => handleDownload('mayor')}
                                disabled={loadingDownload}
                            >
                                <Download size={18} className="me-2" />
                                Descargar Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Balance General */}
                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                        <div className="card-body text-center p-4">
                            <div className="bg-green-50 text-green-600 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                                <Activity size={32} />
                            </div>
                            <h5 className="fw-bold text-dark mb-2">Balance General</h5>
                            <p className="text-muted small mb-4">Situación patrimonial de la empresa (Activo, Pasivo y Patrimonio).</p>
                            <button
                                className="btn btn-primary w-100 fw-bold"
                                onClick={() => handleDownload('balance')}
                                disabled={loadingDownload}
                            >
                                <Download size={18} className="me-2" />
                                Descargar Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estado de Resultados */}
                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                        <div className="card-body text-center p-4">
                            <div className="bg-purple-50 text-purple-600 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                                <Activity size={32} />
                            </div>
                            <h5 className="fw-bold text-dark mb-2">Estado de Resultados</h5>
                            <p className="text-muted small mb-4">Informe de pérdidas y ganancias del ejercicio seleccionado.</p>
                            <button
                                className="btn btn-primary w-100 fw-bold"
                                onClick={() => handleDownload('resultados')}
                                disabled={loadingDownload}
                            >
                                <Download size={18} className="me-2" />
                                Descargar Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportesContables;
