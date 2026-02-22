import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, MapPin, FileText, DollarSign, CheckCircle, AlertCircle, Settings, Printer } from 'lucide-react';
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
        telefono: '',
        email: '',
        nombre_fantasia: '',
        punto_venta: '0001',
        papel_impresion: 'A4',
        moneda_predeterminada: 'ARS',
        actualizar_precios_compra: false,
        logo: null
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get('/api/config/obtener/');
            if (response.data) {
                setConfig(prev => ({ ...prev, ...response.data }));
                if (response.data.logo) {
                    setLogoPreview(response.data.logo);
                }
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
            const formData = new FormData();
            // Agregar todos los campos de config al formData
            Object.keys(config).forEach(key => {
                if (key === 'logo') {
                    if (config.logo instanceof File) {
                        formData.append('logo', config.logo);
                    }
                } else {
                    formData.append(key, config[key]);
                }
            });

            const response = await axios.post('/api/config/guardar/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.ok) {
                setMessage({ type: 'success', text: 'Datos guardados correctamente.' });
                if (response.data.logo_url) {
                    setLogoPreview(response.data.logo_url);
                }
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

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setConfig(prev => ({ ...prev, logo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
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
            <header className="px-8 pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 d-print-none">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <Building2 size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Mi Empresa
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Configuración de identidad legal y fiscal.
                    </p>
                </div>
            </header>

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
                                            {/* Header Eliminado por reduncancia */}

                                            <div className="row g-3 mb-4">
                                                <div className="col-12 col-md-4">
                                                    <div className="d-flex flex-column align-items-center justify-content-center p-3 border rounded-3 bg-white shadow-sm h-100" style={{ minHeight: '180px' }}>
                                                        {logoPreview ? (
                                                            <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center overflow-hidden rounded-2">
                                                                <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '140px', objectFit: 'contain' }} />
                                                                <label htmlFor="logo-upload" className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white text-center py-1 cursor-pointer" style={{ fontSize: '10px' }}>
                                                                    Cambiar Logo
                                                                </label>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-muted">
                                                                <Building size={48} className="mb-2 opacity-25" />
                                                                <p className="small mb-0">Sin Logo</p>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            id="logo-upload"
                                                            className="d-none"
                                                            accept="image/*"
                                                            onChange={handleLogoChange}
                                                        />
                                                        {!logoPreview && (
                                                            <label htmlFor="logo-upload" className="btn btn-sm btn-outline-primary mt-2">
                                                                Subir Logo
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-8">
                                                    <div className="form-floating mb-3">
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
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="nombre_fantasia"
                                                            name="nombre_fantasia"
                                                            placeholder="Nombre de Fantasía"
                                                            value={config.nombre_fantasia}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="nombre_fantasia">Nombre de Fantasía (Opcional)</label>
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
                                            <div className="row g-3 mt-1">
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="telefono"
                                                            name="telefono"
                                                            placeholder="Teléfono"
                                                            value={config.telefono}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="telefono">Teléfono</label>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            id="email"
                                                            name="email"
                                                            placeholder="Email"
                                                            value={config.email}
                                                            onChange={handleChange}
                                                        />
                                                        <label htmlFor="email">Email</label>
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

                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="punto_venta"
                                                            name="punto_venta"
                                                            placeholder="0001"
                                                            value={config.punto_venta}
                                                            onChange={handleChange}
                                                            maxLength={5}
                                                        />
                                                        <label htmlFor="punto_venta">Punto de Venta (ej: 0001)</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                                    <Printer size={20} className="text-primary" />
                                                    Preferencias de Impresión
                                                </h5>
                                                <div className="form-floating">
                                                    <select
                                                        className="form-select"
                                                        id="papel_impresion"
                                                        name="papel_impresion"
                                                        value={config.papel_impresion}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="A4">A4 (Estándar)</option>
                                                        <option value="T80">Ticket 80mm</option>
                                                        <option value="T58">Ticket 58mm</option>
                                                    </select>
                                                    <label htmlFor="papel_impresion">Formato de Impresión</label>
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
            </div >
        </div >
    );
};

export default ConfiguracionEmpresa;
