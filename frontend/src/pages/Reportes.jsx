import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    FileText, ShoppingCart, Package, Users, Banknote, Calendar, Search, Download, Printer,
    ChevronRight, Filter, ArrowUpCircle, ArrowDownCircle, ClipboardList, Activity,
    TrendingUp, ShieldCheck, MapPin, Mail, Phone, CreditCard, Receipt, Settings, X, Truck
} from 'lucide-react';

const SearchableSelect = ({ value, onChange, options, placeholder }) => {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // Support options format {value, label, extra? }
    const filtered = options.filter(o => o.value !== '' && o.label.toLowerCase().includes(search.toLowerCase()));
    const selected = options.find(o => o.value === value);

    const handleSelect = (val) => {
        onChange(val);
        setSearch('');
        setOpen(false);
        setActiveIndex(0);
    };

    const handleKeyDown = (e) => {
        if (!open) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered.length > 0 && activeIndex >= 0 && activeIndex < filtered.length) {
                handleSelect(filtered[activeIndex].value);
            }
        }
    };

    // Reset active index when search changes
    useEffect(() => {
        setActiveIndex(0);
    }, [search]);

    return (
        <div className="relative overflow-visible w-full text-left">
            {selected && value !== '' ? (
                <div className="flex items-center gap-3 bg-primary-600 text-white px-4 py-2 rounded-xl border border-primary-600 shadow-md min-h-[42px]">
                    <div className="flex flex-col overflow-hidden w-full">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none truncate mt-0.5">{selected.label}</span>
                        {selected.extra && <span className="text-[8px] font-bold text-primary-200 uppercase mt-0.5">{selected.extra}</span>}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(''); setSearch(''); setActiveIndex(0); }} className="p-1 hover:bg-white/20 rounded-lg shrink-0 transition-colors cursor-pointer ml-auto">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setOpen(true); }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setOpen(true)}
                            onBlur={() => setTimeout(() => { setOpen(false); setActiveIndex(0); }, 200)}
                            placeholder={placeholder}
                            className="w-full pl-4 pr-10 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold placeholder:text-neutral-400 h-[42px]"
                        />
                        <Search className="absolute right-3 text-neutral-400" size={16} />
                    </div>
                    {open && (
                        <div className="absolute z-[300] top-full left-0 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-2xl p-1 max-h-60 overflow-y-auto scrollbar-thin">
                            {filtered.length > 0 ? filtered.map((opt, idx) => (
                                <div key={opt.value} onClick={() => handleSelect(opt.value)} className={cn("px-4 py-3 cursor-pointer rounded-lg text-xs font-bold transition-colors flex justify-between items-center text-neutral-800", idx === activeIndex ? "bg-primary-50 border-l-4 border-primary-600 shadow-sm" : "hover:bg-neutral-50")}>
                                    <span className="uppercase tracking-tight truncate">{opt.label}</span>
                                    {opt.extra && <span className="text-[8px] px-1.5 py-0.5 rounded ml-2 bg-neutral-100 text-neutral-500 uppercase flex-shrink-0">{opt.extra}</span>}
                                </div>
                            )) : (
                                <div className="px-4 py-3 text-xs font-bold text-neutral-400 text-center italic uppercase tracking-widest">Sin resultados</div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Premium UI Components
import { BentoCard, BentoGrid, StatCard } from '../components/premium/BentoCard';
import { SearchInput, PremiumSelect } from '../components/premium/PremiumInput';
import { PremiumTable, TableCell } from '../components/premium/PremiumTable';
import { BtnAction, BtnPrint } from '../components/CommonButtons';
import { cn } from '../utils/cn';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../utils/alerts';

const Reportes = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('ventas');
    const [selectedReport, setSelectedReport] = useState(null);

    // Reset state if user clicks the sidebar menu again
    useEffect(() => {
        setSelectedReport(null);
        setReportData(null);
    }, [location.key]);

    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [empresa, setEmpresa] = useState({ nombre: 'Mi Empresa', cuit: '', direccion: '', telefono: '' });

    // Fechas por defecto: inicio de mes hasta hoy
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const formatDate = (d) => d.toISOString().split('T')[0];
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const initialFilters = {
        fecha_desde: formatDate(firstDayOfMonth),
        fecha_hasta: formatDate(today),
        cliente_id: '',
        proveedor_id: ''
    };

    const [filtros, setFiltros] = useState(initialFilters);
    const [clientes, setClientes] = useState([]);
    const [proveedores, setProveedores] = useState([]);

    // Cargar datos iniciales
    useEffect(() => {
        const fetchEmpresa = async () => {
            try {
                const res = await fetch('/api/config/obtener/');
                const data = await res.json();
                if (!data.error) setEmpresa(data);
            } catch (e) { console.error('Error cargando empresa:', e); }
        };
        const fetchSelectors = async () => {
            try {
                const resCl = await fetch('/api/clientes/listar-simple/');
                const dataCl = await resCl.json();
                if (dataCl.ok && dataCl.clientes) setClientes(dataCl.clientes);

                const resPr = await fetch('/api/proveedores/lista/');
                const dataPr = await resPr.json();
                if (dataPr.ok) setProveedores(dataPr.data || dataPr.proveedores || []);
            } catch (e) { console.error('Error cargando selectores:', e); }
        };
        fetchEmpresa();
        fetchSelectors();
    }, []);

    useEffect(() => {
        setReportData(null);
        setFiltros(initialFilters);
    }, [selectedReport]);

    const tabs = [
        { id: 'ventas', label: 'Ventas', icon: ShoppingCart, color: 'indigo' },
        { id: 'caja', label: 'Mov. Caja', icon: Banknote, color: 'emerald' },
        { id: 'compras', label: 'Compras', icon: ArrowDownCircle, color: 'amber' },
        { id: 'clientes', label: 'Clientes', icon: Users, color: 'blue' },
        { id: 'proveedores', label: 'Proveedores', icon: Truck, color: 'rose' }, // Corrección: icono de camión
        { id: 'productos', label: 'Productos', icon: Package, color: 'purple' },
        { id: 'contabilidad', label: 'Balances', icon: FileText, color: 'slate' }
    ];
    // Reajuste de color manual para proveedores
    tabs[4].color = 'rose';

    const reportOptions = {
        ventas: [
            { id: 'v_diarias', title: 'Resumen de Ventas Diarias', desc: 'Listado detallado de transacciones por jornada.' },
            { id: 'v_articulos', title: 'Ventas por Artículo', desc: 'Análisis de rotación y productos más vendidos.' },
            { id: 'iva_ventas', title: 'Libro IVA Ventas', desc: 'Reporte fiscal detallado por alícuota.' }
        ],
        caja: [
            { id: 'c_ingresos', title: 'Detalle de Ingresos', desc: 'Todas las entradas de efectivo y cobros.' },
            { id: 'c_gastos', title: 'Detalle de Egresos', desc: 'Listado de retiros, pagos y gastos operativos.' },
            { id: 'c_resumen', title: 'Resumen Consolidado', desc: 'Balance general de movimientos y saldos finales.' }
        ],
        compras: [
            { id: 'co_diarias', title: 'Resumen de Compras', desc: 'Facturas de proveedores y carga de stock.' },
            { id: 'iva_compras', title: 'Libro IVA Compras', desc: 'Créditos fiscales por período.' }
        ],
        clientes: [
            { id: 'cl_saldos', title: 'Saldos Generales', desc: 'Estado de deuda de toda la cartera.' },
            { id: 'cl_saldos_deudores', title: 'Cuentas a Cobrar', desc: 'Listado exclusivo de clientes con deuda.' },
            { id: 'cl_saldos_favor', title: 'Saldos a Favor', desc: 'Clientes con depósitos anticipados.' },
            { id: 'cl_mov', title: 'Estado de Cuenta Individual', desc: 'Historial detallado de un cliente específico.' }
        ],
        proveedores: [
            { id: 'pr_saldos', title: 'Deudas a Proveedores', desc: 'Saldos pendientes de pago.' },
            { id: 'pr_saldos_favor', title: 'Pagos Anticipados', desc: 'Saldos a favor con proveedores.' },
            { id: 'pr_mov', title: 'Cuenta Corriente Proveedor', desc: 'Seguimiento de compras y pagos.' }
        ],
        productos: [
            { id: 'p_stock', title: 'Inventario de Stock', desc: 'Existencias actuales y valorización de mercadería.' },
            { id: 'p_critico', title: 'Alerta de Reposición', desc: 'Productos por debajo del stock mínimo.' }
        ],
        contabilidad: [
            { id: 'co_resultados', title: 'Estado de Resultados', desc: 'Utilidades Brutas y Rentabilidad del Negocio.' }
        ]
    };

    const handleGenerate = async () => {
        if (!selectedReport) return;
        setLoading(true);
        setReportData(null);
        try {
            const params = new URLSearchParams({
                id: selectedReport.id,
                fecha_desde: filtros.fecha_desde,
                fecha_hasta: filtros.fecha_hasta,
                cliente_id: filtros.cliente_id || '',
                proveedor_id: filtros.proveedor_id || ''
            });
            const response = await fetch(`/api/reportes/generar/?${params}`);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const res = await response.json();
            if (res.ok) setReportData(res);
            else showErrorAlert('Error', res.error || 'No se pudo procesar el reporte');
        } catch (error) {
            console.error('Error:', error);
            showErrorAlert('Error de Conexión', 'Hubo un problema al contactar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const renderTable = () => {
        if (!reportData) return null;
        const { headers, data } = reportData;

        // Formateador dinámico
        const formatValue = (val, header) => {
            if (typeof val !== 'number') return val;
            const h = header.toLowerCase();
            const isCurrency = h.includes('total') || h.includes('neto') || h.includes('iva') ||
                h.includes('monto') || h.includes('costo') || h.includes('valor') ||
                h.includes('debe') || h.includes('haber') || h.includes('saldo') ||
                h.includes('ingreso') || h.includes('egreso');
            if (isCurrency) return <TableCell.Currency value={val} />;
            return val;
        };

        return (
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 mt-6 overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead className="bg-slate-900 text-slate-400">
                            <tr>
                                {headers.map((h, i) => (
                                    <th key={i} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 italic">
                            {data.length > 0 ? data.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    {headers.map((h, j) => (
                                        <td key={j} className="px-6 py-3.5 text-xs font-bold text-slate-700 whitespace-nowrap">
                                            {formatValue(row[h], h)}
                                        </td>
                                    ))}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={headers.length} className="px-6 py-20 text-center text-slate-400 font-black uppercase italic tracking-widest">
                                        No se registran datos para este criterio
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }} className="d-print-container">
            {/* Estilos para impresión Premium */}
            <style>
                {`
                @media print {
                    @page { margin: 1.5cm; size: landscape; }
                    body, html { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .d-print-none, aside, nav, header, button, .lucide { display: none !important; }
                    .d-print-container { 
                        position: absolute !important; 
                        top: 0 !important; left: 0 !important; 
                        width: 100% !important; height: auto !important;
                        padding: 0 !important; margin: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                        max-width: none !important;
                    }
                    .report-body { padding: 0 !important; display: block !important; overflow: visible !important; }
                    main { height: auto !important; overflow: visible !important; display: block !important; flex: none !important; }
                    table { border: 1px solid #e2e8f0 !important; font-size: 8.5pt !important; width: 100% !important; border-collapse: collapse !important; }
                    th { background: #f8fafc !important; color: #0f172a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 8px !important; border-bottom: 2px solid #cbd5e1 !important; }
                    td { padding: 8px !important; border-bottom: 1px solid #f1f5f9 !important; }
                    tr { page-break-inside: avoid !important; }
                    .print-header { display: flex !important; justify-content: space-between !important; border-bottom: 2px solid black !important; padding-bottom: 15px !important; margin-bottom: 30px !important; }
                    .bg-white { box-shadow: none !important; border: none !important; }
                }
                .d-print-only { display: none !important; }
                @media print { .d-print-only { display: block !important; } }
                `}
            </style>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 d-print-none mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <BarChart3 size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Reportes y Analítica
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Análisis detallado de operaciones y salud financiera.
                    </p>
                </div>

                {selectedReport && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setSelectedReport(null); setReportData(null); }}
                            style={{ border: 'none', background: 'transparent', color: '#64748b', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#2563eb'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
                        >
                            Cambiar Reporte
                        </button>
                        <button
                            onClick={() => window.print()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                backgroundColor: '#2563eb', color: 'white', padding: '10px 20px',
                                borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <Printer size={18} /> Imprimir PDF
                        </button>
                    </div>
                )}
            </header>

            {/* Main Area */}
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }} className="report-body">

                {/* Print Header (Only visible when printing) */}
                <div className="d-print-only w-full">
                    <div className="flex justify-between border-b-2 border-slate-900 pb-6 mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase">{empresa.nombre_fantasia || empresa.nombre}</h1>
                            <p className="text-xs font-bold text-slate-500">CUIT: {empresa.cuit} • {empresa.direccion}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-lg font-black uppercase text-slate-800">{selectedReport?.title}</h2>
                            <p className="text-xs font-bold text-slate-500">
                                Período: {formatDateDisplay(filtros.fecha_desde)} al {formatDateDisplay(filtros.fecha_hasta)}
                            </p>
                        </div>
                    </div>
                </div>

                {!selectedReport ? (
                    <>
                        {/* Lateral Navigation */}
                        <aside style={{ width: '280px', flexShrink: 0 }} className="d-print-none">
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <div className="d-flex flex-column gap-2">
                                    {tabs.map(tab => {
                                        const isActive = activeTab === tab.id;
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    setActiveTab(tab.id);
                                                    setSelectedReport(null);
                                                    setReportData(null);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px 16px',
                                                    border: isActive ? '2px solid #1e293b' : '2px solid transparent',
                                                    borderRadius: '12px',
                                                    backgroundColor: isActive ? '#f8fafc' : 'transparent',
                                                    color: isActive ? '#2563eb' : '#64748b',
                                                    fontWeight: isActive ? '700' : '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    textAlign: 'left',
                                                    width: '100%'
                                                }}
                                            >
                                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} color={isActive ? '#2563eb' : 'currentColor'} />
                                                <span style={{ lineHeight: '1.2' }}>{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* Report Selection Grid */}
                        <main style={{ flex: 1, minWidth: 0 }} className="d-print-none">
                            <div style={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {reportOptions[activeTab]?.map(report => (
                                        <button
                                            key={report.id}
                                            onClick={() => setSelectedReport(report)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '24px 20px',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '16px',
                                                border: '1px solid #f1f5f9',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                width: '100%',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid #2563eb'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid #f1f5f9'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '12px',
                                                    backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
                                                        {report.title.toUpperCase()}
                                                    </h3>
                                                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>{report.desc}</p>
                                                </div>
                                            </div>
                                            <div style={{ color: '#94a3b8' }}>
                                                <ChevronRight size={20} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </main>
                    </>
                ) : (
                    /* Report Runner / Results */
                    <main style={{ flex: 1, minWidth: 0, height: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '12px' }}>
                        {/* Parameters Panel */}
                        <div style={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '16px' }} className="d-print-none">

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', color: '#3b82f6', marginBottom: '24px' }}>
                                <Settings size={20} /> Generar {selectedReport.title}
                            </div>

                            <div className="grid grid-cols-12 gap-6 items-end">
                                <div className="col-span-12 lg:col-span-3">
                                    <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Desde Fecha</label>
                                    <input
                                        type="date"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.2s', fontSize: '14px', backgroundColor: '#f8fafc' }}
                                        value={filtros.fecha_desde}
                                        onChange={e => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-12 lg:col-span-3">
                                    <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Hasta Fecha</label>
                                    <input
                                        type="date"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.2s', fontSize: '14px', backgroundColor: '#f8fafc' }}
                                        value={filtros.fecha_hasta}
                                        onChange={e => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                                    />
                                </div>

                                {selectedReport.id === 'cl_mov' && (
                                    <div className="col-span-12 lg:col-span-4">
                                        <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Cliente Objetivo</label>
                                        <SearchableSelect
                                            value={filtros.cliente_id}
                                            onChange={val => setFiltros({ ...filtros, cliente_id: val })}
                                            placeholder="Buscar Cliente..."
                                            options={clientes.map(c => ({ value: c.id, label: c.nombre, extra: c.condicion_fiscal_display || 'C.F.' }))}
                                        />
                                    </div>
                                )}

                                {selectedReport.id === 'pr_mov' && (
                                    <div className="col-span-12 lg:col-span-4">
                                        <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Proveedor Objetivo</label>
                                        <SearchableSelect
                                            value={filtros.proveedor_id}
                                            onChange={val => setFiltros({ ...filtros, proveedor_id: val })}
                                            placeholder="Buscar Proveedor..."
                                            options={proveedores.map(p => ({ value: p.id, label: p.nombre, extra: p.cuit ? `CUIT ${p.cuit}` : '' }))}
                                        />
                                    </div>
                                )}

                                <div className="col-span-12 lg:col-span-2">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px 16px',
                                            borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto'
                                        }}
                                    >
                                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TrendingUp size={18} />}
                                        {loading ? 'Procesando' : 'Generar'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Container */}
                        <div className="w-full overflow-x-auto mt-2 pb-8">
                            {/* Stats Resumen (Si existen datos) */}
                            {reportData && reportData.data && (
                                <BentoGrid cols={3} className="mb-4 d-print-none">
                                    <StatCard label="Total Registros" value={reportData.data.length} icon={ClipboardList} color="indigo" compact />
                                    {/* Columnas numéricas resumidas expertamente */}
                                    {reportData.headers && reportData.headers.map((h, idx) => {
                                        const lowerH = h.toLowerCase();
                                        const isCurrency = lowerH.includes('total') || lowerH.includes('neto') || lowerH.includes('iva') ||
                                            lowerH.includes('monto') || lowerH.includes('costo') || lowerH.includes('saldo') || lowerH.includes('ingreso');

                                        if (isCurrency && reportData.data.length > 0) {
                                            const sum = reportData.data.reduce((acc, row) => acc + (parseFloat(row[h]) || 0), 0);
                                            // Only show if there's actual data to sum (not 0, or if it's explicitly tracked like Net, IVA total)
                                            if (sum !== 0 || reportData.data.length > 0) {
                                                return (
                                                    <StatCard
                                                        key={`stat-${idx}`}
                                                        label={`Suma ${h}`}
                                                        value={`$ ${sum.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                                                        icon={Banknote}
                                                        color="emerald"
                                                        compact
                                                    />
                                                );
                                            }
                                        }
                                        return null;
                                    })}

                                    <StatCard label="Fecha Inicio" value={formatDateDisplay(filtros.fecha_desde)} icon={Calendar} color="slate" compact />
                                    <StatCard label="Fecha Termino" value={formatDateDisplay(filtros.fecha_hasta)} icon={Calendar} color="amber" compact />
                                </BentoGrid>
                            )}

                            {renderTable()}
                        </div>
                    </main>
                )}
            </div>

            {/* Print Footer Summary (Only visible when printing) */}
            <div className="d-print-only mt-8 border-t border-slate-200 pt-4 flex justify-between text-[10px] font-bold text-slate-400 italic">
                <span>Generado por {empresa.nombre} • {new Date().toLocaleString()}</span>
                <span>Página 1 de 1</span>
            </div>
        </div>
    );
};

export default Reportes;
