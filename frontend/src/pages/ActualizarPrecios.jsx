
import React, { useState, useEffect } from 'react';
import { Tag, TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, Save, RefreshCw, CheckCircle } from 'lucide-react';

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
    const [message, setMessage] = useState(null);

    // Fetch master data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resRubros, resMarcas] = await Promise.all([
                    fetch('/api/rubros/listar/').then(r => r.json()),
                    fetch('/api/marcas/listar/').then(r => r.json())
                ]);
                setRubros(resRubros.rubros || resRubros);
                setMarcas(resMarcas.marcas || resMarcas);
            } catch (err) {
                console.error("Error loading master data", err);
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
            setMessage({ type: 'error', text: 'Debes seleccionar al menos un precio para actualizar.' });
            return;
        }
        if (!value || isNaN(parseFloat(value))) {
            setMessage({ type: 'error', text: 'Ingresa un valor numérico válido.' });
            return;
        }
        if (scope === 'rubro' && !selectedRubro) {
            setMessage({ type: 'error', text: 'Selecciona un rubro.' });
            return;
        }
        if (scope === 'marca' && !selectedMarca) {
            setMessage({ type: 'error', text: 'Selecciona una marca.' });
            return;
        }

        if (!window.confirm("¿Estás seguro de aplicar esta actualización masiva? Esta acción no se puede deshacer.")) return;

        setLoading(true);
        setMessage(null);

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
                setMessage({ type: 'success', text: data.mensaje || 'Precios actualizados correctamente.' });
                setValue('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Ocurrió un error al actualizar.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de conexión.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    <RefreshCw className="text-blue-600" size={32} />
                    Actualización Masiva de Precios
                </h1>
                <p className="text-slate-500 font-medium ml-10">
                    Ajusta los precios de tus productos globalmente, por rubro o marca.
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm border-l-4 ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Configuration Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8">

                    {/* 1. Scope Selection */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">1</span>
                            Alcance
                        </h3>
                        <div className="flex gap-2 mb-4">
                            {['todos', 'rubro', 'marca'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setScope(opt)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${scope === opt
                                            ? 'bg-slate-800 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {scope === 'rubro' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar Rubro</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar Marca</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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

                    <hr className="border-slate-100" />

                    {/* 2. Operation & Value */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">2</span>
                            Ajuste
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Operation Type */}
                            <div className="bg-slate-50 p-1 rounded-lg flex">
                                <button
                                    onClick={() => setOperationType('increase')}
                                    className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-1 transition-all ${operationType === 'increase' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <TrendingUp size={16} /> Aumentar
                                </button>
                                <button
                                    onClick={() => setOperationType('decrease')}
                                    className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-1 transition-all ${operationType === 'decrease' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <TrendingDown size={16} /> Disminuir
                                </button>
                            </div>

                            {/* Value Type */}
                            <div className="bg-slate-50 p-1 rounded-lg flex">
                                <button
                                    onClick={() => setValueType('PORCENTAJE')}
                                    className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-1 transition-all ${valueType === 'PORCENTAJE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <Percent size={16} /> Porcentaje
                                </button>
                                <button
                                    onClick={() => setValueType('MONTO')}
                                    className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-1 transition-all ${valueType === 'MONTO' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <DollarSign size={16} /> Fijo
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                {valueType === 'MONTO' ? '$' : '%'}
                            </div>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={valueType === 'MONTO' ? "0.00" : "Ej: 15"}
                                className="w-full pl-10 pr-4 py-4 text-xl font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Fields & Actions Card */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">3</span>
                            Precios a Impactar
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: 'costo', label: 'Costo (Base)' },
                                { id: 'precio_efectivo', label: 'Precio Efectivo / Contado' },
                                { id: 'precio_tarjeta', label: 'Precio Tarjeta / Lista' },
                                { id: 'precio_ctacte', label: 'Precio Cuenta Corriente' },
                                { id: 'precio_lista4', label: 'Precio Mayorista' },
                            ].map(field => (
                                <label key={field.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                                    <span className="font-medium text-slate-700 group-hover:text-slate-900">{field.label}</span>
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${selectedFields[field.id] ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 bg-white'}`}>
                                        {selectedFields[field.id] && <CheckCircle size={14} className="fill-current" />}
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
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                        <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-sm mb-4">
                            <AlertTriangle size={18} />
                            <span>Atención: Cambios permanentes</span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                                }`}
                        >
                            {loading ? 'Procesando...' : (
                                <>
                                    <Save size={20} strokeWidth={2.5} />
                                    Aplicar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ActualizarPrecios;
