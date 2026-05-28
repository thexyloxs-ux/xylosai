import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 30_000,
	expect: { timeout: 10_000 },
	use: {
		baseURL,
		trace: 'on-first-retry'
	},
	webServer: process.env.E2E_BASE_URL
		? undefined
		: {
				command: 'npm run dev -- --host 127.0.0.1 --port 4173',
				url: baseURL,
				reuseExistingServer: true,
				env: {
					GROQ_API_KEY: 'check',
					PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
					PUBLIC_SUPABASE_ANON_KEY: 'check',
					SUPABASE_SERVICE_ROLE_KEY: 'check',
					PAYSTACK_SECRET_KEY: 'check',
					PAYSTACK_PLUS_PLAN_CODE: 'PLN_plus',
					PAYSTACK_PRO_PLAN_CODE: 'PLN_pro',
					PAYSTACK_ORG_PLAN_CODE: 'PLN_org',
					RESEND_API_KEY: 'check',
					PUBLIC_APP_URL: 'http://127.0.0.1:4173'
				}
			},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
