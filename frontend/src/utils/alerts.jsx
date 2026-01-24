import Swal from 'sweetalert2';

/**
 * Alertas con diseño Premium EXACTAMENTE como el de Compras.
 * Esta versión usa HTML nativo puro (string) para evitar errores de React/Vite.
 */
const firePremium = (options) => {
    const {
        title,
        text,
        iconHtml = '',
        confirmText = 'Aceptar',
        confirmColor = '#2563eb',
        showCancel = false,
        cancelText = 'Cancelar',
        timer = undefined,
        showConfirmButton = true
    } = options;

    return Swal.fire({
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; font-family: 'Inter', sans-serif;">
                <div style="margin-bottom: 20px;">
                    ${iconHtml}
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 900; color: #1e293b; margin-bottom: 8px; margin-top: 0;">${title}</h3>
                <p style="color: #64748b; font-weight: 500; font-size: 0.875rem; padding: 0 10px; line-height: 1.5; margin: 0;">
                    ${text || ''}
                </p>
            </div>
        `,
        showConfirmButton: showConfirmButton,
        confirmButtonText: confirmText,
        showCancelButton: showCancel,
        cancelButtonText: cancelText,
        buttonsStyling: false,
        reverseButtons: true,
        backdrop: 'rgba(15, 23, 42, 0.6)',
        padding: '2rem',
        timer: timer,
        customClass: {
            popup: 'rounded-premium-alert shadow-2xl border border-slate-200 overflow-hidden w-full max-w-sm',
            actions: 'w-full flex gap-3 mt-8',
            confirmButton: 'flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all text-sm uppercase tracking-wide border-0 outline-none',
            cancelButton: 'flex-1 py-3.5 border-2 border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm uppercase tracking-wide bg-transparent'
        },
        didOpen: (popup) => {
            // Inyectar clase de redondeado masivo si no existiera
            popup.style.borderRadius = '2rem';
            const confirmBtn = popup.querySelector('.swal2-confirm');
            if (confirmBtn) {
                confirmBtn.style.backgroundColor = confirmColor;
                if (confirmColor === '#ef4444') {
                    confirmBtn.style.boxShadow = '0 10px 15px -3px rgba(239, 68, 68, 0.3)';
                } else {
                    confirmBtn.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3)';
                }
                confirmBtn.style.flex = '1';
                confirmBtn.style.display = showConfirmButton ? 'block' : 'none';
            }
            const cancelBtn = popup.querySelector('.swal2-cancel');
            if (cancelBtn) {
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

export const showSuccessAlert = async (title, text, confirmText = 'Aceptar', options = {}) => {
    const icon = `
        <div style="width: 80px; height: 80px; background-color: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #dcfce7; color: #16a34a;">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
    `;
    return firePremium({
        title,
        text,
        iconHtml: icon,
        confirmText,
        variant: 'success',
        confirmColor: '#2563eb',
        ...options
    });
};

export const showWarningAlert = async (title, text, confirmText = 'Entendido', options = {}) => {
    const icon = `
        <div style="width: 80px; height: 80px; background-color: #fff7ed; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #ffedd5; color: #f97316;">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
    `;
    return firePremium({
        title,
        text,
        iconHtml: icon,
        confirmText,
        showCancel: false,
        ...options
    });
};

export const showDeleteAlert = async (title, text, confirmText = 'Eliminar', options = {}) => {
    const icon = `
        <div style="width: 80px; height: 80px; background-color: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #fee2e2; color: #dc2626;">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </div>
    `;
    return firePremium({
        title,
        text,
        iconHtml: icon,
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
