import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, AlertCircle, Banknote, Calendar, User, FileText, CreditCard } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';
import { BtnSave, BtnCancel } from '../CommonButtons';

const bancosOptions = [
    { id: 'Banco Galicia', nombre: 'Banco Galicia' },
    { id: 'Banco Nación', nombre: 'Banco Nación' },
    { id: 'Banco Provincia', nombre: 'Banco Provincia' },
    { id: 'Banco Santander', nombre: 'Banco Santander' },
    { id: 'Banco BBVA', nombre: 'Banco BBVA' },
    { id: 'Banco Macro', nombre: 'Banco Macro' },
    { id: 'Banco ICBC', nombre: 'Banco ICBC' },
    { id: 'Banco Credicoop', nombre: 'Banco Credicoop' },
    { id: 'Banco Ciudad', nombre: 'Banco Ciudad' },
    { id: 'Banco Patagonia', nombre: 'Banco Patagonia' },
    { id: 'Banco Supervielle', nombre: 'Banco Supervielle' },
    { id: 'Banco Hipotecario', nombre: 'Banco Hipotecario' },
    { id: 'Banco Comafi', nombre: 'Banco Comafi' },
    { id: 'Banco Itaú', nombre: 'Banco Itaú' },
    { id: 'Citibank', nombre: 'Citibank' },
    { id: 'HSBC', nombre: 'HSBC' },
    { id: 'Brubank', nombre: 'Brubank' },
    { id: 'Reba', nombre: 'Reba' },
    { id: 'Banco del Sol', nombre: 'Banco del Sol' },
    { id: 'Banco Roela', nombre: 'Banco Roela' },
    { id: 'Banco Mariva', nombre: 'Banco Mariva' },
];

const ChequeForm = ({ cheque, onClose, onSave }) => {
    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm();
    const [serverError, setServerError] = useState(null);

    useEffect(() => {
        if (cheque) {
            reset({
                numero: cheque.numero,
                banco: cheque.banco,
                monto: cheque.monto,
                tipo: cheque.tipo,
                estado: cheque.estado,
                fecha_emision: cheque.fecha_emision,
                fecha_pago: cheque.fecha_pago,
                firmante: cheque.firmante || '',
                cuit_firmante: cheque.cuit_firmante || '',
                destinatario: cheque.destinatario || '',
                observaciones: cheque.observaciones || ''
            });
        } else {
            reset({
                tipo: 'TERCERO',
                estado: 'CARTERA',
                fecha_emision: new Date().toISOString().split('T')[0],
                fecha_pago: new Date().toISOString().split('T')[0],
                monto: 0
            });
        }
    }, [cheque, reset]);

    const onSubmit = async (data) => {
        setServerError(null);

        // Ensure numbers are numbers
        data.monto = parseFloat(data.monto);

        const url = cheque
            ? `/api/cheques/${cheque.id}/editar/`
            : '/api/cheques/crear/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error("Server response (not JSON):", text);
                throw new Error(`Error del servidor (${response.status}): Respondió con formato inválido. Revisa la consola.`);
            }

            if (!response.ok || !result.ok) {
                if (result.errors) {
                    const msg = Object.values(result.errors).flat().join(', ');
                    setServerError(msg);
                } else {
                    setServerError(result.error || `Error ${response.status}: ${response.statusText}`);
                }
                return;
            }

            onSave();
            onClose();
        } catch (error) {
            console.error("Error saving cheque:", error);
            setServerError(error.message || 'Error de conexión con el servidor.');
        }
    };

    // Custom handler to move focus on Enter instead of submitting
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // Allow default behavior for buttons (submission) or textareas (new line)
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;

            e.preventDefault();
            const form = e.target.form;
            if (!form) return;

            const elements = Array.from(form.elements).filter(el =>
                !el.disabled &&
                !el.hidden &&
                el.offsetParent !== null && // Visible check
                el.tabIndex !== -1 &&
                (el.tagName === 'INPUT' || el.tagName === 'SELECT')
            );

            const index = elements.indexOf(e.target);
            if (index > -1 && index < elements.length - 1) {
                elements[index + 1].focus();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden transform transition-all scale-100 z-10">

                {/* Header Premium */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <Banknote size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                {cheque ? 'Editar Cheque' : 'Nuevo Cheque'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {cheque ? `Editando cheque #${cheque.numero}` : 'Registrar un nuevo cheque en cartera'}
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
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <span className="font-medium text-sm">{serverError}</span>
                        </div>
                    )}

                    <form id="cheque-form" onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} autoComplete="off" className="flex flex-col gap-5">

                        {/* SECCIÓN 1: DATOS PRINCIPALES */}
                        <div className="grid grid-cols-12 gap-x-4 gap-y-4">

                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 mb-1">BANCO <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                                        <Banknote size={16} />
                                    </div>
                                    <div className="pl-7">
                                        <Controller
                                            name="banco"
                                            control={control}
                                            rules={{ required: 'Requerido' }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    options={bancosOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Seleccione banco"
                                                />
                                            )}
                                        />
                                    </div>
                                    {errors.banco && <p className="text-red-500 text-xs mt-1">Requerido</p>}
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 mb-1">NÚMERO DE CHEQUE <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <CreditCard size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        className={`w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold font-monospace transition-all ${errors.numero ? 'border-red-300' : ''}`}
                                        placeholder="Ej: 00001234"
                                        {...register('numero', { required: 'Requerido' })}
                                    />
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 mb-1">FECHA EMISIÓN <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all ${errors.fecha_emision ? 'border-red-300' : ''}`}
                                        {...register('fecha_emision', { required: 'Requerido' })}
                                    />
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 mb-1">FECHA PAGO <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all ${errors.fecha_pago ? 'border-red-300' : ''}`}
                                        {...register('fecha_pago', { required: 'Requerido' })}
                                    />
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 mb-1">TIPO <span className="text-red-500">*</span></label>
                                <select
                                    className="form-select w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all"
                                    {...register('tipo', { required: 'Requerido' })}
                                >
                                    <option value="TERCERO">Tercero</option>
                                    <option value="PROPIO">Propio</option>
                                </select>
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 mb-1">IMPORTE <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-bold">$</span>
                                    </div>
                                    <input
                                        type="number" step="0.01"
                                        className={`w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-bold transition-all ${errors.monto ? 'border-red-300' : ''}`}
                                        placeholder="0.00"
                                        {...register('monto', { required: 'Requerido', min: 0 })}
                                    />
                                </div>
                            </div>

                            <div className="col-span-12 border-t border-slate-100 my-2"></div>

                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 mb-1">FIRMANTE / EMISOR</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm transition-all"
                                        placeholder="Nombre del firmante"
                                        {...register('firmante')}
                                    />
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 mb-1">CUIT FIRMANTE</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm transition-all"
                                    placeholder="Ej: 20-12345678-9"
                                    {...register('cuit_firmante')}
                                />
                            </div>

                            <div className="col-span-12">
                                <label className="block text-xs font-bold text-slate-500 mb-1">OBSERVACIONES</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm transition-all"
                                    placeholder="Detalles adicionales..."
                                    rows="2"
                                    {...register('observaciones')}
                                ></textarea>
                            </div>

                        </div>

                    </form>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                    <BtnCancel onClick={onClose} />
                    <BtnSave
                        form="cheque-form"
                        label={isSubmitting ? 'Guardando...' : 'Guardar Cheque'}
                        loading={isSubmitting}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChequeForm;
