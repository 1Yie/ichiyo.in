import nextConfig from 'eslint-config-next';

export default [
	...nextConfig,
	{
		files: ['lib/generated/**', 'prisma/generated/**'],
		linterOptions: {
			reportUnusedDisableDirectives: false,
		},
		rules: {
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-this-alias': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-wrapper-object-types': 'off',
			'@typescript-eslint/no-unnecessary-type-constraint': 'off',
		},
	},
	{
		ignores: ['.next/**', 'node_modules/**', 'public/**', 'components/ui/**'],
	},
];
