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
        data.monto = parseFloat(data.monto);
        const url = cheque ? `/api/cheques/${cheque.id}/editar/` : '/api/cheques/crear/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok || !result.ok) {
                setServerError(result.error || 'Error al guardar');
                return;
            }

            onSave();
            onClose();
        } catch (error) {
            setServerError('Error de conexión.');
        }
    };

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all z-10 border border-slate-100">

                {/* Header Section */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Banknote size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {cheque ? 'Editar Cheque' : 'Nuevo Cheque'}
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                Gestión de Cartera
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    {serverError && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={20} />
                            <span className="font-bold text-sm">{serverError}</span>
                        </div>
                    )}

                    <form id="cheque-form" onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Banco Emisor</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors z-20">
                                        <Banknote size={18} />
                                    </div>
                                    <div className="pl-8">
                                        <Controller
                                            name="banco"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    options={bancosOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Seleccione banco"
                                                    className="!rounded-2xl !border-slate-200 !bg-slate-50/50 !h-12 !font-bold"
                                                />
                                            )}
                                        />
                                    </div>
                                    {errors.banco && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">Requerido</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">N° de Cheque</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                        <FileText size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-sm text-slate-700 font-mono ${errors.numero ? 'border-rose-300' : ''}`}
                                        placeholder="00000000"
                                        {...register('numero', { required: true })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Importe</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors font-bold">$</div>
                                    <input
                                        type="number" step="0.01"
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-lg text-slate-800 ${errors.monto ? 'border-rose-300' : ''}`}
                                        placeholder="0.00"
                                        {...register('monto', { required: true, min: 0 })}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vencimiento Para Cobro</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="date"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm text-slate-700"
                                        {...register('fecha_pago', { required: true })}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tipo de Cheque</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm text-slate-700 outline-none cursor-pointer"
                                    {...register('tipo', { required: true })}
                                >
                                    <option value="TERCERO">TERCERO (REPRESENTADO)</option>
                                    <option value="PROPIO">PROPIO (EMITIDO)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4">
                                    <div className="flex items-center gap-2 px-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información del Emisor</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm text-slate-700"
                                                placeholder="Nombre o Razón Social"
                                                {...register('firmante')}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm text-slate-700 font-mono"
                                                placeholder="CUIT (Opcional)"
                                                {...register('cuit_firmante')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Section */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        form="cheque-form"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'GUARDANDO...' : (cheque ? 'ACTUALIZAR' : 'REGISTRAR CHEQUE')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChequeForm;
