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
	.auth-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 1.5rem; }
	.auth-card { width: 100%; max-width: 420px; background: #fff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 2.5rem 2rem; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
	.auth-logo { display: block; font-size: 1.375rem; font-weight: 800; color: #f59e0b; letter-spacing: -0.03em; margin-bottom: 1.75rem; }
	.auth-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 0.375rem; }
	.auth-sub { font-size: 0.9375rem; color: #64748b; margin-bottom: 1.75rem; line-height: 1.6; }
	.success-state { text-align: center; }
	.success-icon { font-size: 3rem; margin-bottom: 1rem; }
	.success-state .auth-sub { margin-bottom: 1.5rem; }
	.auth-back { color: #f59e0b; font-weight: 600; font-size: 0.9375rem; }
	.auth-form { display: flex; flex-direction: column; gap: 1.125rem; }
	.field { display: flex; flex-direction: column; gap: 0.375rem; }
	.field label { font-size: 0.875rem; font-weight: 600; color: #374151; }
	.field input { width: 100%; padding: 0.625rem 0.875rem; background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.9375rem; min-height: 44px; font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s; }
	.field input::placeholder { color: #94a3b8; }
	.field input:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.15); background: #fff; }
	.auth-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.875rem; color: #dc2626; }
	.auth-submit { width: 100%; min-height: 48px; background: #f59e0b; color: #000; font-weight: 700; font-size: 0.9375rem; border: none; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.15s; font-family: inherit; }
	.auth-submit:hover:not(:disabled) { background: #d97706; }
	.auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
	.spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.auth-switch { text-align: center; font-size: 0.875rem; color: #64748b; margin-top: 1.25rem; }
	.auth-switch a { color: #f59e0b; font-weight: 600; }
</style>
