import React from 'react';
import { cn } from '../../utils/cn';

/**
 * BentoCard - Premium Modular Card Component
 * 
 * Design Principles:
 * - Glassmorphism for depth without heaviness
 * - Strict 8px spacing grid
 * - Micro-interactions for tactile feedback
 * - WCAG 2.2 AA compliant contrast ratios
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional Tailwind classes
 * @param {boolean} props.hover - Enable hover elevation (default: true)
 * @param {boolean} props.glass - Enable glass effect (default: false)
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Padding size
 * @param {Function} props.onClick - Click handler
 */
export const BentoCard = ({
    children,
    className = '',
    hover = true,
    glass = false,
    size = 'md',
    onClick,
    ...props
}) => {
    const sizeClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
    };

    const baseClasses = glass
        ? 'glass rounded-lg'
        : 'bg-white rounded-lg border border-neutral-200 shadow-premium';

    const hoverClasses = hover
        ? 'transition-all duration-200 hover:shadow-premium-lg hover:-translate-y-0.5'
        : '';

    const interactiveClasses = onClick
        ? 'cursor-pointer active:scale-[0.99]'
        : '';

    return (
        <div
            className={cn(
                baseClasses,
                hoverClasses,
                interactiveClasses,
                sizeClasses[size],
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

/**
 * BentoGrid - Responsive Grid Container
 * 
 * Implements Bento Box layout pattern for modular information architecture
 * Auto-responsive: 1 col mobile, 2 cols tablet, 3-4 cols desktop
 */
export const BentoGrid = ({ children, className = '', cols = 'auto' }) => {
    const colClasses = {
        auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
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
 * StatCard - KPI Display Component
 * 
 * Optimized for dashboard metrics with visual hierarchy
 * Supports trend indicators and contextual actions
 */
export const StatCard = ({
    label,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'primary',
    onClick
}) => {
    const colorClasses = {
        primary: 'text-primary-600 bg-primary-50',
        success: 'text-success-600 bg-success-50',
        warning: 'text-warning-600 bg-warning-50',
        error: 'text-error-600 bg-error-50',
    };

    const trendColors = {
        up: 'text-success-600',
        down: 'text-error-600',
        neutral: 'text-neutral-500',
    };

    return (
        <BentoCard hover={!!onClick} onClick={onClick} size="md">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600 mb-1">
                        {label}
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 tracking-tight">
                        {value}
                    </p>
                    {trend && (
                        <p className={cn(
                            'text-sm font-medium mt-2',
                            trendColors[trend]
                        )}>
                            {trendValue}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={cn(
                        'p-3 rounded-lg',
                        colorClasses[color]
                    )}>
                        <Icon size={24} strokeWidth={2} />
                    </div>
                )}
            </div>
        </BentoCard>
    );
};

/**
 * ActionCard - Interactive Task Card
 * 
 * For quick actions and contextual navigation
 * Includes loading states and disabled states for better UX
 */
export const ActionCard = ({
    title,
    description,
    icon: Icon,
    onClick,
    loading = false,
    disabled = false,
    badge,
}) => {
    return (
        <BentoCard
            hover={!disabled}
            onClick={disabled ? undefined : onClick}
            className={cn(
                disabled && 'opacity-50 cursor-not-allowed',
                'relative overflow-hidden'
            )}
        >
            {badge && (
                <span className="absolute top-4 right-4 px-2 py-1 text-xs font-bold bg-primary-100 text-primary-700 rounded-full">
                    {badge}
                </span>
            )}
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="p-3 rounded-lg bg-neutral-100 text-neutral-700">
                        <Icon size={24} strokeWidth={2} />
                    </div>
                )}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                        {description}
                    </p>
                </div>
            </div>
            {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </BentoCard>
    );
};

export default BentoCard;
