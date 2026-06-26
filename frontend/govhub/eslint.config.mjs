import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/recommended-type-checked',
  ),
  {
    ignores: ['app/**/*.js', 'app/**/*.jsx', 'lib/**', 'app/__generated__/'],
  },
  {
    plugins: {
      'prefer-arrow-functions': preferArrowFunctions,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'prefer-arrow-functions/prefer-arrow-functions': [
        'error',
        { disallowPrototype: true },
      ],
      'arrow-body-style': ['error', 'as-needed'],
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message: 'Use `app/_lib/client/localStorage.ts` instead.',
        },
        {
          name: 'sessionStorage',
          message: 'Use `app/_lib/client/sessionStorage.ts` instead.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'flowbite-react',
              importNames: ['Button', 'Avatar'],
              message: "Use components from 'app/_components' instead.",
            },
            {
              name: 'react-leaflet',
              message:
                "Use components from 'app/_component/next-wrapper/react-leaflet.ts' instead.",
            },
            {
              name: 'swr',
              message: "Use 'app/_lib/client/useNextSWR.ts' instead.",
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='a']",
          message: "Use Next.js' <Link> component instead of <a> tag.",
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^debug$',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-restricted-imports': ['off', { name: 'swr' }],
    },
  },
  {
    files: ['**/*.stories.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['app/_lib/client/localStorage.ts'],
    rules: {
      'no-restricted-globals': [
        'off',
        {
          name: 'localStorage',
          message: 'Use `app/_lib/client/localStorage.ts` instead.',
        },
      ],
    },
  },
  {
    files: ['app/_lib/client/sessionStorage.ts'],
    rules: {
      'no-restricted-globals': [
        'off',
        {
          name: 'sessionStorage',
          message: 'Use `app/_lib/client/sessionStorage.ts` instead.',
        },
      ],
    },
  },
  {
    files: ['app/_component/next-wrapper/react-leaflet.ts'],
    rules: {
      'no-restricted-imports': ['off', { name: 'react-leaflet' }],
    },
  },
  {
    files: ['app/_lib/client/useNextSWR.ts', '**/*.test.tsx', '**/*.test.ts'],
    rules: {
      'no-restricted-imports': ['off', { name: 'swr' }],
    },
  },
];
