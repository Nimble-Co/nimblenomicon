import eslint from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginTailwindcss from 'eslint-plugin-tailwindcss';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs['flat/recommended'],
	...eslintPluginTailwindcss.configs['flat/recommended'],
	{
		settings: {
			tailwindcss: {
				// Tailwind v4: entry must live at repo root so `tailwindcss` resolves from project root
				// (see tailwind.eslint.css).
				config: path.join(__dirname, 'tailwind.eslint.css'),
			},
		},
	},
	{
		rules: {
			// Match editor “conflicting classes” / cssConflict (e.g. outline + outline-2)
			'tailwindcss/no-contradicting-classname': 'error',
			// Nimble + Starlight use @theme tokens (e.g. text-fg) not in default Tailwind
			'tailwindcss/no-custom-classname': 'off',
			// Optional style rules — use Prettier plugin for sort; keep CI focused on conflicts
			'tailwindcss/classnames-order': 'off',
			'tailwindcss/enforces-negative-arbitrary-values': 'off',
			'tailwindcss/enforces-shorthand': 'off',
			'tailwindcss/no-unnecessary-arbitrary-value': 'off',
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**', '.astro/**', '**/*.md', '**/*.mdx'],
	},
	{
		files: ['**/env.d.ts'],
		rules: {
			'@typescript-eslint/triple-slash-reference': 'off',
		},
	},
	{
		files: ['public/scripts/**/*.js'],
		languageOptions: {
			globals: globals.browser,
		},
	},
);
