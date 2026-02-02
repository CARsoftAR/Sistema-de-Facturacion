/**
 * Formats a number to Spanish (Argentina) locale: 1.234.567,89
 */
export const formatNumber = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0,00';
    return num.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

/**
 * Formats a number as currency: $ 1.234.567,89
 */
export const formatCurrency = (value) => {
    return `$${formatNumber(value)}`;
};
