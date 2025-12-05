import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		strictPort: true,
		host: 'localhost'
	},
	define: {
		'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(process.env.VITE_BUILD_TIMESTAMP || new Date().toISOString())
	}
});
