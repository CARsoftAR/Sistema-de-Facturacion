import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Monitor, Zap, CheckCircle2, Settings, Loader2 } from 'lucide-react';

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

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get('/api/config/obtener/');
            if (response.data) {
                setAutoRemito(response.data.habilita_remitos !== false);
                setAutoUpdatePrices(response.data.actualizar_precios_compra || false);
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
                actualizar_precios_compra: autoUpdatePrices
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
