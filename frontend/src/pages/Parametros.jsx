import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Monitor, Zap, CheckCircle2, Settings, Loader2, ShoppingCart, Printer, Laptop } from 'lucide-react';

// Estilos base según directrices de la USER_REQUEST
const s = {
    container: { padding: '40px', maxWidth: '800px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b' },
    subtitle: { color: '#64748b', fontSize: '14px' },
    card: { backgroundColor: 'white', border: 'none', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', color: '#3b82f6', marginBottom: '24px' },
    fieldGroup: { marginBottom: '32px' },
    label: { display: 'block', fontWeight: '600', color: '#334155', marginBottom: '8px', fontSize: '14px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.2s', fontSize: '14px' },
    textarea: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.2s', fontSize: '14px', minHeight: '80px', resize: 'vertical' },
    inputBadge: { position: 'absolute', right: '12px', color: '#64748b', fontSize: '13px' },
    switchContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' },
    saveBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '14px', borderRadius: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '32px', transition: 'all 0.2s' },
    // Estilos de Modal
    overlay: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, backdropFilter: 'blur(4px)' },
    modalCard: { backgroundColor: 'white', padding: '32px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
    iconCircle: { margin: '0 auto 20px', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    confirmBtn: { borderRadius: '16px', padding: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer', flex: 1, border: 'none', backgroundColor: '#2563eb', marginTop: '16px' }
};

const Parametros = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Estados locales para los inputs (Aislamiento)
    const [autoRemito, setAutoRemito] = useState(true);
    const [autoUpdatePrices, setAutoUpdatePrices] = useState(false);
    const [permitirStockNegativo, setPermitirStockNegativo] = useState(false);
    const [alertaStockMinimo, setAlertaStockMinimo] = useState(true);
    const [margenGananciaDefecto, setMargenGananciaDefecto] = useState(0);
    const [metodoGanancia, setMetodoGanancia] = useState('MARKUP'); // 'MARKUP' o 'MARGIN'

    // Nuevos estados
    const [papelImpresion, setPapelImpresion] = useState('A4'); // 'A4', 'T80', 'T58'
    const [pieFactura, setPieFactura] = useState('');
    const [autoFocoCodigoBarras, setAutoFocoCodigoBarras] = useState(false);
    const [discriminarIvaCompras, setDiscriminarIvaCompras] = useState(false);
    const [discriminarIvaVentas, setDiscriminarIvaVentas] = useState(false);
    const [redondeoPrecios, setRedondeoPrecios] = useState(1);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get('/api/config/obtener/');
            if (response.data) {
                setAutoRemito(response.data.habilita_remitos !== false);
                setAutoUpdatePrices(response.data.actualizar_precios_compra || false);
                setPermitirStockNegativo(response.data.permitir_stock_negativo || false);
                setAlertaStockMinimo(response.data.alerta_stock_minimo !== false);
                setMargenGananciaDefecto(response.data.margen_ganancia_defecto || 0);
                setMetodoGanancia(response.data.metodo_ganancia || 'MARKUP');

                // Nuevos campos
                setPapelImpresion(response.data.papel_impresion || 'A4');
                setPieFactura(response.data.pie_factura || '');
                setAutoFocoCodigoBarras(response.data.auto_foco_codigo_barras || false);
                setDiscriminarIvaCompras(response.data.discriminar_iva_compras || false);
                setDiscriminarIvaVentas(response.data.discriminar_iva_ventas || false);
                setRedondeoPrecios(response.data.redondeo_precios || 1);
            }
        } catch (error) {
            console.error("Error cargando configuración:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                habilita_remitos: autoRemito,
                actualizar_precios_compra: autoUpdatePrices,
                permitir_stock_negativo: permitirStockNegativo,
                alerta_stock_minimo: alertaStockMinimo,
                margen_ganancia_defecto: parseFloat(margenGananciaDefecto) || 0,
                metodo_ganancia: metodoGanancia,
                papel_impresion: papelImpresion,
                pie_factura: pieFactura,
                auto_foco_codigo_barras: autoFocoCodigoBarras,
                discriminar_iva_compras: discriminarIvaCompras,
                discriminar_iva_ventas: discriminarIvaVentas,
                redondeo_precios: redondeoPrecios
            };
            const response = await axios.post('/api/config/guardar/', payload);
            if (response.data.ok) {
                setShowSuccess(true);
                // Notificar a otros componentes que la config cambió si es necesario
                window.dispatchEvent(new Event('configUpdated'));
            }
        } catch (error) {
            console.error("Error guardando:", error);
            alert("Error al guardar la configuración");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>Parámetros del Sistema</h1>
                <p style={s.subtitle}>Ajustes técnicos y comportamiento de módulos</p>
            </header>

            <div style={s.card}>
                <div style={s.sectionTitle}>
                    <Settings size={20} /> Ajustes Generales
                </div>

                {/* AUTOMATIZACIÓN - REMITOS */}
                <div style={s.fieldGroup}>
                    <label style={s.label}>AUTOMATIZACIÓN DE REMITOS</label>
                    <div style={s.switchContainer}>
                        <div style={{ paddingRight: '16px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Generar Remitos Automáticamente</div>
                            <div style={s.subtitle}>Al finalizar una venta, se creará un remito de entrega.</div>
                        </div>
                        <div className="form-check form-switch pt-0 mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={autoRemito}
                                onChange={() => setAutoRemito(!autoRemito)}
                                style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* AUTOMATIZACIÓN - PRECIOS */}
                <div style={s.fieldGroup}>
                    <label style={s.label}>ACTUALIZACIÓN DE PRECIOS</label>
                    <div style={s.switchContainer}>
                        <div style={{ paddingRight: '16px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Ajustar Precios desde Compras</div>
                            <div style={s.subtitle}>Actualiza precios de venta automáticamente al recibir stock con nuevo costo.</div>
                        </div>
                        <div className="form-check form-switch pt-0 mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={autoUpdatePrices}
                                onChange={() => setAutoUpdatePrices(!autoUpdatePrices)}
                                style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* NUEVA SECCIÓN: VENTAS Y STOCK */}
                <div style={{ ...s.sectionTitle, marginTop: '48px' }}>
                    <ShoppingCart size={20} /> Ventas y Stock
                </div>

                {/* STOCK NEGATIVO */}
                <div style={s.fieldGroup}>
                    <label style={s.label}>GESTIÓN DE INVENTARIO</label>
                    <div style={s.switchContainer}>
                        <div style={{ paddingRight: '16px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Permitir Stock Negativo</div>
                            <div style={s.subtitle}>Habilita la venta de productos aunque el stock sea cero o menor.</div>
                        </div>
                        <div className="form-check form-switch pt-0 mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={permitirStockNegativo}
                                onChange={() => setPermitirStockNegativo(!permitirStockNegativo)}
                                style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* ALERTA STOCK MÍNIMO */}
                <div style={s.fieldGroup}>
                    <div style={s.switchContainer}>
                        <div style={{ paddingRight: '16px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Alertas de Stock Crítico</div>
                            <div style={s.subtitle}>Notificar visualmente cuando el stock esté por debajo del mínimo definido.</div>
                        </div>
                        <div className="form-check form-switch pt-0 mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={alertaStockMinimo}
                                onChange={() => setAlertaStockMinimo(!alertaStockMinimo)}
                                style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* AUTO-FOCO CÓDIGO BARRAS */}
                <div style={s.fieldGroup}>
                    <div style={s.switchContainer}>
                        <div style={{ paddingRight: '16px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Auto-Foco en Código de Barras</div>
                            <div style={s.subtitle}>Al abrir la pantalla de venta, el cursor se posará automáticamente en el buscador.</div>
                        </div>
                        <div className="form-check form-switch pt-0 mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={autoFocoCodigoBarras}
                                onChange={() => setAutoFocoCodigoBarras(!autoFocoCodigoBarras)}
                                style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* MARGEN DE GANANCIA POR DEFECTO */}
                <div style={s.fieldGroup}>
                    <label style={s.label}>MARGEN DE GANANCIA SUGERIDO</label>
                    <div style={s.inputWrapper}>
                        <input
                            type="text"
                            value={margenGananciaDefecto}
                            onChange={(e) => {
                                const val = e.target.value.replace(',', '.');
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    setMargenGananciaDefecto(val);
                                }
                            }}
                            style={s.input}
                            placeholder="0.00"
                        />
                        <span style={s.inputBadge}>% de utilidad sugerida</span>
                    </div>
                    <p style={{ ...s.subtitle, marginTop: '8px' }}>Porcentaje de margen que se aplicará por defecto al crear nuevos productos.</p>
                </div>

                {/* NUEVA SECCIÓN: LÓGICA DE PRECIOS */}
                <div style={{ ...s.sectionTitle, marginTop: '48px' }}>
                    <Zap size={20} /> Lógica de Precios
                </div>
                <p style={{ ...s.subtitle, marginBottom: '20px' }}>Selecciona cómo el sistema debe calcular el precio de venta final a partir del costo.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                    {/* OPCIÓN MARKUP */}
                    <div
                        onClick={() => setMetodoGanancia('MARKUP')}
                        style={{
                            ...s.switchContainer,
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            cursor: 'pointer',
                            border: metodoGanancia === 'MARKUP' ? '2px solid #2563eb' : '1px solid #f1f5f9',
                            backgroundColor: metodoGanancia === 'MARKUP' ? '#eff6ff' : '#f8fafc',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {metodoGanancia === 'MARKUP' && (
                            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                <CheckCircle2 size={18} color="#2563eb" />
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Sobre el Costo (Markup)</span>
                        </div>
                        <p style={{ ...s.subtitle, fontSize: '12px', lineHeight: '1.4' }}>
                            Suma el porcentaje directamente al costo. <br />
                            <b>Ej: $100 + 30% = $130.</b>
                        </p>
                    </div>

                    {/* OPCIÓN MARGEN REAL */}
                    <div
                        onClick={() => setMetodoGanancia('MARGIN')}
                        style={{
                            ...s.switchContainer,
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            cursor: 'pointer',
                            border: metodoGanancia === 'MARGIN' ? '2px solid #2563eb' : '1px solid #f1f5f9',
                            backgroundColor: metodoGanancia === 'MARGIN' ? '#eff6ff' : '#f8fafc',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {metodoGanancia === 'MARGIN' && (
                            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                <CheckCircle2 size={18} color="#2563eb" />
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Sobre la Venta (Margen Real)</span>
                        </div>
                        <p style={{ ...s.subtitle, fontSize: '12px', lineHeight: '1.4' }}>
                            Asegura que el porcentaje sea de la venta total. <br />
                            <b>Ej: $100 + 30% = $142.86.</b>
                        </p>
                    </div>
                </div>

                {/* PREVIEW DINÁMICO */}
                <div style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '20px',
                    padding: '24px',
                    color: 'white',
                    marginBottom: '32px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Simulador de Proyección (Costo $100)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>COSTO</div>
                            <div style={{ fontSize: '18px', fontWeight: '700' }}>$100.00</div>
                        </div>
                        <div style={{ color: '#3b82f6' }}><Zap size={16} /></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>GANANCIA</div>
                            <div style={{ fontSize: '18px', fontWeight: '700' }}>
                                {parseFloat(margenGananciaDefecto) || 30}%
                                {(parseFloat(margenGananciaDefecto) === 0 || !margenGananciaDefecto) && <span style={{ fontSize: '10px', display: 'block', color: '#64748b' }}>(Ejemplo)</span>}
                            </div>
                        </div>
                        <div style={{ color: '#3b82f6' }}><Zap size={16} /></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>P. VENTA</div>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: '900',
                                color: '#3b82f6',
                                textShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                            }}>
                                ${(() => {
                                    const m = parseFloat(margenGananciaDefecto) || 30;
                                    if (metodoGanancia === 'MARKUP') {
                                        return (100 * (1 + (m / 100))).toFixed(2);
                                    } else {
                                        if (m >= 100) return "---";
                                        return (100 / (1 - (m / 100))).toFixed(2);
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '11px', marginTop: '16px', textAlign: 'center', fontStyle: 'italic' }}>
                        {metodoGanancia === 'MARKUP'
                            ? "Cálculo basado en suma directa sobre el costo (Markup)."
                            : "Cálculo basado en rentabilidad sobre el precio final (Margen Real)."}
                    </p>
                </div>

                {/* NUEVA SECCIÓN: FACTURACIÓN E IMPRESIÓN */}
                <div style={{ ...s.sectionTitle, marginTop: '48px' }}>
                    <Printer size={20} /> Facturación e Impresión
                </div>

                {/* FORMATO DE PAPEL */}
                <div style={s.fieldGroup}>
                    <label style={s.label}>FORMATO DE IMPRESIÓN POR DEFECTO</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {[
                            { id: 'A4', label: 'Hoja A4', desc: 'Soporte Universal', icon: Monitor },
                            { id: 'T80', label: 'Ticket 80mm', desc: 'Térmica Grande', icon: Printer },
                            { id: 'T58', label: 'Ticket 58mm', desc: 'Térmica Chica', icon: Printer }
                        ].map(formato => (
                            <div
                                key={formato.id}
                                onClick={() => setPapelImpresion(formato.id)}
                                style={{
                                    ...s.switchContainer,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    padding: '16px 10px',
                                    border: papelImpresion === formato.id ? '2px solid #2563eb' : '1px solid #f1f5f9',
                                    backgroundColor: papelImpresion === formato.id ? '#eff6ff' : '#f8fafc',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                            >
                                {papelImpresion === formato.id && (
                                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                        <CheckCircle2 size={16} color="#2563eb" />
                                    </div>
                                )}
                                <formato.icon size={24} style={{ marginBottom: '8px', color: papelImpresion === formato.id ? '#2563eb' : '#64748b' }} />
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{formato.label}</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>{formato.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PIE DE FACTURA */}
                <div style={s.fieldGroup}>
                    <label style={s.label}>TEXTO AL PIE DE FACTURA (PERSONALIZADO)</label>
                    <textarea
                        style={s.textarea}
                        value={pieFactura}
                        onChange={(e) => setPieFactura(e.target.value)}
                        placeholder="Ej: Gracias por su compra. No se aceptan devoluciones sin el ticket."
                    />
                    <p style={{ ...s.subtitle, marginTop: '8px' }}>Este texto aparecerá fijo al final de todos los comprobantes impresos.</p>
                </div>

                {/* NUEVA SECCIÓN: GESTIÓN DE COMPRAS Y COSTOS */}
                <div style={{ ...s.sectionTitle, marginTop: '48px' }}>
                    <ShoppingCart size={20} /> Gestión de Compras y Costos
                </div>

                {/* DISCRIMINAR IVA EN COMPRAS */}
                <div style={s.fieldGroup}>
                    <div style={s.switchContainer}>
                        <div style={{ paddingRight: '16px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Discriminar IVA en Compras</div>
                            <div style={s.subtitle}>Permitir cargar Neto e IVA por separado al registrar una compra.</div>
                        </div>
                        <div className="form-check form-switch pt-0 mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={discriminarIvaCompras}
                                onChange={() => setDiscriminarIvaCompras(!discriminarIvaCompras)}
                                style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* DISCRIMINAR IVA EN VENTAS */}
                <div style={s.fieldGroup}>
                    <div style={s.switchContainer}>
                        <div style={{ paddingRight: '16px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Discriminar IVA en Ventas</div>
                            <div style={s.subtitle}>Mostrar desglose de Neto e IVA en la pantalla de ventas y permitir edición.</div>
                        </div>
                        <div className="form-check form-switch pt-0 mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={discriminarIvaVentas}
                                onChange={() => setDiscriminarIvaVentas(!discriminarIvaVentas)}
                                style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* REDONDEO DE PRECIOS */}
                <div style={s.fieldGroup}>
                    <label style={s.label}>REDONDEO AUTOMÁTICO DE PRECIOS</label>
                    <select
                        style={s.input}
                        value={redondeoPrecios}
                        onChange={(e) => setRedondeoPrecios(parseInt(e.target.value))}
                    >
                        <option value={1}>Sin Redondeo (Exacto)</option>
                        <option value={10}>Múltiplos de 10</option>
                        <option value={50}>Múltiplos de 50</option>
                        <option value={100}>Múltiplos de 100</option>
                    </select>
                    <p style={{ ...s.subtitle, marginTop: '8px' }}>Se aplicará al actualizar precios automáticamente desde una compra.</p>
                </div>

                <button
                    style={{
                        ...s.saveBtn,
                        opacity: saving ? 0.7 : 1,
                        cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {/* MODAL DE ÉXITO */}
            {showSuccess && (
                <div style={s.overlay}>
                    <div style={s.modalCard} className="fade-in">
                        <div style={{ ...s.iconCircle, backgroundColor: '#dcfce7' }}>
                            <CheckCircle2 color="#16a34a" size={32} />
                        </div>
                        <h3 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                            ¡Configuración Actualizada!
                        </h3>
                        <p style={{ ...s.subtitle, marginBottom: '24px' }}>
                            Los cambios se han aplicado correctamente en todos los módulos del sistema.
                        </p>
                        <div style={{ display: 'flex' }}>
                            <button
                                style={s.confirmBtn}
                                onClick={() => setShowSuccess(false)}
                                className="btn-vibrate"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Parametros;
