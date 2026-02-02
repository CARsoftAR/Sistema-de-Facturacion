import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatNumber } from '../../utils/formats';
import { BentoCard } from './BentoCard';

/**
 * PremiumStats - Advanced Statistics Display Component
 * 
 * Design Philosophy:
 * - Data visualization with immediate comprehension
 * - Color-coded trends for quick insights
 * - Micro-animations for engagement
 * - Responsive grid layouts
 * 
 * Use Cases:
 * - Dashboard KPIs
 * - Financial metrics
 * - Performance indicators
 * - Analytics summaries
 */

export const StatCard = ({
    label,
    value,
    icon: Icon,
    trend,
    trendValue,
    trendLabel,
    color = 'primary',
    loading = false,
    onClick,
    className = '',
}) => {
    const colorClasses = {
        primary: {
            icon: 'text-primary-600 bg-primary-50',
            text: 'text-primary-600',
        },
        success: {
            icon: 'text-success-600 bg-success-50',
            text: 'text-success-600',
        },
        warning: {
            icon: 'text-warning-600 bg-warning-50',
            text: 'text-warning-600',
        },
        error: {
            icon: 'text-error-600 bg-error-50',
            text: 'text-error-600',
        },
        neutral: {
            icon: 'text-neutral-600 bg-neutral-50',
            text: 'text-neutral-600',
        },
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp size={16} />;
        if (trend === 'down') return <TrendingDown size={16} />;
        return <Minus size={16} />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-success-600 bg-success-50';
        if (trend === 'down') return 'text-error-600 bg-error-50';
        return 'text-neutral-500 bg-neutral-50';
    };

    if (loading) {
        return (
            <BentoCard className={cn('animate-pulse', className)}>
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="h-4 bg-neutral-200 rounded w-24" />
                        <div className="h-8 bg-neutral-200 rounded w-32" />
                        <div className="h-3 bg-neutral-200 rounded w-20" />
                    </div>
                    <div className="w-12 h-12 bg-neutral-200 rounded-lg" />
                </div>
            </BentoCard>
        );
    }

    return (
        <BentoCard
            hover={!!onClick}
            onClick={onClick}
            className={cn('group', className)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    {/* Label */}
                    <p className="text-sm font-medium text-neutral-600 mb-2 truncate">
                        {label}
                    </p>

                    {/* Value */}
                    <p className="text-3xl font-bold text-neutral-900 tracking-tight mb-3">
                        {value}
                    </p>

                    {/* Trend */}
                    {(trend || trendValue) && (
                        <div className="flex items-center gap-2">
                            {trend && (
                                <span className={cn(
                                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                                    getTrendColor()
                                )}>
                                    {getTrendIcon()}
                                    {trendValue}
                                </span>
                            )}
                            {trendLabel && (
                                <span className="text-xs text-neutral-500">
                                    {trendLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Icon */}
                {Icon && (
                    <div className={cn(
                        'p-3 rounded-lg transition-transform group-hover:scale-110',
                        colorClasses[color].icon
                    )}>
                        <Icon size={24} strokeWidth={2} />
                    </div>
                )}
            </div>
        </BentoCard>
    );
};

/**
 * MiniStatCard - Compact version for dense layouts
 */
export const MiniStatCard = ({
    label,
    value,
    icon: Icon,
    trend,
    color = 'primary',
    className = '',
}) => {
    const colorClasses = {
        primary: 'text-primary-600',
        success: 'text-success-600',
        warning: 'text-warning-600',
        error: 'text-error-600',
        neutral: 'text-neutral-600',
    };

    return (
        <div className={cn(
            'flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200',
            'hover:shadow-md transition-all',
            className
        )}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className={cn('p-2 rounded-lg bg-neutral-50', colorClasses[color])}>
                        <Icon size={18} strokeWidth={2} />
                    </div>
                )}
                <div>
                    <p className="text-xs text-neutral-500 font-medium">{label}</p>
                    <p className="text-lg font-bold text-neutral-900">{value}</p>
                </div>
            </div>
            {trend && (
                <div className={cn(
                    'text-sm font-semibold',
                    trend === 'up' && 'text-success-600',
                    trend === 'down' && 'text-error-600',
                    trend === 'neutral' && 'text-neutral-500'
                )}>
                    {trend === 'up' && <ArrowUpRight size={20} />}
                    {trend === 'down' && <ArrowDownRight size={20} />}
                </div>
            )}
        </div>
    );
};

/**
 * StatsGrid - Responsive grid container for stats
 */
export const StatsGrid = ({
    children,
    cols = 'auto',
    className = '',
}) => {
    const colClasses = {
        auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn(
            'grid gap-6',
            colClasses[cols],
            className
        )}>
            {children}
        </div>
    );
};

/**
 * ComparisonCard - Side-by-side metric comparison
 */
export const ComparisonCard = ({
    title,
    metrics = [],
    className = '',
}) => {
    return (
        <BentoCard className={className}>
            {title && (
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                    {title}
                </h3>
            )}
            <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, idx) => (
                    <div
                        key={idx}
                        className="p-4 bg-neutral-50 rounded-lg border border-neutral-100"
                    >
                        <p className="text-xs text-neutral-500 font-medium mb-1">
                            {metric.label}
                        </p>
                        <p className="text-2xl font-bold text-neutral-900">
                            {metric.value}
                        </p>
                        {metric.subtitle && (
                            <p className="text-xs text-neutral-500 mt-1">
                                {metric.subtitle}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </BentoCard>
    );
};

/**
 * ProgressCard - Metric with progress bar
 */
export const ProgressCard = ({
    label,
    value,
    max,
    percentage,
    color = 'primary',
    showPercentage = true,
    className = '',
}) => {
    const calculatedPercentage = percentage || (value / max) * 100;

    const colorClasses = {
        primary: 'bg-primary-600',
        success: 'bg-success-600',
        warning: 'bg-warning-600',
        error: 'bg-error-600',
    };

    return (
        <BentoCard className={className}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-neutral-600">{label}</p>
                {showPercentage && (
                    <p className="text-sm font-bold text-neutral-900">
                        {calculatedPercentage.toFixed(0)}%
                    </p>
                )}
            </div>
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500',
                        colorClasses[color]
                    )}
                    style={{ width: `${Math.min(calculatedPercentage, 100)}%` }}
                />
            </div>
            {(value !== undefined && max !== undefined) && (
                <p className="text-xs text-neutral-500 mt-2">
                    {formatNumber(value)} de {formatNumber(max)}
                </p>
            )}
        </BentoCard>
    );
};

export default StatCard;
