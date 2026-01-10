
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Ejercicios = () => {
    const [ejercicios, setEjercicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: null,
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        cerrado: false
    });

    const fetchEjercicios = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/contabilidad/ejercicios/');
            const data = await res.json();
            if (data.success) {
                setEjercicios(data.ejercicios);
            }
        } catch (error) {
            console.error("Error fetching ejercicios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEjercicios();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const url = formData.id
            ? `/api/contabilidad/ejercicios/${formData.id}/editar/`
            : `/api/contabilidad/ejercicios/crear/`;

        try {
            // Get CSRF
            const getCookie = (name) => {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.ok || data.success) {
                setModalOpen(false);
                fetchEjercicios();
            } else {
                alert(data.error || "Error al guardar");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    };

    const handleDelete = async (ej) => {
        if (!window.confirm(`¿Eliminar ejercicio ${ej.descripcion}?`)) return;
        try {
            const getCookie = (name) => {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            };

            const res = await fetch(`/api/contabilidad/ejercicios/${ej.id}/eliminar/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            });
            const data = await res.json();
            if (data.ok) {
                fetchEjercicios();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    const openNew = () => {
        setFormData({
            id: null,
            descripcion: '',
            fecha_inicio: '',
            fecha_fin: '',
            cerrado: false
        });
        setModalOpen(true);
    };

    const openEdit = (ej) => {
        setFormData({
            id: ej.id,
            descripcion: ej.descripcion,
            fecha_inicio: ej.fecha_inicio,
            fecha_fin: ej.fecha_fin,
            cerrado: ej.cerrado
        });
        setModalOpen(true);
    };

    return (
        <div className="container-fluid px-4 py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* ESTILOS EXTRA */}
            <style>{`
                .hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important; transform: translateY(-1px); }
                .table-hover tbody tr:hover { background-color: rgba(13, 110, 253, 0.03); }
            `}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-bold mb-1" style={{ fontSize: '2rem', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                        <i className="bi bi-calendar-check text-primary me-2"></i>
                        Ejercicios Contables
                    </h1>
                    <p className="text-muted mb-0">Administra los períodos fiscales de la empresa.</p>
                </div>
                <div>
                    <button className="btn btn-primary shadow-sm px-4 rounded-pill fw-bold" onClick={openNew}>
                        <i className="bi bi-plus-lg me-2"></i>Nuevo Ejercicio
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL - ESTÁNDAR */}
            <div className="card border-0 shadow mb-4 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary text-opacity-75" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                            <p className="mt-3 text-muted fw-bold">Cargando ejercicios...</p>
                        </div>
                    ) : ejercicios.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-muted" style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-calendar-x fs-1 opacity-50"></i>
                            </div>
                            <h5 className="text-secondary fw-bold">No hay ejercicios registrados</h5>
                            <p className="text-muted small">Crea un nuevo ejercicio para comenzar.</p>
                        </div>
                    ) : (
                        <div className="table-responsive flex-grow-1 overflow-auto">
                            <table className="table align-middle mb-0">
                                <thead className="bg-white border-bottom">
                                    <tr>
                                        <th className="ps-4 py-3 text-dark fw-bold">Descripción</th>
                                        <th className="py-3 text-dark fw-bold">Período</th>
                                        <th className="text-center py-3 text-dark fw-bold">Asientos</th>
                                        <th className="text-center py-3 text-dark fw-bold">Estado</th>
                                        <th className="text-end pe-4 py-3 text-dark fw-bold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ejercicios.map(ej => (
                                        <tr key={ej.id} className="border-bottom-0">
                                            <td className="ps-4 fw-bold text-dark py-3">{ej.descripcion}</td>
                                            <td className="small text-muted py-3">
                                                <div>{ej.fecha_inicio} al {ej.fecha_fin}</div>
                                            </td>
                                            <td className="text-center py-3">
                                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                                                    {ej.cantidad_asientos || 0}
                                                </span>
                                            </td>
                                            <td className="text-center py-3">
                                                <span className={`badge rounded-pill px-3 ${ej.cerrado ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`}>
                                                    {ej.cerrado ? 'Cerrado' : 'Abierto'}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/contabilidad/asientos/?ejercicio=${ej.id}`)}
                                                        className="btn btn-secondary btn-sm d-flex align-items-center justify-content-center px-2 shadow-sm"
                                                        title="Ver Asientos"
                                                        style={{ width: '34px' }}
                                                    >
                                                        <i className="bi bi-journal-text fs-6"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/contabilidad/balance/?ejercicio=${ej.id}`)}
                                                        className="btn btn-info btn-sm d-flex align-items-center justify-content-center px-2 shadow-sm text-white"
                                                        title="Ver Balance"
                                                        style={{ width: '34px' }}
                                                    >
                                                        <i className="bi bi-graph-up fs-6"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(ej)}
                                                        className="btn btn-primary btn-sm d-flex align-items-center justify-content-center px-2 shadow-sm"
                                                        title="Editar"
                                                        style={{ width: '34px' }}
                                                    >
                                                        <i className="bi bi-pencil fs-6"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ej)}
                                                        className="btn btn-danger btn-sm d-flex align-items-center justify-content-center px-2 shadow-sm"
                                                        title="Eliminar"
                                                        style={{ width: '34px' }}
                                                    >
                                                        <i className="bi bi-trash fs-6"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {modalOpen && (
                <>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)' }}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header bg-white border-0 px-4 pt-4 pb-0">
                                    <div>
                                        <h5 className="modal-title fw-bold fs-4 text-dark mb-0">
                                            {formData.id ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                                        </h5>
                                        <p className="text-muted small mb-0">Información del período fiscal.</p>
                                    </div>
                                    <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSave}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-secondary text-uppercase">Descripción</label>
                                            <input
                                                type="text"
                                                className="form-control bg-light border-0 fw-bold"
                                                required
                                                value={formData.descripcion}
                                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                                placeholder="Ej: Ejercicio 2026"
                                            />
                                        </div>
                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <label className="form-label small fw-bold text-secondary text-uppercase">Inicio</label>
                                                <input
                                                    type="date"
                                                    className="form-control bg-light border-0"
                                                    required
                                                    value={formData.fecha_inicio}
                                                    onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small fw-bold text-secondary text-uppercase">Fin</label>
                                                <input
                                                    type="date"
                                                    className="form-control bg-light border-0"
                                                    required
                                                    value={formData.fecha_fin}
                                                    onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {formData.id && (
                                            <div className="mb-4">
                                                <div
                                                    className={`d-flex align-items-center p-3 rounded-3 border cursor-pointer hover-shadow transition-all ${formData.cerrado ? 'bg-danger bg-opacity-10 border-danger border-opacity-25' : 'bg-success bg-opacity-10 border-success border-opacity-25'}`}
                                                    onClick={() => setFormData({ ...formData, cerrado: !formData.cerrado })}
                                                >
                                                    <div className="flex-grow-1">
                                                        <div className={`fw-bold ${formData.cerrado ? 'text-danger' : 'text-success'}`}>
                                                            {formData.cerrado ? 'Ejercicio Cerrado' : 'Ejercicio Abierto'}
                                                        </div>
                                                        <div className="small text-muted">
                                                            {formData.cerrado ? 'No se permiten nuevos asientos.' : 'Se permiten registros contables.'}
                                                        </div>
                                                    </div>
                                                    <div className="form-check form-switch ms-3">
                                                        <input
                                                            className="form-check-input fs-4"
                                                            type="checkbox"
                                                            checked={formData.cerrado}
                                                            readOnly
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                                            <button type="button" className="btn btn-light text-muted px-4 rounded-pill fw-bold" onClick={() => setModalOpen(false)}>Cancelar</button>
                                            <button type="submit" className="btn btn-primary px-5 rounded-pill fw-bold shadow-sm">Guardar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Ejercicios;
