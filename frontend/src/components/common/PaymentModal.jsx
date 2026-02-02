import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Check, DollarSign, CreditCard, FileText,
    Calendar, User, Plus, Truck, ChevronRight,
    Zap, Receipt, Banknote, Landmark, ShieldCheck, Activity
} from 'lucide-react';
import { cn } from '../../utils/cn';

const PaymentModal = ({
    isOpen,
    onClose,
    onConfirm,
    total, // Total esperado (numérico)
    mode = 'sale', // 'sale' | 'payment' | 'purchase'
    clientName = '',
    allowedMethods = ['EFECTIVO', 'TARJETA', 'CHEQUE', 'CTACTE'],
    initialMethod = 'EFECTIVO',
    onMethodChange = null
}) => {
    if (!isOpen) return null;

    // --- FORMATEADORES ---
    const formatToAR = useCallback((val) => {
        if (val === undefined || val === null || val === '') return '0,00';
        const num = typeof val === 'string' ? parseFloat(val.toString().replace(/\./g, '').replace(',', '.')) : val;
        if (isNaN(num)) return '0,00';
        return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    }, []);

    const parseFromAR = useCallback((str) => {
        if (!str) return 0;
        const clean = str.toString().replace(/\./g, '').replace(',', '.');
        return parseFloat(clean) || 0;
    }, []);

    // --- ESTADOS ---
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState(initialMethod);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [transferRef, setTransferRef] = useState('');
    const [cardDetails, setCardDetails] = useState({ last4: '', installments: '1' });
    const [perceptions, setPerceptions] = useState({ iva: '0,00', iibb: '0,00' });
    const [retentions, setRetentions] = useState({ iva: '0,00', iibb: '0,00' });
    const [isSaving, setIsSaving] = useState(false);

    // --- INICIALIZACIÓN ---
    useEffect(() => {
        if (isOpen) {
            setMethod(initialMethod);
            setPerceptions({ iva: '0,00', iibb: '0,00' });
            setRetentions({ iva: '0,00', iibb: '0,00' });
            if (mode === 'sale' || mode === 'purchase') {
                setAmount(formatToAR(total));
            } else {
                setAmount('0,00');
            }
            setIsSaving(false);
            setDescription('');
        }
    }, [isOpen, total, mode, initialMethod, formatToAR]);

    // --- CÁLCULO DE TOTAL AUTOMÁTICO ---
    useEffect(() => {
        if (isOpen && (mode === 'sale' || mode === 'purchase')) {
            const pIVA = parseFromAR(perceptions.iva);
            const pIIBB = parseFromAR(perceptions.iibb);
            const rIVA = parseFromAR(retentions.iva);
            const rIIBB = parseFromAR(retentions.iibb);
            const finalTotal = total + pIVA + pIIBB - rIVA - rIIBB;
            setAmount(formatToAR(finalTotal));
        }
    }, [perceptions, retentions, total, isOpen, formatToAR, parseFromAR]);

    // --- MANEJADORES DE ENTRADA ---
    const handleCurrencyInputChange = (e, setter, key) => {
        let val = e.target.value;
        val = val.replace(/[^\dots,]/g, ''); // Fix: removed dots keep commas decimal only
        val = val.replace(/[^\d,]/g, '');
        const parts = val.split(',');
        if (parts.length > 2) return;
        if (key) {
            setter(prev => ({ ...prev, [key]: val }));
        } else {
            setter(val);
        }
    };

    const handleBlurFormat = (setter, key) => {
        if (key) {
            setter(prev => ({ ...prev, [key]: formatToAR(prev[key]) }));
        } else {
            setter(prev => formatToAR(prev));
        }
    };

    const handleConfirm = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        const p_iva = parseFromAR(perceptions.iva);
        const p_iibb = parseFromAR(perceptions.iibb);
        const r_iva = parseFromAR(retentions.iva);
        const r_iibb = parseFromAR(retentions.iibb);
        const numAmount = parseFromAR(amount);
        const opTotal = total + p_iva + p_iibb - r_iva - r_iibb;

        const paymentData = {
            monto: numAmount,
            fecha: date,
            metodo_pago: method,
            descripcion: description,
            referencia: transferRef,
            tarjeta: cardDetails,
            percepcion_iva: p_iva,
            percepcion_iibb: p_iibb,
            retencion_iva: r_iva,
            retencion_iibb: r_iibb,
            total_operacion: opTotal,
            vuelto: (method === 'EFECTIVO' && numAmount > opTotal && mode !== 'purchase') ? Math.max(0, numAmount - opTotal) : 0
        };

        await onConfirm(paymentData);
        setIsSaving(false);
    };

    const numericAmount = parseFromAR(amount);
    const currentTotalCalc = total + parseFromAR(perceptions.iva) + parseFromAR(perceptions.iibb) - parseFromAR(retentions.iva) - parseFromAR(retentions.iibb);
    const change = numericAmount - currentTotalCalc;
    const showChange = method === 'EFECTIVO' && change > 0 && currentTotalCalc > 0 && mode !== 'purchase';

    const methodConfig = {
        'EFECTIVO': { label: 'Efectivo', icon: Banknote },
        'TARJETA': { label: 'Tarjeta', icon: CreditCard },
        'TRANSFERENCIA': { label: 'Transf.', icon: Zap },
        'CHEQUE': { label: 'Cheque', icon: Landmark },
        'CTACTE': { label: 'Cta. Cte.', icon: User },
    };

    return (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <form
                onSubmit={handleConfirm}
                className={cn(
                    "bg-white rounded-[2.5rem] shadow-2xl w-full max-h-[95vh] flex flex-col transform transition-all animate-in zoom-in-95 duration-300 border border-neutral-200 select-none overflow-hidden",
                    mode === 'sale' ? "max-w-4xl" : "max-w-2xl"
                )}
            >
                {/* Header */}
                <div className="px-8 py-5 flex items-center justify-between shrink-0 bg-white border-b border-neutral-100">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                            mode === 'purchase' ? "bg-amber-100 text-amber-600" : "bg-primary-100 text-primary-600"
                        )}>
                            {mode === 'purchase' ? <Truck size={20} /> : <ShieldCheck size={20} />}
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-black text-neutral-900 leading-none tracking-tight">
                                {mode === 'sale' ? 'Finalizar Venta' : mode === 'purchase' ? 'Confirmar Compra' : 'Registrar Pago'}
                            </h2>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1 block">
                                {clientName || (mode === 'purchase' ? 'PROVEEDOR SELECCIONADO' : 'CONSUMIDOR FINAL')}
                            </span>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-all">
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 pt-6 no-scrollbar">
                    <div className="grid grid-cols-12 gap-8">

                        {/* Columna Izquierda: Información de Pago */}
                        <div className={cn(
                            "col-span-12 space-y-6",
                            mode === 'sale' ? "lg:col-span-7" : "lg:col-span-12"
                        )}>

                            {/* Monto Principal */}
                            <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 relative transition-all group focus-within:border-primary-500/30 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-primary-500/5">
                                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">Total Confirmado</label>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl font-black text-neutral-300">$</span>
                                    <input
                                        type="text" required autoFocus
                                        className="w-full bg-transparent text-4xl font-black text-neutral-900 border-none outline-none focus:ring-0 p-0 tracking-tighter"
                                        value={amount}
                                        onChange={(e) => handleCurrencyInputChange(e, setAmount)}
                                        onBlur={() => handleBlurFormat(setAmount)}
                                    />
                                    {showChange && (
                                        <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow-lg shrink-0 transform animate-in slide-in-from-right-4">
                                            <div className="text-[8px] font-black uppercase opacity-90 leading-none">Vuelto</div>
                                            <div className="text-lg font-black mt-1">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(change)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Medios de Pago */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Medio de Pago</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {allowedMethods.map(m => {
                                        const conf = methodConfig[m] || methodConfig['EFECTIVO'];
                                        const active = method === m;
                                        return (
                                            <button
                                                key={m} type="button"
                                                onClick={() => { setMethod(m); if (onMethodChange) onMethodChange(m); }}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300",
                                                    active
                                                        ? "bg-neutral-900 border-neutral-900 text-white shadow-xl -translate-y-1"
                                                        : "bg-white border-neutral-100 text-neutral-500 hover:border-neutral-200"
                                                )}
                                            >
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", active ? "bg-white/10" : "bg-neutral-50")}>
                                                    <conf.icon size={20} />
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-tight">{conf.label}</span>
                                                {active && <Check size={18} className="ml-auto text-primary-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Fecha y Nota */}
                            <div className="grid grid-cols-2 gap-4 pb-2">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Fecha</label>
                                    <input
                                        type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-3 text-sm font-black bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:bg-white focus:border-neutral-300 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Referencia</label>
                                    <input
                                        type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Nota..."
                                        className="w-full px-4 py-3 text-sm font-black bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:bg-white focus:border-neutral-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Datos Tarjeta */}
                            {method === 'TARJETA' && (
                                <div className="animate-in slide-in-from-top-4 duration-300 space-y-4">
                                    <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                                        <CreditCard size={18} className="text-primary-500" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-950">Información de Tarjeta</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Últimos 4 Dígitos</label>
                                            <input
                                                type="text" maxLength={4}
                                                className="w-full px-4 py-3 text-sm font-black bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:bg-white focus:border-neutral-300 transition-all"
                                                value={cardDetails.last4} onChange={(e) => setCardDetails({ ...cardDetails, last4: e.target.value })}
                                                placeholder="0000"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Cuotas</label>
                                            <select
                                                className="w-full px-4 py-3 text-sm font-black bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:bg-white focus:border-neutral-300 transition-all cursor-pointer"
                                                value={cardDetails.installments} onChange={(e) => setCardDetails({ ...cardDetails, installments: e.target.value })}
                                            >
                                                <option value="1">1 pago (Sin interés)</option>
                                                <option value="3">3 cuotas fijas</option>
                                                <option value="6">6 cuotas fijas</option>
                                                <option value="12">12 cuotas fijas</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna Derecha: Impuestos (Solo en Ventas por ahora) */}
                        {mode === 'sale' && (
                            <div className="col-span-12 lg:col-span-5 space-y-6">

                                {/* Percepciones (+) */}
                                <div className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-sm space-y-5">
                                    <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-50 pb-3">
                                        <Receipt size={18} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">Percepciones (+)</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Percep. IVA $</label>
                                            <input
                                                type="text"
                                                value={perceptions.iva}
                                                onChange={(e) => handleCurrencyInputChange(e, setPerceptions, 'iva')}
                                                onBlur={() => handleBlurFormat(setPerceptions, 'iva')}
                                                className={cn(
                                                    "w-full px-4 py-3 text-base font-black border rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 outline-none transition-all",
                                                    parseFromAR(perceptions.iva) === 0 ? "bg-neutral-50/50 border-neutral-100 text-neutral-400" : "bg-white border-primary-100 text-neutral-900"
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Percep. IIBB $</label>
                                            <input
                                                type="text"
                                                value={perceptions.iibb}
                                                onChange={(e) => handleCurrencyInputChange(e, setPerceptions, 'iibb')}
                                                onBlur={() => handleBlurFormat(setPerceptions, 'iibb')}
                                                className={cn(
                                                    "w-full px-4 py-3 text-base font-black border rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 outline-none transition-all",
                                                    parseFromAR(perceptions.iibb) === 0 ? "bg-neutral-50/50 border-neutral-100 text-neutral-400" : "bg-white border-primary-100 text-neutral-900"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-100 flex gap-6 shrink-0 mt-auto">
                    <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-all font-mono">
                        CANCELAR
                    </button>
                    <button
                        type="submit"
                        disabled={!numericAmount || numericAmount <= 0 || isSaving}
                        className={cn(
                            "flex-[2.5] py-4 rounded-[1.25rem] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl",
                            isSaving || !numericAmount || numericAmount <= 0
                                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                : "bg-primary-600 text-white shadow-primary-600/30 hover:bg-primary-700 hover:-translate-y-1"
                        )}
                    >
                        <span className="text-sm font-black uppercase tracking-[0.2em]">CONFIRMAR OPERACIÓN</span>
                        <ChevronRight size={22} strokeWidth={3} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentModal;
