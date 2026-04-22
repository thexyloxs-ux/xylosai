<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createSupabaseBrowserClient } from '$lib/supabase';

	const supabase = createSupabaseBrowserClient();

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	const joinCode = $derived($page.url.searchParams.get('join'));

	let googleLoading = $state(false);

	async function signInWithGoogle() {
		googleLoading = true;
		const redirectTo = `${window.location.origin}/auth/callback${joinCode ? `?next=/join/${joinCode}` : ''}`;
		const { error: err } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo }
		});
		if (err) {
			error = err.message;
			googleLoading = false;
		}
	}

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		const { error: err } = await supabase.auth.signInWithPassword({ email, password });

		if (err) {
			error = err.message;
			loading = false;
			return;
		}

		if (joinCode) {
			goto(`/join/${joinCode}`);
		} else {
			goto('/chat');
		}
	}
</script>

<svelte:head>
	<title>Sign in — XYLO</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-bg-grain"></div>

	<nav class="auth-nav">
		<a href="/" class="auth-wordmark">XYLO</a>
		<a href="/auth/signup" class="auth-nav-link">New here? Create account →</a>
	</nav>

	<main class="auth-main">
		<div class="auth-card">
			{#if joinCode}
				<div class="auth-badge">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
					Accepting school invite
				</div>
			{/if}

			<h1 class="auth-heading">Welcome back.</h1>
			<p class="auth-sub">Continue your learning journey with XYLO.</p>

			<button type="button" class="google-btn" onclick={signInWithGoogle} disabled={googleLoading}>
				{#if googleLoading}
					<span class="spinner-ink"></span>
					Redirecting…
				{:else}
					<svg width="19" height="19" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
						<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
						<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
						<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
					</svg>
					Continue with Google
				{/if}
			</button>

			<div class="divider">
				<span>or sign in with email</span>
			</div>

			<form class="auth-form" onsubmit={handleLogin}>
				<div class="field">
					<label for="email">Email address</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="name@email.com"
						required
						autocomplete="email"
					/>
				</div>

				<div class="field">
					<div class="field-label-row">
						<label for="password">Password</label>
						<a href="/auth/forgot-password" class="forgot-link">Forgot password?</a>
					</div>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						required
						autocomplete="current-password"
					/>
				</div>

				{#if error}
					<div class="auth-error" role="alert">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
						{error}
					</div>
				{/if}

				<button type="submit" class="submit-btn" disabled={loading}>
					{#if loading}
						<span class="spinner-white"></span>
						Signing in…
					{:else}
						Sign in to XYLO
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
					{/if}
				</button>
			</form>

			<p class="auth-switch">
				New to XYLO? <a href="/auth/signup{joinCode ? `?join=${joinCode}` : ''}">Create a free account</a>
			</p>
			<p class="auth-switch-school">
				School leader? <a href="/auth/signup?type=school">Register your school →</a>
			</p>
		</div>

		<aside class="auth-aside">
			<blockquote class="aside-quote">
				<p>"XYLO explained organic chemistry in a way my teacher never did. I actually get it now."</p>
				<footer>Amara T. — SS3, Lagos</footer>
			</blockquote>
			<div class="aside-stat-row">
				<div class="aside-stat">
					<span class="stat-n">20</span>
					<span class="stat-l">free messages<br>every single day</span>
				</div>
				<div class="aside-stat">
					<span class="stat-n">6+</span>
					<span class="stat-l">African curricula<br>fully supported</span>
				</div>
			</div>
		</aside>
	</main>
</div>

<style>
	/* ── Design tokens ── */
	:root {
		--cream:      oklch(97.5% 0.018 85);
		--cream-warm: oklch(94.5% 0.025 80);
		--border:     oklch(87%   0.028 78);
		--ink:        oklch(18%   0.014 50);
		--ink-2:      oklch(40%   0.020 50);
		--ink-3:      oklch(62%   0.016 55);
		--amber:      oklch(72%   0.185 72);
		--amber-deep: oklch(63%   0.175 68);
	}

	/* ── Page shell ── */
	.auth-page {
		min-height: 100dvh;
		background-color: var(--cream);
		background-image:
			radial-gradient(ellipse 80% 50% at 10% 0%, oklch(91% 0.040 80 / 0.55) 0%, transparent 60%),
			radial-gradient(ellipse 60% 40% at 90% 100%, oklch(91% 0.032 78 / 0.35) 0%, transparent 55%);
		color: var(--ink);
		font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	/* subtle paper grain overlay */
	.auth-bg-grain {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
		background-size: 200px 200px;
	}

	/* ── Top nav ── */
	.auth-nav {
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 2.5rem;
	}

	.auth-wordmark {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--amber);
		letter-spacing: -0.05em;
	}

	.auth-nav-link {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--ink-2);
		transition: color 0.15s;
	}
	.auth-nav-link:hover { color: var(--ink); }

	/* ── Main two-column layout ── */
	.auth-main {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
		max-width: 1100px;
		width: 100%;
		margin: 0 auto;
		padding: 3rem 2.5rem 4rem;
		position: relative;
		z-index: 1;
	}

	/* ── Auth card ── */
	.auth-card {
		background: oklch(100% 0 0 / 0.72);
		backdrop-filter: blur(24px) saturate(160%);
		border: 1px solid oklch(100% 0 0 / 0.88);
		border-radius: 1.25rem;
		padding: 3rem 2.5rem;
		box-shadow:
			inset 0 1px 0 oklch(100% 0 0 / 1),
			0 2px 4px oklch(18% 0.014 50 / 0.04),
			0 12px 40px oklch(18% 0.014 50 / 0.10);
		position: relative;
		isolation: isolate;
		overflow: hidden;
		animation: card-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	@keyframes card-in {
		from { opacity: 0; transform: translateY(16px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* ── Badge ── */
	.auth-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.875rem;
		background: oklch(95% 0.06 80 / 0.6);
		border: 1px solid oklch(82% 0.08 78);
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--amber-deep);
		margin-bottom: 1.5rem;
	}

	/* ── Headings ── */
	.auth-heading {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.03em;
		color: var(--ink);
		margin-bottom: 0.5rem;
	}

	.auth-sub {
		font-size: 0.9375rem;
		color: var(--ink-3);
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	/* ── Google button ── */
	.google-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.8125rem 1.25rem;
		background: oklch(100% 0 0 / 0.60);
		backdrop-filter: blur(12px) saturate(130%);
		border: 1px solid oklch(100% 0 0 / 0.80);
		border-radius: 0.75rem;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--ink);
		cursor: pointer;
		transition: background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, transform 0.1s;
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.9), 0 1px 4px oklch(18% 0.014 50 / 0.06);
	}
	.google-btn:hover {
		background: oklch(100% 0 0 / 0.82);
		border-color: oklch(72% 0.04 78 / 0.5);
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 1), 0 4px 16px oklch(18% 0.014 50 / 0.10);
		transform: translateY(-1px);
	}
	.google-btn:active { transform: translateY(0); }
	.google-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

	/* ── Divider ── */
	.divider {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 1.25rem 0;
	}
	.divider::before, .divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}
	.divider span {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--ink-3);
		white-space: nowrap;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	/* ── Form ── */
	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.field label {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--ink-2);
		text-transform: uppercase;
		letter-spacing: 0.07em;
	}

	.field input {
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--cream);
		border: 1px solid var(--border);
		border-radius: 0.625rem;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--ink);
		transition: border-color 0.15s, box-shadow 0.15s;
		min-height: 44px;
	}
	.field input::placeholder { color: var(--ink-3); }
	.field input:focus {
		outline: none;
		border-color: var(--amber);
		box-shadow: 0 0 0 3px oklch(72% 0.185 72 / 0.12);
	}

	.forgot-link {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--ink-3);
		transition: color 0.15s;
	}
	.forgot-link:hover { color: var(--amber-deep); }

	/* ── Error ── */
	.auth-error {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem 1rem;
		background: oklch(93% 0.06 25 / 0.5);
		border: 1px solid oklch(75% 0.12 25 / 0.4);
		border-radius: 0.625rem;
		color: oklch(40% 0.14 25);
		font-size: 0.875rem;
		font-weight: 600;
	}

	/* ── Submit button ── */
	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 50px;
		padding: 0.75rem 1.5rem;
		background: var(--ink);
		color: var(--cream);
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 700;
		border: none;
		border-radius: 0.75rem;
		cursor: pointer;
		transition: background 0.15s, transform 0.1s;
		margin-top: 0.5rem;
	}
	.submit-btn:hover { background: oklch(25% 0.016 50); }
	.submit-btn:active { transform: scale(0.99); }
	.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

	/* ── Footer links ── */
	.auth-switch {
		margin-top: 1.75rem;
		font-size: 0.875rem;
		color: var(--ink-3);
		font-weight: 500;
	}
	.auth-switch a {
		color: var(--ink);
		font-weight: 700;
		margin-left: 0.25rem;
		transition: color 0.15s;
	}
	.auth-switch a:hover { color: var(--amber-deep); }

	.auth-switch-school {
		margin-top: 0.625rem;
		font-size: 0.8125rem;
		color: var(--ink-3);
	}
	.auth-switch-school a {
		color: var(--ink-3);
		font-weight: 600;
		margin-left: 0.25rem;
		transition: color 0.15s;
	}
	.auth-switch-school a:hover { color: var(--ink); }

	/* ── Aside ── */
	.auth-aside {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		padding: 2rem;
	}

	.aside-quote {
		border-left: 3px solid var(--amber);
		padding-left: 1.5rem;
	}
	.aside-quote p {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-style: italic;
		font-size: clamp(1.125rem, 2vw, 1.375rem);
		font-weight: 400;
		line-height: 1.55;
		color: var(--ink);
		margin-bottom: 1rem;
	}
	.aside-quote footer {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--ink-3);
		text-transform: uppercase;
		letter-spacing: 0.07em;
	}

	.aside-stat-row {
		display: flex;
		gap: 2rem;
	}
	.aside-stat {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.stat-n {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--ink);
		line-height: 1;
	}
	.stat-l {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--ink-3);
		line-height: 1.45;
	}

	/* ── Spinners ── */
	.spinner-ink {
		width: 16px; height: 16px;
		border: 2px solid oklch(18% 0.014 50 / 0.15);
		border-top-color: var(--ink);
		border-radius: 50%;
		animation: spin 0.75s linear infinite;
		display: inline-block;
		flex-shrink: 0;
	}
	.spinner-white {
		width: 16px; height: 16px;
		border: 2px solid oklch(97.5% 0.018 85 / 0.3);
		border-top-color: var(--cream);
		border-radius: 50%;
		animation: spin 0.75s linear infinite;
		display: inline-block;
		flex-shrink: 0;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.auth-main {
			grid-template-columns: 1fr;
			max-width: 520px;
			padding: 2rem 1.5rem 4rem;
			gap: 2rem;
		}
		.auth-aside { padding: 0; }
	}

	@media (max-width: 560px) {
		.auth-nav { padding: 1.25rem 1.25rem; }
		.auth-nav-link { display: none; }
		.auth-card { padding: 2rem 1.5rem; }
		.auth-aside { display: none; }
	}
</style>
