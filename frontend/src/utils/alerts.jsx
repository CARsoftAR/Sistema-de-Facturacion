import Swal from 'sweetalert2';

/**
 * Alertas con diseño Premium EXCLUSIVO (Neumorphic/Glass dynamic style).
 * Esta versión usa HTML nativo puro (string) para máxima compatibilidad con Vite/Fast Refresh.
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
        <p style="color: #64748b; font-weight: 500; font-size: 0.875rem; padding: 0 10px; line-height: 1.6; margin: 0;">
            ${text || ''}
        </p>
    `;

    return Swal.fire({
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
                <div style="margin-bottom: 24px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.05));">
                    ${iconHtml}
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 900; color: #0f172a; margin-bottom: 12px; margin-top: 0; letter-spacing: -0.025em;">${title}</h3>
                ${content}
            </div>
        `,
        showConfirmButton: showConfirmButton,
        confirmButtonText: confirmText,
        showCancelButton: showCancel,
        cancelButtonText: cancelText,
        buttonsStyling: false,
        reverseButtons: true,
        backdrop: 'rgba(15, 23, 42, 0.5)',
        padding: '2.5rem',
        timer: timer,
        icon: undefined,
        customClass: {
            popup: 'rounded-[1.5rem] lg:rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-0 overflow-hidden w-full max-w-[400px]',
            actions: 'w-full flex gap-3 mt-10',
            confirmButton: 'flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-xs uppercase tracking-[0.15em] border-0 outline-none',
            cancelButton: 'flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-xs uppercase tracking-wide bg-transparent'
        },
        didOpen: (popup) => {
            popup.style.borderRadius = '2.5rem';
            const confirmBtn = popup.querySelector('.swal2-confirm');
            if (confirmBtn) {
                confirmBtn.style.backgroundColor = confirmColor;
                confirmBtn.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
                confirmBtn.style.outline = 'none';
                confirmBtn.style.display = showConfirmButton ? 'block' : 'none';
            }
            const cancelBtn = popup.querySelector('.swal2-cancel');
            if (cancelBtn) {
                cancelBtn.style.boxShadow = 'none';
                cancelBtn.style.outline = 'none';
            }
        }
    });
};

export const showConfirmationAlert = async (title, text, confirmText = 'Confirmar', variant = 'danger', options = {}) => {
    // Icono Premium de Advertencia con Círculos Concéntricos
    const iconHtml = `
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="44" cy="44" r="40" fill="${variant === 'danger' ? '#fee2e2' : '#fef3c7'}"/>
            <circle cx="44" cy="44" r="40" stroke="${variant === 'danger' ? '#fecaca' : '#fcd34d'}" stroke-width="4" fill="none"/>
            <path d="M44 28V48M44 58H44.02" stroke="${variant === 'danger' ? '#ef4444' : '#f59e0b'}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    return firePremium({
        title,
        text,
        iconHtml,
        confirmText,
        confirmColor: variant === 'danger' ? '#ef4444' : '#2563eb',
        showCancel: true,
        ...options
    });
};

export const showSuccessAlert = async (title, text, confirmText = '¡ENTENDIDO!', options = {}) => {
    const iconHtml = `
        <svg width="88" height="88" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="42" cy="42" r="40" fill="#d1fae5"/>
            <circle cx="42" cy="42" r="40" stroke="#86efac" stroke-width="4" fill="none"/>
            <path d="M56 32L35.375 52.625L28 45.25" stroke="#10b981" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
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

export const showErrorAlert = async (title, text, confirmText = 'Cerrar', options = {}) => {
    const iconHtml = `
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="44" cy="44" r="40" fill="#fee2e2"/>
            <circle cx="44" cy="44" r="40" stroke="#fecaca" stroke-width="4" fill="none"/>
            <path d="M54 34L34 54M34 34L54 54" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>
        </svg>
    `;
    return firePremium({
        title,
        text,
        iconHtml: iconHtml,
        confirmText,
        confirmColor: '#ef4444',
        ...options
    });
};

export const showWarningAlert = async (title, text, confirmText = 'Entendido', options = {}) => {
    const iconHtml = `
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="44" cy="44" r="40" fill="#fef3c7"/>
            <circle cx="44" cy="44" r="40" stroke="#fcd34d" stroke-width="4" fill="none"/>
            <path d="M44 28V48M44 58H44.02" stroke="#f59e0b" stroke-width="8" stroke-linecap="round"/>
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

export const showDeleteAlert = async (title, text, confirmText = 'SI, ELIMINAR', options = {}) => {
    const iconHtml = `
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="44" cy="44" r="40" fill="#fee2e2"/>
            <circle cx="44" cy="44" r="40" stroke="#fecaca" stroke-width="4" fill="none"/>
            <path d="M54 32H34M36 32V56C36 57.1046 36.8954 58 38 58H50C51.1046 58 52 57.1046 52 56V32M42 32V28C42 26.8954 42.8954 26 44 26H44C45.1046 26 46 26.8954 46 28V32" stroke="#ef4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
        customClass: {
            popup: 'rounded-xl shadow-lg border-0'
        }
    });
    Toast.fire({ icon, title });
};
