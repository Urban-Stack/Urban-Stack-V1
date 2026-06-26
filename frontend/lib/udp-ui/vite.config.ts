import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import preserveDirectives from 'rollup-preserve-directives';
import tailwindcss from '@tailwindcss/vite';
import flowbiteReact from 'flowbite-react/plugin/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['lib'],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.stories.ts',
        '**/*.stories.tsx',
        '**/__test__',
      ],
      insertTypesEntry: true,
    }),
    preserveDirectives(),
    flowbiteReact(),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: {
        components: resolve(__dirname, 'lib/components/index.ts'),
        assertion: resolve(__dirname, 'lib/assertion/index.ts'),
        env: resolve(__dirname, 'lib/env/index.ts'),
        fp: resolve(__dirname, 'lib/fp/index.ts'),
        fetching: resolve(__dirname, 'lib/fetching/index.ts'),
        hook: resolve(__dirname, 'lib/hook/index.ts'),
        string: resolve(__dirname, 'lib/string/index.ts'),
        tailwind: resolve(__dirname, 'lib/tailwind/index.ts'),
        'test-utils': resolve(__dirname, 'lib/test-utils/index.ts'),
        theme: resolve(__dirname, 'lib/theme/index.ts'),
      },
      name: 'udp-ui',
      fileName: (format, name) => `${name}.${format}.js`,
      formats: ['es', 'cjs'],
    },
    copyPublicDir: false,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'flowbite-react',
        'tailwindcss',
        'react-toastify',
      ],
      output: { globals: { 'react-toastify': 'ReactToastify' } },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
