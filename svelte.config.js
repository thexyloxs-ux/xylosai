import autoAdapter from '@sveltejs/adapter-auto';
import vercelAdapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const adapter = process.env.VERCEL
	? vercelAdapter({
			runtime: 'nodejs20.x'
		})
	: autoAdapter();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter,
		alias: {
			$lib: './src/lib'
		}
	}
};

export default config;
