import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/CertiVault-AI/' : '/',
  server: {
    port: 5173,
    open: false,
    host: true
  }
}));
