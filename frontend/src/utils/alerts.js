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
    const confirmBtnClass = {
        danger: 'btn-danger',
        primary: 'btn-primary',
        success: 'btn-success'
    }[variant] || 'btn-danger';

    // Base config assuming simple text icon if no component
    const iconConfig = iconComponent ? {
        icon: undefined,
        iconHtml: iconComponent,
        customClass: {
            icon: 'border-0 bg-transparent shadow-none mb-3', // Allow custom component to handle its own circles
            htmlContainer: 'text-muted small mb-4',
            popup: 'rounded-4 shadow-lg border-0 py-4 px-3',
            actions: 'w-100 d-flex justify-content-center gap-3',
            confirmButton: `btn ${confirmBtnClass} rounded-3 px-4 py-2 fw-bold shadow-sm border-0 flex-grow-1`,
            cancelButton: 'btn btn-light rounded-3 px-4 py-2 fw-bold text-secondary shadow-sm border-0 flex-grow-1 bg-light',
            title: 'fs-4 fw-bold text-dark mb-2'
        }
    } : {
        icon: 'warning',
        customClass: {
            icon: 'border-0 mb-3',
            htmlContainer: 'text-muted small mb-4',
            popup: 'rounded-4 shadow-lg border-0 py-4 px-3',
            actions: 'w-100 d-flex justify-content-center gap-3',
            confirmButton: `btn ${confirmBtnClass} rounded-3 px-4 py-2 fw-bold shadow-sm border-0 flex-grow-1`,
            cancelButton: 'btn btn-light rounded-3 px-4 py-2 fw-bold text-secondary shadow-sm border-0 flex-grow-1 bg-light',
            title: 'fs-4 fw-bold text-dark mb-2'
        }
    };

    return MySwal.fire({
        title: title,
        text: text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        buttonsStyling: false,
        width: '380px',
        padding: '0', // handled by custom classes
        focusCancel: true,
        ...iconConfig,
        ...rest
    });
};

export const showDeleteAlert = async (title, text, confirmText = 'Eliminar', options = {}) => {
    return showConfirmationAlert(title, text, confirmText, 'danger', options);
};
