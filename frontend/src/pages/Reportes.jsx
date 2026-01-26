import React, { useState } from 'react';
import {
    FileText,
    ShoppingCart,
    Package,
    Users,
    Banknote,
    Calendar,
    Search,
    Download,
    Printer,
    ChevronRight,
    Filter,
    ArrowUpCircle,
    ArrowDownCircle,
    ClipboardList
} from 'lucide-react';

// Estilos base extraídos de Parametros.jsx para mantener consistencia
const s = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b' },
    subtitle: { color: '#64748b', fontSize: '14px' },
    card: { backgroundColor: 'white', border: 'none', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', color: '#3b82f6', marginBottom: '24px' },
    label: { display: 'block', fontWeight: '600', color: '#334155', marginBottom: '8px', fontSize: '12px' },
    input: { width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' },
    reportItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        marginBottom: '12px',
        transition: 'all 0.2s',
        cursor: 'pointer'
    },
    runBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '12px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px'
    }
};

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

    // Cargar datos de la empresa
    React.useEffect(() => {
        const fetchEmpresa = async () => {
            try {
                const res = await fetch('/api/config/obtener/');
                const data = await res.json();
                if (!data.error) {
                    setEmpresa(data);
                }
            } catch (e) {
                console.error('Error cargando datos de empresa:', e);
            }
        };
        fetchEmpresa();
    }, []);

    const fetchSelectors = async () => {
        try {
            console.log('Cargando electores (clientes)...');
            const resCl = await fetch('/api/clientes/listar-simple/');
            const dataCl = await resCl.json();
            if (dataCl.ok && dataCl.clientes) {
                setClientes(dataCl.clientes);
                console.log('Clientes cargados:', dataCl.clientes.length);
            }
        } catch (e) { console.error('Error cargando clientes:', e); }

        try {
            console.log('Cargando electores (proveedores)...');
            const resPr = await fetch('/api/proveedores/lista/');
            const dataPr = await resPr.json();
            console.log('Respuesta proveedores API:', dataPr);

            if (dataPr.ok && dataPr.proveedores) {
                setProveedores(dataPr.proveedores);
                console.log('Proveedores cargados (formato ok):', dataPr.proveedores.length);
            } else if (Array.isArray(dataPr)) {
                setProveedores(dataPr); // Fallback por si acaso
                console.log('Proveedores cargados (formato array):', dataPr.length);
            } else if (dataPr.proveedores) {
                setProveedores(dataPr.proveedores);
                console.log('Proveedores cargados (formato viejo):', dataPr.proveedores.length);
            } else {
                console.warn('Formato de respuesta de proveedores inesperado:', dataPr);
            }
        } catch (e) { console.error('Error cargando proveedores:', e); }
    };

    React.useEffect(() => {
        fetchSelectors();
    }, []);

    React.useEffect(() => {
        setReportData(null);
        setFiltros(initialFilters);
    }, [selectedReport]);

    const tabs = [
        { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
        { id: 'caja', label: 'Caja', icon: Banknote },
        { id: 'compras', label: 'Compras', icon: ArrowDownCircle },
        { id: 'clientes', label: 'Clientes', icon: Users },
        { id: 'proveedores', label: 'Proveedores', icon: Users },
        { id: 'productos', label: 'Productos', icon: Package },
        { id: 'contabilidad', label: 'Contabilidad', icon: FileText }
    ];

    const reportOptions = {
        ventas: [
            { id: 'v_diarias', title: 'Resumen de Ventas Diarias', desc: 'Listado detallado de ventas por día.' },
            { id: 'v_articulos', title: 'Ventas por Artículo', desc: 'Ranking de productos más vendidos.' },
            { id: 'iva_ventas', title: 'Libro IVA Ventas', desc: 'Reporte para presentaciones fiscales.' }
        ],
        caja: [
            { id: 'c_ingresos', title: 'Ingresos de Caja', desc: 'Listado de entradas de efectivo y cobros.' },
            { id: 'c_gastos', title: 'Egresos de Caja', desc: 'Listado de gastos y retiros de efectivo.' },
            { id: 'c_resumen', title: 'Resumen General de Caja', desc: 'Consolidado de todos los movimientos y saldos.' }
        ],
        compras: [
            { id: 'co_diarias', title: 'Resumen de Compras', desc: 'Carga de stock y facturas de proveedores.' },
            { id: 'iva_compras', title: 'Libro IVA Compras', desc: 'Reporte detallado de créditos fiscales.' }
        ],
        clientes: [
            { id: 'cl_saldos', title: 'Saldos de Clientes (General)', desc: 'Listado completo de saldos (debe y haber).' },
            { id: 'cl_saldos_deudores', title: 'Saldos de Clientes Deudores', desc: 'Únicamente clientes con cuentas pendientes.' },
            { id: 'cl_saldos_favor', title: 'Saldos de Clientes a Favor', desc: 'Únicamente clientes con saldo a su favor.' },
            { id: 'cl_mov', title: 'Movimientos por Cliente', desc: 'Historial completo de un cliente específico.' }
        ],
        proveedores: [
            { id: 'pr_saldos', title: 'Saldos de Proveedores (Deuda)', desc: 'Deudas pendientes con proveedores.' },
            { id: 'pr_saldos_favor', title: 'Saldos de Proveedores a Favor', desc: 'Saldos a favor con proveedores.' },
            { id: 'pr_mov', title: 'Movimientos por Proveedor', desc: 'Historial de pagos y facturas.' }
        ],
        productos: [
            { id: 'p_stock', title: 'Listado de Stock', desc: 'Existencias actuales y valorización.' },
            { id: 'p_critico', title: 'Stock Crítico', desc: 'Productos por debajo del punto de reposición.' }
        ],
        contabilidad: [
            { id: 'co_resultados', title: 'Estado de Resultados', desc: 'Ganancias y pérdidas del ejercicio.' }
        ]
    };

    const handleGenerate = async (e) => {
        if (e) e.preventDefault();
        if (!selectedReport) {
            alert('Por favor seleccione un reporte');
            return;
        }
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
            console.log('Generando reporte con params:', Object.fromEntries(params));
            const response = await fetch(`/api/reportes/generar/?${params}`);
            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                alert(`Error del servidor: ${response.status}`);
                return;
            }

            const res = await response.json();
            console.log('Response data:', res);
            if (res.ok) {
                setReportData(res);
            } else {
                alert(res.error || 'Error al generar reporte');
            }
        } catch (error) {
            console.error('Error al generar reporte:', error);
            alert('Error de conexión: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const renderTable = () => {
        if (!reportData) return null;
        const { headers, data } = reportData;

        const totals = {};
        const numericColumns = [];

        // Calcular totales para columnas numéricas
        headers.forEach(h => {
            const hLower = h.toLowerCase();
            const isNumericHeader = hLower.includes('total') || hLower.includes('neto') ||
                hLower.includes('iva') || hLower.includes('monto') || hLower.includes('costo') ||
                hLower.includes('valor') || hLower.includes('debe') || hLower.includes('haber') ||
                hLower.includes('saldo') || hLower.includes('cantidad') || hLower.includes('comprobantes') ||
                hLower.includes('ingreso') || hLower.includes('egreso');

            if (isNumericHeader && data.length > 0) {
                // Determine if this is a "running balance" column
                const isRunningBalance = hLower.includes('acum') ||
                    (['cl_mov', 'pr_mov', 'c_resumen'].includes(selectedReport?.id) && hLower === 'saldo');

                if (isRunningBalance) {
                    // For running balances, the total is the terminal value
                    const lastValue = data[data.length - 1][h];
                    totals[h] = typeof lastValue === 'number' ? lastValue : 0;
                } else {
                    // For others, we sum
                    const sum = data.reduce((acc, row) => {
                        const val = row[h];
                        return acc + (typeof val === 'number' ? val : 0);
                    }, 0);
                    totals[h] = sum;
                }
                numericColumns.push(h);
            }
        });

        const formatValue = (val, header) => {
            if (typeof val !== 'number') return val;
            const hLower = header.toLowerCase();
            const isCurrency = hLower.includes('total') || hLower.includes('neto') ||
                hLower.includes('iva') || hLower.includes('monto') || hLower.includes('costo') ||
                hLower.includes('valor') || hLower.includes('debe') || hLower.includes('haber') ||
                hLower.includes('saldo') || hLower.includes('ingreso') || hLower.includes('egreso');

            if (isCurrency) {
                return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });
            }
            return val.toLocaleString('es-AR');
        };

        return (
            <div className="report-table-container">
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                    border: '1px solid #cbd5e1'
                }}>
                    <thead>
                        {/* Encabezado de reporte simplificado - se repite en cada página */}
                        <tr className="d-none d-print-table-row">
                            <th colSpan={headers.length} style={{ padding: 0, border: 'none', backgroundColor: 'white' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    borderBottom: '1px solid #cbd5e1',
                                    paddingBottom: '4px',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {selectedReport?.title}
                                    </div>
                                </div>
                            </th>
                        </tr>
                        {/* Encabezado de columnas - Mejorado para impresión */}
                        <tr style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}>
                            {headers.map((h, i) => (
                                <th key={i} style={{
                                    padding: '10px 12px',
                                    textAlign: numericColumns.includes(h) ? 'right' : 'left',
                                    fontWeight: '700',
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderBottom: '2px solid #cbd5e1',
                                    borderTop: '1px solid #cbd5e1'
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map((row, i) => (
                            <tr key={i} style={{
                                backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                                borderBottom: '1px solid #e2e8f0'
                            }}>
                                {headers.map((h, j) => {
                                    const val = row[h];
                                    const isNumeric = typeof val === 'number';

                                    // Lógica de colores condicionales
                                    let textColor = '#1e293b'; // Default
                                    const hLower = h.toLowerCase();

                                    if (isNumeric) {
                                        const isBalance = hLower.includes('saldo');
                                        const isDebit = hLower.includes('debe') || hLower.includes('egreso') || hLower.includes('gasto');
                                        const isCredit = hLower.includes('haber') || hLower.includes('ingreso');

                                        if (isBalance) {
                                            if (val > 0) textColor = '#ef4444'; // Deuda -> Rojo
                                            if (val < 0) textColor = '#22c55e'; // A favor -> Verde
                                        } else if (isDebit && val !== 0) {
                                            textColor = '#ef4444'; // Salidas/Debe -> Rojo
                                        } else if (isCredit && val !== 0) {
                                            textColor = '#22c55e'; // Entradas/Haber -> Verde
                                        }
                                    }

                                    return (
                                        <td key={j} style={{
                                            padding: '10px 12px',
                                            color: textColor,
                                            textAlign: isNumeric ? 'right' : 'left',
                                            fontFamily: isNumeric ? "'Roboto Mono', monospace" : 'inherit',
                                            fontWeight: (isNumeric && textColor !== '#1e293b') ? '600' : '400'
                                        }}>
                                            {formatValue(val, h)}
                                        </td>
                                    );
                                })}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={headers.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                    No se encontraron datos para este reporte.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {data.length > 0 && numericColumns.length > 0 && (
                        <tfoot>
                            <tr style={{ backgroundColor: '#1e293b', color: 'white', fontWeight: '700' }}>
                                {headers.map((h, i) => (
                                    <td key={i} style={{
                                        padding: '12px',
                                        textAlign: numericColumns.includes(h) ? 'right' : 'left',
                                        fontFamily: numericColumns.includes(h) ? "'Roboto Mono', monospace" : 'inherit',
                                        borderTop: '2px solid #0f172a'
                                    }}>
                                        {i === 0 ? 'TOTALES' : (totals[h] !== undefined ? formatValue(totals[h], h) : '')}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        );
    };

    const renderParameters = () => {
        if (!selectedReport) return null;

        const hasData = reportData && reportData.data && reportData.data.length > 0;

        return (
            <div className="fade-in" style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                <div style={s.sectionTitle} className="d-print-none">
                    <Filter size={18} /> Parámetros para: {selectedReport.title}
                </div>

                <div className="d-print-none" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label style={s.label}>FECHA DESDE</label>
                        <input
                            type="date"
                            style={s.input}
                            value={filtros.fecha_desde}
                            onChange={e => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={s.label}>FECHA HASTA</label>
                        <input
                            type="date"
                            style={s.input}
                            value={filtros.fecha_hasta}
                            onChange={e => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                        />
                    </div>
                    {selectedReport.id === 'cl_mov' && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={s.label}>SELECCIONAR CLIENTE</label>
                            <select
                                style={s.input}
                                value={filtros.cliente_id}
                                onChange={e => setFiltros({ ...filtros, cliente_id: e.target.value })}
                            >
                                <option value="">Seleccione un cliente...</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {selectedReport.id === 'pr_mov' && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={s.label}>SELECCIONAR PROVEEDOR</label>
                            <select
                                style={s.input}
                                value={filtros.proveedor_id}
                                onChange={e => setFiltros({ ...filtros, proveedor_id: e.target.value })}
                            >
                                <option value="">Seleccione un proveedor...</option>
                                {proveedores.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }} className="d-print-none">
                    <button type="button" style={s.runBtn} onClick={handleGenerate} disabled={loading}>
                        <Search size={18} /> {loading ? 'Generando...' : 'Generar Reporte'}
                    </button>
                    <button
                        type="button"
                        style={{
                            ...s.runBtn,
                            backgroundColor: hasData ? '#faf5ff' : '#e2e8f0',
                            color: hasData ? '#7e22ce' : '#94a3b8',
                            border: hasData ? '1px solid #e9d5ff' : 'none'
                        }}
                        onClick={handlePrint}
                        disabled={!hasData}
                    >
                        <Printer size={18} /> Imprimir
                    </button>
                    <button
                        type="button"
                        style={{
                            ...s.runBtn,
                            backgroundColor: hasData ? '#f0fdf4' : '#e2e8f0',
                            color: hasData ? '#15803d' : '#94a3b8',
                            border: hasData ? '1px solid #bbf7d0' : 'none'
                        }}
                        onClick={() => window.open(`/api/reportes/exportar/?id=${selectedReport?.id}&fecha_desde=${filtros.fecha_desde}&fecha_hasta=${filtros.fecha_hasta}&cliente_id=${filtros.cliente_id}&proveedor_id=${filtros.proveedor_id}`, '_blank')}
                        disabled={!hasData}
                    >
                        <Download size={18} /> Excel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedReport(null);
                            setReportData(null);
                        }}
                        style={{ ...s.runBtn, backgroundColor: 'transparent', color: '#ef4444', marginLeft: 'auto' }}
                    >
                        Volver
                    </button>
                </div>

                {reportData && (
                    <div className="report-results" style={{ marginTop: '32px' }}>
                        {/* Encabezado del reporte para pantalla */}
                        <div className="d-print-none" style={{
                            marginBottom: '24px',
                            padding: '20px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '700' }}>
                                {selectedReport.title}
                            </h3>
                            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>
                                Período: {formatDateDisplay(filtros.fecha_desde)} al {formatDateDisplay(filtros.fecha_hasta)}
                                {reportData.data && <span style={{ marginLeft: '16px' }}>• {reportData.data.length} registros</span>}
                            </p>
                        </div>

                        {/* Encabezado profesional para impresión */}
                        <div className="d-none d-print-block print-header" style={{ marginBottom: '30px' }}>
                            {/* Cabecera con logo y datos de empresa */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                borderBottom: '3px solid #1e293b',
                                paddingBottom: '15px',
                                marginBottom: '20px'
                            }}>
                                <div>
                                    <h1 style={{
                                        margin: 0,
                                        fontSize: '24px',
                                        fontWeight: '800',
                                        color: '#1e293b',
                                        letterSpacing: '-0.5px'
                                    }}>
                                        {empresa.nombre_fantasia || empresa.nombre || 'Mi Empresa'}
                                    </h1>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                                        Fecha de emisión:
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                        {new Date().toLocaleDateString('es-AR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Título del reporte */}
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '20px',
                                padding: '15px',
                                backgroundColor: '#f1f5f9',
                                borderRadius: '4px'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#1e293b',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    {selectedReport.title}
                                </h2>
                                <p style={{
                                    margin: '8px 0 0',
                                    fontSize: '13px',
                                    color: '#475569'
                                }}>
                                    Período: {formatDateDisplay(filtros.fecha_desde) || 'Desde el inicio'} al {formatDateDisplay(filtros.fecha_hasta) || 'Fecha actual'}
                                </p>
                            </div>
                        </div>

                        {/* Tabla de datos */}
                        {renderTable()}

                        {/* Pie de página para impresión */}
                        <div className="d-none d-print-block" style={{
                            marginTop: '30px',
                            paddingTop: '15px',
                            borderTop: '1px solid #cbd5e1',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '10px',
                            color: '#64748b'
                        }}>
                            <span>Generado el {new Date().toLocaleDateString('es-AR')} a las {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>Total de registros: {reportData.data?.length || 0}</span>
                            <span>Sistema de Facturación</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={s.container}>
            <style>
                {`
                    @media print {
                        /* Ocultar elementos de navegación */
                        .d-print-none { display: none !important; }
                        
                        /* Ocultar sidebar y header del layout principal */
                        aside, nav, header, footer,
                        [class*="sidebar"], [class*="Sidebar"],
                        [class*="header"], [class*="Header"],
                        [class*="navbar"], [class*="Navbar"],
                        [class*="menu"], [class*="Menu"] {
                            display: none !important;
                        }
                        
                        /* Resetear el contenedor principal */
                        body {
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        
                        /* Hacer que el contenido use todo el ancho */
                        main, [class*="content"], [class*="Content"],
                        #root, .app, .App {
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            max-width: 100% !important;
                        }
                        
                        /* Ajustar el contenedor del reporte */
                        div[style*="padding: 40px"] { 
                            padding: 20px !important; 
                        }
                        div[style*="max-width: 1200px"] { 
                            max-width: 100% !important; 
                            margin: 0 !important; 
                        }
                        
                        /* Mostrar solo los resultados del reporte */
                        .report-results { 
                            margin-top: 0 !important; 
                            page-break-inside: avoid;
                        }
                        
                        /* Estilos de tabla para impresión */
                        table { 
                            font-size: 10px !important; 
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        th { 
                            background-color: #eee !important; 
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            padding: 8px !important;
                            border: 1px solid #ddd !important;
                        }
                        td {
                            padding: 6px !important;
                            border: 1px solid #ddd !important;
                        }
                        
                        /* Encabezado del reporte para impresión */
                        .d-none.d-print-block {
                            display: block !important;
                        }
                    }
                `}
            </style>
            <header style={s.header} className="d-print-none">
                <h1 style={s.title}>Reportes del Sistema</h1>
                <p style={s.subtitle}>Informes, análisis y estadísticas de su negocio</p>
            </header>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                {/* Lado Izquierdo: Categorías */}
                {!selectedReport && (
                    <div style={{ width: '280px', flexShrink: 0 }} className="d-print-none">
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                            <div className="d-flex flex-column gap-2">
                                {tabs.map(tab => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setSelectedReport(null);
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
                                                textAlign: 'left'
                                            }}
                                        >
                                            <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} color={isActive ? '#2563eb' : 'currentColor'} />
                                            <span style={{ lineHeight: '1.2' }}>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Lado Derecho: Opciones de Reporte */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...s.card, minHeight: !selectedReport ? '600px' : 'auto' }}>
                        <div style={s.sectionTitle} className="d-print-none">
                            {tabs.find(t => t.id === activeTab)?.label} - Opciones Disponibles
                        </div>

                        {!selectedReport ? (
                            <div className="fade-in">
                                {reportOptions[activeTab]?.map(report => (
                                    <div
                                        key={report.id}
                                        style={s.reportItem}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#eff6ff';
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#f1f5f9';
                                        }}
                                        onClick={() => setSelectedReport(report)}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{report.title}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>{report.desc}</div>
                                        </div>
                                        <ChevronRight size={20} color="#cbd5e1" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            renderParameters()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reportes;
