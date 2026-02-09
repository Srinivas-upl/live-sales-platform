import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        rewrite: (path) => {
          // Handle auth routes specially
          if (path.startsWith('/api/auth/register')) {
            return '/store/auth?action=register';
          }
          if (path.startsWith('/api/auth/login')) {
            return '/store/auth?action=login';
          }
          if (path === '/api/auth') {
            return '/store/auth';
          }
          // Default rewrite
          return path.replace(/^\/api/, '/store');
        }
      }
    }
  }
})
