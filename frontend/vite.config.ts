import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	base: '',
	build: {
		target: 'esnext',
		outDir: 'build'
	},
	server: {
			port: 5174,
			strictPort: false
	},
	resolve: {
		alias: {
			$lib: path.resolve("./src/lib")
		}
	}
});
