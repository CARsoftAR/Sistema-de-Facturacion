import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, AlertCircle, User, CreditCard, MapPin, Phone, StickyNote, X, Users } from 'lucide-react';
import { BtnCancel, BtnSave, BtnBack } from '../components/CommonButtons';
import Swal from 'sweetalert2';

const NuevoCliente = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm();

    // Auxiliares
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [serverError, setServerError] = useState(null);
    const [loading, setLoading] = useState(!!id);

    const tieneCtacte = watch('tiene_ctacte');

    // Effect for limite credito auto-reset
    useEffect(() => {
        if (!tieneCtacte) {
            setValue('limite_credito', 0);
        }
    }, [tieneCtacte, setValue]);

    // Load Data
    useEffect(() => {
        const fetchAux = async () => {
            try {
                const [resProv, resLoc] = await Promise.all([
                    fetch('/api/provincias/listar/'),
                    fetch('/api/localidades/listar/')
                ]);
                const dataProv = await resProv.json();
                const dataLoc = await resLoc.json();

                setProvincias(dataProv);
                setLocalidades(dataLoc);

                if (id) {
                    await fetchCliente(id);
                } else {
                    reset({
                        condicion_fiscal: 'CF',
                        lista_precio: '1',
                        limite_credito: 0,
                        activo: true,
                        tiene_ctacte: false
                    });
                    setLoading(false);
                }
            } catch (e) {
                console.error("Error cargando auxiliares", e);
                setServerError("Error al cargar datos.");
                setLoading(false);
            }
        };
        fetchAux();
    }, [id, reset]);

    const fetchCliente = async (clienteId) => {
        try {
            const res = await fetch(`/api/clientes/${clienteId}/`);
            if (!res.ok) throw new Error("Cliente no encontrado");
            const cliente = await res.json();

            reset({
                nombre: cliente.nombre,
                cuit: cliente.cuit || '',
                condicion_fiscal: cliente.condicion_fiscal || 'CF',
                telefono: cliente.telefono || '',
                email: cliente.email || '',
                domicilio: cliente.domicilio || '',
                localidad: cliente.localidad_id || '', // Assuming API returns raw ID or relationship? ClienteForm uses 'localidad', likely ID for select
                provincia: cliente.provincia_id || '', // Same assumptions
                lista_precio: cliente.lista_precio || '1',
                limite_credito: cliente.limite_credito || 0,
                notas: cliente.notas || '',
                activo: cliente.activo !== false,
                tiene_ctacte: cliente.tiene_ctacte || false
            });
            // Note: If API structure differs from what reset expects (e.g. nested objects), might need mapping.
            // ClienteForm used `cliente.localidad` directly in select? Let's check. 
            // Standardizing assuming simplest case or that ClientForm was correct.
        } catch (e) {
            setServerError("No se pudo cargar el cliente.");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setServerError(null);
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                if (key === 'activo' || key === 'tiene_ctacte') {
                    formData.append(key, data[key] ? 'on' : 'off');
                } else {
                    formData.append(key, data[key]);
                }
            }
        });

        const url = id
            ? `/api/clientes/${id}/editar/`
            : '/api/clientes/nuevo/';

        try {
            const response = await fetch(url, {
                method: 'POST',
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

            Swal.fire({
                title: 'Éxito',
                text: id ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/clientes');
        } catch (error) {
            setServerError('Error de conexión con el servidor.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;
            e.preventDefault();
            const form = e.target.form;
            if (!form) return;
            const elements = Array.from(form.elements).filter(el =>
                !el.disabled && !el.hidden && el.offsetParent !== null && el.tabIndex !== -1 &&
                (el.tagName === 'INPUT' || el.tagName === 'SELECT')
            );
            const index = elements.indexOf(e.target);
            if (index > -1 && index < elements.length - 1) {
                elements[index + 1].focus();
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* LEFT COLUMN: Header & Info */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1">
                    {/* Header: Back Button & Title Stacked */}
                    <div>
                        <BtnBack onClick={() => navigate('/clientes')} />
                    </div>

                    <div className="flex-shrink-0">
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <Users className="text-blue-600" size={32} />
                            {id ? 'Editar Cliente' : 'Nuevo Cliente'}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm ml-10">
                            {id ? 'Actualizando datos del cliente' : 'Complete la ficha para dar de alta un cliente'}
                        </p>
                    </div>

                    {serverError && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <span className="font-medium text-sm">{serverError}</span>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Form */}
                <div className="lg:col-span-8 flex flex-col h-full min-h-0">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <form id="cliente-form" onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="flex flex-col gap-6">

                                {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <User size={14} /> Información General
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6">
                                        {/* Row 1: Identificación */}
                                        <div className="col-span-12 md:col-span-8">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">NOMBRE / RAZÓN SOCIAL <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User size={16} className="text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all ${errors.nombre ? 'border-red-300' : ''}`}
                                                    placeholder="Nombre del cliente..."
                                                    {...register('nombre', { required: 'Requerido' })}
                                                    onKeyDown={handleKeyDown}
                                                />
                                            </div>
                                            {errors.nombre && <div className="text-red-500 text-xs mt-1">{errors.nombre.message}</div>}
                                        </div>

                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CUIT / DNI</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm transition-all"
                                                placeholder="Sin guiones"
                                                {...register('cuit')}
                                                onKeyDown={handleKeyDown}
                                            />
                                        </div>

                                        {/* Row 2: Contacto & Condición */}
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CONDICIÓN FISCAL</label>
                                            <select
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm transition-all"
                                                {...register('condicion_fiscal')}
                                                onKeyDown={handleKeyDown}
                                            >
                                                <option value="CF">Consumidor Final</option>
                                                <option value="RI">Responsable Inscripto</option>
                                                <option value="MT">Monotributo</option>
                                                <option value="EX">Exento</option>
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">TELÉFONO</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone size={16} className="text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm transition-all"
                                                    {...register('telefono')}
                                                    onKeyDown={handleKeyDown}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">EMAIL</label>
                                            <input
                                                type="email"
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm transition-all"
                                                placeholder="email@ejemplo.com"
                                                {...register('email')}
                                                onKeyDown={handleKeyDown}
                                            />
                                        </div>

                                        {/* Row 3: Domicilio */}
                                        <div className="col-span-12 md:col-span-6">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">DOMICILIO</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPin size={16} className="text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm transition-all"
                                                    placeholder="Calle, altura..."
                                                    {...register('domicilio')}
                                                    onKeyDown={handleKeyDown}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">LOCALIDAD</label>
                                            <select
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm transition-all"
                                                {...register('localidad')}
                                                onKeyDown={handleKeyDown}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {localidades.map(l => (
                                                    <option key={l.id} value={l.id}>{l.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">PROVINCIA</label>
                                            <select
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm transition-all"
                                                {...register('provincia')}
                                                onKeyDown={handleKeyDown}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {provincias.map(p => (
                                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 2: DATOS COMERCIALES */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CreditCard size={14} /> Configuración Comercial
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6">

                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">LISTA DE PRECIOS</label>
                                            <select
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm transition-all"
                                                {...register('lista_precio')}
                                                onKeyDown={handleKeyDown}
                                            >
                                                <option value="1">Efectivo / Contado</option>
                                                <option value="2">Cuenta Corriente</option>
                                                <option value="3">Tarjeta</option>
                                                <option value="4">Mayorista</option>
                                            </select>
                                        </div>

                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">LÍMITE CRÉDITO ($)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <CreditCard size={16} className={`text-slate-400 ${!tieneCtacte ? 'opacity-50' : ''}`} />
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm font-medium transition-all ${!tieneCtacte ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                                                    {...register('limite_credito')}
                                                    disabled={!tieneCtacte}
                                                    onKeyDown={handleKeyDown}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CTA. CTE.</label>
                                            <div className={`w-full px-3 py-2.5 border rounded-xl flex items-center justify-between transition-all ${tieneCtacte ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                                <span className={`text-sm font-semibold ${tieneCtacte ? 'text-blue-700' : 'text-slate-400'}`}>
                                                    {tieneCtacte ? 'Si' : 'No'}
                                                </span>
                                                <div className="form-check form-switch m-0 min-h-0 flex items-center">
                                                    <input className="form-check-input cursor-pointer" type="checkbox" role="switch" id="ctacteSwitch" {...register('tiene_ctacte')} style={{ transform: 'scale(1.2)', marginLeft: 0 }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">ESTADO</label>
                                            <div className={`w-full px-3 py-2.5 border rounded-xl flex items-center justify-between transition-all ${watch('activo') ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                                                <span className={`text-sm font-semibold ${watch('activo') ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                    {watch('activo') ? 'Activo' : 'Baja'}
                                                </span>
                                                <div className="form-check form-switch m-0 min-h-0 flex items-center">
                                                    <input className="form-check-input cursor-pointer" type="checkbox" role="switch" id="activoSwitch" {...register('activo')} style={{ transform: 'scale(1.2)', marginLeft: 0 }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-12 mt-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">OBSERVACIONES</label>
                                            <div className="relative">
                                                <div className="absolute top-3 left-3 pointer-events-none">
                                                    <StickyNote size={16} className="text-slate-400" />
                                                </div>
                                                <textarea
                                                    className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm transition-all"
                                                    rows="2"
                                                    placeholder="Notas internas..."
                                                    {...register('notas')}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-slate-50 rounded-b-3xl border-t border-slate-100 flex justify-end gap-3">
                            <BtnCancel onClick={() => navigate('/clientes')} />
                            <BtnSave
                                form="cliente-form"
                                label={isSubmitting ? 'Guardando...' : (id ? 'Actualizar Cliente' : 'Guardar Cliente')}
                                loading={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NuevoCliente;
