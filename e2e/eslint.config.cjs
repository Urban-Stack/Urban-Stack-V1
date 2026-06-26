const { defineConfig, globalIgnores } = require('eslint/config');

const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

module.exports = defineConfig([
	{
		languageOptions: {
			parser: tsParser,

			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ['./tsconfig.json']
			}
		},

		extends: compat.extends(
			'eslint:recommended',
			'plugin:@typescript-eslint/recommended',
			'plugin:@typescript-eslint/recommended-requiring-type-checking'
		),

		plugins: {
			'@typescript-eslint': typescriptEslint
		},

		rules: {
			'no-mixed-spaces-and-tabs': 'off',
			'no-unexpected-multiline': 'off',
			'no-unused-vars': 'off',

			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],

			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off'
		}
	},
	globalIgnores(['**/*.cjs'])
]);
