import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, AlertCircle, User, CreditCard, MapPin, Phone, StickyNote } from 'lucide-react';

const ClienteForm = ({ cliente, onClose, onSave }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [serverError, setServerError] = useState(null);

    // Cargar datos auxiliares (Provincias, Localidades)
    // Nota: Si no existen APIs directas, se pueden dejar vacíos o mocking por ahora.
    // Asumimos que existen o usaremos una lista estatica si fallan.
    useEffect(() => {
        const fetchAux = async () => {
            try {
                // TODO: Implementar API real de localidades si existe
                // Por ahora simulamos o dejamos vacío si no hay endpoint claro
            } catch (e) {
                console.error(e);
            }
        };
        fetchAux();
    }, []);

    useEffect(() => {
        if (cliente) {
            reset({
                nombre: cliente.nombre,
                cuit: cliente.cuit || '',
                condicion_fiscal: cliente.condicion_fiscal || 'CF',
                telefono: cliente.telefono || '',
                email: cliente.email || '',
                domicilio: cliente.domicilio || '',
                lista_precio: cliente.lista_precio || '1',
                limite_credito: cliente.limite_credito || 0,
                notas: cliente.notas || '',
                activo: cliente.activo !== false // Default true
            });
        } else {
            reset({
                condicion_fiscal: 'CF',
                lista_precio: '1',
                limite_credito: 0,
                activo: true
            });
        }
    }, [cliente, reset]);

    const onSubmit = async (data) => {
        setServerError(null);
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                // Checkbox logic
                if (key === 'activo') {
                    formData.append(key, data[key] ? 'on' : 'off');
                } else {
                    formData.append(key, data[key]);
                }
            }
        });

        const url = cliente
            ? `/api/clientes/${cliente.id}/editar/`
            : '/api/clientes/nuevo/';

        try {
            const response = await fetch(url, {
                method: 'POST', // Django API espera POST multipart/form-data
                body: formData,
            });

            const result = await response.json();

            if (!result.ok) {
                if (result.errors) {
                    const msg = Object.values(result.errors).flat().join(', ');
                    setServerError(msg);
                } else {
                    setServerError(result.error || 'Ocurrió un error al guardar.');
                }
                return;
            }

            onSave();
            onClose();
        } catch (error) {
            setServerError('Error de conexión con el servidor.');
        }
    };

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg">

                        {/* Header Moderno (Igual a ProductoForm pero Azul/Cyan) */}
                        <div className="modal-header bg-primary text-white px-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-2 bg-white bg-opacity-25 rounded-circle">
                                    <User size={24} className="text-white" />
                                </div>
                                <div>
                                    <h5 className="modal-title fw-bold mb-0">
                                        {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                                    </h5>
                                    <p className="mb-0 small text-white text-opacity-75">
                                        {cliente ? `Editando: ${cliente.nombre}` : 'Complete los datos para agregar un cliente'}
                                    </p>
                                </div>
                            </div>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>

                        <div className="modal-body p-4 bg-light">
                            {serverError && (
                                <div className="alert alert-danger d-flex align-items-center mb-4 shadow-sm border-0 border-start border-4 border-danger">
                                    <AlertCircle size={20} className="me-3" />
                                    <div>{serverError}</div>
                                </div>
                            )}

                            <form id="cliente-form" onSubmit={handleSubmit(onSubmit)} className="row g-4">

                                {/* 1. Datos Principales */}
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <User size={18} className="text-primary" />
                                                <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ letterSpacing: '0.05em' }}>Datos Personales</h6>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 pt-2">
                                            <div className="row g-3">
                                                <div className="col-md-8">
                                                    <label className="form-label small fw-medium text-muted">Nombre / Razón Social *</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                                        placeholder="Nombre del cliente..."
                                                        {...register('nombre', { required: 'El nombre es requerido' })}
                                                    />
                                                    {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small fw-medium text-muted">CUIT / DNI</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Sin guiones"
                                                        {...register('cuit')}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-medium text-muted">Condición Fiscal</label>
                                                    <select className="form-select" {...register('condicion_fiscal')}>
                                                        <option value="CF">Consumidor Final</option>
                                                        <option value="RI">Responsable Inscripto</option>
                                                        <option value="MT">Monotributo</option>
                                                        <option value="EX">Exento</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-medium text-muted">Estado</label>
                                                    <div className="form-check form-switch mt-2">
                                                        <input className="form-check-input" type="checkbox" role="switch" id="activoSwitch" {...register('activo')} />
                                                        <label className="form-check-label" htmlFor="activoSwitch">Cliente Activo</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Contacto y Dirección */}
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <MapPin size={18} className="text-info" />
                                                <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ letterSpacing: '0.05em' }}>Ubicación</h6>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 pt-2">
                                            <div className="mb-3">
                                                <label className="form-label small fw-medium text-muted">Domicilio</label>
                                                <input type="text" className="form-control" placeholder="Calle, altura, piso..." {...register('domicilio')} />
                                            </div>
                                            {/* Aquí se podrían agregar selects para Provincia/Localidad si hubiera API */}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Phone size={18} className="text-success" />
                                                <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ letterSpacing: '0.05em' }}>Contacto</h6>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 pt-2">
                                            <div className="mb-3">
                                                <label className="form-label small fw-medium text-muted">Teléfono</label>
                                                <input type="text" className="form-control" {...register('telefono')} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small fw-medium text-muted">Email</label>
                                                <input type="email" className="form-control" placeholder="cliente@ejemplo.com" {...register('email')} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Comercial */}
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <CreditCard size={18} className="text-warning" />
                                                <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ letterSpacing: '0.05em' }}>Comercial</h6>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 pt-2">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-medium text-muted">Lista de Precios</label>
                                                    <select className="form-select" {...register('lista_precio')}>
                                                        <option value="1">Lista 1 (Minorista)</option>
                                                        <option value="2">Lista 2 (Gremio)</option>
                                                        <option value="3">Lista 3 (Mayorista)</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-medium text-muted">Límite Crédito ($)</label>
                                                    <input type="number" step="0.01" className="form-control" {...register('limite_credito')} />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label small fw-medium text-muted">Notas Internas</label>
                                                    <textarea className="form-control" rows="2" placeholder="Observaciones..." {...register('notas')}></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-top bg-white py-3">
                            <button type="button" className="btn btn-light px-4" onClick={onClose}>Cancelar</button>
                            <button
                                type="submit"
                                form="cliente-form"
                                className="btn btn-primary px-4 d-flex align-items-center gap-2 shadow-sm"
                                disabled={isSubmitting}
                            >
                                <Save size={18} />
                                {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ClienteForm;
