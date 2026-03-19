import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('development'),
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: [
      '@shelby-protocol/clay-codes',
      '@aptos-labs/aptos-dynamic-transaction-composer',
    ],
  },
  server: {
    host: '::',
    port: 8080,
    hmr: { overlay: false },
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
