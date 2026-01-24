import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, CreditCard, MapPin, Phone, StickyNote, Building2, Mail } from 'lucide-react';
import { BtnCancel, BtnSave, BtnBack } from '../components/CommonButtons';
import { showWarningAlert, showSuccessAlert } from '../utils/alerts';

// Helper for CSRF Token
function getCookie(name) {
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
}

const NuevoProveedor = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // ==================== STATE ====================
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [nombre, setNombre] = useState('');
    const [cuit, setCuit] = useState('');
    const [condicionFiscal, setCondicionFiscal] = useState('CF');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [direccion, setDireccion] = useState('');
    const [cbu, setCbu] = useState('');
    const [alias, setAlias] = useState('');
    const [notas, setNotas] = useState('');

    // ==================== REFS (Explicit Navigation) ====================
    const nombreRef = useRef(null);
    const cuitRef = useRef(null);
    const condicionRef = useRef(null);
    const telefonoRef = useRef(null);
    const emailRef = useRef(null);
    const direccionRef = useRef(null);
    const cbuRef = useRef(null);
    const aliasRef = useRef(null);
    const notasRef = useRef(null);
    const saveBtnRef = useRef(null);

    // ==================== EFFECTS ====================

    // 1. Focus first field
    useEffect(() => {
        if (!loading) {
            setTimeout(() => {
                nombreRef.current?.focus();
            }, 100);
        }
    }, [loading]);

    // 2. Load Provider if Edit Mode
    useEffect(() => {
        if (id) {
            const fetchProveedor = async () => {
                try {
                    const res = await fetch(`/api/proveedores/${id}/`);
                    if (!res.ok) throw new Error("Proveedor no encontrado");
                    const data = await res.json();

                    setNombre(data.nombre || '');
                    setCuit(data.cuit || '');
                    setCondicionFiscal(data.condicion_fiscal || 'CF');
                    setTelefono(data.telefono || '');
                    setEmail(data.email || '');
                    setDireccion(data.direccion || '');
                    setCbu(data.cbu || '');
                    setAlias(data.alias || '');
                    setNotas(data.notas || '');

                } catch (e) {
                    console.error("Error cargando proveedor:", e);
                    showWarningAlert("Error", "No se pudo cargar el proveedor.");
                    navigate('/proveedores');
                } finally {
                    setLoading(false);
                }
            };
            fetchProveedor();
        } else {
            setLoading(false);
        }
    }, [id, navigate]);

    // ==================== HANDLERS ====================

    // Generic Enter Handler
    const handleEnter = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextRef?.current?.focus();
            // Optional: select text if it's an input
            if (nextRef?.current?.tagName === 'INPUT') {
                nextRef.current.select();
            }
        }
    };

    const handleSave = async () => {
        if (!nombre.trim()) {
            showWarningAlert("Campo Requerido", "El Nombre / Razón Social es obligatorio.");
            return;
        }

        const formData = new FormData();
        formData.append('nombre', nombre.trim());
        formData.append('cuit', cuit);
        formData.append('condicion_fiscal', condicionFiscal);
        formData.append('telefono', telefono.trim());
        formData.append('email', email.trim());
        formData.append('direccion', direccion.trim());
        formData.append('cbu', cbu.trim());
        formData.append('alias', alias.trim());
        formData.append('notas', notas.trim());

        setSaving(true);
        const url = id ? `/api/proveedores/${id}/editar/` : '/api/proveedores/nuevo/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') },
                body: formData
            });

            const result = await response.json();

            if (!result.ok && !result.id && !response.ok) { // Check for various success indicators depending on backend return
                // Some backends return {id: ...} on success, others {ok: true}
                // Let's assume !response.ok is strict failure, or result.error exists
                let msg = 'Error al guardar.';
                if (result.errors) msg = Object.values(result.errors).flat().join(', ');
                else if (result.error) msg = result.error;

                // If the backend returns just the object created (with ID), it's a success
                if (result.id) {
                    // actually success, proceed below
                } else {
                    showWarningAlert("Atención", msg);
                    setSaving(false);
                    return;
                }
            }

            // Success
            await showSuccessAlert(
                "Éxito",
                id ? "Proveedor actualizado correctamente." : "Proveedor creado correctamente.",
                undefined,
                { timer: 1500, showConfirmButton: false }
            );

            if (id) {
                navigate('/proveedores');
            } else {
                // Create mode: Reset form for rapid entry
                setNombre('');
                setCuit('');
                setCondicionFiscal('CF');
                setTelefono('');
                setEmail('');
                setDireccion('');
                setCbu('');
                setAlias('');
                setNotas('');

                // Refocus Name
                setTimeout(() => {
                    nombreRef.current?.focus();
                }, 100);
            }

        } catch (e) {
            console.error("Error al guardar:", e);
            showWarningAlert("Error", "Error de conexión o problema en el servidor.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Cargando datos...</div>;

    return (
        <div className="p-6 pb-0 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-4 flex flex-col gap-4 pr-1">
                    <div><BtnBack onClick={() => navigate('/proveedores')} /></div>
                    <div className="flex-shrink-0">
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <Truck className="text-blue-600" size={32} />
                            {id ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm ml-10">
                            {id ? 'Actualizando datos del proveedor' : 'Complete la ficha para dar de alta un proveedor'}
                        </p>
                    </div>

                    {/* Resumen Card */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                                {nombre ? nombre.substring(0, 2).toUpperCase() : '?'}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-slate-800 truncate">{nombre || 'Nuevo Proveedor'}</h3>
                                <p className="text-sm text-slate-500">{cuit || 'Sin Identificación'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-8 flex flex-col h-full min-h-0">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="flex flex-col gap-6">

                                {/* SECTION 1: DATOS PRINCIPALES */}
                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Building2 size={14} /> Información General
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="col-span-12 md:col-span-8">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">RAZÓN SOCIAL / NOMBRE <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <Building2 size={16} className="absolute left-3 top-3 text-slate-400" />
                                                <input
                                                    ref={nombreRef}
                                                    type="text"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800 transition-all"
                                                    placeholder="Nombre del proveedor..."
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                    onKeyDown={(e) => handleEnter(e, cuitRef)}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CUIT / DNI</label>
                                            <input
                                                ref={cuitRef}
                                                type="text"
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                placeholder="Sin guiones"
                                                value={cuit}
                                                onChange={(e) => setCuit(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, condicionRef)}
                                            />
                                        </div>

                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CONDICIÓN FISCAL</label>
                                            <select
                                                ref={condicionRef}
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                value={condicionFiscal}
                                                onChange={(e) => setCondicionFiscal(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, telefonoRef)}
                                            >
                                                <option value="RI">Responsable Inscripto</option>
                                                <option value="MO">Monotributista</option>
                                                <option value="EX">Exento</option>
                                                <option value="CF">Consumidor Final</option>
                                            </select>
                                        </div>

                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">TELÉFONO</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                                                <input
                                                    ref={telefonoRef}
                                                    type="text"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                    value={telefono}
                                                    onChange={(e) => setTelefono(e.target.value)}
                                                    onKeyDown={(e) => handleEnter(e, emailRef)}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">EMAIL</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                                                <input
                                                    ref={emailRef}
                                                    type="email"
                                                    className="w-full pl-10 px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                    placeholder="email@ejemplo.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onKeyDown={(e) => handleEnter(e, direccionRef)}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-12">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">DIRECCIÓN</label>
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                                                <input
                                                    ref={direccionRef}
                                                    type="text"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                    placeholder="Calle, altura, localidad..."
                                                    value={direccion}
                                                    onChange={(e) => setDireccion(e.target.value)}
                                                    onKeyDown={(e) => handleEnter(e, cbuRef)}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* SECTION 2: DATOS BANCARIOS & NOTAS */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CreditCard size={14} /> Datos Bancarios y Notas
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                                        <div className="col-span-12 md:col-span-6">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CBU / CVU</label>
                                            <input
                                                ref={cbuRef}
                                                type="text"
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white transition-all font-mono"
                                                placeholder="22 dígitos"
                                                value={cbu}
                                                onChange={(e) => setCbu(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, aliasRef)}
                                            />
                                        </div>

                                        <div className="col-span-12 md:col-span-6">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">ALIAS</label>
                                            <input
                                                ref={aliasRef}
                                                type="text"
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white transition-all uppercase"
                                                placeholder="MI.ALIAS"
                                                value={alias}
                                                onChange={(e) => setAlias(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, notasRef)}
                                            />
                                        </div>

                                        <div className="col-span-12 mt-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">OBSERVACIONES</label>
                                            <div className="relative">
                                                <StickyNote size={16} className="absolute left-3 top-3 text-slate-400" />
                                                <textarea
                                                    ref={notasRef}
                                                    className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                    rows="2"
                                                    placeholder="Notas internas..."
                                                    value={notas}
                                                    onChange={(e) => setNotas(e.target.value)}
                                                    onKeyDown={(e) => handleEnter(e, saveBtnRef)}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-4 m-3 mb-6 rounded-2xl bg-slate-900 text-white flex justify-end items-center gap-4 shadow-xl ring-1 ring-white/10 flex-shrink-0">
                            <BtnCancel onClick={() => navigate('/proveedores')} label="Cancelar" className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-none" />
                            <BtnSave
                                ref={saveBtnRef}
                                onClick={handleSave}
                                loading={saving}
                                label={saving ? 'Guardando...' : (id ? 'Actualizar Proveedor' : 'Guardar Proveedor')}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30"
                            />
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default NuevoProveedor;
