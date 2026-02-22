import React, { useState, useEffect } from 'react';
import { Tag, TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, Save, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { showSuccessAlert, showWarningAlert, showConfirmationAlert } from '../utils/alerts';
import { BentoCard } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';

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

        const result = await showConfirmationAlert(
            '¿Confirmar Actualización?',
            '¿Estás seguro de aplicar esta actualización masiva? Esta acción no se puede deshacer.',
            'SÍ, APLICAR',
            'danger'
        );

        if (!result.isConfirmed) return;

        setLoading(true);

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
            productos: []
        };

        try {
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
        <div className="h-screen overflow-hidden bg-white flex flex-col">
            <div className="flex-1 overflow-hidden p-8 flex flex-col gap-8 max-w-[1400px] mx-auto w-full">

                {/* Header */}
                <header className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-3 rounded-2xl text-white shadow-xl shadow-orange-200">
                            <RefreshCw size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase font-outfit">
                                Modificar Precios
                            </h1>
                            <p className="text-slate-500 font-medium text-sm mt-2">
                                Ajusta los precios de tus productos globalmente, por rubro o marca.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">

                    {/* COLUMNA IZQUIERDA - CONFIGURACIÓN */}
                    <div className="lg:col-span-6 space-y-6 overflow-y-auto pr-4 scrollbar-premium">

                        {/* Step 1: Alcance */}
                        <BentoCard className="p-8 border-slate-100" hover={false}>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white font-black text-xs">1</span>
                                <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs">ALCANCE</h3>
                            </div>

                            <div className="flex p-1.5 bg-slate-100 rounded-[2rem] border border-slate-200 mb-6 w-full shadow-sm">
                                {['todos', 'rubro', 'marca'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setScope(opt)}
                                        className={cn(
                                            "flex-1 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-tight transition-all duration-300",
                                            scope === opt
                                                ? "bg-white text-orange-600 shadow-md scale-[1.01]"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[80px]">
                                {scope === 'rubro' && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-1">Seleccionar Rubro</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none font-bold text-slate-700 transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                            value={selectedRubro}
                                            onChange={(e) => setSelectedRubro(e.target.value)}
                                        >
                                            <option value="">ELIJA UN RUBRO</option>
                                            {rubros.map(r => (
                                                <option key={r.id} value={r.id}>{r.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {scope === 'marca' && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-1">Seleccionar Marca</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                            value={selectedMarca}
                                            onChange={(e) => setSelectedMarca(e.target.value)}
                                        >
                                            <option value="">ELIJA UNA MARCA</option>
                                            {marcas.map(m => (
                                                <option key={m.id} value={m.id}>{m.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </BentoCard>

                        {/* Step 2: Ajuste */}
                        <BentoCard className="p-8 border-slate-100" hover={false}>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white font-black text-xs">2</span>
                                <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs">AJUSTE</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                                    <button
                                        onClick={() => setOperationType('increase')}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                            operationType === 'increase'
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                : "text-slate-400 hover:bg-white/50"
                                        )}
                                    >
                                        <TrendingUp size={14} strokeWidth={3} /> Aumentar
                                    </button>
                                    <button
                                        onClick={() => setOperationType('decrease')}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                            operationType === 'decrease'
                                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                                : "text-slate-400 hover:bg-white/50"
                                        )}
                                    >
                                        <TrendingDown size={14} strokeWidth={3} /> Disminuir
                                    </button>
                                </div>

                                <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                                    <button
                                        onClick={() => setValueType('PORCENTAJE')}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                            valueType === 'PORCENTAJE'
                                                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                                                : "text-slate-400 hover:bg-white/50"
                                        )}
                                    >
                                        <Percent size={14} strokeWidth={3} /> % %
                                    </button>
                                    <button
                                        onClick={() => setValueType('MONTO')}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                            valueType === 'MONTO'
                                                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                                                : "text-slate-400 hover:bg-white/50"
                                        )}
                                    >
                                        <DollarSign size={14} strokeWidth={3} /> $ Fijo
                                    </button>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-extrabold text-2xl group-focus-within:text-orange-500 transition-colors">
                                    {valueType === 'MONTO' ? '$' : '%'}
                                </div>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={valueType === 'MONTO' ? "0.00" : "Ej: 15"}
                                    className="w-full pl-14 pr-8 py-6 text-4xl font-black text-slate-800 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-orange-500 outline-none transition-all placeholder:text-slate-200"
                                />
                            </div>
                        </BentoCard>
                    </div>

                    {/* COLUMNA DERECHA - PRECIOS A IMPACTAR */}
                    <div className="lg:col-span-6 flex flex-col min-h-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">

                        {/* Scroll Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-2 scrollbar-premium">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white font-black text-xs">3</span>
                                <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs">PRECIOS A IMPACTAR</h3>
                            </div>

                            {[
                                { id: 'costo', label: 'Costo (Base)' },
                                { id: 'precio_efectivo', label: 'Precio Efectivo / Contado' },
                                { id: 'precio_tarjeta', label: 'Precio Tarjeta / Lista' },
                                { id: 'precio_ctacte', label: 'Precio Cuenta Corriente' },
                                { id: 'precio_lista4', label: 'Precio Mayorista' },
                            ].map(field => (
                                <label
                                    key={field.id}
                                    className={cn(
                                        "flex items-center justify-between px-6 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-300 active:scale-[0.98]",
                                        selectedFields[field.id]
                                            ? "border-orange-600 bg-orange-50/50"
                                            : "border-slate-50 bg-white hover:border-orange-200"
                                    )}
                                >
                                    <span className={cn(
                                        "font-black text-[11px] uppercase tracking-tight transition-colors",
                                        selectedFields[field.id] ? "text-orange-700" : "text-slate-500"
                                    )}>
                                        {field.label}
                                    </span>
                                    <div className={cn(
                                        "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                        selectedFields[field.id]
                                            ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/30"
                                            : "border-slate-200 bg-white"
                                    )}>
                                        {selectedFields[field.id] ? (
                                            <CheckCircle2 size={16} strokeWidth={3} />
                                        ) : (
                                            <div className="w-3.5 h-3.5 rounded-full bg-slate-50" />
                                        )}
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

                        {/* Sticky Footer */}
                        <div className="p-4 bg-slate-100">
                            <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl">
                                <div className="flex items-center justify-center gap-3 text-amber-400 font-black text-[10px] mb-4 uppercase tracking-[0.2em]">
                                    <AlertTriangle size={18} strokeWidth={2.5} />
                                    <span>Cambios Permanentes</span>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-black text-white shadow-2xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.97] uppercase tracking-widest text-xs",
                                        loading
                                            ? "bg-slate-700 cursor-not-allowed opacity-50"
                                            : "bg-orange-600 hover:bg-orange-500 shadow-orange-500/20"
                                    )}
                                >
                                    {loading ? (
                                        <RefreshCw size={18} className="animate-spin" strokeWidth={3} />
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
        </div>
    );
};

export default ActualizarPrecios;

