import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('@supabase/supabase-js')) return 'supabase';
					if (id.includes('groq-sdk')) return 'groq';
					if (id.includes('stripe')) return 'stripe';
				}
			}
		}
	},
	optimizeDeps: {
		include: ['@supabase/supabase-js', 'groq-sdk']
	}
});
