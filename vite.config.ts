import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiKey = process.env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
  console.log(`[Vite Build] Loading Env. API Key present: ${!!apiKey}, Length: ${apiKey?.length}`);
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    base: '/Prepster---your-study-companion/',
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
