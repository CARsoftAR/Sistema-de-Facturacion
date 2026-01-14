import React from 'react';
import { Pencil, Trash2, Plus, Search, Filter, Download, Printer, FileText, Check, X, ArrowLeft, ArrowUpRight, RotateCcw, Eraser } from 'lucide-react';

// Base styles for consistency
const BASE_BTN_CLASS = "btn shadow-sm rounded-2 d-inline-flex align-items-center justify-content-center gap-2 transition-all fw-bold";

// Modern Gradient Styles Map
const gradientStyles = {
    primary: { bg: 'linear-gradient(145deg, #dbeafe 0%, #ffffff 100%)', text: '#1d4ed8' }, // Blue-700
    success: { bg: 'linear-gradient(145deg, #dcfce7 0%, #ffffff 100%)', text: '#15803d' }, // Green-700
    danger: { bg: 'linear-gradient(145deg, #fee2e2 0%, #ffffff 100%)', text: '#b91c1c' }, // Red-700
    warning: { bg: 'linear-gradient(145deg, #fef3c7 0%, #ffffff 100%)', text: '#b45309' }, // Amber-700
    info: { bg: 'linear-gradient(145deg, #cffafe 0%, #ffffff 100%)', text: '#0e7490' },    // Cyan-700
    print: { bg: 'linear-gradient(145deg, #f3e8ff 0%, #ffffff 100%)', text: '#7e22ce' },    // Violet-700
    light: { bg: 'linear-gradient(145deg, #f1f5f9 0%, #ffffff 100%)', text: '#334155' }      // Slate-700
};

// Soft Styles for Vertical Buttons
const softStyles = {
    primary: { bg: '#dbeafe', text: '#1e40af' }, // Blue-100
    success: { bg: '#dcfce7', text: '#166534' }, // Green-100
    danger: { bg: '#fee2e2', text: '#991b1b' },  // Red-100
    warning: { bg: '#fef3c7', text: '#92400e' }, // Amber-100
    info: { bg: '#e0f2fe', text: '#0369a1' },    // Sky-100
    print: { bg: '#f3e8ff', text: '#6b21a8' },   // Purple-100
    light: { bg: '#f1f5f9', text: '#334155' }    // Slate-100
};

/**
 * Generic Icon Button Wrapper
 */
export const BtnIcon = ({ icon: Icon, onClick, color = "primary", className = "", title = "", size = "sm", style = {}, ...rest }) => {
    // Size mapping
    const sizeStyle = size === 'sm' ? { width: '32px', height: '32px' } : { width: '38px', height: '38px' };
    const iconSize = size === 'sm' ? 16 : 18;

    const currentStyle = gradientStyles[color] || gradientStyles.primary;

    return (
        <button
            type="button"
            className={`rounded-2 shadow-sm d-inline-flex align-items-center justify-content-center border-0 fw-bold transition-all ${className}`}
            onClick={onClick}
            title={title}
            style={{ ...sizeStyle, background: currentStyle.bg, color: currentStyle.text, cursor: 'pointer', ...style }}
            {...rest}
        >
            {Icon && <Icon size={iconSize} />}
        </button>
    );
};

// ============================================================================
// CRUD BUTTONS
// ============================================================================

export const BtnAdd = ({ label = "Agregar", onClick, className = "", icon: Icon = Plus, ...rest }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-primary text-white ${className}`} onClick={onClick} {...rest}>
        <Icon size={20} />
        {label}
    </button>
);

export const BtnEdit = ({ onClick, title = "Editar", size = "sm", label = "Editar" }) => {
    const style = softStyles.warning;
    return (
        <button
            type="button"
            className={`btn btn-sm d-inline-flex align-items-center gap-1 fw-bold rounded-2 border-0 transition-all`}
            style={{ background: style.bg, color: style.text }}
            onClick={onClick}
            title={title}
        >
            <Pencil size={16} />
            {label}
        </button>
    );
};

export const BtnDelete = ({ onClick, title = "Eliminar", size = "sm", label = "Eliminar" }) => {
    const style = softStyles.danger;
    return (
        <button
            type="button"
            className={`btn btn-sm d-inline-flex align-items-center gap-1 fw-bold rounded-2 border-0 transition-all`}
            style={{ background: style.bg, color: style.text }}
            onClick={onClick}
            title={title}
        >
            <Trash2 size={16} />
            {label}
        </button>
    );
};

export const BtnSave = ({ label = "Guardar", onClick, loading = false, className = "", ...rest }) => (
    <button
        type="submit"
        className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        onClick={onClick}
        disabled={loading}
        {...rest}
    >
        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <Check size={18} />}
        {label}
    </button>
);

export const BtnCancel = ({ label = "Cancelar", onClick, className = "", ...rest }) => (
    <button
        type="button"
        className={`px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all border-0 flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 ${className}`}
        onClick={onClick}
        {...rest}
    >
        <X size={18} />
        {label}
    </button>
);

// ============================================================================
// SYSTEM / DATA BUTTONS
// ============================================================================

// Update BtnView
export const BtnView = ({ onClick, title = "Ver Detalle", size = "sm", label = "Ver" }) => {
    const style = softStyles.info;
    return (
        <button
            type="button"
            className="btn btn-sm d-inline-flex align-items-center gap-1 fw-bold rounded-2 border-0 transition-all"
            style={{ background: style.bg, color: style.text }}
            onClick={onClick}
            title={title}
        >
            <FileText size={16} />
            {label}
        </button>
    );
};

// Update BtnPrint
export const BtnPrint = ({ onClick, label = "Imprimir", title = "Imprimir", size = "sm", iconOnly = false }) => {
    const style = softStyles.print;
    // We ignore iconOnly for consistent table look if utilized in tables
    if (iconOnly) {
        return <BtnIcon icon={Printer} color="print" onClick={onClick} title={title} size={size} />;
    }
    return (
        <button
            type="button"
            className="btn btn-sm d-inline-flex align-items-center gap-1 fw-bold rounded-2 border-0 transition-all"
            style={{ background: style.bg, color: style.text }}
            onClick={onClick}
            title={title}
        >
            <Printer size={16} />
            {label}
        </button>
    );
};

// Generic Table Action (e.g., Facturar, Nota Debito, Anular custom)
export const BtnTableAction = ({ label, icon: Icon, onClick, color = "primary", title = "" }) => {
    const style = softStyles[color] || softStyles.primary;
    return (
        <button
            type="button"
            className="btn btn-sm d-inline-flex align-items-center gap-1 fw-bold rounded-2 border-0 transition-all"
            style={{ background: style.bg, color: style.text }}
            onClick={onClick}
            title={title || label}
        >
            {Icon && <Icon size={16} />}
            {label}
        </button>
    );
};

export const BtnBack = ({ onClick, label = "Volver", className = "" }) => (
    <button
        type="button"
        className={`px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all border-0 flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 ${className}`}
        onClick={onClick}
    >
        <ArrowLeft size={18} />
        {label}
    </button>
);

// ============================================================================
// CUSTOM GENERIC
// ============================================================================

/**
 * For specialized actions like "Asientos", "Balance" that don't fit standard CRUD.
 */
export const BtnAction = ({ label, icon: Icon, onClick, color = "primary", className = "", ...rest }) => {
    const style = gradientStyles[color] || gradientStyles.primary;
    return (
        <button type="button" className={`${BASE_BTN_CLASS} border-0 ${className}`}
            style={{ background: style.bg, color: style.text }}
            onClick={onClick} {...rest}>
            {Icon && (typeof Icon === 'function' || typeof Icon === 'object' ? <Icon size={18} /> : null)}
            {label}
        </button>
    );
};

export const BtnClear = ({ onClick, label = "Limpiar Filtros", className = "" }) => (
    <button
        type="button"
        className={`btn text-dark fw-bold border border-success-subtle shadow-sm d-inline-flex align-items-center justify-content-center gap-2 transition-all hover:bg-white hover:text-danger ${className}`}
        onClick={onClick}
        style={{ height: '38px', backgroundColor: '#e2f9e3' }}
        title="Limpiar filtros"
    >
        <Eraser size={16} />
        {label}
    </button>
);

// ============================================================================
// SPECIALTY BUTTONS
// ============================================================================

/**
 * Vertical Button (Icon on top, Text on bottom)
 * Based on user requirement for "Standardized" vertical buttons
 */
export const BtnVertical = ({ icon: Icon, label, onClick, color = "primary", className = "", style = {}, ...rest }) => {
    // Force use of soft styles for this component as requested
    const currentStyle = softStyles[color] || softStyles.primary;
    return (
        <button
            type="button"
            className={`rounded-2 d-inline-flex flex-column align-items-center justify-content-center p-1 fw-bold transition-all ${className}`}
            onClick={onClick}
            style={{
                width: '70px',
                height: '48px',
                background: currentStyle.bg,
                color: currentStyle.text,
                border: 'none',
                cursor: 'pointer',
                ...style
            }}
            {...rest}
        >
            {Icon && <Icon size={20} className="mb-1" />}
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', lineHeight: '1.1' }}>{label}</span>
        </button>
    );
};
