import Swal from 'sweetalert2';

/**
 * Alertas con diseño Premium EXACTAMENTE como el de Compras.
 * Esta versión usa HTML nativo puro (string) para evitar errores de React/Vite.
 */
const firePremium = (options) => {
    const {
        title,
        text,
        html,
        iconHtml = '',
        confirmText = 'Aceptar',
        confirmColor = '#2563eb',
        showCancel = false,
        cancelText = 'Cancelar',
        timer = undefined,
        showConfirmButton = true
    } = options;

    const content = html || `
        <p style="color: #64748b; font-weight: 500; font-size: 0.875rem; padding: 0 10px; line-height: 1.5; margin: 0;">
            ${text || ''}
        </p>
    `;

    return Swal.fire({
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; font-family: 'Inter', sans-serif;">
                <div style="margin-bottom: 20px;">
                    ${iconHtml}
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 900; color: #1e293b; margin-bottom: 12px; margin-top: 0;">${title}</h3>
                ${content}
            </div>
        `,
        showConfirmButton: showConfirmButton,
        confirmButtonText: confirmText,
        showCancelButton: showCancel,
        cancelButtonText: cancelText,
        buttonsStyling: false,
        reverseButtons: true,
        backdrop: 'rgba(15, 23, 42, 0.4)',
        padding: '2rem',
        timer: timer,
        icon: undefined,
        customClass: {
            popup: 'rounded-premium-alert shadow-2xl border-0 overflow-hidden w-full max-w-sm',
            actions: 'w-full flex gap-3 mt-8',
            confirmButton: 'flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all text-sm uppercase tracking-wide border-0 outline-none',
            cancelButton: 'flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm uppercase tracking-wide bg-transparent'
        },
        didOpen: (popup) => {
            popup.style.borderRadius = '2.5rem';
            const confirmBtn = popup.querySelector('.swal2-confirm');
            if (confirmBtn) {
                confirmBtn.style.backgroundColor = confirmColor;
                confirmBtn.style.boxShadow = 'none';
                confirmBtn.style.outline = 'none';
                confirmBtn.style.flex = '1';
                confirmBtn.style.display = showConfirmButton ? 'block' : 'none';
            }
            const cancelBtn = popup.querySelector('.swal2-cancel');
            if (cancelBtn) {
                cancelBtn.style.boxShadow = 'none';
                cancelBtn.style.outline = 'none';
                cancelBtn.style.flex = '1';
            }
        }
    });
};

export const showConfirmationAlert = async (title, text, confirmText = 'Confirmar', variant = 'danger', options = {}) => {
    return firePremium({
        title,
        text,
        confirmText,
        confirmColor: variant === 'danger' ? '#ef4444' : '#2563eb',
        showCancel: true,
        ...options
    });
};

export const showSuccessAlert = async (title, text, confirmText = 'OK', options = {}) => {
    // Icono con círculo de fondo verde claro Y borde circular verde
    const iconHtml = `
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
            <circle cx="42" cy="42" r="40" fill="#d1fae5"/>
            <circle cx="42" cy="42" r="40" stroke="#86efac" stroke-width="4" fill="none"/>
            <path d="M56 32L35.375 52.625L28 45.25" stroke="#10b981" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    return firePremium({
        title,
        text,
        iconHtml: iconHtml,
        confirmText,
        confirmColor: '#2563eb',
        ...options
    });
};

export const showErrorAlert = async (title, text, confirmText = 'Entendido', options = {}) => {
    const iconHtml = `
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="42" cy="42" r="42" fill="#fee2e2"/>
            <path d="M52 32L32 52M32 32L52 52" stroke="#ef4444" stroke-width="7" stroke-linecap="round"/>
        </svg>
    `;
    return firePremium({
        title,
        text,
        iconHtml: iconHtml,
        confirmText,
        confirmColor: '#2563eb',
        ...options
    });
};

export const showWarningAlert = async (title, text, confirmText = 'Entendido', options = {}) => {
    const iconHtml = `
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="42" cy="42" r="42" fill="#fef3c7"/>
            <path d="M42 28V46M42 56H42.02" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/>
        </svg>
    `;
    return firePremium({
        title,
        text,
        iconHtml: iconHtml,
        confirmText,
        showCancel: false,
        confirmColor: '#2563eb',
        ...options
    });
};

export const showDeleteAlert = async (title, text, confirmText = 'Eliminar', options = {}) => {
    const iconHtml = `
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="42" cy="42" r="42" fill="#fee2e2"/>
            <path d="M54 30H30M32 30V54C32 55.1046 32.8954 56 34 56H50C51.1046 56 52 55.1046 52 54V30M38 30V26C38 24.8954 38.8954 24 40 24H44C45.1046 24 46 24.8954 46 26V30" stroke="#ef4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    return firePremium({
        title,
        text,
        iconHtml: iconHtml,
        confirmText,
        confirmColor: '#ef4444',
        showCancel: true,
        ...options
    });
};

export const showToast = (title, icon = 'success') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
    Toast.fire({ icon, title });
};
