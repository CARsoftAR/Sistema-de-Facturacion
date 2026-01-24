import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, CreditCard, MapPin, Phone, StickyNote, Users } from 'lucide-react';
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

const NuevoCliente = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // ==================== STATE ====================
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [nombre, setNombre] = useState('');
    const [cuit, setCuit] = useState('');
    const [condicionFiscal, setCondicionFiscal] = useState('CF'); // Default Confumidor Final
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [domicilio, setDomicilio] = useState('');
    const [localidad, setLocalidad] = useState('');
    const [provincia, setProvincia] = useState('');
    const [listaPrecio, setListaPrecio] = useState('1'); // Default Lista 1
    const [limiteCredito, setLimiteCredito] = useState(0);
    const [tieneCtacte, setTieneCtacte] = useState(false);
    const [activo, setActivo] = useState(true);
    const [notas, setNotas] = useState('');

    // Select Options
    const [provinciasOpts, setProvinciasOpts] = useState([]);
    const [localidadesOpts, setLocalidadesOpts] = useState([]);

    // ==================== REFS (Explicit Navigation) ====================
    const nombreRef = useRef(null);
    const cuitRef = useRef(null);
    const condicionRef = useRef(null);
    const telefonoRef = useRef(null);
    const emailRef = useRef(null);
    const domicilioRef = useRef(null);
    const localidadRef = useRef(null);
    const provinciaRef = useRef(null);
    const listaRef = useRef(null);
    const limiteRef = useRef(null);
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

    // 2. Load Auxiliaries (Provincias/Localidades)
    useEffect(() => {
        const fetchAux = async () => {
            try {
                const [resProv, resLoc] = await Promise.all([
                    fetch('/api/provincias/listar/'),
                    fetch('/api/localidades/listar/')
                ]);
                const dataProv = await resProv.json();
                const dataLoc = await resLoc.json();
                setProvinciasOpts(dataProv);
                setLocalidadesOpts(dataLoc);
            } catch (e) {
                console.error("Error cargando auxiliares:", e);
                showWarningAlert("Error", "No se pudieron cargar listas de provincias/localidades.");
            }
        };
        fetchAux();
    }, []);

    // 3. Load Client if Edit Mode
    useEffect(() => {
        if (id) {
            const fetchCliente = async () => {
                try {
                    const res = await fetch(`/api/clientes/${id}/`);
                    if (!res.ok) throw new Error("Cliente no encontrado");
                    const data = await res.json();

                    // Populate State
                    setNombre(data.nombre || '');
                    setCuit(data.cuit || '');
                    setCondicionFiscal(data.condicion_fiscal || 'CF');
                    setTelefono(data.telefono || '');
                    setEmail(data.email || '');
                    setDomicilio(data.domicilio || '');
                    setLocalidad(data.localidad || ''); // Assuming ID comes back
                    setProvincia(data.provincia || ''); // Assuming ID comes back
                    setListaPrecio(data.lista_precio ? data.lista_precio.toString() : '1');
                    setLimiteCredito(data.limite_credito ? parseFloat(data.limite_credito) : 0);
                    setTieneCtacte(data.tiene_ctacte || false);
                    setActivo(data.activo !== false); // Default true if undefined
                    setNotas(data.notas || '');

                } catch (e) {
                    console.error("Error cargando cliente:", e);
                    showWarningAlert("Error", "No se pudo cargar el cliente.");
                    navigate('/clientes');
                } finally {
                    setLoading(false);
                }
            };
            fetchCliente();
        } else {
            setLoading(false);
        }
    }, [id, navigate]);

    // 4. Auto-reset credit limit
    useEffect(() => {
        if (!tieneCtacte) setLimiteCredito(0);
    }, [tieneCtacte]);


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
        // 1. Validation
        if (!nombre.trim()) {
            showWarningAlert("Campo Requerido", "El Nombre / Razón Social es obligatorio.");
            return;
        }

        const cuitSanitized = cuit.replace(/\D/g, '');

        const formData = new FormData();
        formData.append('nombre', nombre.trim());
        formData.append('cuit', cuitSanitized);
        formData.append('condicion_fiscal', condicionFiscal);
        formData.append('telefono', telefono.trim());
        formData.append('email', email.trim());
        formData.append('domicilio', domicilio.trim());
        if (localidad) formData.append('localidad', localidad);
        if (provincia) formData.append('provincia', provincia);
        formData.append('lista_precio', listaPrecio);
        formData.append('limite_credito', limiteCredito);
        formData.append('tiene_ctacte', tieneCtacte ? 'on' : 'off');
        formData.append('activo', activo ? 'on' : 'off');
        formData.append('notas', notas.trim());

        // 3. Send Request
        setSaving(true);
        const url = id ? `/api/clientes/${id}/editar/` : '/api/clientes/nuevo/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData
            });

            const result = await response.json();

            if (!result.ok) {
                // Handle Error
                let msg = 'Error al guardar.';
                if (result.errors) {
                    msg = Object.values(result.errors).flat().join(', ');
                } else if (result.error) {
                    msg = result.error;
                }
                showWarningAlert("Atención", msg);
            } else {
                // Success
                await showSuccessAlert(
                    "Éxito",
                    id ? "Cliente actualizado correctamente." : "Cliente creado correctamente.",
                    undefined,
                    { timer: 1500, showConfirmButton: false }
                );

                if (id) {
                    // Update mode: Return to list (or stay, but list is standard)
                    navigate('/clientes');
                } else {
                    // Create mode: Reset form for rapid entry
                    setNombre('');
                    setCuit('');
                    setCondicionFiscal('CF');
                    setTelefono('');
                    setEmail('');
                    setDomicilio('');
                    setLocalidad('');
                    setProvincia('');
                    setListaPrecio('1');
                    setLimiteCredito(0);
                    setTieneCtacte(false);
                    setActivo(true);
                    setNotas('');

                    // Refocus Name
                    setTimeout(() => {
                        nombreRef.current?.focus();
                    }, 100);
                }
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

                {/* LEFT COLUMN: Header & Info */}
                <div className="lg:col-span-4 flex flex-col gap-4 pr-1">
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

                    {/* Resumen Card (Optional visual filler) */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                                {nombre ? nombre.substring(0, 2).toUpperCase() : '?'}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-slate-800 truncate">{nombre || 'Nuevo Cliente'}</h3>
                                <p className="text-sm text-slate-500">{cuit || 'Sin Identificación'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Form */}
                <div className="lg:col-span-8 flex flex-col h-full min-h-0">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="flex flex-col gap-6">

                                {/* SECTION 1 */}
                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <User size={14} /> Información General
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        {/* Nombre */}
                                        <div className="col-span-12 md:col-span-8">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">NOMBRE / RAZÓN SOCIAL <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                                                <input
                                                    ref={nombreRef}
                                                    type="text"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800 transition-all"
                                                    placeholder="Nombre del cliente..."
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                    onKeyDown={(e) => handleEnter(e, cuitRef)} // -> CUIT
                                                />
                                            </div>
                                        </div>

                                        {/* CUIT */}
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CUIT / DNI</label>
                                            <input
                                                ref={cuitRef}
                                                type="text"
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                placeholder="Sin guiones"
                                                value={cuit}
                                                onChange={(e) => setCuit(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, condicionRef)} // -> CONDICION
                                            />
                                        </div>

                                        {/* Condición Fiscal */}
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CONDICIÓN FISCAL</label>
                                            <select
                                                ref={condicionRef}
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                value={condicionFiscal}
                                                onChange={(e) => setCondicionFiscal(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, telefonoRef)} // -> TELEFONO
                                            >
                                                <option value="CF">Consumidor Final</option>
                                                <option value="RI">Responsable Inscripto</option>
                                                <option value="MT">Monotributo</option>
                                                <option value="EX">Exento</option>
                                            </select>
                                        </div>

                                        {/* Teléfono */}
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
                                                    onKeyDown={(e) => handleEnter(e, emailRef)} // -> EMAIL
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">EMAIL</label>
                                            <input
                                                ref={emailRef}
                                                type="email"
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                placeholder="email@ejemplo.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, domicilioRef)} // -> DOMICILIO
                                            />
                                        </div>

                                        {/* Domicilio */}
                                        <div className="col-span-12 md:col-span-6">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">DOMICILIO</label>
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                                                <input
                                                    ref={domicilioRef}
                                                    type="text"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                    placeholder="Calle, altura..."
                                                    value={domicilio}
                                                    onChange={(e) => setDomicilio(e.target.value)}
                                                    onKeyDown={(e) => handleEnter(e, localidadRef)} // -> LOCALIDAD
                                                />
                                            </div>
                                        </div>

                                        {/* Localidad */}
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">LOCALIDAD</label>
                                            <select
                                                ref={localidadRef}
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                value={localidad}
                                                onChange={(e) => setLocalidad(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, provinciaRef)} // -> PROVINCIA
                                            >
                                                <option value="">Seleccionar...</option>
                                                {localidadesOpts.map(l => (
                                                    <option key={l.id} value={l.id}>{l.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Provincia */}
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">PROVINCIA</label>
                                            <select
                                                ref={provinciaRef}
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                                value={provincia}
                                                onChange={(e) => setProvincia(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, listaRef)} // -> LISTA PRECIOS
                                            >
                                                <option value="">Seleccionar...</option>
                                                {provinciasOpts.map(p => (
                                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>
                                </div>

                                {/* SECTION 2 */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CreditCard size={14} /> Configuración Comercial
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        {/* Lista Precio */}
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">LISTA DE PRECIOS</label>
                                            <select
                                                ref={listaRef}
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50 transition-all cursor-pointer hover:bg-white"
                                                value={listaPrecio}
                                                onChange={(e) => setListaPrecio(e.target.value)}
                                                onKeyDown={(e) => handleEnter(e, limiteRef)} // -> LIMITE
                                            >
                                                <option value="1">Efectivo / Contado</option>
                                                <option value="2">Cuenta Corriente</option>
                                                <option value="3">Tarjeta</option>
                                                <option value="4">Mayorista</option>
                                            </select>
                                        </div>

                                        {/* Limite Credito */}
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">LÍMITE CRÉDITO ($)</label>
                                            <div className="relative">
                                                <CreditCard size={16} className={`absolute left-3 top-3 text-slate-400 ${!tieneCtacte ? 'opacity-50' : ''}`} />
                                                <input
                                                    ref={limiteRef}
                                                    type="number"
                                                    step="0.01"
                                                    className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-medium transition-all ${!tieneCtacte ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                                                    value={limiteCredito}
                                                    onChange={(e) => setLimiteCredito(e.target.value)}
                                                    disabled={!tieneCtacte}
                                                    onKeyDown={(e) => handleEnter(e, notasRef)} // -> NOTAS
                                                />
                                            </div>
                                        </div>

                                        {/* Cta Cte Switch */}
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CTA. CTE.</label>
                                            <div className={`w-full px-3 py-2.5 border rounded-xl flex items-center justify-between transition-all ${tieneCtacte ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                                <span className={`text-sm font-semibold ${tieneCtacte ? 'text-blue-700' : 'text-slate-400'}`}>
                                                    {tieneCtacte ? 'Habilitada' : 'No'}
                                                </span>
                                                <div className="form-check form-switch m-0 min-h-0 flex items-center">
                                                    <input
                                                        className="form-check-input cursor-pointer"
                                                        type="checkbox"
                                                        checked={tieneCtacte}
                                                        onChange={(e) => setTieneCtacte(e.target.checked)}
                                                        style={{ transform: 'scale(1.2)', marginLeft: 0 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activo Switch */}
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">ESTADO</label>
                                            <div className={`w-full px-3 py-2.5 border rounded-xl flex items-center justify-between transition-all ${activo ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                                                <span className={`text-sm font-semibold ${activo ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                    {activo ? 'Activo' : 'Baja'}
                                                </span>
                                                <div className="form-check form-switch m-0 min-h-0 flex items-center">
                                                    <input
                                                        className="form-check-input cursor-pointer"
                                                        type="checkbox"
                                                        checked={activo}
                                                        onChange={(e) => setActivo(e.target.checked)}
                                                        style={{ transform: 'scale(1.2)', marginLeft: 0 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Observaciones */}
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
                                                    onKeyDown={(e) => handleEnter(e, saveBtnRef)} // -> SAVE BTN
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-4 m-3 mb-6 rounded-2xl bg-slate-900 text-white flex justify-end items-center gap-4 shadow-xl ring-1 ring-white/10 flex-shrink-0">
                            <BtnCancel onClick={() => navigate('/clientes')} label="Cancelar" className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-none" />
                            <BtnSave
                                ref={saveBtnRef}
                                onClick={handleSave}
                                loading={saving}
                                label={saving ? 'Guardando...' : (id ? 'Actualizar Cliente' : 'Guardar Cliente')}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30"
                            />
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default NuevoCliente;
