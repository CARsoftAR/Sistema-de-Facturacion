import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
  // Base path for assets in production (must match Django static url)
  base: '/static/dist/'
})
