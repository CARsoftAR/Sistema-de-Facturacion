import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import React from 'react';

const MySwal = withReactContent(Swal);

/**
 * Muestra una alerta de confirmación con estilo Premium.
 * @param {string} title - Título de la alerta
 * @param {string} text - Texto descriptivo
 * @param {string} confirmText - Texto del botón confirmar
 * @param {string} variant - 'danger' | 'primary' | 'success' (default: 'danger')
 * @param {object} options - opciones extra { iconComponent: ReactNode }
 */
export const showConfirmationAlert = async (title, text, confirmText = 'Confirmar', variant = 'danger', options = {}) => {
    const { iconComponent, ...rest } = options;

    // Define colors based on variant
    // Tailwind colors
    const confirmBtnClass = {
        danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200',
        success: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200' // Success also uses Blue to match standard
    }[variant] || 'bg-red-500 hover:bg-red-600 text-white';

    // Base config assuming simple text icon if no component
    const iconConfig = iconComponent ? {
        icon: undefined,
        iconHtml: iconComponent,
        customClass: {
            icon: 'border-0 bg-transparent shadow-none mb-4',
            htmlContainer: 'text-slate-500 text-sm mb-6',
            popup: 'rounded-2xl shadow-2xl border-0 p-6 w-full max-w-sm',
            actions: 'w-full flex gap-3 !mt-0',
            confirmButton: `w-full py-2.5 rounded-xl font-bold text-sm transition-all outline-none border-0 shadow-lg ${confirmBtnClass.replace('shadow-md', '')}`,
            cancelButton: 'w-full py-2.5 rounded-xl font-bold text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all outline-none border-0',
            title: 'text-xl font-bold text-slate-800 mb-2'
        }
    } : {
        icon: 'warning',
        customClass: {
            icon: 'border-0 mb-3 !text-sm',
            htmlContainer: 'text-slate-500 text-sm mb-6', // Removed px-2 to match Facturar
            popup: 'rounded-2xl shadow-2xl border-0 p-6 w-full max-w-sm', // Match Pedidos classes
            actions: 'w-full flex gap-3 !mt-0', // Remove default Swal spacing, rely on mb-6 from content
            confirmButton: `w-full py-2.5 rounded-xl font-bold text-sm transition-all outline-none border-0 shadow-lg ${confirmBtnClass.replace('shadow-md', '')}`, // Force shadow-lg, remove lower shadow if present
            cancelButton: 'w-full py-2.5 rounded-xl font-bold text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all outline-none border-0',
            title: 'text-xl font-bold text-slate-800 mb-2' // Removed mt-2
        }
    };

    // Merge customClass manually to avoid overwrite
    const finalCustomClass = {
        ...(iconConfig.customClass || {}),
        ...(rest.customClass || {})
    };

    // Remove customClass from rest so it doesn't overwrite our manual merge
    const { customClass, ...finalRest } = rest;

    return MySwal.fire({
        title: title,
        text: text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        buttonsStyling: false,
        padding: '0', // handled by custom classes
        focusCancel: true,
        ...iconConfig,
        customClass: finalCustomClass,
        ...finalRest
    });
};

export const showDeleteAlert = async (title, text, confirmText = 'Eliminar', options = {}) => {
    return showConfirmationAlert(title, text, confirmText, 'danger', options);
};

export const showSuccessAlert = async (title, text, confirmText = 'Aceptar', options = {}) => {
    // If iconComponent is provided, don't force 'success' icon, let the component handle it.
    const iconType = options.iconComponent ? undefined : 'success';

    return showConfirmationAlert(title, text, confirmText, 'success', {
        icon: iconType,
        ...options,
        showCancelButton: false,
        customClass: {
            ...options.customClass,
            cancelButton: 'hidden display-none'
        }
    });
};
