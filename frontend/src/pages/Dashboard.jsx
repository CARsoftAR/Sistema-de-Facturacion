
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingCart,
    Wallet,
    Clock,
    AlertTriangle,
    TrendingUp,
    Package,
    Truck,
    MoreHorizontal,
    PlusCircle,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/dashboard/stats/');
                if (!response.ok) throw new Error('Error al cargar datos');
                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error("Dashboard Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger" role="alert">
                    No se pudo cargar el dashboard: {error}
                </div>
            </div>
        );
    }

    console.log("Dashboard Loaded. Stats:", stats); // DEBUG: Check console for data
    const { kpi, chart, actividad_reciente, top_productos } = stats;

    // --- Simple SVG Area Chart Helper ---
    const Chart = ({ labels, data }) => {
        if (!data || data.length === 0) return null;

        const height = 200;
        const width = 800;
        const padding = 40; // Increased padding to prevent edge cutoff
        const effectiveWidth = width - (padding * 2);

        // Add 20% headroom so the highest point isn't at the very top edge
        const maxVal = Math.max(...data, 100) * 1.2;

        const points = data.map((val, index) => {
            const x = padding + (index / (data.length - 1)) * effectiveWidth;
            const y = height - (val / maxVal) * height;
            return `${x},${y}`;
        }).join(' ');

        // Fill area
        const fillPath = `${padding},${height} ${points} ${width - padding},${height}`;

        return (
            <div style={{ width: '100%', overflow: 'hidden' }}>
                <svg viewBox={`0 0 ${width} ${height + 50}`} className="w-100" style={{ height: '240px' }}>
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#0d6efd" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                        <line
                            key={p}
                            x1={padding}
                            y1={height - (height * p)}
                            x2={width - padding}
                            y2={height - (height * p)}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    ))}

                    <polygon points={fillPath} fill="url(#chartGradient)" />
                    <polyline points={points} fill="none" stroke="#0d6efd" strokeWidth="3" vectorEffect="non-scaling-stroke" />

                    {data.map((val, index) => {
                        const x = padding + (index / (data.length - 1)) * effectiveWidth;
                        const y = height - (val / maxVal) * height;
                        return (
                            <g key={index} className="point-group">
                                {/* Vertical Drop Line (Dashed) to connect point to date */}
                                <line
                                    x1={x}
                                    y1={y}
                                    x2={x}
                                    y2={height}
                                    stroke="#e5e7eb"
                                    strokeWidth="1"
                                    strokeDasharray="4 2"
                                />

                                <circle cx={x} cy={y} r="5" fill="#fff" stroke="#0d6efd" strokeWidth="2" className="transition-all hover:r-6" />

                                {/* Value Label (Top) */}
                                {val >= 0 && (
                                    <text
                                        x={x}
                                        y={y - 15}
                                        textAnchor="middle"
                                        fill="#0d6efd"
                                        fontSize="14"
                                        fontWeight="bold"
                                        style={{ pointerEvents: 'none', textShadow: '0px 0px 2px white' }}
                                    >
                                        ${val.toLocaleString()}
                                    </text>
                                )}

                                {/* Date Label (Bottom) - Perfectly Aligned */}
                                <text
                                    x={x}
                                    y={height + 25}
                                    textAnchor="middle"
                                    fill="#6c757d"
                                    fontSize="12"
                                    fontWeight="500"
                                >
                                    {labels[index]}
                                </text>

                                <title>${val.toLocaleString()} - {labels[index]}</title>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };


    return (
        <div className="container-fluid p-4 fade-in">
            {/* Header */}
            <header className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold text-dark mb-0">Tablero de Control</h1>
                    <p className="text-secondary mb-0">Resumen general de tu negocio</p>
                </div>
                <div>
                    <span className="badge bg-light text-dark border px-3 py-2">
                        {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="row g-4 mb-4">
                {/* Ventas Hoy */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h6 className="text-uppercase text-muted small fw-bold mb-1">Ventas Hoy</h6>
                                    <h2 className="mb-0 fw-bold text-primary">${kpi.ventas_hoy.toLocaleString()}</h2>
                                </div>
                                <div className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary">
                                    <ShoppingCart size={24} />
                                </div>
                            </div>
                            <div className="small text-success d-flex align-items-center">
                                <TrendingUp size={14} className="me-1" />
                                <span>Ingresos del día</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Caja */}
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h6 className="text-uppercase text-muted small fw-bold mb-1">Caja Chica</h6>
                                    <h2 className="mb-0 fw-bold text-success">${kpi.caja_hoy.toLocaleString()}</h2>
                                </div>
                                <div className="p-2 bg-success bg-opacity-10 rounded-3 text-success">
                                    <Wallet size={24} />
                                </div>
                            </div>
                            <div className="small text-muted">
                                Movimientos registrados hoy
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pedidos Pendientes */}
                <div className="col-12 col-md-6 col-xl-3">
                    <Link to="/pedidos" className="text-decoration-none">
                        <div className="card border-0 shadow-sm h-100 card-hover-effect">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="text-uppercase text-muted small fw-bold mb-1">Pendientes</h6>
                                        <h2 className="mb-0 fw-bold text-warning">{kpi.pedidos_pendientes}</h2>
                                    </div>
                                    <div className="p-2 bg-warning bg-opacity-10 rounded-3 text-warning">
                                        <Clock size={24} />
                                    </div>
                                </div>
                                <div className="small text-warning fw-semibold">
                                    Pedidos por procesar
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Stock Bajo */}
                <div className="col-12 col-md-6 col-xl-3">
                    <Link to="/productos" className="text-decoration-none">
                        <div className="card border-0 shadow-sm h-100 card-hover-effect">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="text-uppercase text-muted small fw-bold mb-1">Stock Alerta</h6>
                                        <h2 className="mb-0 fw-bold text-danger">{kpi.stock_bajo}</h2>
                                    </div>
                                    <div className="p-2 bg-danger bg-opacity-10 rounded-3 text-danger">
                                        <AlertTriangle size={24} />
                                    </div>
                                </div>
                                <div className="small text-danger fw-semibold">
                                    Productos con bajo stock
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Main Content: Chart + Actions */}
                <div className="col-12 col-lg-8">
                    {/* Sales Chart */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="card-title fw-bold mb-0">Evolución de Ventas (7 días)</h5>
                        </div>
                        <div className="card-body">
                            <Chart labels={chart.labels} data={chart.data} />
                        </div>
                    </div>

                    {/* Quick Stats/Actions */}
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-0 py-3">
                                    <h6 className="fw-bold mb-0">Accesos Rápidos</h6>
                                </div>
                                <div className="card-body d-grid gap-2">
                                    <Link to="/ventas/nuevo" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2">
                                        <PlusCircle size={18} /> Nueva Venta
                                    </Link>
                                    <Link to="/compras/nueva" className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 py-2">
                                        <Truck size={18} /> Nueva Compra
                                    </Link>
                                    <Link to="/productos/nuevo" className="btn btn-light border d-flex align-items-center justify-content-center gap-2 py-2">
                                        <Package size={18} /> Nuevo Producto
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            {/* Top Products */}
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-0 py-3">
                                    <h6 className="fw-bold mb-0">Más Vendidos (30d)</h6>
                                </div>
                                <div className="list-group list-group-flush">
                                    {top_productos.length === 0 ? (
                                        <div className="p-3 text-muted text-center small">Sin datos</div>
                                    ) : (
                                        top_productos.map((prod, idx) => (
                                            <div key={idx} className="list-group-item d-flex justify-content-between align-items-center px-3 py-2 border-0">
                                                <div className="text-truncate me-2" style={{ maxWidth: '180px' }}>
                                                    <small className="fw-medium text-dark">{prod.producto}</small>
                                                </div>
                                                <span className="badge bg-light text-dark border rounded-pill">{prod.total} un.</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content: Recent Activity */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Actividad Reciente</h5>
                            <Link to="/ventas" className="btn btn-link btn-sm p-0">Ver todo</Link>
                        </div>
                        <div className="list-group list-group-flush">
                            {actividad_reciente.length === 0 ? (
                                <div className="p-4 text-center text-muted">
                                    <p className="mb-0">No hay actividad registrada</p>
                                </div>
                            ) : (
                                actividad_reciente.map((item, index) => (
                                    <div key={index} className="list-group-item px-3 py-3 border-light">
                                        <div className="d-flex align-items-center">
                                            <div className={`p-2 rounded-circle bg-${item.color} bg-opacity-10 text-${item.color} me-3`}>
                                                {item.tipo === 'VENTA' ? <ShoppingCart size={18} /> : <FileText size={18} />}
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-0 small fw-bold text-dark">{item.texto}</h6>
                                                <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>{item.subtexto}</p>
                                            </div>
                                            <div className="text-end">
                                                <span className="text-muted" style={{ fontSize: '11px' }}>{item.fecha.split(' ')[0]}</span>
                                                <div className="text-muted" style={{ fontSize: '11px' }}>{item.fecha.split(' ')[1]}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Dashboard;
