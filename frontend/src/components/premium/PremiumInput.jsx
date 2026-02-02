import React, { forwardRef, useState } from 'react';
import { Search, X, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * PremiumInput - Advanced Input Component
 * 
 * Design Principles (Nielsen's Heuristics):
 * 1. Visibility of system status - Clear focus/error/success states
 * 2. Error prevention - Real-time validation feedback
 * 3. Recognition over recall - Placeholder + label always visible
 * 4. Aesthetic & minimalist - Clean, purposeful design
 * 
 * WCAG 2.2 AA Compliance:
 * - 4.5:1 contrast ratio for text
 * - Visible focus indicators
 * - Proper ARIA labels
 * - Keyboard navigation support
 */

export const PremiumInput = forwardRef(({
    label,
    error,
    success,
    hint,
    icon: Icon,
    clearable = false,
    onClear,
    className = '',
    containerClassName = '',
    type = 'text',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const handleClear = () => {
        if (onClear) {
            onClear();
        } else if (props.onChange) {
            props.onChange({ target: { value: '' } });
        }
    };

    return (
        <div className={cn('w-full', containerClassName)}>
            {label && (
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {label}
                    {props.required && <span className="text-error-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {/* Icon */}
                {Icon && (
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400">
                        <Icon size={18} strokeWidth={2} />
                    </div>
                )}

                {/* Input */}
                <input
                    ref={ref}
                    type={inputType}
                    className={cn(
                        // Base styles
                        'w-full py-3 rounded-lg border transition-all duration-200',
                        'text-neutral-900 placeholder:text-neutral-400',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',

                        // Conditioned Padding
                        !Icon && 'px-4',
                        Icon && 'pl-16 pr-4', // Aumentado a 16 para máxima seguridad
                        (clearable || isPassword) && 'pr-12',

                        // States
                        error && 'border-error-300 focus:border-error-500 focus:ring-error-500/20 bg-error-50/30',
                        success && 'border-success-300 focus:border-success-500 focus:ring-success-500/20 bg-success-50/30',
                        !error && !success && 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-white',

                        // Disabled
                        props.disabled && 'opacity-50 cursor-not-allowed bg-neutral-50',

                        className
                    )}
                    {...props}
                />

                {/* Clear button */}
                {clearable && props.value && !props.disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label="Limpiar campo"
                    >
                        <X size={18} strokeWidth={2} />
                    </button>
                )}

                {/* Password toggle */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}

                {/* Status icons */}
                {error && !clearable && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500">
                        <AlertCircle size={18} strokeWidth={2} />
                    </div>
                )}
                {success && !clearable && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500">
                        <CheckCircle2 size={18} strokeWidth={2} />
                    </div>
                )}
            </div>

            {/* Helper text */}
            {(hint || error || success) && (
                <div className="mt-2 flex items-start gap-1">
                    {error && (
                        <>
                            <AlertCircle size={14} className="text-error-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-error-600">{error}</p>
                        </>
                    )}
                    {success && !error && (
                        <>
                            <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-success-600">{success}</p>
                        </>
                    )}
                    {hint && !error && !success && (
                        <p className="text-sm text-neutral-500">{hint}</p>
                    )}
                </div>
            )}
        </div>
    );
});

PremiumInput.displayName = 'PremiumInput';

/**
 * SearchInput - Specialized search field with debounce
 */
export const SearchInput = ({
    onSearch,
    debounce = 300,
    placeholder = 'Buscar...',
    value: propValue = '',
    ...props
}) => {
    const [value, setValue] = useState(propValue);
    const [timeoutId, setTimeoutId] = useState(null);

    // Sincronizar con valor externo (para limpieza)
    React.useEffect(() => {
        setValue(propValue);
    }, [propValue]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);

        if (timeoutId) clearTimeout(timeoutId);

        const newTimeoutId = setTimeout(() => {
            onSearch?.(newValue);
        }, debounce);

        setTimeoutId(newTimeoutId);
    };

    const handleClear = () => {
        setValue('');
        onSearch?.('');
    };

    return (
        <PremiumInput
            icon={Search}
            value={value}
            onChange={handleChange}
            onClear={handleClear}
            clearable
            placeholder={placeholder}
            {...props}
        />
    );
};

/**
 * PremiumSelect - Styled select dropdown
 */
export const PremiumSelect = forwardRef(({
    label,
    error,
    hint,
    options = [],
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={cn('w-full', containerClassName)}>
            {label && (
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {label}
                    {props.required && <span className="text-error-500 ml-1">*</span>}
                </label>
            )}

            <select
                ref={ref}
                className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-all duration-200',
                    'text-neutral-900 bg-white',
                    'focus:outline-none focus:ring-2 focus:ring-offset-0',
                    'appearance-none cursor-pointer',

                    error && 'border-error-300 focus:border-error-500 focus:ring-error-500/20',
                    !error && 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20',

                    props.disabled && 'opacity-50 cursor-not-allowed bg-neutral-50',

                    className
                )}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {(hint || error) && (
                <div className="mt-2">
                    {error && (
                        <p className="text-sm text-error-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {error}
                        </p>
                    )}
                    {hint && !error && (
                        <p className="text-sm text-neutral-500">{hint}</p>
                    )}
                </div>
            )}
        </div>
    );
});

PremiumSelect.displayName = 'PremiumSelect';

export default PremiumInput;
