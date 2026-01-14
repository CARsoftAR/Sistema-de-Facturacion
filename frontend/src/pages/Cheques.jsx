import React from 'react';
import { Banknote, AlertCircle } from 'lucide-react';

const Cheques = () => {
    return (
        <div className="container-fluid px-4 py-4 fade-in">
            <h2 className="text-primary fw-bold mb-4 d-flex align-items-center gap-2">
                <Banknote size={32} />
                Cheques y Bancos
            </h2>

            <div className="alert alert-info d-flex align-items-center gap-3 shadow-sm rounded-3 bg-white border-start border-4 border-info text-dark">
                <AlertCircle size={24} className="text-info" />
                <div>
                    <h5 className="mb-1 fw-bold">Módulo en Desarrollo</h5>
                    <p className="mb-0 text-muted">Esta funcionalidad estará disponible próximamente.</p>
                </div>
            </div>

            {/* Placeholder for future content */}
            <div className="card shadow-sm border-0 rounded-4 mt-4">
                <div className="card-body p-5 text-center text-muted">
                    <Banknote size={48} className="mb-3 opacity-25" />
                    <p className="fw-medium">Aquí se visualizará la gestión de cheques y cuentas bancarias.</p>
                </div>
            </div>
        </div>
    );
};

export default Cheques;
