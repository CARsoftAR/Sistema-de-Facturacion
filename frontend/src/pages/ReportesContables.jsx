
import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Calendar, Activity,
    BookOpen, Layers, PieChart, TrendingUp, Search, Clock
} from 'lucide-react';
import axios from 'axios';
import { BentoCard } from '../components/premium/BentoCard';
import { PremiumSelect, PremiumInput } from '../components/premium/PremiumInput';
import { showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { cn } from '../utils/cn';

const ReportesContables = () => {
    const [ejercicios, setEjercicios] = useState([]);
    const [loadingEjercicios, setLoadingEjercicios] = useState(true);
    const [selectedEjercicio, setSelectedEjercicio] = useState('');
    const [fechas, setFechas] = useState({ desde: '', hasta: '' });
    const [loadingDownload, setLoadingDownload] = useState(false);

    useEffect(() => {
        fetchEjercicios();
    }, []);

    const fetchEjercicios = async () => {
        try {
            const response = await axios.get('/api/contabilidad/ejercicios/');
            if (response.data.success) {
                setEjercicios(response.data.ejercicios);
                if (response.data.ejercicios.length > 0) {
                    const actual = response.data.ejercicios.find(e => !e.cerrado);
                    setSelectedEjercicio(actual ? actual.id : response.data.ejercicios[0].id);
                }
            }
        } catch (error) {
            console.error("Error loading ejercicios:", error);
            showErrorAlert("Error", "Error al cargar la lista de ejercicios fiscales");
        } finally {
            setLoadingEjercicios(false);
        }
    };

    const handleDownload = (reportType) => {
        if (!selectedEjercicio) {
            showErrorAlert("Faltan Datos", "Seleccione un ejercicio contable");
            return;
        }

        const params = new URLSearchParams({
            ejercicio_id: selectedEjercicio,
            fecha_desde: fechas.desde,
            fecha_hasta: fechas.hasta
        });

        let endpoint = '';
        let filename = 'reporte.xlsx';

        switch (reportType) {
            case 'diario':
                endpoint = '/api/contabilidad/reportes/libro-diario/';
                filename = 'libro_diario.xlsx';
                break;
            case 'mayor':
                endpoint = '/api/contabilidad/mayor/exportar/';
                filename = 'libro_mayor.xlsx';
                break;
            case 'balance':
                endpoint = '/api/contabilidad/balance/exportar/';
                filename = 'balance_general.xlsx';
                break;
            case 'resultados':
                endpoint = '/api/contabilidad/reportes/estado-resultados/';
                filename = 'estado_resultados.xlsx';
                break;
            default:
                return;
        }

        const url = `${endpoint}?${params.toString()}`;
        window.open(url, '_blank');
        showSuccessAlert("¡Éxito!", "La descarga se ha iniciado correctamente.");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] p-6 gap-6 overflow-hidden bg-neutral-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-neutral-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <FileText size={28} strokeWidth={2.5} />
                        </div>
                        Central de Reportes
                    </h1>
                    <p className="text-neutral-500 mt-1 font-medium flex items-center gap-2">
                        <Layers size={14} /> Emisión de Libros Legales y Estados Contables
                    </p>
                </div>
            </div>

            {/* Filtros Globales */}
            <BentoCard className="p-4 shrink-0 overflow-visible">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[300px]">
                        <PremiumSelect
                            label="Ejercicio Fiscal"
                            icon={<Calendar size={18} />}
                            value={selectedEjercicio}
                            onChange={(e) => setSelectedEjercicio(e.target.value)}
                            options={ejercicios.map(ej => ({
                                value: ej.id,
                                label: `${ej.descripcion} (${new Date(ej.fecha_inicio).toLocaleDateString()} - ${new Date(ej.fecha_fin).toLocaleDateString()})`
                            }))}
                        />
                    </div>
                    <div className="w-48">
                        <PremiumInput
                            label="Desde (Opcional)"
                            type="date"
                            value={fechas.desde}
                            onChange={(e) => setFechas({ ...fechas, desde: e.target.value })}
                        />
                    </div>
                    <div className="w-48">
                        <PremiumInput
                            label="Hasta (Opcional)"
                            type="date"
                            value={fechas.hasta}
                            onChange={(e) => setFechas({ ...fechas, hasta: e.target.value })}
                        />
                    </div>
                </div>
            </BentoCard>

            {/* Grid de Reportes */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
                    <ReportCard
                        title="Libro Diario"
                        description="Listado cronológico de todos los asientos y movimientos comerciales."
                        icon={<BookOpen className="text-blue-600" />}
                        onDownload={() => handleDownload('diario')}
                        color="blue"
                    />
                    <ReportCard
                        title="Libro Mayor"
                        description="Detalle acumulado de débitos, créditos y saldos por cada cuenta."
                        icon={<Activity className="text-indigo-600" />}
                        onDownload={() => handleDownload('mayor')}
                        color="indigo"
                    />
                    <ReportCard
                        title="Sumas y Saldos"
                        description="Balance de comprobación para verificar la igualdad patrimonial."
                        icon={<PieChart className="text-emerald-600" />}
                        onDownload={() => handleDownload('balance')}
                        color="emerald"
                    />
                    <ReportCard
                        title="Resultados"
                        description="Estado de pérdidas y ganancias devengadas en el período seleccionado."
                        icon={<TrendingUp className="text-purple-600" />}
                        onDownload={() => handleDownload('resultados')}
                        color="purple"
                    />
                </div>
            </div>
        </div>
    );
};

const ReportCard = ({ title, description, icon, onDownload, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    };

    return (
        <BentoCard className="flex flex-col p-8 group hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-300 border border-neutral-100 hover:border-primary-200">
            <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 mb-6 shadow-sm",
                colorClasses[color]
            )}>
                {React.cloneElement(icon, { size: 32, strokeWidth: 2.5 })}
            </div>

            <h3 className="text-xl font-black text-neutral-800 mb-3 group-hover:text-primary-600 transition-colors">{title}</h3>
            <p className="text-sm font-medium text-neutral-500 mb-8 leading-relaxed">
                {description}
            </p>

            <button
                onClick={onDownload}
                className="mt-auto flex items-center justify-center gap-3 py-4 rounded-xl bg-neutral-900 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-600 shadow-lg transition-all active:scale-95"
            >
                <Download size={18} />
                Descargar Excel
            </button>
        </BentoCard>
    );
};

export default ReportesContables;
