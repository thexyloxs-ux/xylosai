<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createSupabaseBrowserClient } from '$lib/supabase';

	const supabase = createSupabaseBrowserClient();

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	// Banner for invite join flow
	const joinCode = $derived($page.url.searchParams.get('join'));

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

		// Redirect based on join code or role
		if (joinCode) {
			goto(`/join/${joinCode}`);
		} else {
			// Layout will redirect based on role after session loads
			goto('/chat');
		}
	}
</script>

<svelte:head>
	<title>Sign in — XYLO</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<a href="/" class="auth-logo">XYLO</a>

		{#if joinCode}
			<div class="auth-banner">
				You've been invited to join a school on XYLO. Sign in to accept.
			</div>
		{/if}

		<h1 class="auth-title">Welcome back</h1>
		<p class="auth-sub">Sign in to continue your studies</p>

		<form class="auth-form" onsubmit={handleLogin}>
			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="you@example.com"
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
				<div class="auth-error" role="alert">{error}</div>
			{/if}

			<button type="submit" class="auth-submit" disabled={loading}>
				{#if loading}
					<span class="spinner"></span> Signing in…
				{:else}
					Sign in
				{/if}
			</button>
		</form>

		<p class="auth-switch">
			Don't have an account?
			<a href="/auth/signup{joinCode ? `?join=${joinCode}` : ''}">Sign up free</a>
		</p>
		<p class="auth-switch" style="margin-top:0.375rem">
			Registering a school?
			<a href="/auth/signup?type=school">School sign up →</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8fafc;
		padding: 1.5rem;
	}
	.auth-card {
		width: 100%;
		max-width: 420px;
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 1rem;
		padding: 2.5rem 2rem;
		box-shadow: 0 4px 24px rgba(0,0,0,0.06);
	}
	.auth-logo {
		display: block;
		font-size: 1.375rem;
		font-weight: 800;
		color: #f59e0b;
		letter-spacing: -0.03em;
		margin-bottom: 1.75rem;
	}
	.auth-banner {
		background: #fef3c7;
		border: 1px solid #fde68a;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #92400e;
		margin-bottom: 1.25rem;
		line-height: 1.5;
	}
	.auth-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #0f172a;
		letter-spacing: -0.02em;
		margin-bottom: 0.375rem;
	}
	.auth-sub {
		font-size: 0.9375rem;
		color: #64748b;
		margin-bottom: 1.75rem;
	}
	.auth-form { display: flex; flex-direction: column; gap: 1.125rem; }
	.field { display: flex; flex-direction: column; gap: 0.375rem; }
	.field label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}
	.field-label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.forgot-link {
		font-size: 0.8125rem;
		color: #f59e0b;
		font-weight: 500;
		transition: color 0.15s;
	}
	.forgot-link:hover { color: #d97706; }
	.field input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		background: #f8fafc;
		color: #0f172a;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		min-height: 44px;
		transition: border-color 0.15s, box-shadow 0.15s;
		font-family: inherit;
	}
	.field input::placeholder { color: #94a3b8; }
	.field input:focus {
		outline: none;
		border-color: #f59e0b;
		box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
		background: #fff;
	}
	.auth-error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #dc2626;
	}
	.auth-submit {
		width: 100%;
		min-height: 48px;
		background: #f59e0b;
		color: #000;
		font-weight: 700;
		font-size: 0.9375rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: background 0.15s, transform 0.1s;
		margin-top: 0.25rem;
		font-family: inherit;
	}
	.auth-submit:hover:not(:disabled) { background: #d97706; }
	.auth-submit:active:not(:disabled) { transform: scale(0.98); }
	.auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
	.spinner {
		width: 16px; height: 16px;
		border: 2px solid rgba(0,0,0,0.2);
		border-top-color: #000;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		flex-shrink: 0;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
	.auth-switch {
		text-align: center;
		font-size: 0.875rem;
		color: #64748b;
		margin-top: 1.25rem;
	}
	.auth-switch a { color: #f59e0b; font-weight: 600; }
	.auth-switch a:hover { color: #d97706; }
</style>
