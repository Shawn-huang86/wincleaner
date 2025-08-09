import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 重要：设置相对路径，用于 Electron
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false, // 允许自动选择可用端口
    host: true // 允许外部访问
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
