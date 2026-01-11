import React from 'react';
import { Pencil, Trash2, Plus, Search, Filter, Download, Printer, FileText, Check, X, ArrowLeft, ArrowUpRight, RotateCcw, Eraser } from 'lucide-react';

// Base styles for consistency
const BASE_BTN_CLASS = "btn shadow-sm rounded-2 d-inline-flex align-items-center justify-content-center gap-2 transition-all fw-bold";

/**
 * Generic Icon Button Wrapper
 * Can be used when a specific semantic button doesn't exist.
 */
export const BtnIcon = ({ icon: Icon, onClick, color = "primary", className = "", title = "", size = "sm", style = {}, ...rest }) => {
    // Size mapping for fixed square buttons
    const sizeStyle = size === 'sm' ? { width: '32px', height: '32px' } : { width: '38px', height: '38px' };
    const iconSize = size === 'sm' ? 16 : 18;

    return (
        <button
            type="button"
            className={`btn btn-${size} btn-${color} text-white rounded-2 shadow-sm d-inline-flex align-items-center justify-content-center border-0 ${className}`}
            onClick={onClick}
            title={title}
            style={{ ...sizeStyle, ...style }}
            {...rest}
        >
            {Icon && <Icon size={iconSize} />}
        </button>
    );
};

// ============================================================================
// CRUD BUTTONS
// ============================================================================

export const BtnAdd = ({ label = "Agregar", onClick, className = "", ...rest }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-primary text-white ${className}`} onClick={onClick} {...rest}>
        <Plus size={18} />
        {label}
    </button>
);

export const BtnEdit = ({ onClick, title = "Editar", size = "sm" }) => (
    <BtnIcon icon={Pencil} color="warning" onClick={onClick} title={title} size={size} />
);

export const BtnDelete = ({ onClick, title = "Eliminar", size = "sm" }) => (
    <BtnIcon icon={Trash2} color="danger" onClick={onClick} title={title} size={size} />
);

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

export const BtnView = ({ onClick, title = "Ver Detalle", size = "sm" }) => {
    // Determine size
    const btnSize = size === 'sm' ? '35px' : '42px';
    const iconSize = size === 'sm' ? 18 : 20;

    return (
        <button
            type="button"
            className="btn btn-info text-white rounded-lg shadow-sm d-inline-flex align-items-center justify-content-center border-0 hover:scale-105 transition-transform p-0"
            onClick={onClick}
            title={title}
            style={{ width: btnSize, height: btnSize, color: 'white' }}
        >
            <FileText size={iconSize} />
        </button>
    );
};

export const BtnSearch = ({ onClick, className = "" }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-primary ${className}`} onClick={onClick}>
        <Search size={18} />
        Buscar
    </button>
);

export const BtnFilter = ({ onClick, label = "Filtrar", className = "" }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-primary ${className}`} onClick={onClick}>
        <Filter size={18} />
        {label}
    </button>
);

export const BtnExport = ({ onClick, label = "Exportar Excel", className = "" }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-primary text-white ${className}`} onClick={onClick}>
        <Download size={18} />
        {label}
    </button>
);

export const BtnPrint = ({ onClick, label = "Imprimir", title = "Imprimir", iconOnly = false, className = "", size = "sm" }) => {
    if (iconOnly) return <BtnIcon icon={Printer} color="print" onClick={onClick} title={title} size={size} />;

    return (
        <button type="button" className={`${BASE_BTN_CLASS} btn-print text-white btn-${size} ${className}`} onClick={onClick}>
            <Printer size={18} />
            {label}
        </button>
    );
};

export const BtnBack = ({ onClick, label = "Volver", className = "" }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-light text-muted border ${className}`} onClick={onClick}>
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
export const BtnAction = ({ label, icon: Icon, onClick, color = "primary", className = "", ...rest }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-${color} ${className}`} onClick={onClick} {...rest}>
        {Icon && (typeof Icon === 'function' || typeof Icon === 'object' ? <Icon size={18} /> : null)}
        {label}
    </button>
);






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
export const BtnVertical = ({ icon: Icon, label, onClick, color = "primary", className = "", style = {}, ...rest }) => (
    <button
        type="button"
        className={`btn btn-${color} text-white rounded-2 shadow-sm d-inline-flex flex-column align-items-center justify-content-center border-0 p-1 ${className}`}
        onClick={onClick}
        style={{ width: '70px', height: '48px', ...style }}
        {...rest}
    >
        {Icon && <Icon size={20} className="mb-1" />}
        <span style={{ fontSize: '0.7rem', fontWeight: '600', lineHeight: '1.1' }}>{label}</span>
    </button>
);
