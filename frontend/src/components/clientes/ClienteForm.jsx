import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, AlertCircle, User, CreditCard, MapPin, Phone, StickyNote, X } from 'lucide-react';

const ClienteForm = ({ cliente, onClose, onSave }) => {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm();
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [serverError, setServerError] = useState(null);

    const tieneCtacte = watch('tiene_ctacte');

    useEffect(() => {
        if (!tieneCtacte) {
            setValue('limite_credito', 0);
        }
    }, [tieneCtacte, setValue]);

    useEffect(() => {
        const fetchAux = async () => {
            try {
                const resProv = await fetch('/api/provincias/listar/');
                const dataProv = await resProv.json();
                setProvincias(dataProv);

                const resLoc = await fetch('/api/localidades/listar/');
                const dataLoc = await resLoc.json();
                setLocalidades(dataLoc);
            } catch (e) {
                console.error("Error cargando auxiliares", e);
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
                activo: cliente.activo !== false, // Default true
                tiene_ctacte: cliente.tiene_ctacte || false
            });
        } else {
            reset({
                condicion_fiscal: 'CF',
                lista_precio: '1',
                limit_credito: 0,
                activo: true,
                tiene_ctacte: false
            });
        }
    }, [cliente, reset]);

    const onSubmit = async (data) => {
        setServerError(null);
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                // Checkbox logic
                if (key === 'activo' || key === 'tiene_ctacte') {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">

                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <User size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {cliente ? `Actualizando datos de ${cliente.nombre}` : 'Complete la ficha para dar de alta un cliente'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
                    {serverError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <span className="font-medium text-sm">{serverError}</span>
                        </div>
                    )}

                    <form id="cliente-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-5">

                        {/* Fila 1: Datos Identificación */}
                        <div className="col-span-12 md:col-span-6">
                            <label className="block text-xs font-bold text-slate-500 mb-1">NOMBRE / RAZÓN SOCIAL <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={16} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm font-medium ${errors.nombre ? 'border-red-500' : ''}`}
                                    placeholder="Nombre del cliente..."
                                    {...register('nombre', { required: 'El nombre es requerido' })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const form = e.target.form;
                                            const index = Array.prototype.indexOf.call(form, e.target);
                                            form.elements[index + 1].focus();
                                        }
                                    }}
                                />
                            </div>
                            {errors.nombre && <div className="text-red-500 text-xs mt-1">{errors.nombre.message}</div>}
                        </div>

                        <div className="col-span-12 md:col-span-3">
                            <label className="block text-xs font-bold text-slate-500 mb-1">CUIT / DNI</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                placeholder="Sin guiones"
                                {...register('cuit')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const form = e.target.form;
                                        const index = Array.prototype.indexOf.call(form, e.target);
                                        form.elements[index + 1].focus();
                                    }
                                }}
                            />
                        </div>

                        <div className="col-span-12 md:col-span-3">
                            <label className="block text-xs font-bold text-slate-500 mb-1">CONDICIÓN FISCAL</label>
                            <select
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                {...register('condicion_fiscal')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const form = e.target.form;
                                        const index = Array.prototype.indexOf.call(form, e.target);
                                        form.elements[index + 1].focus();
                                    }
                                }}
                            >
                                <option value="CF">Consumidor Final</option>
                                <option value="RI">Responsable Inscripto</option>
                                <option value="MT">Monotributo</option>
                                <option value="EX">Exento</option>
                            </select>
                        </div>

                        {/* Fila 2: Ubicación */}
                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">DOMICILIO</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin size={16} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                    placeholder="Calle, altura..."
                                    {...register('domicilio')}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const form = e.target.form;
                                            const index = Array.prototype.indexOf.call(form, e.target);
                                            form.elements[index + 1].focus();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">LOCALIDAD</label>
                            <select
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                {...register('localidad')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const form = e.target.form;
                                        const index = Array.prototype.indexOf.call(form, e.target);
                                        form.elements[index + 1].focus();
                                    }
                                }}
                            >
                                <option value="">Seleccionar...</option>
                                {localidades.map(l => (
                                    <option key={l.id} value={l.id}>{l.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">PROVINCIA</label>
                            <select
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                {...register('provincia')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const form = e.target.form;
                                        const index = Array.prototype.indexOf.call(form, e.target);
                                        form.elements[index + 1].focus();
                                    }
                                }}
                            >
                                <option value="">Seleccionar...</option>
                                {provincias.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Fila 3: Contacto y Comercial */}
                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">TELÉFONO</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone size={16} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                    {...register('telefono')}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const form = e.target.form;
                                            const index = Array.prototype.indexOf.call(form, e.target);
                                            form.elements[index + 1].focus();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">EMAIL</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                placeholder="email@ejemplo.com"
                                {...register('email')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const form = e.target.form;
                                        const index = Array.prototype.indexOf.call(form, e.target);
                                        form.elements[index + 1].focus();
                                    }
                                }}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">LISTA DE PRECIOS</label>
                            <select
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                {...register('lista_precio')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const form = e.target.form;
                                        const index = Array.prototype.indexOf.call(form, e.target);
                                        form.elements[index + 1].focus();
                                    }
                                }}
                            >
                                <option value="1">Efectivo / Contado</option>
                                <option value="2">Cuenta Corriente</option>
                                <option value="3">Tarjeta</option>
                                <option value="4">Mayorista</option>
                            </select>
                        </div>

                        {/* Fila 4: Crédito y Notas */}
                        <div className="col-span-12 md:col-span-3">
                            <label className="block text-xs font-bold text-slate-500 mb-1">LÍMITE CRÉDITO ($)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard size={16} className={`text-slate-400 ${!tieneCtacte ? 'opacity-50' : ''}`} />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm ${!tieneCtacte ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                                    {...register('limite_credito')}
                                    disabled={!tieneCtacte}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const form = e.target.form;
                                            const index = Array.prototype.indexOf.call(form, e.target);
                                            form.elements[index + 1].focus();
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-5 flex items-end gap-3 pb-1">
                            <div className="flex-1 bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between shadow-sm">
                                <label className="text-xs font-bold text-slate-600 mb-0 cursor-pointer" htmlFor="ctacteSwitch">CTA. CTE.</label>
                                <div className="form-check form-switch m-0 min-h-0 flex items-center">
                                    <input className="form-check-input cursor-pointer" type="checkbox" role="switch" id="ctacteSwitch" {...register('tiene_ctacte')} style={{ transform: 'scale(1.1)', marginTop: 0 }} />
                                </div>
                            </div>
                            <div className="flex-1 bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between shadow-sm">
                                <label className="text-xs font-bold text-slate-600 mb-0 cursor-pointer" htmlFor="activoSwitch">ACTIVO</label>
                                <div className="form-check form-switch m-0 min-h-0 flex items-center">
                                    <input className="form-check-input cursor-pointer" type="checkbox" role="switch" id="activoSwitch" {...register('activo')} style={{ transform: 'scale(1.1)', marginTop: 0 }} />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">OBSERVACIONES</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <StickyNote size={16} className="text-slate-400" />
                                </div>
                                <textarea
                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                    rows="1"
                                    placeholder="Notas internas..."
                                    {...register('notas')}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            // Allow normal enter
                                        }
                                    }}
                                ></textarea>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="cliente-form"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Save size={18} strokeWidth={2.5} />
                        {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClienteForm;
