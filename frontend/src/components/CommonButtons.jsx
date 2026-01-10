import React from 'react';


// Base styles for consistency
const BASE_BTN_CLASS = "btn shadow-sm rounded-2 d-inline-flex align-items-center justify-content-center gap-2 transition-all fw-bold";
const ICON_ONLY_CLASS = "p-0"; // For fixed size generic containers usually handled by style props or sizing classes

/**
 * Generic Icon Button Wrapper
 * Can be used when a specific semantic button doesn't exist.
 */
export const BtnIcon = ({ icon, onClick, color = "primary", className = "", title = "", size = "sm", style = {}, ...rest }) => {
    // Size mapping for fixed square buttons
    const sizeStyle = size === 'sm' ? { width: '32px', height: '32px' } : { width: '38px', height: '38px' };

    return (
        <button
            type="button"
            className={`btn btn-${size} btn-${color} text-white rounded-2 shadow-sm d-inline-flex align-items-center justify-content-center border-0 ${className}`}
            onClick={onClick}
            title={title}
            style={{ ...sizeStyle, ...style }}
            {...rest}
        >
            <i className={`bi ${icon}`}></i>
        </button>
    );
};

// ============================================================================
// CRUD BUTTONS
// ============================================================================

export const BtnAdd = ({ label = "Agregar", onClick, className = "", ...rest }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-success text-white ${className}`} onClick={onClick} {...rest}>
        <i className="bi bi-plus-lg"></i>
        {label}
    </button>
);

export const BtnEdit = ({ onClick, title = "Editar", size = "sm" }) => (
    <BtnIcon icon="bi-pencil" color="warning" onClick={onClick} title={title} size={size} />
);

export const BtnDelete = ({ onClick, title = "Eliminar", size = "sm" }) => (
    <BtnIcon icon="bi-trash" color="danger" onClick={onClick} title={title} size={size} />
);

export const BtnSave = ({ label = "Guardar", onClick, loading = false, className = "", ...rest }) => (
    <button
        type="submit"
        className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        onClick={onClick}
        disabled={loading}
        {...rest}
    >
        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-lg"></i>}
        {label}
    </button>
);

export const BtnCancel = ({ label = "Cancelar", onClick, className = "", ...rest }) => (
    <button
        type="button"
        className={`px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors border-0 ${className}`}
        onClick={onClick}
        {...rest}
    >
        <i className="bi bi-x-lg me-1"></i>
        {label}
    </button>
);

// ============================================================================
// SYSTEM / DATA BUTTONS
// ============================================================================

export const BtnView = ({ onClick, title = "Ver Detalle", size = "sm" }) => {
    // Determine size
    const btnSize = size === 'sm' ? '35px' : '42px';
    const iconSize = size === 'sm' ? '1.4rem' : '1.6rem';

    return (
        <button
            type="button"
            className="btn btn-info text-white rounded-lg shadow-sm d-inline-flex align-items-center justify-content-center border-0 hover:scale-105 transition-transform p-0"
            onClick={onClick}
            title={title}
            style={{ width: btnSize, height: btnSize, color: 'white' }}
        >
            <i className="bi bi-file-earmark-text-fill" style={{ fontSize: iconSize }}></i>
        </button>
    );
};

export const BtnSearch = ({ onClick, className = "" }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-primary ${className}`} onClick={onClick}>
        <i className="bi bi-search"></i>
        Buscar
    </button>
);

export const BtnFilter = ({ onClick, label = "Filtrar", className = "" }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-primary ${className}`} onClick={onClick}>
        <i className="bi bi-funnel-fill"></i>
        {label}
    </button>
);

export const BtnExport = ({ onClick, label = "Exportar Excel", className = "" }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-success text-white ${className}`} onClick={onClick}>
        <i className="bi bi-file-earmark-excel-fill"></i>
        {label}
    </button>
);

export const BtnPrint = ({ onClick, label = "Imprimir", title = "Imprimir", iconOnly = false }) => {
    if (iconOnly) return <BtnIcon icon="bi-printer-fill" color="secondary" onClick={onClick} title={title} />;

    return (
        <button type="button" className={`${BASE_BTN_CLASS} btn-secondary text-white`} onClick={onClick}>
            <i className="bi bi-printer-fill"></i>
            {label}
        </button>
    );
};

export const BtnBack = ({ onClick, label = "Volver", className = "" }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-light text-muted border ${className}`} onClick={onClick}>
        <i className="bi bi-arrow-left"></i>
        {label}
    </button>
);

// ============================================================================
// CUSTOM GENERIC
// ============================================================================

/**
 * For specialized actions like "Asientos", "Balance" that don't fit standard CRUD.
 */
export const BtnAction = ({ label, icon, onClick, color = "primary", className = "" }) => (
    <button type="button" className={`${BASE_BTN_CLASS} btn-${color} ${className}`} onClick={onClick}>
        {icon && <i className={`bi ${icon}`}></i>}
        {label}
    </button>
);
