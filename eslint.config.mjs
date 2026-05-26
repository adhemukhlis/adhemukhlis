import jsEslint from '@eslint/js'
import next from '@next/eslint-plugin-next'
import pluginImport from 'eslint-plugin-import-x'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'
import eslintReact from '@eslint-react/eslint-plugin'
import tsEslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

const eslintConfig = defineConfig([
	{
		ignores: ['**/node_modules/**', '**/.next/**', '**/.git/**', '**/.vscode/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
	},
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: tsEslint.parser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.node,
				...globals.browser,
			},
		},
		plugins: {
			import: pluginImport,
			'@stylistic': stylistic,
			'@next/next': next,
		},
		extends: [jsEslint.configs.recommended, tsEslint.configs.recommended, eslintReact.configs['strict-typescript']],
		rules: {
			...next.configs.recommended.rules,
			...next.configs['core-web-vitals'].rules,
			'@typescript-eslint/no-base-to-string': 'error',
			'@typescript-eslint/require-await': 'error',
			'@typescript-eslint/unbound-method': 'error',
			'no-template-curly-in-string': 'off',
			'no-misleading-character-class': 'off',
			'no-unsafe-optional-chaining': 'off',
			'no-undef': 'off',
			'no-mixed-spaces-and-tabs': 'off',
			'no-unused-vars': 'off',
			'no-dupe-keys': 'error',
			'no-console': ['warn', { allow: ['warn', 'error', 'info', 'table'] }],
			'no-extra-boolean-cast': 'off',
			'@eslint-react/no-missing-key': 'error',
			'@eslint-react/no-missing-component-display-name': 'off',
			'@eslint-react/jsx-no-useless-fragment': 'off',
			'@eslint-react/no-array-index-key': 'off',
			'@eslint-react/no-clone-element': 'off',
			'@eslint-react/dom-no-dangerously-set-innerhtml': 'off',
			'prefer-const': 'warn',
			'no-control-regex': 'off',
			'@stylistic/padding-line-between-statements': [
				'error',
				{ blankLine: 'always', prev: '*', next: 'return' },
				{ blankLine: 'always', prev: 'directive', next: '*' },
				{ blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
				{ blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
				{ blankLine: 'always', prev: 'block-like', next: '*' },
				{ blankLine: 'always', prev: '*', next: 'block-like' },
				{ blankLine: 'always', prev: ['multiline-const'], next: '*' },
				{ blankLine: 'always', prev: '*', next: ['multiline-const'] },
				{ blankLine: 'always', prev: '*', next: ['if', 'for', 'switch', 'try', 'while'] },
				{ blankLine: 'always', prev: ['if', 'for', 'switch', 'try', 'while'], next: '*' },
				{ blankLine: 'always', prev: 'import', next: '*' },
				{ blankLine: 'any', prev: 'import', next: 'import' },
				{ blankLine: 'always', prev: '*', next: 'export' },
				{ blankLine: 'always', prev: '*', next: ['interface', 'type', 'return'] },
				{ blankLine: 'always', prev: ['interface', 'type'], next: '*' },
			],
			'@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
			'@stylistic/jsx-child-element-spacing': 'error',
			'@stylistic/jsx-pascal-case': ['error', { allowNamespace: true }],
			'@stylistic/jsx-self-closing-comp': 'error',
			'arrow-parens': ['error', 'always'],
			'no-self-compare': 'error',
			'no-case-declarations': 'error',
			curly: ['error', 'all'],
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
			'no-restricted-syntax': [
				'error',
				{
					selector: `JSXElement[openingElement.name.name='pre'] > JSXExpressionContainer > CallExpression[callee.object.name='JSON'][callee.property.name='stringify'][arguments.length>=3]`,
					message: `Don't leave JSON.stringify inside <pre> in production code.`,
				},
			],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'separate-type-imports',
				},
			],
			'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
			'import/no-duplicates': ['error', { 'prefer-inline': false }],
			'import/no-namespace': 'error',
		},
		settings: {
			'import/resolver': {
				typescript: {
					project: './tsconfig.json',
				},
			},
		},
	},
])

export default eslintConfig
