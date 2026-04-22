<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { PUBLIC_APP_URL } from '$env/static/public';

	const supabase = createSupabaseBrowserClient();

	let email = $state('');
	let loading = $state(false);
	let sent = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${PUBLIC_APP_URL}/auth/reset-password`
		});

		loading = false;
		if (err) { error = err.message; return; }
		sent = true;
	}
</script>

<svelte:head>
	<title>Forgot password — XYLO</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<a href="/" class="auth-logo">XYLO</a>

		{#if sent}
			<div class="success-state">
				<div class="success-icon">📬</div>
				<h1 class="auth-title">Check your email</h1>
				<p class="auth-sub">
					We've sent a password reset link to <strong>{email}</strong>.
					Check your inbox — and your spam folder just in case.
				</p>
				<a href="/auth/login" class="auth-back">← Back to sign in</a>
			</div>
		{:else}
			<h1 class="auth-title">Reset your password</h1>
			<p class="auth-sub">
				Enter your email and we'll send you a link to reset your password.
			</p>

			<form class="auth-form" onsubmit={handleSubmit}>
				<div class="field">
					<label for="email">Email address</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						required
						autocomplete="email"
					/>
				</div>

				{#if error}
					<div class="auth-error" role="alert">{error}</div>
				{/if}

				<button type="submit" class="auth-submit" disabled={loading}>
					{#if loading}
						<span class="spinner"></span> Sending link…
					{:else}
						Send reset link
					{/if}
				</button>
			</form>

			<p class="auth-switch">
				Remembered it? <a href="/auth/login">Back to sign in</a>
			</p>
		{/if}
	</div>
</div>

<style>
	.auth-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background-color: oklch(97.5% 0.018 85);
		background-image:
			radial-gradient(ellipse 80% 50% at 10% 0%, oklch(91% 0.040 80 / 0.55) 0%, transparent 60%),
			radial-gradient(ellipse 60% 40% at 90% 100%, oklch(91% 0.032 78 / 0.35) 0%, transparent 55%);
		font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
		color: oklch(18% 0.014 50);
	}
	.auth-card {
		width: 100%;
		max-width: 420px;
		background: oklch(100% 0 0 / 0.72);
		backdrop-filter: blur(24px) saturate(160%);
		border: 1px solid oklch(100% 0 0 / 0.88);
		border-radius: 1.25rem;
		padding: 2.5rem 2rem;
		box-shadow:
			inset 0 1px 0 oklch(100% 0 0 / 1),
			0 4px 8px oklch(18% 0.014 50 / 0.04),
			0 16px 40px oklch(18% 0.014 50 / 0.10);
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}
	.auth-logo {
		display: block;
		font-size: 1.375rem;
		font-weight: 800;
		color: oklch(72% 0.185 72);
		letter-spacing: -0.05em;
		margin-bottom: 1.75rem;
	}
	.auth-title { font-size: 1.5rem; font-weight: 700; color: oklch(18% 0.014 50); letter-spacing: -0.02em; margin-bottom: 0.375rem; font-family: 'Fraunces', Georgia, serif; }
	.auth-sub { font-size: 0.9375rem; color: oklch(62% 0.016 55); margin-bottom: 1.75rem; line-height: 1.6; }
	.success-state { text-align: center; }
	.success-icon { font-size: 3rem; margin-bottom: 1rem; }
	.success-state .auth-sub { margin-bottom: 1.5rem; }
	.auth-back { color: oklch(72% 0.185 72); font-weight: 700; font-size: 0.9375rem; }
	.auth-form { display: flex; flex-direction: column; gap: 1.125rem; }
	.field { display: flex; flex-direction: column; gap: 0.375rem; }
	.field label { font-size: 0.75rem; font-weight: 700; color: oklch(40% 0.020 50); text-transform: uppercase; letter-spacing: 0.07em; }
	.field input {
		width: 100%;
		padding: 0.6875rem 1rem;
		background: oklch(97.5% 0.018 85);
		color: oklch(18% 0.014 50);
		border: 1px solid oklch(87% 0.028 78);
		border-radius: 0.625rem;
		font-size: 0.9375rem;
		min-height: 44px;
		font-family: inherit;
		font-weight: 500;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.field input::placeholder { color: oklch(62% 0.016 55); }
	.field input:focus { outline: none; border-color: oklch(72% 0.185 72); box-shadow: 0 0 0 3px oklch(72% 0.185 72 / 0.12); }
	.auth-error { background: oklch(93% 0.06 25 / 0.5); border: 1px solid oklch(75% 0.12 25 / 0.4); border-radius: 0.625rem; padding: 0.75rem 1rem; font-size: 0.875rem; color: oklch(40% 0.14 25); font-weight: 600; }
	.auth-submit {
		width: 100%;
		min-height: 48px;
		background: oklch(18% 0.014 50);
		color: oklch(97.5% 0.018 85);
		font-weight: 700;
		font-size: 0.9375rem;
		border: none;
		border-radius: 0.75rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: background 0.15s;
		font-family: inherit;
	}
	.auth-submit:hover:not(:disabled) { background: oklch(25% 0.016 50); }
	.auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }
	.spinner { width: 16px; height: 16px; border: 2px solid oklch(97.5% 0.018 85 / 0.3); border-top-color: oklch(97.5% 0.018 85); border-radius: 50%; animation: spin 0.7s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.auth-switch { text-align: center; font-size: 0.875rem; color: oklch(62% 0.016 55); margin-top: 1.25rem; }
	.auth-switch a { color: oklch(18% 0.014 50); font-weight: 700; }
</style>
