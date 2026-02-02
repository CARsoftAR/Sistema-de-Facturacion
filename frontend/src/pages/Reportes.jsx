import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText, ShoppingCart, Package, Users, Banknote, Calendar, Search, Download, Printer,
    ChevronRight, Filter, ArrowUpCircle, ArrowDownCircle, ClipboardList, Activity,
    TrendingUp, ShieldCheck, MapPin, Mail, Phone, CreditCard, Receipt
} from 'lucide-react';

// Premium UI Components
import { BentoCard, BentoGrid, StatCard } from '../components/premium/BentoCard';
import { SearchInput, PremiumSelect } from '../components/premium/PremiumInput';
import { PremiumTable, TableCell } from '../components/premium/PremiumTable';
import { BtnAction, BtnPrint } from '../components/CommonButtons';
import { cn } from '../utils/cn';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../utils/alerts';

const Reportes = () => {
    const [activeTab, setActiveTab] = useState('ventas');
    const [selectedReport, setSelectedReport] = useState(null);
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
        { id: 'proveedores', label: 'Proveedores', icon: rose => 'rose' }, // Corrección: solo color
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
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
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
        );
    };

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 flex flex-col p-6 gap-6 d-print-container">
            {/* Estilos para impresión Premium */}
            <style>
                {`
                @media print {
                    @page { margin: 1cm; size: landscape; }
                    .d-print-none, aside, nav, header { display: none !important; }
                    .d-print-container { 
                        position: fixed !important; 
                        top: 0 !important; left: 0 !important; 
                        width: 100vw !important; height: 100vh !important;
                        padding: 0 !important; margin: 0 !important;
                        background: white !important;
                    }
                    .report-body { padding: 2cm !important; }
                    table { border: 1px solid #eee !important; font-size: 8pt !important; }
                    th { background: #f8fafc !important; color: black !important; -webkit-print-color-adjust: exact; }
                    .print-header { display: flex !important; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 15px; margin-bottom: 30px; }
                }
                .d-print-only { display: none; }
                @media print { .d-print-only { display: block !important; } }
                `}
            </style>

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 d-print-none">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <Activity size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reportes e Inteligencia</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Análisis detallado de operaciones y salud financiera.
                    </p>
                </div>

                {selectedReport && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setSelectedReport(null); setReportData(null); }}
                            className="px-6 py-2.5 text-slate-400 hover:text-rose-600 font-black text-xs tracking-widest uppercase transition-all"
                        >
                            Cambiar Reporte
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10"
                        >
                            <Printer size={18} /> IMPRIMIR PDF
                        </button>
                    </div>
                )}
            </header>

            {/* Main Area */}
            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden report-body">

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
                        <aside className="w-72 flex flex-col gap-2 d-print-none">
                            {tabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group border-2 relative overflow-hidden",
                                            isActive
                                                ? `bg-white border-slate-900 shadow-xl shadow-slate-200 ring-4 ring-slate-100`
                                                : "bg-white/50 border-transparent hover:border-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2.5 rounded-xl transition-all",
                                            isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                                        )}>
                                            <Icon size={20} />
                                        </div>
                                        <span className={cn(
                                            "font-black text-xs tracking-[0.1em] uppercase",
                                            isActive ? "text-slate-900" : "text-slate-500"
                                        )}>{tab.label}</span>
                                        {isActive && <div className="absolute right-4 w-2 h-2 rounded-full bg-slate-900 animate-pulse" />}
                                    </button>
                                );
                            })}
                        </aside>

                        {/* Report Selection Grid */}
                        <main className="flex-1 overflow-y-auto pr-2 d-print-none">
                            <BentoGrid cols={2} className="gap-6">
                                {reportOptions[activeTab]?.map(report => (
                                    <button
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className="text-left group"
                                    >
                                        <BentoCard className="h-full p-8 hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between">
                                            <div>
                                                <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-6">
                                                    <FileText size={24} />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight uppercase tracking-tight">{report.title}</h3>
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">{report.desc}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                                Configurar Reporte <ChevronRight size={14} strokeWidth={3} />
                                            </div>
                                        </BentoCard>
                                    </button>
                                ))}
                            </BentoGrid>
                        </main>
                    </>
                ) : (
                    /* Report Runner / Results */
                    <main className="flex-1 flex flex-col min-h-0">
                        {/* Parameters Panel */}
                        <BentoCard className="p-6 bg-white/80 backdrop-blur-md d-print-none shadow-premium border-slate-100">
                            <div className="grid grid-cols-12 gap-6 items-end">
                                <div className="col-span-12 lg:col-span-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-1">Fecha Desde</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-xs"
                                        value={filtros.fecha_desde}
                                        onChange={e => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-12 lg:col-span-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-1">Fecha Hasta</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-xs"
                                        value={filtros.fecha_hasta}
                                        onChange={e => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                                    />
                                </div>

                                {selectedReport.id === 'cl_mov' && (
                                    <div className="col-span-12 lg:col-span-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-1">Cliente Objetivo</label>
                                        <PremiumSelect
                                            value={filtros.cliente_id}
                                            onChange={e => setFiltros({ ...filtros, cliente_id: e.target.value })}
                                            options={[{ value: '', label: 'Seleccionar Cliente...' }, ...clientes.map(c => ({ value: c.id, label: c.nombre }))]}
                                            className="!py-3.5 !text-xs !font-black"
                                        />
                                    </div>
                                )}

                                {selectedReport.id === 'pr_mov' && (
                                    <div className="col-span-12 lg:col-span-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-1">Proveedor Objetivo</label>
                                        <PremiumSelect
                                            value={filtros.proveedor_id}
                                            onChange={e => setFiltros({ ...filtros, proveedor_id: e.target.value })}
                                            options={[{ value: '', label: 'Seleccionar Proveedor...' }, ...proveedores.map(p => ({ value: p.id, label: p.nombre }))]}
                                            className="!py-3.5 !text-xs !font-black"
                                        />
                                    </div>
                                )}

                                <div className="col-span-12 lg:col-span-2">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TrendingUp size={18} />}
                                        {loading ? 'PROCESANDO' : 'GENERAR'}
                                    </button>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Results Container */}
                        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden mt-4">
                            {/* Stats Resumen (Si existen datos) */}
                            {reportData && reportData.data && (
                                <BentoGrid cols={3} className="mb-4 d-print-none">
                                    <StatCard label="Total Registros" value={reportData.data.length} icon={ClipboardList} color="indigo" compact />
                                    <StatCard label="Fecha Inicio" value={formatDateDisplay(filtros.fecha_desde)} icon={Calendar} color="emerald" compact />
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
