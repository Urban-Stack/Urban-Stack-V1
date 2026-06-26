import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup-vitest.js',
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      include: [
        'lib/**/*.{ts,tsx}',
        '!**/*.stories.*',
        '!**/__test__',
        '!lib/components/icons/**',
        '!lib/tailwind/config.ts',
      ],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        perFile: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
