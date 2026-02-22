/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        // Dynamic color classes for module cards
        {
            pattern: /bg-(amber|indigo|purple|emerald|rose|violet|orange|yellow|blue|primary)-(50|100|500|600|700)/,
        },
        {
            pattern: /text-(amber|indigo|purple|emerald|rose|violet|orange|yellow|blue|primary)-(600|700)/,
        },
        {
            pattern: /ring-(amber|indigo|purple|emerald|rose|violet|orange|yellow|blue|primary)-(100|200)/,
        },
        {
            pattern: /border-(amber|indigo|purple|emerald|rose|violet|orange|yellow|blue|primary)-(200|300)/,
        },
        {
            pattern: /shadow-(amber|indigo|purple|emerald|rose|violet|orange|yellow|blue|primary)-(200|600)\/20/,
        },
    ],
    theme: {
        extend: {
            // ═══════════════════════════════════════════════════════════
            // PREMIUM COLOR SYSTEM 2025 - Quiet Luxury Palette
            // ═══════════════════════════════════════════════════════════
            colors: {
                // Primary: Sophisticated Cobalt (Professional Trust)
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',  // Main brand
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },

                // Neutral: Warm Grays (Reduced Eye Strain)
                neutral: {
                    0: '#ffffff',
                    50: '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                    950: '#0c0a09',
                },

                // Semantic Colors
                success: {
                    50: '#f0fdf4',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                },
                warning: {
                    50: '#fffbeb',
                    500: '#f59e0b',
                    600: '#d97706',
                },
                error: {
                    50: '#fef2f2',
                    500: '#ef4444',
                    600: '#dc2626',
                },

                // Glass Effect Base
                glass: {
                    light: 'rgba(255, 255, 255, 0.7)',
                    dark: 'rgba(0, 0, 0, 0.05)',
                },
            },

            // ═══════════════════════════════════════════════════════════
            // SPACING SYSTEM - Strict 8px Grid
            // ═══════════════════════════════════════════════════════════
            spacing: {
                '0': '0px',
                '1': '4px',
                '2': '8px',
                '3': '12px',
                '4': '16px',
                '5': '20px',
                '6': '24px',
                '7': '28px',
                '8': '32px',
                '10': '40px',
                '12': '48px',
                '14': '56px',
                '16': '64px',
                '20': '80px',
                '24': '96px',
                '32': '128px',
            },

            // ═══════════════════════════════════════════════════════════
            // TYPOGRAPHY - Professional Hierarchy
            // ═══════════════════════════════════════════════════════════
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
                'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
                '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
            },

            fontFamily: {
                sans: ['Inter var', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Consolas', 'monospace'],
            },

            // ═══════════════════════════════════════════════════════════
            // GLASSMORPHISM & DEPTH
            // ═══════════════════════════════════════════════════════════
            backdropBlur: {
                xs: '2px',
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '24px',
            },

            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.12)',
                'premium': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
                'premium-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                'premium-xl': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
                'inner-subtle': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            },

            // ═══════════════════════════════════════════════════════════
            // BORDER RADIUS - Soft & Approachable
            // ═══════════════════════════════════════════════════════════
            borderRadius: {
                'none': '0',
                'sm': '0.25rem',    // 4px
                'DEFAULT': '0.5rem', // 8px
                'md': '0.75rem',    // 12px
                'lg': '1rem',       // 16px
                'xl': '1.5rem',     // 24px
                '2xl': '2rem',      // 32px
                'full': '9999px',
            },

            // ═══════════════════════════════════════════════════════════
            // ANIMATION - Micro-interactions
            // ═══════════════════════════════════════════════════════════
            transitionDuration: {
                '75': '75ms',
                '100': '100ms',
                '150': '150ms',
                '200': '200ms',
                '300': '300ms',
                '500': '500ms',
            },

            animation: {
                'fade-in': 'fadeIn 200ms ease-in',
                'slide-up': 'slideUp 300ms ease-out',
                'slide-down': 'slideDown 300ms ease-out',
                'scale-in': 'scaleIn 200ms ease-out',
                'shimmer': 'shimmer 2s linear infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
        },
    },
    plugins: [
        // Custom plugin for glass effect utilities
        function ({ addUtilities }) {
            const newUtilities = {
                '.glass': {
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                },
                '.glass-dark': {
                    background: 'rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                },
                '.bento-card': {
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                    transition: 'all 200ms ease-in-out',
                },
                '.bento-card:hover': {
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                },
            }
            addUtilities(newUtilities)
        },
    ],
}
