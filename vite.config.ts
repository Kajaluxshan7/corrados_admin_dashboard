import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 3002,
      host: env.VITE_HOST || 'localhost',
      strictPort: false,
    },
    build: {
      outDir: env.VITE_BUILD_OUT_DIR || 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      chunkSizeWarningLimit: parseInt(env.VITE_CHUNK_SIZE_LIMIT) || 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'mui-vendor': [
              '@mui/material',
              '@mui/icons-material',
              '@emotion/react',
              '@emotion/styled',
            ],
            'calendar-vendor': [
              '@fullcalendar/react',
              '@fullcalendar/daygrid',
              '@fullcalendar/timegrid',
              '@fullcalendar/interaction',
            ],
          },
        },
      },
    },
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT) || 3002,
      strictPort: false,
      host: env.VITE_HOST || 'localhost',
    },
  };
});
