
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
    CreditCard,
    LayoutDashboard
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarTab, setSidebarTab] = useState('activity'); // 'activity', 'clients', 'products'

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const params = new URLSearchParams({
                    fecha_start: dateRange.start,
                    fecha_end: dateRange.end
                });
                const response = await fetch(`/api/dashboard/stats/?${params}`);
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
    }, [dateRange]); // Refetch when dates change

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

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
    const { kpi, chart, actividad_reciente, top_productos, rentabilidad, top_clientes, stock_bajo_list, pedidos_pendientes_list } = stats;

    // --- Simple SVG Area Chart Helper ---
    // --- Multi-Dataset SVG Chart Helper ---
    const Chart = ({ labels, datasets }) => {
        if (!datasets || datasets.length === 0) return null;

        const height = 240;
        const width = 800;
        const padding = 40;
        const effectiveWidth = width - (padding * 2);
        const effectiveHeight = height - (padding * 2);

        // Find max value across all datasets
        let maxVal = 0;
        datasets.forEach(ds => {
            const m = Math.max(...ds.data, 0);
            if (m > maxVal) maxVal = m;
        });
        maxVal = maxVal * 1.2 || 100; // Add headroom

        const getPoints = (data) => {
            return data.map((val, index) => {
                const x = padding + (index / (data.length - 1)) * effectiveWidth;
                const y = height - padding - (val / maxVal) * effectiveHeight;
                return `${x},${y}`;
            }).join(' ');
        };

        return (
            <div style={{ width: '100%', overflow: 'hidden' }}>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-100" style={{ height: '300px' }}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                        const y = height - padding - (effectiveHeight * p);
                        return (
                            <g key={p}>
                                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e9ecef" strokeWidth="1" strokeDasharray="4 4" />
                                <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#adb5bd">${Math.round(maxVal * p).toLocaleString()}</text>
                            </g>
                        );
                    })}

                    {/* X Axis Labels */}
                    {labels.map((label, index) => {
                        const x = padding + (index / (labels.length - 1)) * effectiveWidth;

                        // Smart Label Skipping: Ensure max ~8 labels
                        const skip = Math.ceil(labels.length / 8);
                        if (index % skip !== 0 && index !== labels.length - 1) return null;

                        return (
                            <text key={index} x={x} y={height - 15} textAnchor="middle" fontSize="11" fill="#6c757d">{label}</text>
                        );
                    })}

                    {/* Datasets */}
                    {datasets.map((ds, dsIndex) => {
                        const points = getPoints(ds.data);
                        const fillPath = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

                        return (
                            <g key={dsIndex}>
                                <polygon points={fillPath} fill={ds.backgroundColor} />
                                <polyline points={points} fill="none" stroke={ds.borderColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                {ds.data.map((val, i) => {
                                    const x = padding + (i / (ds.data.length - 1)) * effectiveWidth;
                                    const y = height - padding - (val / maxVal) * effectiveHeight;
                                    return (
                                        <g key={i}>
                                            <circle cx={x} cy={y} r="4" fill="#fff" stroke={ds.borderColor} strokeWidth="2" />
                                            {/* Tooltip-like value on hover? Simplified for static: just dots */}
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })}
                </svg>
                {/* Legend */}
                <div className="d-flex justify-content-center gap-4 mt-2">
                    {datasets.map((ds, i) => (
                        <div key={i} className="d-flex align-items-center">
                            <span style={{ width: 12, height: 12, backgroundColor: ds.borderColor, borderRadius: '50%', display: 'inline-block', marginRight: 8 }}></span>
                            <span className="small text-muted fw-semibold">{ds.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    // --- Profit Distribution Doughnut Chart Helper ---
    const ProfitDistributionChart = ({ stats }) => {
        if (!stats) return null;
        const { ventas, costos, gastos, ganancia_neta } = stats;

        // Ensure positive values for visualization
        const v = Math.max(0, parseFloat(ventas) || 0);
        const c = Math.max(0, parseFloat(costos) || 0);
        const g = Math.max(0, parseFloat(gastos) || 0);
        const profit = Math.max(0, parseFloat(ganancia_neta) || 0);

        // If loss, we chart Costs vs Expenses only (or handle differently)
        const total = profit > 0 ? v : (c + g);

        if (total === 0) return (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                Sin datos
            </div>
        );

        // Segments for Chart (only positive)
        const chartSegs = [
            { label: 'Costo', value: c, color: '#dc3545' }, // Danger
            { label: 'Gasto', value: g, color: '#ffc107' }, // Warning
            { label: 'Ganancia', value: profit, color: '#198754' } // Success
        ].filter(s => s.value > 0);

        // Segments for Legend (Always show all to be explicit)
        const legendSegs = [
            { label: 'Costo', value: c, color: '#dc3545' },
            { label: 'Gasto', value: g, color: '#ffc107' },
            { label: 'Ganancia', value: profit, color: '#198754' }
        ];

        let accumulatedAngle = 0;

        return (
            <div className="d-flex align-items-center justify-content-between h-100 px-3">
                {/* SVG Donut */}
                <div style={{ width: '100px', height: '100px', position: 'relative' }}>
                    <svg viewBox="0 0 100 100" className="w-100 h-100" style={{ transform: 'rotate(-90deg)' }}>
                        {chartSegs.map((seg, i) => {
                            const percentage = seg.value / total;

                            const circleEl = (
                                <circle
                                    key={i}
                                    cx="50" cy="50" r="15.9155"
                                    fill="transparent"
                                    stroke={seg.color}
                                    strokeWidth="8"
                                    strokeDasharray={`${percentage * 100} 100`}
                                    strokeDashoffset={-accumulatedAngle} // 0-100 scale because C=100
                                />
                            );
                            accumulatedAngle += percentage * 100;
                            return circleEl;
                        })}
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ lineHeight: 1 }}>
                        <div className={profit > 0 ? "fw-bold text-success" : "fw-bold text-danger"} style={{ fontSize: '0.8rem' }}>
                            {profit > 0 ? `${Math.round((profit / v) * 100)}%` : '0%'}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="ps-3 d-flex flex-column justify-content-center" style={{ fontSize: '0.75rem' }}>
                    {legendSegs.map((seg, i) => {
                        const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
                        return (
                            <div key={i} className="d-flex align-items-center mb-1">
                                <span className="rounded-circle me-2" style={{ width: 8, height: 8, backgroundColor: seg.color }}></span>
                                <div className="d-flex w-100 justify-content-between gap-1">
                                    <span className="text-muted">{seg.label}</span>
                                    <span className="fw-bold">{pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid p-4 fade-in">
            {/* Header */}
            <header className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <LayoutDashboard className="me-2 inline-block" size={32} />
                        Tablero de Control
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Resumen general de tu negocio
                    </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center bg-white border rounded p-1 shadow-sm">
                        <input
                            type="date"
                            name="start"
                            value={dateRange.start}
                            onChange={handleDateChange}
                            className="form-control border-0 bg-transparent py-1 shadow-none"
                            style={{ fontSize: '0.9rem', width: '130px' }}
                        />
                        <span className="text-muted mx-1">-</span>
                        <input
                            type="date"
                            name="end"
                            value={dateRange.end}
                            onChange={handleDateChange}
                            className="form-control border-0 bg-transparent py-1 shadow-none"
                            style={{ fontSize: '0.9rem', width: '130px' }}
                        />
                    </div>
                </div>
            </header>

            {/* RENTABILIDAD & CHART SECTION */}
            {rentabilidad && (
                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <h6 className="text-muted small fw-bold text-uppercase mb-2">Rentabilidad Estimada ({stats.rentabilidad?.start} - {stats.rentabilidad?.end})</h6>
                    </div>

                    {/* Metrics (Col-9) */}
                    <div className="col-12 col-xl-9">
                        <div className="row g-2 h-100">
                            {/* Ventas */}
                            <div className="col">
                                <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #dbeafe 0%, #ffffff 100%)' }}>
                                    <div className="card-body p-2 d-flex flex-column justify-content-between">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="text-muted xsmall fw-bold" style={{ fontSize: '0.7rem' }}>VENTAS</div>
                                            <div className="text-primary"><TrendingUp size={16} /></div>
                                        </div>
                                        <h5 className="fw-bold mb-0 text-truncate" title={rentabilidad.ventas.toLocaleString()}>${rentabilidad.ventas.toLocaleString()}</h5>
                                    </div>
                                </div>
                            </div>
                            {/* Costos */}
                            <div className="col">
                                <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #fee2e2 0%, #ffffff 100%)' }}>
                                    <div className="card-body p-2 d-flex flex-column justify-content-between">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="text-muted xsmall fw-bold" style={{ fontSize: '0.7rem' }}>COSTOS</div>
                                            <div className="text-danger"><ArrowDownRight size={16} /></div>
                                        </div>
                                        <h5 className="fw-bold mb-0 text-danger text-truncate" title={(rentabilidad.costos + rentabilidad.gastos).toLocaleString()}>-${(rentabilidad.costos + rentabilidad.gastos).toLocaleString()}</h5>
                                        <div className="text-muted text-truncate" style={{ fontSize: '0.65rem' }}>Globales</div>
                                    </div>
                                </div>
                            </div>
                            {/* Ganancia */}
                            <div className="col">
                                <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #dcfce7 0%, #ffffff 100%)' }}>
                                    <div className="card-body p-2 d-flex flex-column justify-content-between">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="text-success xsmall fw-bold" style={{ fontSize: '0.7rem' }}>GANANCIA</div>
                                            <div className="text-success"><Wallet size={16} /></div>
                                        </div>
                                        <h5 className="fw-bold mb-0 text-success text-truncate" title={rentabilidad.ganancia_neta.toLocaleString()}>${rentabilidad.ganancia_neta.toLocaleString()}</h5>
                                    </div>
                                </div>
                            </div>
                            {/* Margen */}
                            <div className="col">
                                <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #cffafe 0%, #ffffff 100%)' }}>
                                    <div className="card-body p-2 d-flex flex-column justify-content-between">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="text-muted xsmall fw-bold" style={{ fontSize: '0.7rem' }}>MARGEN</div>
                                            <div className="text-info"><CreditCard size={16} /></div>
                                        </div>
                                        <h5 className={`fw-bold mb-0 text-truncate ${rentabilidad.margen > 0 ? 'text-success' : 'text-danger'}`}>{rentabilidad.margen}%</h5>
                                        <div className="text-muted text-truncate" style={{ fontSize: '0.65rem' }}>Neto</div>
                                    </div>
                                </div>
                            </div>
                            {/* Ticket */}
                            <div className="col">
                                <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #e2e8f0 0%, #ffffff 100%)' }}>
                                    <div className="card-body p-2 d-flex flex-column justify-content-between">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="text-muted xsmall fw-bold" style={{ fontSize: '0.7rem' }}>TICKET</div>
                                            <div className="text-secondary"><FileText size={16} /></div>
                                        </div>
                                        <h5 className="fw-bold mb-0 text-truncate" title={rentabilidad.ticket_promedio?.toLocaleString()}>${rentabilidad.ticket_promedio?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h5>
                                        <div className="text-muted text-truncate" style={{ fontSize: '0.65rem' }}>Promedio</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart (Col-3) */}
                    <div className="col-12 col-xl-3">
                        <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #f3e8ff 0%, #ffffff 100%)' }}>
                            <div className="card-body p-1">
                                <ProfitDistributionChart stats={rentabilidad} />
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* KPI Cards (Today) */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #dbeafe 0%, #ffffff 100%)' }}>
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted xsmall fw-bold mb-1" style={{ fontSize: '0.7rem' }}>VENTAS HOY</div>
                                <h5 className="mb-0 fw-bold text-primary">${kpi.ventas_hoy.toLocaleString()}</h5>
                            </div>
                            <div className="p-2 bg-primary bg-opacity-10 rounded text-primary"><ShoppingCart size={18} /></div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(145deg, #dcfce7 0%, #ffffff 100%)' }}>
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted xsmall fw-bold mb-1" style={{ fontSize: '0.7rem' }}>CAJA HOY</div>
                                <h5 className="mb-0 fw-bold text-success">${kpi.caja_hoy.toLocaleString()}</h5>
                            </div>
                            <div className="p-2 bg-success bg-opacity-10 rounded text-success"><Wallet size={18} /></div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <Link to="/pedidos?estado=PENDIENTE" className="text-decoration-none">
                        <div className="card shadow-sm h-100 card-hover-effect border-0" style={{ background: 'linear-gradient(145deg, #fef3c7 0%, #ffffff 100%)' }}>
                            <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="text-muted xsmall fw-bold mb-1" style={{ fontSize: '0.7rem' }}>PEDIDOS PENDIENTES</div>
                                    <h5 className="mb-0 fw-bold text-warning">{kpi.pedidos_pendientes}</h5>
                                </div>
                                <div className="p-2 bg-warning bg-opacity-10 rounded text-warning"><Clock size={18} /></div>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-6 col-md-3">
                    <Link to="/productos?stock=bajo" className="text-decoration-none">
                        <div className="card shadow-sm h-100 card-hover-effect border-0" style={{ background: 'linear-gradient(145deg, #fee2e2 0%, #ffffff 100%)' }}>
                            <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="text-muted xsmall fw-bold mb-1" style={{ fontSize: '0.7rem' }}>ALERTA STOCK</div>
                                    <h5 className="mb-0 fw-bold text-danger">{kpi.stock_bajo}</h5>
                                </div>
                                <div className="p-2 bg-danger bg-opacity-10 rounded text-danger"><AlertTriangle size={18} /></div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="row g-3">
                {/* Main Content: Chart */}
                <div className="col-12 col-xl-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-2 border-0 d-flex justify-content-between align-items-center">
                            <h6 className="card-title fw-bold mb-0">Proyección Financiera (30 días)</h6>
                            <span className="badge bg-light text-muted fw-normal">Cashflow</span>
                        </div>
                        <div className="card-body pt-0">
                            {/* Use 'proyeccion' if available, otherwise fallback to 'chart' (sales) */}
                            <Chart
                                labels={stats.proyeccion ? stats.proyeccion.labels : chart.labels}
                                datasets={stats.proyeccion ? stats.proyeccion.datasets : chart.datasets}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar: Tabs for Activity, Clients, Products */}
                <div className="col-12 col-xl-4">
                    <div className="card border-0 shadow-sm h-100" style={{ minHeight: '350px' }}>
                        <div className="card-header bg-white p-1 border-0">
                            <div className="nav nav-pills nav-fill" role="tablist">
                                <button
                                    className={`nav-link py-1 px-2 small ${sidebarTab === 'activity' ? 'active fw-bold' : 'text-muted'}`}
                                    onClick={() => setSidebarTab('activity')}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Actividad
                                </button>
                                <button
                                    className={`nav-link py-1 px-2 small ${sidebarTab === 'clients' ? 'active fw-bold' : 'text-muted'}`}
                                    onClick={() => setSidebarTab('clients')}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Top Clientes
                                </button>
                                <button
                                    className={`nav-link py-1 px-2 small ${sidebarTab === 'products' ? 'active fw-bold' : 'text-muted'}`}
                                    onClick={() => setSidebarTab('products')}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Top Prod.
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-0 overflow-auto" style={{ maxHeight: '400px' }}>

                            {/* ACTIVITY TAB */}
                            {sidebarTab === 'activity' && (
                                <div className="list-group list-group-flush">
                                    {actividad_reciente.length === 0 ? (
                                        <div className="p-4 text-center text-muted small">Sin actividad reciente</div>
                                    ) : (
                                        actividad_reciente.map((item, index) => (
                                            <div key={index} className="list-group-item px-3 py-2 border-light">
                                                <div className="d-flex align-items-center">
                                                    <div className={`p-1 rounded-circle bg-${item.color} bg-opacity-10 text-${item.color} me-2`}>
                                                        {item.tipo === 'VENTA' ? <ShoppingCart size={15} /> : item.tipo === 'COMPRA' ? <Truck size={15} /> : <FileText size={15} />}
                                                    </div>
                                                    <div className="flex-grow-1 text-truncate">
                                                        <h6 className="mb-0 small fw-bold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>{item.texto}</h6>
                                                        <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>{item.subtexto}</p>
                                                    </div>
                                                    <div className="text-end ms-1" style={{ minWidth: '60px' }}>
                                                        <span className="text-muted d-block" style={{ fontSize: '10px' }}>{item.fecha.split(' ')[0]}</span>
                                                        <span className="text-muted" style={{ fontSize: '10px' }}>{item.fecha.split(' ')[1]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* CLIENTS TAB */}
                            {sidebarTab === 'clients' && (
                                <div className="list-group list-group-flush">
                                    {top_clientes && top_clientes.length > 0 ? (
                                        top_clientes.map((c, index) => (
                                            <div key={index} className="list-group-item d-flex justify-content-between align-items-center px-3 py-2 border-light">
                                                <div className="d-flex align-items-center text-truncate">
                                                    <div className="me-2 fw-bold text-muted small">#{index + 1}</div>
                                                    <div className="text-truncate">
                                                        <h6 className="mb-0 small fw-bold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>{c.cliente}</h6>
                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>{c.cantidad} Compras</small>
                                                    </div>
                                                </div>
                                                <span className="badge bg-light text-primary border rounded-pill small">
                                                    ${c.total.toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-muted small">Sin datos</div>
                                    )}
                                </div>
                            )}

                            {/* PRODUCTS TAB */}
                            {sidebarTab === 'products' && (
                                <div className="list-group list-group-flush">
                                    {top_productos.length === 0 ? (
                                        <div className="p-4 text-center text-muted small">Sin datos</div>
                                    ) : (
                                        top_productos.map((prod, idx) => (
                                            <div key={idx} className="list-group-item d-flex justify-content-between align-items-center px-3 py-2 border-light">
                                                <div className="d-flex align-items-center text-truncate">
                                                    <div className="me-2 fw-bold text-muted small">#{idx + 1}</div>
                                                    <div className="text-truncate" style={{ maxWidth: '160px' }}>
                                                        <small className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>{prod.producto}</small>
                                                    </div>
                                                </div>
                                                <span className="badge bg-light text-dark border rounded-pill small">{prod.total} un.</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            {/* NEW: Detailed Insights Section (Below Fold) */}
            <div className="row g-3 mt-4">
                <div className="col-12">
                    <h6 className="text-muted small fw-bold text-uppercase mb-2">Detalles Operativos</h6>
                </div>

                {/* Stock Alerts Table */}
                <div className="col-12 col-xl-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-2 border-0 d-flex justify-content-between align-items-center">
                            <h6 className="card-title fw-bold mb-0 text-danger"><AlertTriangle size={16} className="me-2" />Alertas de Stock</h6>
                            <Link to="/productos?stock=bajo" className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize: '0.8rem' }}>Ver inventario</Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-3">Producto</th>
                                        <th className="border-0 text-center">Actual</th>
                                        <th className="border-0 text-center">Mínimo</th>
                                        <th className="border-0 text-end pe-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stock_bajo_list && stock_bajo_list.length > 0 ? (
                                        stock_bajo_list.map(p => (
                                            <tr key={p.id}>
                                                <td className="ps-3 fw-medium text-dark">{p.nombre}</td>
                                                <td className="text-center fw-bold text-danger">{p.stock}</td>
                                                <td className="text-center text-muted">{p.minimo}</td>
                                                <td className="text-end pe-3">
                                                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-pill">Crítico</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">Todo en orden</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pending Orders Table */}
                <div className="col-12 col-xl-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-2 border-0 d-flex justify-content-between align-items-center">
                            <h6 className="card-title fw-bold mb-0 text-warning"><Clock size={16} className="me-2" />Pedidos Pendientes</h6>
                            <Link to="/pedidos" className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize: '0.8rem' }}>Ver pedidos</Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-3">ID</th>
                                        <th className="border-0">Cliente</th>
                                        <th className="border-0">Fecha</th>
                                        <th className="border-0 text-end pe-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidos_pendientes_list && pedidos_pendientes_list.length > 0 ? (
                                        pedidos_pendientes_list.map(p => (
                                            <tr key={p.id}>
                                                <td className="ps-3 text-muted">#{p.id}</td>
                                                <td className="fw-medium text-dark">{p.cliente}</td>
                                                <td className="text-muted small">{p.fecha}</td>
                                                <td className="text-end pe-3 fw-bold">${p.total.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">No hay pendientes</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>


        </div >
    );
};

export default Dashboard;
