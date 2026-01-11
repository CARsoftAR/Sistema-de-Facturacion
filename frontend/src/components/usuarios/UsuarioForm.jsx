import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, User, Mail, Lock, Shield, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { BtnSave, BtnCancel } from '../CommonButtons';

const permissionGroups = [
    {
        label: 'Comercial', permissions: [
            { id: 'ventas', label: 'Ventas' },
            { id: 'compras', label: 'Compras' },
            { id: 'pedidos', label: 'Pedidos' },
            { id: 'remitos', label: 'Remitos' },
            { id: 'productos', label: 'Productos' },
            { id: 'clientes', label: 'Clientes' },
            { id: 'proveedores', label: 'Proveedores' },
        ]
    },
    {
        label: 'Administración', permissions: [
            { id: 'caja', label: 'Caja' },
            { id: 'bancos', label: 'Bancos' },
            { id: 'ctacte', label: 'Ctas. Corrientes' },
            { id: 'contabilidad', label: 'Contabilidad' },
            { id: 'usuarios', label: 'Usuarios' },
            { id: 'reportes', label: 'Reportes' },
            { id: 'configuracion', label: 'Configuración' },
        ]
    }
];

const UsuarioForm = ({ usuario, onClose, onSave }) => {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm();
    const [serverError, setServerError] = useState(null);

    useEffect(() => {
        if (usuario) {
            reset({
                username: usuario.username,
                first_name: usuario.first_name || '',
                email: usuario.email || '',
                is_active: usuario.is_active,
                is_staff: usuario.is_staff,
                permisos: {
                    ventas: usuario.permisos?.ventas || false,
                    compras: usuario.permisos?.compras || false,
                    pedidos: usuario.permisos?.pedidos || false,
                    remitos: usuario.permisos?.remitos || false,
                    productos: usuario.permisos?.productos || false,
                    clientes: usuario.permisos?.clientes || false,
                    proveedores: usuario.permisos?.proveedores || false,
                    caja: usuario.permisos?.caja || false,
                    bancos: usuario.permisos?.bancos || false,
                    ctacte: usuario.permisos?.ctacte || false,
                    contabilidad: usuario.permisos?.contabilidad || false,
                    configuracion: usuario.permisos?.configuracion || false,
                    usuarios: usuario.permisos?.usuarios || false,
                    reportes: usuario.permisos?.reportes || false,
                }
            });
        } else {
            reset({
                username: '',
                first_name: '',
                email: '',
                is_active: true,
                is_staff: false,
                permisos: {
                    ventas: false,
                    compras: false,
                    pedidos: false,
                    remitos: false,
                    productos: false,
                    clientes: false,
                    proveedores: false,
                    caja: false,
                    bancos: false,
                    ctacte: false,
                    contabilidad: false,
                    configuracion: false,
                    usuarios: false,
                    reportes: false,
                }
            });
        }
    }, [usuario, reset]);

    // Watcher for Admin flag to sync permissions
    const isStaff = watch('is_staff');
    useEffect(() => {
        if (isStaff) {
            // If admin is active, auto-check all permissions
            const allPerms = {
                ventas: true,
                compras: true,
                pedidos: true,
                remitos: true,
                productos: true,
                clientes: true,
                proveedores: true,
                caja: true,
                bancos: true,
                ctacte: true,
                contabilidad: true,
                configuracion: true,
                usuarios: true,
                reportes: true,
            };
            setValue('permisos', allPerms);
        }
    }, [isStaff, setValue]);

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

    const onSubmit = async (data) => {
        setServerError(null);
        const url = usuario ? `/api/usuarios/${usuario.id}/editar/` : '/api/usuarios/crear/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.ok) {
                onSave();
                onClose();
            } else {
                setServerError(result.error || 'Ocurrió un error al guardar el usuario.');
            }
        } catch (err) {
            setServerError('Error de conexión con el servidor.');
        }
    };


    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col fade-in">
            {/* Header - Matching Standard */}
            <div className="mb-6 flex-shrink-0 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                        <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h1>
                        <p className="text-slate-500 font-medium ml-1">
                            {usuario ? `Configurando perfil de ${usuario.first_name || usuario.username}` : 'Registrar un nuevo perfil de acceso'}
                        </p>
                    </div>
                </div>
                <BtnCancel label="Volver" onClick={onClose} className="px-5 shadow-sm" />
            </div>

            {serverError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-1 shadow-sm">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span className="font-semibold">{serverError}</span>
                </div>
            )}

            {/* Layout principal - 4/8 Column Split like New Sale */}
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}
            </style>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">

                {/* COLUMNA IZQUIERDA: DATOS GENERALES (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">

                    {/* Card: Información Personal */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                <User size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Información Personal</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="text-start">
                                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">Nombre Completo <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 font-medium transition-all ${errors.first_name ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                                        placeholder="Ej: Juan Pérez"
                                        {...register('first_name', { required: 'El nombre es requerido' })}
                                    />
                                </div>
                            </div>

                            <div className="text-start">
                                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">Usuario / Email <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 font-medium transition-all ${errors.username ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                                        placeholder="usuario@empresa.com"
                                        {...register('username', { required: 'El usuario es requerido' })}
                                    />
                                    <input type="hidden" {...register('email')} />
                                </div>
                            </div>

                            <div className="text-start">
                                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">Contraseña {!usuario && <span className="text-red-500">*</span>}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50 font-medium transition-all text-sm"
                                        placeholder={usuario ? "Nueva clave para cambiar" : "********"}
                                        {...register('password', { required: usuario ? false : 'La contraseña es requerida' })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card: Estado y Roles */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700 text-lg">Estado y Rol</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all cursor-pointer group/row">
                                <div className="flex flex-col">
                                    <label className="font-bold text-slate-700 cursor-pointer" htmlFor="is_staff">ADMINISTRADOR</label>
                                    <span className="text-xs text-slate-400 font-medium">Permisos totales sobre el sistema</span>
                                </div>
                                <div className="form-check form-switch m-0 scale-125">
                                    <input className="form-check-input cursor-pointer shadow-sm" type="checkbox" role="switch" id="is_staff" {...register('is_staff')} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all cursor-pointer group/row">
                                <div className="flex flex-col">
                                    <label className="font-bold text-slate-700 cursor-pointer" htmlFor="is_active">USUARIO ACTIVO</label>
                                    <span className="text-xs text-slate-400 font-medium">Habilita o deshabilita el ingreso</span>
                                </div>
                                <div className="form-check form-switch m-0 scale-125">
                                    <input className="form-check-input cursor-pointer shadow-sm" type="checkbox" role="switch" id="is_active" {...register('is_active')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: PERMISOS (8 cols) */}
                <div className="lg:col-span-8 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">

                    {/* Header Permisos */}
                    <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Shield size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg tracking-tight">Permisos de Acceso</h2>
                                <p className="text-slate-500 text-xs font-medium">Gestiona qué módulos puede visualizar y operar el usuario</p>
                            </div>
                        </div>
                    </div>

                    {/* Selector de Permisos con Scroll Interno */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth no-scrollbar">
                        <form id="usuario-form" onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {permissionGroups.map((group, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="h-1 w-6 bg-blue-500 rounded-full"></div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{group.label}</p>
                                        </div>
                                        <div className="space-y-2">
                                            {group.permissions.map(perm => (
                                                <div key={perm.id} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group/item cursor-pointer">
                                                    <label className="font-bold text-slate-600 cursor-pointer mb-0 group-hover/item:text-blue-600 transition-colors" htmlFor={perm.id}>
                                                        {perm.label.toUpperCase()}
                                                    </label>
                                                    <div className="form-check form-switch m-0 scale-110">
                                                        <input className="form-check-input cursor-pointer" type="checkbox" role="switch" id={perm.id} {...register(`permisos.${perm.id}`)} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </form>
                    </div>

                    {/* Footer Acción Integrado - Dark Premium Style like New Sale */}
                    <div className="p-6 bg-slate-900 text-white flex-shrink-0 mt-auto rounded-b-3xl shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center gap-x-12">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5 backdrop-blur-md">
                                    <Save className="text-blue-400" size={24} />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none mb-1">Confirmar transacción</p>
                                    <p className="text-white text-lg font-bold leading-tight">Guardar cambios del perfil</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <BtnCancel onClick={onClose} className="px-6 bg-slate-800 border-white/10 text-white hover:bg-slate-700 transition-colors" />
                                <BtnSave
                                    form="usuario-form"
                                    label={isSubmitting ? 'Guardando...' : (usuario ? 'Actualizar Usuario' : 'Crear Usuario')}
                                    loading={isSubmitting}
                                    className="px-10 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default UsuarioForm;
