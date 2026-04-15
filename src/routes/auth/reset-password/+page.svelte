<script lang="ts">
	import { goto } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/supabase';

	const supabase = createSupabaseBrowserClient();

	let password = $state('');
	let confirm = $state('');
	let loading = $state(false);
	let error = $state('');
	let done = $state(false);

	async function handleReset(e: Event) {
		e.preventDefault();
		error = '';

		if (password !== confirm) {
			error = 'Passwords do not match.';
			return;
		}
		if (password.length < 8) {
			error = 'Password must be at least 8 characters.';
			return;
		}

		loading = true;
		const { error: err } = await supabase.auth.updateUser({ password });
		loading = false;

		if (err) { error = err.message; return; }
		done = true;
		setTimeout(() => goto('/chat'), 2000);
	}
</script>

<svelte:head>
	<title>Set new password — XYLO</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<a href="/" class="auth-logo">XYLO</a>

		{#if done}
			<div class="success-state">
				<div class="success-icon">✅</div>
				<h1 class="auth-title">Password updated!</h1>
				<p class="auth-sub">Taking you to the app now…</p>
			</div>
		{:else}
			<h1 class="auth-title">Set a new password</h1>
			<p class="auth-sub">Choose something strong and memorable.</p>

			<form class="auth-form" onsubmit={handleReset}>
				<div class="field">
					<label for="password">New password</label>
					<input id="password" type="password" bind:value={password} placeholder="At least 8 characters" required minlength="8" autocomplete="new-password" />
				</div>
				<div class="field">
					<label for="confirm">Confirm password</label>
					<input id="confirm" type="password" bind:value={confirm} placeholder="Same again" required autocomplete="new-password" />
				</div>

				{#if error}
					<div class="auth-error" role="alert">{error}</div>
				{/if}

				<button type="submit" class="auth-submit" disabled={loading}>
					{#if loading}<span class="spinner"></span> Updating…{:else}Update password{/if}
				</button>
			</form>
		{/if}
	</div>
</div>

<style>
	.auth-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 1.5rem; }
	.auth-card { width: 100%; max-width: 420px; background: #fff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 2.5rem 2rem; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
	.auth-logo { display: block; font-size: 1.375rem; font-weight: 800; color: #f59e0b; letter-spacing: -0.03em; margin-bottom: 1.75rem; }
	.auth-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 0.375rem; }
	.auth-sub { font-size: 0.9375rem; color: #64748b; margin-bottom: 1.75rem; }
	.success-state { text-align: center; }
	.success-icon { font-size: 3rem; margin-bottom: 1rem; }
	.auth-form { display: flex; flex-direction: column; gap: 1.125rem; }
	.field { display: flex; flex-direction: column; gap: 0.375rem; }
	.field label { font-size: 0.875rem; font-weight: 600; color: #374151; }
	.field input { width: 100%; padding: 0.625rem 0.875rem; background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.9375rem; min-height: 44px; font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s; }
	.field input:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.15); background: #fff; }
	.field input::placeholder { color: #94a3b8; }
	.auth-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.875rem; color: #dc2626; }
	.auth-submit { width: 100%; min-height: 48px; background: #f59e0b; color: #000; font-weight: 700; font-size: 0.9375rem; border: none; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.15s; font-family: inherit; }
	.auth-submit:hover:not(:disabled) { background: #d97706; }
	.auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
	.spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
</style>
