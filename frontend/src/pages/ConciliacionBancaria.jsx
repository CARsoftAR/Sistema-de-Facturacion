import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Banknote,
    CheckCircle2,
    TrendingUp,
    TrendingDown,
    Filter,
    Calendar,
    Search,
    ChevronDown,
    Building
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
// import toast from 'react-hot-toast'; // Disabled for stability

const ConciliacionBancaria = () => {
    const [cuentas, setCuentas] = useState([]);
    const [selectedCuenta, setSelectedCuenta] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterConciliado, setFilterConciliado] = useState('no'); // 'si', 'no', 'todos'

    // Load Bank Accounts
    useEffect(() => {
        const fetchCuentas = async () => {
            try {
                const response = await axios.get('/api/bancos/listar/');
                if (response.data.ok) {
                    // FIX: Response key is 'cuentas', not 'bancos'
                    const cuentasList = response.data.cuentas || [];
                    setCuentas(cuentasList);
                    if (cuentasList.length > 0) {
                        setSelectedCuenta(cuentasList[0].id);
                    }
                }
            } catch (error) {
                console.error("Error cargando bancos:", error);
            }
        };
        fetchCuentas();
    }, []);

    // Load Movements
    useEffect(() => {
        if (!selectedCuenta) return;

        const fetchMovimientos = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/bancos/movimientos/', {
                    params: {
                        cuenta_id: selectedCuenta,
                        conciliado: filterConciliado
                    }
                });
                if (response.data.ok) {
                    setMovimientos(response.data.movimientos || []);
                }
            } catch (error) {
                console.error("Error cargando movimientos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovimientos();
    }, [selectedCuenta, filterConciliado]);

    // Handle Conciliation Toggle
    const handleConciliar = async (movimiento) => {
        const newValue = !movimiento.conciliado;

        // Optimistic Update
        const originalMovimientos = [...movimientos];
        setMovimientos(prev => prev.map(m =>
            m.id === movimiento.id ? { ...m, conciliado: newValue } : m
        ));

        try {
            const response = await axios.post('/api/bancos/conciliar/', {
                id: movimiento.id,
                conciliado: newValue
            });

            if (response.data.ok) {
                // Auto remove from list logic (delayed slightly for visual feedback)
                if (filterConciliado === 'no' && newValue) {
                    setTimeout(() => {
                        setMovimientos(prev => prev.filter(m => m.id !== movimiento.id));
                    }, 300);
                }
                if (filterConciliado === 'si' && !newValue) {
                    setTimeout(() => {
                        setMovimientos(prev => prev.filter(m => m.id !== movimiento.id));
                    }, 300);
                }
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error("Error conciliando:", error);
            setMovimientos(originalMovimientos); // Revert
        }
    };

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
        } catch (e) {
            return `$ ${amount}`;
        }
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in">
            {/* Header (Matching Cheques.jsx) */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <Building className="me-2 inline-block" size={32} />
                        Conciliación Bancaria
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Punteo de movimientos y control de extractos
                    </p>
                </div>
            </div>

            {/* Filters Card */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body p-2 d-flex flex-wrap gap-2 align-items-center">

                    {/* Account Selector */}
                    <div className="position-relative flex-grow-0" style={{ minWidth: '300px' }}>
                        <div className="input-group border-0 bg-light rounded overflow-hidden">
                            <span className="input-group-text border-0 bg-light text-primary">
                                <Banknote size={18} />
                            </span>
                            <select
                                className="form-select border-0 bg-light fw-medium"
                                value={selectedCuenta || ''}
                                onChange={(e) => setSelectedCuenta(e.target.value)}
                            >
                                {(cuentas || []).map(c => (
                                    <option key={c.id} value={c.id}>{c.banco} - {c.cbu}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="vr mx-2 text-muted"></div>

                    {/* Filter Buttons */}
                    {/* Filter Buttons */}
                    <div className="btn-group shadow-sm" role="group">
                        <button
                            type="button"
                            className={`btn btn-sm px-3 fw-bold border-0 transition-all`}
                            style={filterConciliado === 'no'
                                ? { backgroundColor: '#dbeafe', color: '#1e40af' } // Soft Blue
                                : { backgroundColor: '#ffffff', color: '#6c757d', border: '1px solid #dee2e6' }}
                            onClick={() => setFilterConciliado('no')}
                        >
                            Pendientes ({filterConciliado === 'no' ? movimientos.length : '...'})
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm px-3 fw-bold border-0 transition-all`}
                            style={filterConciliado === 'si'
                                ? { backgroundColor: '#dcfce7', color: '#166534' } // Soft Green
                                : { backgroundColor: '#ffffff', color: '#6c757d', border: '1px solid #dee2e6' }}
                            onClick={() => setFilterConciliado('si')}
                        >
                            Conciliados
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm px-3 fw-bold border-0 transition-all`}
                            style={filterConciliado === 'todos'
                                ? { backgroundColor: '#f3f4f6', color: '#1f2937' } // Soft Gray
                                : { backgroundColor: '#ffffff', color: '#6c757d', border: '1px solid #dee2e6' }}
                            onClick={() => setFilterConciliado('todos')}
                        >
                            Todos
                        </button>
                    </div>

                    <div className="ms-auto">
                        <span className="text-muted small">
                            <Filter size={14} className="me-1" />
                            Mostrando {movimientos.length} movimientos
                        </span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold" style={{ width: '60px' }}></th>
                                    <th className="py-3 fw-bold">Fecha</th>
                                    <th className="py-3 fw-bold">Concepto / Descripción</th>
                                    <th className="py-3 fw-bold">Referencia</th>
                                    <th className="text-end pe-4 py-3 fw-bold">Importe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : movimientos.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <EmptyState
                                                title="Todo al día"
                                                description="No hay movimientos pendientes para la selección actual."
                                                icon={CheckCircle2}
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    movimientos.map((mov) => {
                                        const isPositive = mov.monto > 0;
                                        return (
                                            <tr key={mov.id} className={`${mov.conciliado ? 'bg-light opacity-50' : ''} hover-bg-light`}>
                                                <td className="ps-4">
                                                    <div className="form-check d-flex align-items-center justify-content-center">
                                                        <input
                                                            className="form-check-input shadow-sm"
                                                            type="checkbox"
                                                            checked={mov.conciliado}
                                                            onChange={() => handleConciliar(mov)}
                                                            style={{ cursor: 'pointer', transform: 'scale(1.3)', borderColor: mov.conciliado ? '#198754' : '#ced4da' }}
                                                            title={mov.conciliado ? "Desmarcar Conciliado" : "Marcar Conciliado"}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="text-nowrap fw-medium text-dark-emphasis">{mov.fecha}</td>
                                                <td>
                                                    <div className="fw-medium text-dark">{mov.descripcion}</div>
                                                </td>
                                                <td>
                                                    {mov.referencia ? <span className="badge bg-light text-dark border px-2 py-1">{mov.referencia}</span> : <span className="text-muted small">-</span>}
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className={`fw-bold d-flex align-items-center justify-content-end gap-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
                                                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                        {formatCurrency(Math.abs(mov.monto))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConciliacionBancaria;
