/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom dark theme palette
                'sidebar-bg': '#0f172a',    // Slate 900
                'sidebar-hover': '#1e293b', // Slate 800
                'accent': '#3b82f6',        // Blue 500
                'accent-hover': '#2563eb',  // Blue 600
                'text-primary': '#f8fafc',  // Slate 50
                'text-secondary': '#94a3b8' // Slate 400
            }
        },
    },
    plugins: [],
}
