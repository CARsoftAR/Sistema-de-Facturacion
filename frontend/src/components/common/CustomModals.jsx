import React from 'react';
import { X, Check, CheckCircle2, AlertCircle } from 'lucide-react';

export const SuccessModal = ({ isOpen, onClose, title, message, buttonText = "OK" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 border border-slate-200" style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '24rem', overflow: 'hidden', textAlign: 'center', padding: '1.5rem', borderColor: '#e2e8f0', borderWidth: '1px' }}>
                <div className="mx-auto bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-green-600 border border-green-100" style={{ marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#f0fdf4', width: '5rem', height: '5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#16a34a', borderColor: '#dcfce7', borderWidth: '1px' }}>
                    <CheckCircle2 size={40} strokeWidth={2} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2" style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>{title}</h4>
                <p className="text-slate-500 text-sm mb-6 px-2 font-medium" style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.25rem', marginBottom: '1.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem', fontWeight: 500 }}>
                    {message}
                </p>
                <button
                    className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:translate-y-px transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                    onClick={onClose}
                    style={{ width: '100%', paddingTop: '0.875rem', paddingBottom: '0.875rem', backgroundColor: '#2563eb', color: 'white', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export const ErrorModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 border border-slate-200" style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '24rem', overflow: 'hidden', textAlign: 'center', padding: '1.5rem', borderColor: '#e2e8f0', borderWidth: '1px' }}>
                <div className="mx-auto bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-red-600 border border-red-100" style={{ marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fef2f2', width: '5rem', height: '5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#dc2626', borderColor: '#fee2e2', borderWidth: '1px' }}>
                    <AlertCircle size={40} strokeWidth={2} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2" style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>{title}</h4>
                <p className="text-slate-500 text-sm mb-6 px-2 font-medium" style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.25rem', marginBottom: '1.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem', fontWeight: 500 }}>
                    {message}
                </p>
                <button
                    className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                    onClick={onClose}
                    style={{ width: '100%', paddingTop: '0.875rem', paddingBottom: '0.875rem', backgroundColor: '#1e293b', color: 'white', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};
