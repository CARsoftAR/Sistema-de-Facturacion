import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const showDeleteAlert = async (title, text, confirmText = 'Eliminar', options = {}) => {
    const { iconComponent } = options;

    const iconConfig = iconComponent ? {
        icon: undefined, // Disable default icon
        iconHtml: iconComponent,
        customClass: {
            // override default icon styles to allow our custom circular styling
            icon: 'border-0 bg-transparent shadow-none',
            htmlContainer: 'text-muted small mb-4',
            popup: 'rounded-4 shadow-lg border-0',
            actions: 'w-100 d-flex justify-content-center gap-3',
            confirmButton: 'btn btn-danger rounded-3 px-4 py-2 fw-bold shadow-sm border-0 flex-grow-1',
            cancelButton: 'btn btn-light rounded-3 px-4 py-2 fw-bold text-secondary shadow-sm border-0 flex-grow-1 bg-light',
        }
    } : {
        icon: 'warning',
        customClass: {
            popup: 'rounded-4 shadow-lg border-0',
            icon: 'border-0',
            title: 'fs-4 fw-bold text-dark mb-1',
            htmlContainer: 'text-muted small mb-4',
            actions: 'w-100 d-flex justify-content-center gap-3',
            confirmButton: 'btn btn-danger rounded-3 px-4 py-2 fw-bold shadow-sm border-0 flex-grow-1',
            cancelButton: 'btn btn-light rounded-3 px-4 py-2 fw-bold text-secondary shadow-sm border-0 flex-grow-1 bg-light',
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
        padding: '2rem',
        focusCancel: true,
        ...iconConfig
    });
};
