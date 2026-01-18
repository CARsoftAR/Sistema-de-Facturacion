
import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';

const StandardModal = ({
    isOpen,
    onClose,
    title,
    onSubmit,
    children,
    size = 'md', // sm, md, lg, xl
    isLoading = false,
    headerColor = 'bg-white', // can be bg-blue-50 etc.
    headerIcon = null, // Lucide icon component
    submitLabel = 'Guardar',
    closeLabel = 'Cancelar',
    hideFooter = false,
}) => {
    if (!isOpen) return null;

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Size classes
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-full mx-4'
    };

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-slate-200`}>

                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${headerColor}`}>
                    <div className="flex items-center gap-3">
                        {headerIcon && (
                            <div className="p-2 bg-white/50 rounded-lg text-slate-700 shadow-sm">
                                {headerIcon}
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} message="Cerrar modal" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {!hideFooter && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
                            disabled={isLoading}
                        >
                            {closeLabel || 'Cancelar'}
                        </button>
                        {onSubmit && (
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={isLoading}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check size={18} strokeWidth={2.5} />
                                )}
                                {submitLabel || 'Guardar'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StandardModal;
