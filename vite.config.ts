import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
  base: loadEnv(mode, '.', 'BASE_PATH').BASE_PATH || '/',
  plugins: [react()],
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] }
}));
