import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, MapPin, FileText, DollarSign, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { BtnSave } from '../components/CommonButtons';

const ConfiguracionEmpresa = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        nombre: '',
        cuit: '',
        direccion: '',
        localidad: '',
        provincia: '',
        condicion_fiscal: 'RI',
        iibb: '',
        inicio_actividades: '',
        moneda_predeterminada: 'ARS'
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get('/api/config/obtener/');
            if (response.data) {
                setConfig(prev => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.error("Error cargando configuración:", error);
            setMessage({ type: 'error', text: 'Error al cargar los datos.' });
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
                setMessage({ type: 'success', text: 'Datos guardados correctamente.' });
                setTimeout(() => setMessage(null), 3000);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    return (
        <div className="container-fluid h-100 d-flex flex-column bg-light p-0" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
            {/* 1. Header Fijo */}
            <div className="px-4 pt-4 pb-2 flex-shrink-0">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                            <Settings className="me-2 inline-block" size={32} />
                            Datos de la Empresa
                        </h2>
                        <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                            Información legal y fiscal para la facturación
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Contenido Scrollable */}
            <div className="flex-grow-1 overflow-auto px-4 pb-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-10">
                        {message && (
                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center gap-2 mb-4 shadow-sm border-0 sticky-top`} style={{ zIndex: 10, top: '0px' }}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span className="fw-medium">{message.text}</span>
                            </div>
                        )}

                        <div className="card border-0 shadow-sm rounded-3 mb-4">
                            <div className="card-header bg-white py-3 border-bottom">
                                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                                    <Building size={20} className="text-primary" />
                                    Información General
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <form id="config-form" onSubmit={handleSave}>
                                    <div className="row g-5">
                                        {/* Columna Izquierda: Información General */}
                                        <div className="col-12 col-xl-6 border-end-xl">
                                            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                                <Building size={20} className="text-primary" />
                                                Información General
                                            </h5>

                                            <div className="row g-3 mb-3">
                                                <div className="col-12">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            className="form-control fw-bold"
                                                            id="nombre"
                                                            name="nombre"
                                                            placeholder="Nombre"
                                                            value={config.nombre}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="nombre">Nombre / Razón Social</label>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="cuit"
                                                            name="cuit"
                                                            placeholder="00-00000000-0"
                                                            value={config.cuit}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="cuit">CUIT</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <div className="input-group">
                                                    <span className="input-group-text bg-white border-end-0 text-muted"><MapPin size={18} /></span>
                                                    <div className="form-floating flex-grow-1">
                                                        <input
                                                            type="text"
                                                            className="form-control border-start-0 ps-2"
                                                            id="direccion"
                                                            name="direccion"
                                                            placeholder="Dirección"
                                                            value={config.direccion}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="direccion" style={{ left: '-5px' }}>Domicilio Fiscal</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="localidad"
                                                            name="localidad"
                                                            placeholder="Localidad"
                                                            value={config.localidad}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="localidad">Localidad</label>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="provincia"
                                                            name="provincia"
                                                            placeholder="Provincia"
                                                            value={config.provincia}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="provincia">Provincia</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Columna Derecha: Datos Fiscales y Moneda */}
                                        <div className="col-12 col-xl-6">
                                            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                                <FileText size={20} className="text-primary" />
                                                Datos Fiscales
                                            </h5>

                                            <div className="row g-3 mb-5">
                                                <div className="col-12">
                                                    <div className="form-floating">
                                                        <select
                                                            className="form-select"
                                                            id="condicion_fiscal"
                                                            name="condicion_fiscal"
                                                            value={config.condicion_fiscal}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="RI">Responsable Inscripto</option>
                                                            <option value="MO">Monotributista</option>
                                                            <option value="EX">Exento</option>
                                                            <option value="CF">Consumidor Final</option>
                                                        </select>
                                                        <label htmlFor="condicion_fiscal">Condición Fiscal</label>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="iibb"
                                                            name="iibb"
                                                            placeholder="IIBB"
                                                            value={config.iibb}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="iibb">Ingresos Brutos</label>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            id="inicio_actividades"
                                                            name="inicio_actividades"
                                                            value={config.inicio_actividades}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="inicio_actividades">Inicio de Actividades</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                                <DollarSign size={20} className="text-primary" />
                                                Configuración de Moneda
                                            </h5>

                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <div className="form-floating">
                                                        <select
                                                            className="form-select"
                                                            id="moneda"
                                                            name="moneda_predeterminada"
                                                            value={config.moneda_predeterminada}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="ARS">Peso Argentino (ARS)</option>
                                                            <option value="USD">Dólar Estadounidense (USD)</option>
                                                        </select>
                                                        <label htmlFor="moneda">Moneda Predeterminada</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end align-items-center mt-5 pt-3 border-top">
                                                <p className="text-muted small mb-0 me-3 d-none d-xl-block">
                                                    <CheckCircle size={14} className="me-1" />
                                                    Los cambios se aplican al instante
                                                </p>
                                                <BtnSave
                                                    loading={saving}
                                                    label="Guardar Cambios"
                                                    onClick={handleSave}
                                                    className="px-4 py-2 fw-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionEmpresa;
