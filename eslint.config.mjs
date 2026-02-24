import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import next from '@next/eslint-plugin-next'
import react from 'eslint-plugin-react'

import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import globals from 'globals'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
	...nextVitals,
	{
		ignores: ['**/node_modules/**', '**/.next/**', '**/.git/**', '**/.vscode/**'],
	},
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: tsparser,
			parserOptions: {
				project: './tsconfig.json',
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
		},
		rules: {
			...js.configs.recommended.rules,
			...react.configs.recommended.rules,
			...next.configs.recommended.rules,
			...tseslint.configs.recommended.rules,
			'@typescript-eslint/no-base-to-string': 'error',
			'@typescript-eslint/require-await': 'error',
			'@typescript-eslint/unbound-method': 'error',
			'react/react-in-jsx-scope': 'off',
			'no-template-curly-in-string': 'off',
			'no-misleading-character-class': 'off',
			'no-unsafe-optional-chaining': 'off',
			'no-undef': 'off',
			'no-mixed-spaces-and-tabs': 'off',
			'no-unused-vars': 'off',
			'no-dupe-keys': 'error',
			'react/prop-types': 'off',
			'react/jsx-key': 'error',
			'no-console': ['warn', { allow: ['warn', 'error', 'info', 'table'] }],
			'react/display-name': 'off',
			'no-extra-boolean-cast': 'off',
			'react-hooks/exhaustive-deps': 'warn',
			'prefer-const': 'warn',
			'no-control-regex': 'off',
			'newline-before-return': 'error',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'sort-imports': [
				'error',
				{
					ignoreCase: true,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false,
					allowSeparatedGroups: false,
				},
			],
			'import/order': [
				'error',
				{
					groups: [['builtin', 'external'], ['internal', 'parent', 'sibling', 'index'], 'type', 'object', 'unknown'],
					alphabetize: { order: 'asc', caseInsensitive: true },
					'newlines-between': 'always',
					pathGroups: [
						{
							pattern: '@/**',
							group: 'internal',
						},
					],
					pathGroupsExcludedImportTypes: ['type'],
				},
			],
			// 'no-restricted-syntax': [
			// 	'error',
			// 	{
			// 		selector: `JSXElement[openingElement.name.name='pre'] > JSXExpressionContainer > CallExpression[callee.object.name='JSON'][callee.property.name='stringify'][arguments.length>=3]`,
			// 		message: `Don't leave JSON.stringify inside <pre> in production code.`
			// 	}
			// ],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'separate-type-imports',
				},
			],
			'import/no-duplicates': ['error', { 'prefer-inline': false }],
		},
		settings: {
			react: {
				version: 'detect',
			},
			'import/resolver': {
				typescript: {
					project: './tsconfig.json',
				},
			},
		},
	},
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
