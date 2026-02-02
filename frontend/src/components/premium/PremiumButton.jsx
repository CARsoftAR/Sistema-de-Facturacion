import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * PremiumButton - Advanced Button Component
 * 
 * Design Principles:
 * - Clear visual hierarchy through variants
 * - Tactile feedback with micro-animations
 * - Loading states for async operations
 * - Icon support for better recognition
 * - WCAG 2.2 AA compliant contrast
 * 
 * Variants:
 * - primary: Main CTAs (blue)
 * - secondary: Secondary actions (gray)
 * - success: Positive actions (green)
 * - warning: Caution actions (yellow)
 * - error: Destructive actions (red)
 * - ghost: Minimal style
 * - outline: Bordered style
 */

export const PremiumButton = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    onClick,
    type = 'button',
    ...props
}) => {
    const baseClasses = cn(
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]'
    );

    const sizeClasses = {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base',
        xl: 'px-6 py-3.5 text-base',
    };

    const variantClasses = {
        primary: cn(
            'bg-primary-600 text-white',
            'hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30',
            'focus:ring-primary-500',
            'disabled:hover:bg-primary-600 disabled:hover:shadow-none'
        ),
        secondary: cn(
            'bg-neutral-600 text-white',
            'hover:bg-neutral-700 hover:shadow-lg hover:shadow-neutral-500/30',
            'focus:ring-neutral-500',
            'disabled:hover:bg-neutral-600 disabled:hover:shadow-none'
        ),
        success: cn(
            'bg-success-600 text-white',
            'hover:bg-success-700 hover:shadow-lg hover:shadow-success-500/30',
            'focus:ring-success-500',
            'disabled:hover:bg-success-600 disabled:hover:shadow-none'
        ),
        warning: cn(
            'bg-warning-600 text-white',
            'hover:bg-warning-700 hover:shadow-lg hover:shadow-warning-500/30',
            'focus:ring-warning-500',
            'disabled:hover:bg-warning-600 disabled:hover:shadow-none'
        ),
        error: cn(
            'bg-error-600 text-white',
            'hover:bg-error-700 hover:shadow-lg hover:shadow-error-500/30',
            'focus:ring-error-500',
            'disabled:hover:bg-error-600 disabled:hover:shadow-none'
        ),
        ghost: cn(
            'bg-transparent text-neutral-700',
            'hover:bg-neutral-100',
            'focus:ring-neutral-500'
        ),
        outline: cn(
            'bg-transparent border-2 border-neutral-300 text-neutral-700',
            'hover:bg-neutral-50 hover:border-neutral-400',
            'focus:ring-neutral-500'
        ),
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={cn(
                baseClasses,
                sizeClasses[size],
                variantClasses[variant],
                widthClass,
                className
            )}
            {...props}
        >
            {loading && (
                <Loader2 size={16} className="animate-spin" />
            )}
            {!loading && Icon && iconPosition === 'left' && (
                <Icon size={16} strokeWidth={2.5} />
            )}
            {children}
            {!loading && Icon && iconPosition === 'right' && (
                <Icon size={16} strokeWidth={2.5} />
            )}
        </button>
    );
};

/**
 * ButtonGroup - Container for grouped buttons
 */
export const ButtonGroup = ({
    children,
    orientation = 'horizontal',
    className = '',
}) => {
    return (
        <div
            className={cn(
                'inline-flex',
                orientation === 'horizontal' ? 'flex-row' : 'flex-col',
                '[&>button]:rounded-none',
                '[&>button:first-child]:rounded-l-lg',
                '[&>button:last-child]:rounded-r-lg',
                orientation === 'vertical' && '[&>button:first-child]:rounded-t-lg',
                orientation === 'vertical' && '[&>button:last-child]:rounded-b-lg',
                orientation === 'vertical' && '[&>button:first-child]:rounded-l-none',
                orientation === 'vertical' && '[&>button:last-child]:rounded-r-none',
                className
            )}
        >
            {children}
        </div>
    );
};

/**
 * IconButton - Button with only an icon
 */
export const IconButton = ({
    icon: Icon,
    variant = 'ghost',
    size = 'md',
    className = '',
    'aria-label': ariaLabel,
    ...props
}) => {
    const sizeClasses = {
        xs: 'p-1',
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5',
        xl: 'p-3',
    };

    const iconSizes = {
        xs: 14,
        sm: 16,
        md: 18,
        lg: 20,
        xl: 24,
    };

    return (
        <PremiumButton
            variant={variant}
            className={cn('!px-0', sizeClasses[size], className)}
            aria-label={ariaLabel}
            {...props}
        >
            <Icon size={iconSizes[size]} strokeWidth={2.5} />
        </PremiumButton>
    );
};

/**
 * FloatingActionButton - FAB for primary actions
 */
export const FloatingActionButton = ({
    icon: Icon,
    onClick,
    variant = 'primary',
    position = 'bottom-right',
    className = '',
    ...props
}) => {
    const positionClasses = {
        'bottom-right': 'fixed bottom-6 right-6',
        'bottom-left': 'fixed bottom-6 left-6',
        'top-right': 'fixed top-6 right-6',
        'top-left': 'fixed top-6 left-6',
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                'p-4 rounded-full shadow-2xl z-50',
                'transition-all duration-200',
                'hover:scale-110 active:scale-95',
                'focus:outline-none focus:ring-4 focus:ring-offset-2',
                variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
                variant === 'success' && 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
                variant === 'error' && 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
                positionClasses[position],
                className
            )}
            {...props}
        >
            <Icon size={24} strokeWidth={2.5} />
        </button>
    );
};

export default PremiumButton;
