
import React, { useState, useEffect } from 'react';
import {
    FileText, Plus, Search, Trash2, Save, X, Calendar, DollarSign, Filter, RefreshCw
} from 'lucide-react';
import { showDeleteAlert } from '../utils/alerts';
import { BtnAdd } from '../components/CommonButtons';
import { formatNumber } from '../utils/formats';

// Helper recursivo para aplanar el plan de cuentas
const flattenCuentas = (nodes, result = []) => {
    nodes.forEach(node => {
        if (node.imputable) {
            result.push(node);
        }
        if (node.hijos && node.hijos.length > 0) {
            flattenCuentas(node.hijos, result);
        }
    });
    return result;
};

const Asientos = () => {
    // --- Estado Principal ---
    const [asientos, setAsientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({ fechaInicio: '', fechaFin: '', ejercicio: '' });

    // --- Estado Modal / Editor ---
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        ejercicio_id: '',
        numero: '',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        movimientos: [
            { id: Date.now(), cuenta_id: '', debe: 0, haber: 0 },
            { id: Date.now() + 1, cuenta_id: '', debe: 0, haber: 0 }
        ]
    });

    // --- Datos Maestros ---
    const [ejercicios, setEjercicios] = useState([]);
    const [cuentasPlanas, setCuentasPlanas] = useState([]);

    // --- Cargas iniciales ---
    const fetchMaestros = async () => {
        try {
            const [resEj, resCuentas] = await Promise.all([
                fetch('/api/contabilidad/ejercicios/').then(r => r.json()),
                fetch('/api/contabilidad/plan-cuentas/').then(r => r.json())
            ]);

            if (resEj.success) setEjercicios(resEj.ejercicios);
            if (resCuentas.success) setCuentasPlanas(flattenCuentas(resCuentas.cuentas));
        } catch (error) {
            console.error("Error cargando maestros:", error);
        }
    };

    const fetchAsientos = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/contabilidad/asientos/');
            const data = await res.json();
            if (data.success) {
                setAsientos(data.asientos);
                // Sugerir próximo número (simple logic)
                const maxNum = data.asientos.length > 0
                    ? Math.max(...data.asientos.map(a => parseInt(a.numero) || 0))
                    : 0;
                // No actualizamos formData aquí para no pisar ediciones, solo referencia
            }
        } catch (error) {
            console.error("Error fetching asientos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaestros();
        fetchAsientos();
    }, []);

    // --- Lógica del Formulario ---
    const handleMoveChange = (idx, field, val) => {
        const newMoves = [...formData.movimientos];
        newMoves[idx][field] = val;

        // Auto-fix: Si escribe en Debe, borra Haber y viceversa
        if (field === 'debe' && parseFloat(val) > 0) newMoves[idx]['haber'] = 0;
        if (field === 'haber' && parseFloat(val) > 0) newMoves[idx]['debe'] = 0;

        setFormData({ ...formData, movimientos: newMoves });
    };

    const addRow = () => {
        setFormData({
            ...formData,
            movimientos: [...formData.movimientos, { id: Date.now(), cuenta_id: '', debe: 0, haber: 0 }]
        });
    };

    const removeRow = (idx) => {
        if (formData.movimientos.length <= 2) return;
        const newMoves = formData.movimientos.filter((_, i) => i !== idx);
        setFormData({ ...formData, movimientos: newMoves });
    };

    const totalDebe = formData.movimientos.reduce((acc, m) => acc + (parseFloat(m.debe) || 0), 0);
    const totalHaber = formData.movimientos.reduce((acc, m) => acc + (parseFloat(m.haber) || 0), 0);
    const diferencia = totalDebe - totalHaber;
    const balanceado = Math.abs(diferencia) < 0.01;

    const handleSave = async (e) => {
        e.preventDefault();
        if (!balanceado) {
            alert(`El asiento está descuadrado por ${diferencia.toFixed(2)}`);
            return;
        }
        if (!formData.ejercicio_id) {
            alert("Seleccione un ejercicio fiscal");
            return;
        }

        const url = `/api/contabilidad/asientos/crear/`; // Solo crear por ahora, editar es complejo

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

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.ok || data.success) {
                setModalOpen(false);
                fetchAsientos();
            } else {
                alert(data.error || "Error al guardar");
            }
        } catch (error) {
            alert("Error de conexión");
        }
    };

    const openNew = () => {
        // Encontrar ejercicio activo (no cerrado) por defecto
        const defaultEj = ejercicios.find(e => !e.cerrado);
        setFormData({
            id: null,
            ejercicio_id: defaultEj ? defaultEj.id : '',
            numero: (asientos.length + 1).toString(), // Sugerencia
            fecha: new Date().toISOString().split('T')[0],
            descripcion: '',
            movimientos: [
                { id: Date.now(), cuenta_id: '', debe: 0, haber: 0 },
                { id: Date.now() + 1, cuenta_id: '', debe: 0, haber: 0 }
            ]
        });
        setModalOpen(true);
    };

    const loadDetalle = async (id) => {
        // Cargar detalle para ver/editar (solo ver por ahora si no implementamos API editar completa)
        try {
            const res = await fetch(`/api/contabilidad/asientos/${id}/`);
            const data = await res.json();
            if (data.ok) {
                const as = data.asiento;
                setFormData({
                    id: as.id,
                    ejercicio_id: as.ejercicio_id,
                    numero: as.numero,
                    fecha: as.fecha,
                    descripcion: as.descripcion,
                    movimientos: as.movimientos.map(m => ({
                        ...m,
                        // flatten key names if needed, backend uses similar
                    }))
                });
                setModalOpen(true);
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        const result = await showDeleteAlert(
            "¿Eliminar asiento?",
            "Esta acción eliminará el asiento contable de forma permanente. Los saldos de las cuentas se recalcularán.",
            'Eliminar',
            {
                iconComponent: (
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger mx-auto" style={{ width: '80px', height: '80px' }}>
                        <FileText size={40} strokeWidth={1.5} />
                    </div>
                )
            }
        );
        if (!result.isConfirmed) return;
        // API call...
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

            const res = await fetch(`/api/contabilidad/asientos/${id}/eliminar/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            });
            const data = await res.json();
            if (data.ok) {
                fetchAsientos();
            } else {
                alert(data.error);
            }
        } catch (err) { alert("Error al eliminar"); }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <FileText className="text-blue-600" size={32} />
                        Asientos Contables
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Registro manual de operaciones y ajustes.</p>
                </div>
                <BtnAdd
                    label="Nuevo Asiento"
                    icon={FileText}
                    onClick={openNew}
                    className="btn-lg shadow-sm text-white border-0"
                    style={{ background: '#2563eb' }}
                />
            </div>

            {/* List - ESTÁNDAR */}
            <div className="card border-0 shadow mb-4 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2">Cargando asientos...</p>
                        </div>
                    ) : (
                        <div className="table-responsive flex-grow-1 overflow-auto">
                            <table className="table align-middle mb-0">
                                <thead className="bg-white border-bottom">
                                    <tr>
                                        <th className="ps-4 py-3 text-dark fw-bold">Número</th>
                                        <th className="py-3 text-dark fw-bold">Fecha</th>
                                        <th className="py-3 text-dark fw-bold">Descripción</th>
                                        <th className="py-3 text-dark fw-bold">Total Debe</th>
                                        <th className="py-3 text-dark fw-bold">Total Haber</th>
                                        <th className="text-end pe-4 py-3 text-dark fw-bold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asientos.map(as => (
                                        <tr key={as.id} className="cursor-pointer border-bottom-0" onClick={() => loadDetalle(as.id)}>
                                            <td className="ps-4 fw-bold text-primary py-3">#{as.numero}</td>
                                            <td className="text-dark py-3">{as.fecha}</td>
                                            <td className="font-medium text-secondary py-3">{as.descripcion}</td>
                                            <td className="text-success fw-bold py-3">$ {formatNumber(as.total_debe)}</td>
                                            <td className="text-primary fw-bold py-3">$ {formatNumber(as.total_haber)}</td>
                                            <td className="text-end pe-4 py-3">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(as.id) }}
                                                    className="btn btn-danger btn-sm d-inline-flex align-items-center justify-content-center px-2 shadow-sm"
                                                    title="Eliminar"
                                                    style={{ width: '34px' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header Fixed */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <h3 className="font-bold text-lg text-slate-800">
                                {formData.id ? `Ver Asiento #${formData.numero}` : 'Nuevo Asiento'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto grow">
                            {/* Master Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ejercicio</label>
                                    <select
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                        value={formData.ejercicio_id}
                                        onChange={e => setFormData({ ...formData, ejercicio_id: e.target.value })}
                                        disabled={formData.id}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {ejercicios.map(e => <option key={e.id} value={e.id}>{e.descripcion}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                        value={formData.numero}
                                        onChange={e => setFormData({ ...formData, numero: e.target.value })}
                                        disabled={formData.id}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                        value={formData.fecha}
                                        onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                                        disabled={formData.id}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    {/* Spacer or Status */}
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                                        value={formData.descripcion}
                                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                        disabled={formData.id}
                                        placeholder="Ej: Ajuste de caja por diferencia de cambio"
                                    />
                                </div>
                            </div>

                            {/* Lines Header */}
                            <div className="flex bg-slate-100 p-2 rounded-t-lg font-bold text-xs uppercase text-slate-500">
                                <div className="flex-1 px-2">Cuenta</div>
                                <div className="w-40 px-2 text-right">Debe</div>
                                <div className="w-40 px-2 text-right">Haber</div>
                                {!formData.id && <div className="w-10"></div>}
                            </div>

                            {/* Dynamic Rows */}
                            <div className="space-y-2 mt-2">
                                {formData.movimientos.map((mov, idx) => (
                                    <div key={mov.id || idx} className="flex gap-2 items-center">
                                        <div className="flex-1">
                                            <select
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                                                value={mov.cuenta_id}
                                                onChange={e => handleMoveChange(idx, 'cuenta_id', e.target.value)}
                                                disabled={formData.id}
                                            >
                                                <option value="">Seleccionar cuenta...</option>
                                                {cuentasPlanas.map(c => (
                                                    <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-40">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full p-2 border border-slate-200 rounded-lg text-right font-mono text-sm focus:ring-2 focus:ring-green-500"
                                                value={mov.debe}
                                                onChange={e => handleMoveChange(idx, 'debe', e.target.value)}
                                                disabled={formData.id}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="w-40">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full p-2 border border-slate-200 rounded-lg text-right font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                                                value={mov.haber}
                                                onChange={e => handleMoveChange(idx, 'haber', e.target.value)}
                                                disabled={formData.id}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {!formData.id && (
                                            <div className="w-10 flex justify-center">
                                                <button
                                                    onClick={() => removeRow(idx)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {!formData.id && (
                                <button
                                    onClick={addRow}
                                    className="mt-4 text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline"
                                >
                                    <Plus size={16} /> Agregar Línea
                                </button>
                            )}
                        </div>

                        {/* Footer & Totals */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
                            <div className="flex justify-between items-center mb-4 text-sm">
                                <div className="font-bold text-slate-500">Totales</div>
                                <div className="flex gap-8">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs uppercase text-slate-400 font-bold">Total Debe</span>
                                        <span className="font-mono text-lg font-bold text-green-600">$ {formatNumber(totalDebe)}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs uppercase text-slate-400 font-bold">Total Haber</span>
                                        <span className="font-mono text-lg font-bold text-indigo-600">$ {formatNumber(totalHaber)}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs uppercase text-slate-400 font-bold">Diferencia</span>
                                        <span className={`font-mono text-lg font-bold ${balanceado ? 'text-slate-400' : 'text-red-500'}`}>
                                            $ {diferencia.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {!formData.id && (
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!balanceado}
                                        className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-colors flex items-center justify-center gap-2 ${balanceado ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <Save size={18} />
                                        Guardar Asiento
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Asientos;
