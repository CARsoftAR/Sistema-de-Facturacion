import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    // Output build files to Django's staticfiles directory
    outDir: '../static/dist',
    emptyOutDir: true,
    manifest: true, // Generate manifest.json for Django to map assets
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        // Ensure consistent naming for static files
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // Base path: '/' for development, '/static/dist/' for production
  base: mode === 'production' ? '/static/dist/' : '/'
}))
