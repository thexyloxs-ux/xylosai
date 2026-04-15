<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import '../../landing.css';

	const supabase = createSupabaseBrowserClient();

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

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

<div class="aw-page auth-wrapper">
	<div class="glow-aura"></div>
	
	<div class="auth-card glass-deck">
		<header class="auth-header">
			<a href="/" class="aw-logo">XYLO</a>
			{#if joinCode}
				<div class="auth-banner glass-amber">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
					Accept School Invite
				</div>
			{/if}
			<h1 class="auth-title">Welcome back</h1>
			<p class="auth-sub">Continue your learning journey with XYLO</p>
		</header>

		<form class="auth-form" onsubmit={handleLogin}>
			<div class="field">
				<label for="email">Email Address</label>
				<div class="field-island">
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="name@email.com"
						required
						autocomplete="email"
					/>
				</div>
			</div>

			<div class="field">
				<div class="field-label-row">
					<label for="password">Password</label>
					<a href="/auth/forgot-password" class="forgot-link">Forgot?</a>
				</div>
				<div class="field-island">
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						required
						autocomplete="current-password"
					/>
				</div>
			</div>

			{#if error}
				<div class="auth-error-chip glass-red" role="alert">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
					{error}
				</div>
			{/if}

			<button type="submit" class="aw-btn aw-btn-primary auth-submit" disabled={loading}>
				{#if loading}
					<span class="spinner"></span> Signing in…
				{:else}
					Sign in to Xylo
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				{/if}
			</button>
		</form>

		<footer class="auth-footer">
			<p class="auth-switch">
				New to XYLO?
				<a href="/auth/signup{joinCode ? `?join=${joinCode}` : ''}">Create an account</a>
			</p>
			<p class="auth-switch-alt">
				School leader?
				<a href="/auth/signup?type=school">Register your school →</a>
			</p>
		</footer>
	</div>
</div>

<style>
	.auth-wrapper {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.5rem;
		position: relative;
		overflow: hidden;
	}

	.glow-aura {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%);
		pointer-events: none;
		z-index: 0;
	}

	.auth-card.glass-deck {
		width: 100%;
		max-width: 440px;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(48px);
		-webkit-backdrop-filter: blur(48px);
		border-radius: 2.5rem;
		padding: 3.5rem 2.5rem;
		box-shadow: 
			0 24px 80px rgba(0, 0, 0, 0.08), 
			0 2px 4px rgba(0, 0, 0, 0.02),
			inset 0 1px 0 rgba(255, 255, 255, 1);
		position: relative;
		z-index: 1;
		animation: auth-reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	@keyframes auth-reveal {
		from { opacity: 0; transform: translateY(20px) scale(0.98); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}
	/* Hairline boundary */
	.auth-card.glass-deck::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: 2.5rem;
		border: 1px solid rgba(0, 0, 0, 0.06);
		pointer-events: none;
	}

	.auth-header { text-align: center; margin-bottom: 2.5rem; }
	.aw-logo { margin-bottom: 2rem; display: inline-block; font-size: 1.5rem; }
	
	.auth-title { 
		font-size: 1.75rem; 
		font-weight: 900; 
		color: #0f172a; 
		letter-spacing: -0.04em; 
		margin-bottom: 0.5rem; 
	}
	.auth-sub { 
		font-size: 0.9375rem; 
		color: #64748b; 
		line-height: 1.6; 
		font-weight: 500;
	}

	.auth-banner.glass-amber {
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: 999px;
		padding: 0.5rem 1rem;
		font-size: 0.8125rem;
		font-weight: 700;
		color: #b45309;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.auth-form { display: flex; flex-direction: column; gap: 1.5rem; }
	.field { display: flex; flex-direction: column; gap: 0.625rem; }
	.field label { 
		font-size: 0.75rem; 
		font-weight: 800; 
		color: #94a3b8; 
		text-transform: uppercase; 
		letter-spacing: 0.1em; 
	}
	.field-label-row { display: flex; justify-content: space-between; align-items: center; }
	.forgot-link { font-size: 0.8125rem; color: #f59e0b; font-weight: 700; }

	.field-island {
		background: #fff;
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 1rem;
		padding: 0.125rem;
		transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
		box-shadow: 0 2px 4px rgba(0,0,0,0.02);
	}
	.field-island:focus-within {
		border-color: #f59e0b;
		box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12), 0 4px 12px rgba(245,158,11,0.05);
		transform: translateY(-1px);
	}
	
	.field-island input {
		width: 100%;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		outline: none;
		font-size: 1rem;
		font-weight: 600;
		color: #1e293b;
		font-family: inherit;
	}

	.auth-error-chip {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.25rem;
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.15);
		border-radius: 1.25rem;
		color: #dc2626;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.auth-submit { 
		width: 100%; 
		min-height: 54px; 
		margin-top: 0.5rem;
		font-size: 1rem;
	}

	.auth-footer { margin-top: 2.5rem; text-align: center; }
	.auth-switch { font-size: 0.9375rem; color: #64748b; font-weight: 500; margin-bottom: 0.75rem; }
	.auth-switch a { color: #f59e0b; font-weight: 800; margin-left: 0.25rem; }
	
	.auth-switch-alt { font-size: 0.875rem; color: #94a3b8; font-weight: 600; }
	.auth-switch-alt a { color: #64748b; margin-left: 0.25rem; transition: color 0.2s; }
	.auth-switch-alt a:hover { color: #f59e0b; }

	.spinner {
		width: 18px; height: 18px;
		border: 2.5px solid rgba(255,255,255,0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	@media (max-width: 480px) {
		.auth-card.glass-deck { padding: 2.5rem 1.5rem; border-radius: 1.5rem; }
	}
</style>
