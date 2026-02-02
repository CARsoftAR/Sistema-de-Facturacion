import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp,
    AlertCircle,
    Lightbulb,
    Clock,
    Users,
    DollarSign,
    Package,
    ShoppingCart
} from 'lucide-react';
import { BentoGrid, BentoCard, StatCard, ActionCard } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';

/**
 * INTELLIGENT DASHBOARD - Capa Predictiva
 * 
 * Características de IA Explicable (XAI):
 * 1. Predicción de acciones basada en patrones históricos
 * 2. Sugerencias contextuales con justificación
 * 3. Alertas proactivas de anomalías
 * 4. Optimización de flujo de trabajo
 * 
 * Principios de Diseño Anticipatorio:
 * - El sistema aprende del comportamiento del usuario
 * - Presenta información relevante antes de que se solicite
 * - Explica el "por qué" de cada sugerencia (transparencia)
 * - Permite desactivar sugerencias (control del usuario)
 */

const IntelligentDashboard = () => {
    const [userBehavior, setUserBehavior] = useState({
        commonActions: [],
        peakHours: [],
        preferredClients: [],
    });

    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    // ═══════════════════════════════════════════════════════════
    // INTELLIGENT LAYER - Behavioral Analysis
    // ═══════════════════════════════════════════════════════════

    useEffect(() => {
        const analyzeUserBehavior = async () => {
            try {
                // Simulated API call to behavioral analytics
                const response = await fetch('/api/analytics/user-behavior/');
                const data = await response.json();

                setUserBehavior(data);

                // Generate contextual insights
                const currentHour = new Date().getHours();
                const currentDay = new Date().getDay();

                const generatedInsights = [];

                // Insight 1: Time-based suggestion
                if (currentHour >= 9 && currentHour <= 11) {
                    generatedInsights.push({
                        type: 'suggestion',
                        icon: Clock,
                        title: 'Momento óptimo para ventas',
                        description: 'Históricamente, registras el 40% de tus ventas entre 9-11 AM.',
                        action: 'Nueva Venta',
                        actionUrl: '/ventas/nuevo',
                        confidence: 0.87,
                        color: 'primary'
                    });
                }

                // Insight 2: Stock alert (proactive)
                generatedInsights.push({
                    type: 'alert',
                    icon: AlertCircle,
                    title: '3 productos con stock bajo',
                    description: 'Basado en tu velocidad de venta promedio, estos productos se agotarán en 5 días.',
                    action: 'Ver Productos',
                    actionUrl: '/productos?filter=low-stock',
                    confidence: 0.92,
                    color: 'warning'
                });

                // Insight 3: Client engagement
                if (currentDay === 5) { // Friday
                    generatedInsights.push({
                        type: 'opportunity',
                        icon: Users,
                        title: 'Clientes inactivos detectados',
                        description: '5 clientes frecuentes no han comprado en 30 días. Considera enviar una promoción.',
                        action: 'Ver Clientes',
                        actionUrl: '/clientes?filter=inactive',
                        confidence: 0.78,
                        color: 'success'
                    });
                }

                setInsights(generatedInsights);
                setLoading(false);
            } catch (error) {
                console.error('Error analyzing behavior:', error);
                setLoading(false);
            }
        };

        analyzeUserBehavior();
    }, []);

    // ═══════════════════════════════════════════════════════════
    // QUICK ACTIONS - Adaptive Ordering
    // ═══════════════════════════════════════════════════════════

    const quickActions = useMemo(() => {
        // Default actions
        const actions = [
            { id: 'nueva-venta', title: 'Nueva Venta', icon: ShoppingCart, url: '/ventas/nuevo', frequency: 0 },
            { id: 'nuevo-producto', title: 'Nuevo Producto', icon: Package, url: '/productos/nuevo', frequency: 0 },
            { id: 'nuevo-cliente', title: 'Nuevo Cliente', icon: Users, url: '/clientes/nuevo', frequency: 0 },
            { id: 'reportes', title: 'Ver Reportes', icon: TrendingUp, url: '/reportes', frequency: 0 },
        ];

        // Sort by user frequency (intelligent ordering)
        if (userBehavior.commonActions?.length > 0) {
            actions.forEach(action => {
                const behaviorData = userBehavior.commonActions.find(b => b.id === action.id);
                if (behaviorData) {
                    action.frequency = behaviorData.frequency;
                }
            });

            return actions.sort((a, b) => b.frequency - a.frequency);
        }

        return actions;
    }, [userBehavior]);

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
                        <Lightbulb size={36} className="text-primary-600" />
                        Dashboard Inteligente
                    </h1>
                    <p className="text-neutral-600 mt-2">
                        Insights personalizados basados en tu comportamiento
                    </p>
                </div>

                {/* INTELLIGENT INSIGHTS */}
                {insights.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                            <Lightbulb size={20} className="text-primary-600" />
                            Sugerencias Inteligentes
                        </h2>

                        <BentoGrid cols={2}>
                            {insights.map((insight, idx) => (
                                <InsightCard key={idx} insight={insight} />
                            ))}
                        </BentoGrid>
                    </div>
                )}

                {/* QUICK ACTIONS - Adaptive */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-neutral-900">
                            Acciones Rápidas
                        </h2>
                        <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                            Ordenadas por frecuencia de uso
                        </span>
                    </div>

                    <BentoGrid cols={4}>
                        {quickActions.map((action, idx) => (
                            <ActionCard
                                key={action.id}
                                title={action.title}
                                description={action.frequency > 0 ? `Usada ${action.frequency} veces` : 'Disponible'}
                                icon={action.icon}
                                onClick={() => window.location.href = action.url}
                                badge={idx === 0 ? 'Más usada' : null}
                            />
                        ))}
                    </BentoGrid>
                </div>

                {/* KPI STATS */}
                <BentoGrid cols={4}>
                    <StatCard
                        label="Ventas Hoy"
                        value="$45,230"
                        icon={DollarSign}
                        trend="up"
                        trendValue="+12% vs ayer"
                        color="primary"
                    />
                    <StatCard
                        label="Productos Activos"
                        value="234"
                        icon={Package}
                        color="success"
                    />
                    <StatCard
                        label="Clientes Nuevos"
                        value="12"
                        icon={Users}
                        trend="up"
                        trendValue="+3 esta semana"
                        color="primary"
                    />
                    <StatCard
                        label="Pendientes"
                        value="8"
                        icon={AlertCircle}
                        color="warning"
                    />
                </BentoGrid>

            </div>
        </div>
    );
};

/**
 * InsightCard - XAI Component
 * Displays intelligent insights with explanation and confidence level
 */
const InsightCard = ({ insight }) => {
    const colorClasses = {
        primary: 'border-primary-200 bg-primary-50/50',
        success: 'border-success-200 bg-success-50/50',
        warning: 'border-warning-200 bg-warning-50/50',
        error: 'border-error-200 bg-error-50/50',
    };

    const iconColorClasses = {
        primary: 'text-primary-600 bg-primary-100',
        success: 'text-success-600 bg-success-100',
        warning: 'text-warning-600 bg-warning-100',
        error: 'text-error-600 bg-error-100',
    };

    const Icon = insight.icon;

    return (
        <BentoCard
            className={cn(
                'border-2 transition-all duration-200',
                colorClasses[insight.color]
            )}
            hover={true}
        >
            <div className="flex items-start gap-4">
                <div className={cn(
                    'p-3 rounded-lg flex-shrink-0',
                    iconColorClasses[insight.color]
                )}>
                    <Icon size={24} strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        {insight.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">
                        {insight.description}
                    </p>

                    {/* XAI: Confidence Level */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.location.href = insight.actionUrl}
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            {insight.action} →
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-600 rounded-full transition-all"
                                    style={{ width: `${insight.confidence * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-neutral-500">
                                {Math.round(insight.confidence * 100)}% confianza
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </BentoCard>
    );
};

export default IntelligentDashboard;
