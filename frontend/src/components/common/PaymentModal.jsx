import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, CreditCard, FileText, Calendar, User, Plus, Truck } from 'lucide-react';

const PaymentModal = ({
    isOpen,
    onClose,
    onConfirm,
    total, // Total esperado (venta) o deuda total (ctacte)
    mode = 'sale', // 'sale' | 'payment' | 'purchase'
    clientName = '',
    allowCtaCte = true, // Legacy prop, prefer allowedMethods
    allowedMethods = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE', 'CTACTE'], // Control specific methods
    initialMethod = 'EFECTIVO'
}) => {
    if (!isOpen) return null;

    const [amount, setAmount] = useState(mode === 'sale' ? total : '');
    const [method, setMethod] = useState(initialMethod);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    // Detalles por método
    const [transferRef, setTransferRef] = useState('');
    const [cardDetails, setCardDetails] = useState({ last4: '', installments: '1' });
    const [chequeDetails, setChequeDetails] = useState({
        bank: '',
        number: '',
        emissionDate: new Date().toISOString().split('T')[0],
        paymentDate: new Date().toISOString().split('T')[0], // a.k.a Fecha Vto
        signer: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMethod(initialMethod);
            if (mode === 'sale' || mode === 'purchase') {
                setAmount(total);
            } else {
                setAmount('');
            }
            setDate(new Date().toISOString().split('T')[0]);
            setIsSaving(false);
            setTransferRef('');
            setCardDetails({ last4: '', installments: '1' });
            setChequeDetails({
                bank: '',
                number: '',
                emissionDate: new Date().toISOString().split('T')[0],
                paymentDate: new Date().toISOString().split('T')[0],
                signer: ''
            });
            setDescription('');
        }
    }, [isOpen, total, mode, initialMethod]);

    const handleConfirm = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const paymentData = {
            monto: parseFloat(amount),
            fecha: date,
            metodo_pago: method,
            descripcion: description,
            referencia: transferRef,
            tarjeta: cardDetails,
            cheque: chequeDetails,
            total_operacion: total,
            vuelto: (method === 'EFECTIVO' && parseFloat(amount) > total && mode !== 'purchase') ? Math.max(0, parseFloat(amount) - total) : 0
        };

        await onConfirm(paymentData);
        setIsSaving(false);
    };

    const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    // Calculate Change (Vuelto)
    const numericAmount = parseFloat(amount) || 0;
    const numericTotal = parseFloat(total) || 0;
    const change = numericAmount - numericTotal;
    const showChange = method === 'EFECTIVO' && change > 0 && numericTotal > 0 && mode !== 'purchase';

    // Map methods to UI config
    const methodConfig = {
        'EFECTIVO': { label: 'Efectivo', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        'TARJETA': { label: 'Tarjeta', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        'TRANSFERENCIA': { label: 'Transf.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        'CHEQUE': { label: 'Cheque', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
        'CTACTE': { label: 'Cta. Cte.', icon: User, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    };

    // Filter available methods
    const visibleMethods = allowedMethods.filter(m => {
        if (m === 'CTACTE' && !allowCtaCte) return false;
        return true;
    });

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-slate-200">

                {/* White Header (Centered Style - Premium) */}
                <div className="relative pt-6 px-6 pb-2 text-center z-10" style={{ backgroundColor: 'white' }}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>

                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm ${mode === 'purchase' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                        {mode === 'purchase' ? <Truck size={32} strokeWidth={2} /> : <DollarSign size={32} strokeWidth={2} />}
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 mb-1">
                        {mode === 'sale' ? 'Completar Pago' : mode === 'purchase' ? 'Recibir Orden' : 'Registrar Pago'}
                    </h2>

                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex justify-center items-center gap-2">
                        {methodConfig[method]?.label || method}
                        {clientName && <span className="text-slate-300">|</span>}
                        {clientName && <span className="text-slate-400 font-medium normal-case">{clientName}</span>}
                    </p>
                </div>

                <form onSubmit={handleConfirm} className="p-6 pt-2">

                    {/* Big Total Display */}
                    {(total > 0 || mode === 'payment') && (
                        <div className="text-center mb-6" style={{ backgroundColor: 'white' }}>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                {mode === 'payment' ? 'DEUDA TOTAL' : 'TOTAL A PAGAR'}
                            </p>
                            <div className="text-4xl font-black text-slate-800 tracking-tight">
                                {formatMoney(total)}
                            </div>
                        </div>
                    )}

                    {/* Amount & Change Section - Side by Side */}
                    <div className="mb-3">
                        <div className="flex justify-between items-baseline mb-2">
                            <label className="block text-sm font-bold text-slate-700">
                                {mode === 'sale' ? 'Monto Recibido' : 'Monto ($)'}
                            </label>
                            {mode === 'payment' && total > 0 && (
                                <button type="button" onClick={() => setAmount(total)} className="text-xs font-bold text-blue-600 hover:text-blue-800">
                                    Saldar Total
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3 h-[52px]">
                            {/* Input Container */}
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full h-full pl-10 pr-4 text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 placeholder:text-slate-300"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={total > 0 ? total.toString() : "0.00"}
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Vuelto / Change Display - Compact Side-By-Side */}
                            {showChange && (
                                <div className="flex-1 bg-emerald-50 border border-emerald-100 px-4 rounded-xl flex flex-col justify-center items-end animate-in fade-in slide-in-from-right-4 duration-300 shadow-sm">
                                    <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider leading-none mb-0.5">Vuelto</span>
                                    <span className="text-2xl font-black text-emerald-600 leading-none">{formatMoney(change)}</span>
                                </div>
                            )}
                        </div>

                        {/* Short Amount Warning (Optional UX) */}
                        {method === 'EFECTIVO' && numericAmount < numericTotal && numericAmount > 0 && parseInt(cardDetails.installments || 1) <= 1 && (
                            <div className="mt-2 text-xs text-amber-600 font-bold text-center">
                                Falta: {formatMoney(numericTotal - numericAmount)}
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-100 my-2" />

                    {/* Método de Pago Cards */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Medio de Pago</label>
                        <div className="grid grid-cols-5 gap-2">
                            {visibleMethods.map(m => {
                                const conf = methodConfig[m] || methodConfig['EFECTIVO'];
                                const active = method === m;
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMethod(m)}
                                        className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${active ? `${conf.border} ${conf.bg} shadow-sm ring-1 ring-inset ${conf.border}` : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <conf.icon size={20} className={active ? conf.color : 'text-slate-400'} />
                                        <span className={`font-bold text-[10px] uppercase tracking-tight ${active ? 'text-slate-900' : 'text-slate-500'}`}>{conf.label}</span>
                                        {active && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Campos Específicos por Método */}
                    <div className="space-y-4 mb-6">
                        {/* Fecha Siempre Visible (Compacta) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Operación</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="date"
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 font-medium"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* TRANSFERENCIA */}
                        {method === 'TRANSFERENCIA' && (
                            <div className="animate-in fade-in slide-in-from-top-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Referencia / Comprobante</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500"
                                    placeholder="N° de operación..."
                                    value={transferRef}
                                    onChange={(e) => setTransferRef(e.target.value)}
                                />
                            </div>
                        )}

                        {/* TARJETA */}
                        {method === 'TARJETA' && (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Últimos 4</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input
                                            type="text"
                                            maxLength={4}
                                            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500"
                                            placeholder="xxxx"
                                            value={cardDetails.last4}
                                            onChange={(e) => setCardDetails({ ...cardDetails, last4: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Cuotas</label>
                                    <select
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500 bg-white"
                                        value={cardDetails.installments}
                                        onChange={(e) => setCardDetails({ ...cardDetails, installments: e.target.value })}
                                    >
                                        <option value="1">1 pago</option>
                                        <option value="3">3 cuotas</option>
                                        <option value="6">6 cuotas</option>
                                        <option value="12">12 cuotas</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* CHEQUE */}
                        {method === 'CHEQUE' && (
                            <div className="space-y-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Banco</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500"
                                            placeholder="Nombre Banco"
                                            value={chequeDetails.bank}
                                            onChange={(e) => setChequeDetails({ ...chequeDetails, bank: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">N° Cheque</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500"
                                            placeholder="Número"
                                            value={chequeDetails.number}
                                            onChange={(e) => setChequeDetails({ ...chequeDetails, number: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">F. Pago</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500"
                                            value={chequeDetails.paymentDate}
                                            onChange={(e) => setChequeDetails({ ...chequeDetails, paymentDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Firmante</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500"
                                            placeholder="(Opcional)"
                                            value={chequeDetails.signer}
                                            onChange={(e) => setChequeDetails({ ...chequeDetails, signer: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Observaciones */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nota (Opcional)</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 placeholder:text-slate-300"
                                placeholder="Notas u observaciones (opcional)..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm uppercase tracking-wide"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!amount || parseFloat(amount) <= 0 || isSaving}
                            className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:translate-y-px transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={20} strokeWidth={2.5} />
                                    Confirmar
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
