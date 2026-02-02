import React, { useState, useEffect } from 'react';
import { Tag, TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, Save, RefreshCw, CheckCircle, X } from 'lucide-react';
import { showSuccessAlert, showWarningAlert, showConfirmationAlert } from '../utils/alerts';

const ActualizarPrecios = () => {
    // State
    const [scope, setScope] = useState('todos'); // todos, rubro, marca
    const [selectedRubro, setSelectedRubro] = useState('');
    const [selectedMarca, setSelectedMarca] = useState('');

    const [rubros, setRubros] = useState([]);
    const [marcas, setMarcas] = useState([]);

    const [operationType, setOperationType] = useState('increase'); // increase, decrease
    const [valueType, setValueType] = useState('PORCENTAJE'); // PORCENTAJE, MONTO
    const [value, setValue] = useState('');

    const [selectedFields, setSelectedFields] = useState({
        costo: false,
        precio_efectivo: true,
        precio_tarjeta: true,
        precio_ctacte: true,
        precio_lista4: false
    });

    const [loading, setLoading] = useState(false);

    // Fetch master data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resRubros, resMarcas] = await Promise.all([
                    fetch('/api/rubros/listar/').then(r => r.json()),
                    fetch('/api/marcas/listar/').then(r => r.json())
                ]);

                // Asegurar que sean arrays
                const rubrosData = resRubros.rubros || resRubros.data || resRubros;
                const marcasData = resMarcas.marcas || resMarcas.data || resMarcas;

                setRubros(Array.isArray(rubrosData) ? rubrosData : []);
                setMarcas(Array.isArray(marcasData) ? marcasData : []);
            } catch (err) {
                console.error("Error loading master data", err);
                setRubros([]);
                setMarcas([]);
            }
        };
        fetchData();
    }, []);

    const handleFieldToggle = (field) => {
        setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async () => {
        // Validation
        const fieldsToUpdate = Object.keys(selectedFields).filter(k => selectedFields[k]);
        if (fieldsToUpdate.length === 0) {
            showWarningAlert('Error', 'Debes seleccionar al menos un precio para actualizar.');
            return;
        }
        if (!value || isNaN(parseFloat(value))) {
            showWarningAlert('Error', 'Ingresa un valor numérico válido.');
            return;
        }
        if (scope === 'rubro' && !selectedRubro) {
            showWarningAlert('Error', 'Selecciona un rubro.');
            return;
        }
        if (scope === 'marca' && !selectedMarca) {
            showWarningAlert('Error', 'Selecciona una marca.');
            return;
        }

        // Confirmación con diseño premium
        const result = await showConfirmationAlert(
            '¿Confirmar Actualización?',
            '¿Estás seguro de aplicar esta actualización masiva? Esta acción no se puede deshacer.',
            'SÍ, APLICAR',
            'danger'
        );

        if (!result.isConfirmed) return;

        setLoading(true);

        // Calculate actual value based on increase/decrease
        let finalValue = parseFloat(value);
        if (operationType === 'decrease') {
            finalValue = -finalValue;
        }

        const payload = {
            tipo_actualizacion: valueType,
            valor: finalValue,
            campos: fieldsToUpdate,
            rubros: scope === 'rubro' ? [parseInt(selectedRubro)] : [],
            marcas: scope === 'marca' ? [parseInt(selectedMarca)] : [],
            productos: [] // Future: support specific product selection
        };

        try {
            // Get CSRF Token
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

            const response = await fetch('/api/precios/actualizar-masivo/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.ok) {
                await showSuccessAlert('¡Actualización Exitosa!', data.mensaje || 'Precios actualizados correctamente.');
                setValue('');
            } else {
                showWarningAlert('Error', data.error || 'Ocurrió un error al actualizar.');
            }
        } catch (err) {
            showWarningAlert('Error', 'Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex flex-col">
            <div className="flex-1 overflow-hidden p-6 flex flex-col">

                {/* Header - Compacto */}
                <div className="mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2 rounded-xl text-white shadow-md">
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Actualización Masiva de Precios</h1>
                            <p className="text-sm text-slate-600 font-medium mt-0.5">
                                Ajusta los precios de tus productos globalmente, por rubro o marca.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">

                    {/* COLUMNA IZQUIERDA - Configuración */}
                    <div className="space-y-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>

                        {/* Card 1: Alcance */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                    1
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Alcance</h3>
                            </div>

                            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 mb-3">
                                {['todos', 'rubro', 'marca'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setScope(opt)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-black capitalize transition-all ${scope === opt
                                            ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            {scope === 'rubro' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1 ml-1">Seleccionar Rubro</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-800"
                                        value={selectedRubro}
                                        onChange={(e) => setSelectedRubro(e.target.value)}
                                    >
                                        <option value="">-- Elige un Rubro --</option>
                                        {rubros.map(r => (
                                            <option key={r.id} value={r.id}>{r.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {scope === 'marca' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1 ml-1">Seleccionar Marca</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-800"
                                        value={selectedMarca}
                                        onChange={(e) => setSelectedMarca(e.target.value)}
                                    >
                                        <option value="">-- Elige una Marca --</option>
                                        {marcas.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Card 2: Ajuste */}
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                    2
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Ajuste</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {/* Operation Type */}
                                <div className="bg-slate-50 p-1 rounded-lg flex border border-slate-200">
                                    <button
                                        onClick={() => setOperationType('increase')}
                                        className={`flex-1 py-2 rounded-md text-xs font-black flex items-center justify-center gap-1 transition-all ${operationType === 'increase' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <TrendingUp size={14} strokeWidth={3} /> Aumentar
                                    </button>
                                    <button
                                        onClick={() => setOperationType('decrease')}
                                        className={`flex-1 py-2 rounded-md text-xs font-black flex items-center justify-center gap-1 transition-all ${operationType === 'decrease' ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <TrendingDown size={14} strokeWidth={3} /> Disminuir
                                    </button>
                                </div>

                                {/* Value Type */}
                                <div className="bg-slate-50 p-1 rounded-lg flex border border-slate-200">
                                    <button
                                        onClick={() => setValueType('PORCENTAJE')}
                                        className={`flex-1 py-2 rounded-md text-xs font-black flex items-center justify-center gap-1 transition-all ${valueType === 'PORCENTAJE' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <Percent size={14} strokeWidth={3} /> %
                                    </button>
                                    <button
                                        onClick={() => setValueType('MONTO')}
                                        className={`flex-1 py-2 rounded-md text-xs font-black flex items-center justify-center gap-1 transition-all ${valueType === 'MONTO' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <DollarSign size={14} strokeWidth={3} /> Fijo
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">
                                    {valueType === 'MONTO' ? '$' : '%'}
                                </div>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={valueType === 'MONTO' ? "0.00" : "Ej: 15"}
                                    className="w-full pl-12 pr-4 py-3 text-2xl font-black text-slate-800 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA - Precios y Acción */}
                    <div className="flex flex-col min-h-0 bg-white rounded-2xl shadow-md border border-slate-200/50 overflow-hidden">

                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                    3
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Precios a Impactar</h3>
                            </div>
                        </div>

                        {/* Contenido scrolleable */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                            {[
                                { id: 'costo', label: 'Costo (Base)' },
                                { id: 'precio_efectivo', label: 'Precio Efectivo / Contado' },
                                { id: 'precio_tarjeta', label: 'Precio Tarjeta / Lista' },
                                { id: 'precio_ctacte', label: 'Precio Cuenta Corriente' },
                                { id: 'precio_lista4', label: 'Precio Mayorista' },
                            ].map(field => (
                                <label
                                    key={field.id}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedFields[field.id]
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className={`font-bold text-sm ${selectedFields[field.id] ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        {field.label}
                                    </span>
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedFields[field.id]
                                        ? 'bg-indigo-500 border-indigo-500 text-white'
                                        : 'border-slate-300 bg-white'
                                        }`}>
                                        {selectedFields[field.id] && <CheckCircle size={16} strokeWidth={3} />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedFields[field.id]}
                                        onChange={() => handleFieldToggle(field.id)}
                                    />
                                </label>
                            ))}
                        </div>

                        {/* Footer - Barra de acción */}
                        <div className="p-4 m-4 rounded-2xl bg-slate-900 text-white shadow-xl">
                            <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-xs mb-3 uppercase tracking-widest">
                                <AlertTriangle size={16} strokeWidth={3} />
                                <span>Cambios Permanentes</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-black text-white shadow-xl flex items-center justify-center gap-2 transition-all ${loading
                                    ? 'bg-slate-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" strokeWidth={3} />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} strokeWidth={3} />
                                        Aplicar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActualizarPrecios;
