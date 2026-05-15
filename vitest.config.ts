import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/lib/server/**/*.ts']
		}
	},
	resolve: {
		alias: {
			'$lib': resolve('./src/lib'),
			'$env/static/private': resolve('./src/lib/server/__tests__/__stubs__/env-private.ts'),
			'$env/static/public': resolve('./src/lib/server/__tests__/__stubs__/env-public.ts')
		}
	}
});
