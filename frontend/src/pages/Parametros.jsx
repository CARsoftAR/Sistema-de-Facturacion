import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle, Settings } from 'lucide-react';

const Parametros = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        items_por_pagina: 10,
        habilita_remitos: true
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get('/api/config/obtener/');
            if (response.data) {
                setConfig({
                    items_por_pagina: response.data.items_por_pagina || 10,
                    habilita_remitos: response.data.habilita_remitos || false
                });
            }
        } catch (error) {
            console.error("Error cargando configuración:", error);
            setMessage({ type: 'error', text: 'Error al cargar la configuración.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await axios.post('/api/config/guardar/', config);
            if (response.data.ok) {
                setMessage({ type: 'success', text: 'Parámetros actualizados correctamente.' });
                window.dispatchEvent(new Event('configUpdated'));
            } else {
                setMessage({ type: 'error', text: 'Error al guardar: ' + response.data.error });
            }
        } catch (error) {
            console.error("Error guardando:", error);
            setMessage({ type: 'error', text: 'Error de conexión al guardar.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold text-dark tracking-tight">Parámetros del Sistema</h2>
                    <p className="text-secondary mb-0">Ajustes técnicos y comportamiento de módulos</p>
                </div>
            </div>

            <div className="row">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold text-primary d-flex align-items-center gap-2">
                                <Settings size={20} />
                                Ajustes Generales
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {message && (
                                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center gap-2 mb-4`}>
                                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSave}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-secondary text-uppercase fs-7">
                                        Visualización
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="5"
                                            max="100"
                                            value={config.items_por_pagina}
                                            onChange={(e) => setConfig({ ...config, items_por_pagina: parseInt(e.target.value) || 10 })}
                                        />
                                        <span className="input-group-text bg-light text-muted">items por página</span>
                                    </div>
                                    <div className="form-text">
                                        Cantidad de filas a mostrar en listados (Ventas, Compras, etc).
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-secondary text-uppercase fs-7">
                                        Automatización
                                    </label>
                                    <div className="form-check form-switch p-3 border rounded bg-light">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="checkRemitos"
                                            checked={config.habilita_remitos}
                                            onChange={(e) => setConfig({ ...config, habilita_remitos: e.target.checked })}
                                        />
                                        <label className="form-check-label ms-2 fw-medium" htmlFor="checkRemitos">
                                            Generar Remitos Automáticamente
                                        </label>
                                    </div>
                                    <div className="form-text mt-1">
                                        Al finalizar una venta, se creará un remito de entrega automáticamente.
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end pt-3 border-top">
                                    <button
                                        type="submit"
                                        className="btn btn-primary d-flex align-items-center gap-2 px-4"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Guardar Cambios
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Parametros;
