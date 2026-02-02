import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Save, Monitor, Zap, CheckCircle2, Settings, Loader2, ShoppingCart,
    Printer, Laptop, Package, Calculator, FileText, Mail, Lock,
    Server, Shield, HardDrive, Cloud, Folder, Activity, Key, Globe, Layout, Database
} from 'lucide-react';

// Premium UI Components
import { BentoCard, BentoGrid, StatCard } from '../components/premium/BentoCard';
import { SearchInput, PremiumSelect } from '../components/premium/PremiumInput';
import { showSuccessAlert, showErrorAlert, showConfirmationAlert, showWarningAlert } from '../utils/alerts';
import { cn } from '../utils/cn';

const Parametros = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    // Estados de Configuración
    const [config, setConfig] = useState({
        habilita_remitos: true,
        actualizar_precios_compra: false,
        permitir_stock_negativo: false,
        alerta_stock_minimo: true,
        margen_ganancia_defecto: 0,
        metodo_ganancia: 'MARKUP',
        papel_impresion: 'A4',
        pie_factura: '',
        ocultar_barra_scroll: true,
        ocultar_scroll_tablas: false,
        ancho_contenido: 'max-w-7xl',
        auto_foco_codigo_barras: false,
        comportamiento_codigo_barras: 'DEFAULT',
        discriminar_iva_compras: false,
        discriminar_iva_ventas: false,
        redondeo_precios: 1,
        smtp_server: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_security: 'STARTTLS',
        smtp_password: '',
        backup_local_path: '',
        backup_google_drive_enabled: false,
        backup_google_drive_folder_id: ''
    });

    const [hasSmtpPassword, setHasSmtpPassword] = useState(false);
    const [hasGoogleDriveCredentials, setHasGoogleDriveCredentials] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/config/obtener/');
            if (response.data) {
                setConfig(prev => ({ ...prev, ...response.data }));
                setHasSmtpPassword(response.data.has_smtp_password || false);
                setHasGoogleDriveCredentials(response.data.has_google_drive_credentials || false);
            }
        } catch (error) {
            console.error("Error cargando configuración:", error);
            showErrorAlert("Error", "No se pudo cargar la configuración del sistema.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.post('/api/config/guardar/', config);
            if (response.data.ok) {
                await showSuccessAlert("Configuración Guardada", "Los cambios se aplicarán de inmediato en todo el sistema.");
                window.dispatchEvent(new Event('configUpdated'));
            } else {
                showErrorAlert("Error", response.data.error || "No se pudieron guardar los cambios.");
            }
        } catch (error) {
            console.error("Error guardando:", error);
            showErrorAlert("Error de Conexión", "No se pudo comunicar con el servidor.");
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'interfaz', label: 'Interfaz', icon: Laptop },
        { id: 'ventas', label: 'Ventas y Stock', icon: Package },
        { id: 'precios', label: 'Lógica Precios', icon: Zap },
        { id: 'facturacion', label: 'Facturación', icon: Printer },
        { id: 'compras', label: 'Compras y Costos', icon: ShoppingCart },
        { id: 'email', label: 'Cuentas Correo', icon: Mail },
        { id: 'backups', label: 'Backups y Nube', icon: HardDrive },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sincronizando Parámetros...</p>
        </div>
    );

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 flex flex-col p-6 gap-6">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <Settings size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Preferencias del Sistema</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Ajustes técnicos, reglas de negocio y personalización.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    {saving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
                </button>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex gap-6 min-h-0">

                {/* Lateral Navigation Tabs */}
                <aside className="w-72 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl transition-all group border-2 relative overflow-hidden",
                                    isActive
                                        ? "bg-white border-indigo-100 shadow-xl shadow-indigo-500/5 ring-4 ring-indigo-50/50"
                                        : "bg-transparent border-transparent hover:bg-white hover:border-slate-100"
                                )}
                            >
                                <div className={cn(
                                    "p-2.5 rounded-xl transition-all",
                                    isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50"
                                )}>
                                    <Icon size={18} />
                                </div>
                                <span className={cn(
                                    "font-black text-[10px] tracking-widest uppercase",
                                    isActive ? "text-indigo-900" : "text-slate-500"
                                )}>{tab.label}</span>
                                {isActive && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-indigo-600" />}
                            </button>
                        );
                    })}
                </aside>

                {/* Content Area */}
                <main className="flex-1 min-w-0 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-6">

                        {/* Tab Content Render */}
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">

                            {/* General */}
                            {activeTab === 'general' && (
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Globe size={24} /></div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 uppercase">Ajustes Generales</h2>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Reglas base del sistema operativo</p>
                                        </div>
                                    </div>

                                    <BentoCard className="p-8 space-y-8">
                                        <div className="flex items-center justify-between gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 transition-all hover:bg-white hover:shadow-lg">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Ajustar Precios desde Compras</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-1">Actualiza precios de venta automáticamente al recibir stock con nuevo costo.</p>
                                            </div>
                                            <div className="form-check form-switch pt-0 mb-0">
                                                <input
                                                    className="form-check-input w-12 h-6 cursor-pointer"
                                                    type="checkbox"
                                                    checked={config.actualizar_precios_compra}
                                                    onChange={() => handleInputChange('actualizar_precios_compra', !config.actualizar_precios_compra)}
                                                />
                                            </div>
                                        </div>
                                    </BentoCard>
                                </section>
                            )}

                            {/* Interfaz */}
                            {activeTab === 'interfaz' && (
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><Layout size={24} /></div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 uppercase">Apariencia e Interfaz</h2>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Personalización visual del entorno</p>
                                        </div>
                                    </div>

                                    <BentoCard className="p-8 space-y-6">
                                        <div className="flex items-center justify-between gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Ocultar Barra de Desplazamiento Lateral</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-1">Maximiza el espacio de trabajo ocultando el scroll del menú.</p>
                                            </div>
                                            <div className="form-check form-switch pt-0 mb-0">
                                                <input
                                                    className="form-check-input w-12 h-6 cursor-pointer"
                                                    type="checkbox"
                                                    checked={config.ocultar_barra_scroll}
                                                    onChange={() => handleInputChange('ocultar_barra_scroll', !config.ocultar_barra_scroll)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Ocultar Scroll en Tablas Internas</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-1">Apariencia más limpia en el listado de productos de ventas y compras.</p>
                                            </div>
                                            <div className="form-check form-switch pt-0 mb-0">
                                                <input
                                                    className="form-check-input w-12 h-6 cursor-pointer"
                                                    type="checkbox"
                                                    checked={config.ocultar_scroll_tablas}
                                                    onChange={() => handleInputChange('ocultar_scroll_tablas', !config.ocultar_scroll_tablas)}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Comportamiento del Lector de Código de Barras</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'DEFAULT', label: 'Estándar', desc: 'Básico' },
                                                    { id: 'CANTIDAD', label: 'Cantidad', desc: 'Foco automático' },
                                                    { id: 'DIRECTO', label: 'Directo (x1)', desc: 'Velocidad ultra' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleInputChange('comportamiento_codigo_barras', opt.id)}
                                                        className={cn(
                                                            "p-4 rounded-2xl border-2 text-center transition-all",
                                                            config.comportamiento_codigo_barras === opt.id
                                                                ? "bg-amber-50 border-amber-500 text-amber-900 shadow-lg shadow-amber-500/10"
                                                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="text-xs font-black uppercase tracking-tight mb-1">{opt.label}</div>
                                                        <div className="text-[10px] opacity-70 italic">{opt.desc}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </BentoCard>
                                </section>
                            )}

                            {/* Al final añado el botón de reset opcionalmente o solo el footer */}
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl shadow-slate-900/20">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Panel de Control maestro</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">¿Has finalizado tus ajustes? No olvides guardar.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-3 uppercase shadow-lg disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin text-indigo-600" /> : <CheckCircle2 size={18} className="text-indigo-600" />}
                                Confirmar Cambios
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Parametros;
