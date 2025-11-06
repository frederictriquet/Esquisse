import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'node'
	},
	resolve: {
		alias: {
			'$lib': resolve(__dirname, './src/lib'),
			'$app': resolve(__dirname, './src/app')
		}
	}
});
