<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createSupabaseBrowserClient } from '$lib/supabase';

	const supabase = createSupabaseBrowserClient();

	const isSchool = $derived($page.url.searchParams.get('type') === 'school');
	const joinCode = $derived($page.url.searchParams.get('join'));

	let fullName = $state('');
	let email = $state('');
	let password = $state('');
	let schoolName = $state('');
	let country = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state('');

	async function handleSignup(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		const metadata: Record<string, string> = {
			full_name: fullName,
			role: isSchool ? 'school_admin' : 'individual'
		};
		if (isSchool) {
			metadata.school_name = schoolName;
			metadata.country = country;
		}
		if (joinCode) {
			metadata.role = 'student';
			metadata.join_code = joinCode;
		}

		const { data, error: err } = await supabase.auth.signUp({
			email,
			password,
			options: { data: metadata }
		});

		if (err) {
			error = err.message;
			loading = false;
			return;
		}

		if (data.user) {
			// Send welcome email via API
			await fetch('/api/auth/welcome', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: fullName, email })
			}).catch(() => {}); // Non-blocking

			if (joinCode) goto(`/join/${joinCode}`);
			else goto('/onboarding');
		}
	}
</script>

<svelte:head>
	<title>{isSchool ? 'Register your school' : 'Create account'} — XYLO</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<a href="/" class="auth-logo">XYLO</a>

		{#if joinCode}
			<div class="auth-banner">
				You've been invited to join a school on XYLO. Create your account to join.
			</div>
		{/if}

		<h1 class="auth-title">
			{#if isSchool}Register your school{:else}Create your account{/if}
		</h1>
		<p class="auth-sub">
			{#if isSchool}
				Get full AI access for all your students — free for 14 days.
			{:else}
				Start free. 20 messages/day. No credit card needed.
			{/if}
		</p>

		<!-- Type toggle (only shown if not joining via invite) -->
		{#if !joinCode}
			<div class="type-toggle">
				<a
					href="/auth/signup"
					class="toggle-btn"
					class:active={!isSchool}
				>Student</a>
				<a
					href="/auth/signup?type=school"
					class="toggle-btn"
					class:active={isSchool}
				>School</a>
			</div>
		{/if}

		<form class="auth-form" onsubmit={handleSignup}>
			<div class="field">
				<label for="fullName">{isSchool ? 'Your name (admin)' : 'Full name'}</label>
				<input
					id="fullName"
					type="text"
					bind:value={fullName}
					placeholder="Amara Okafor"
					required
					autocomplete="name"
				/>
			</div>

			{#if isSchool}
				<div class="field">
					<label for="schoolName">School name</label>
					<input
						id="schoolName"
						type="text"
						bind:value={schoolName}
						placeholder="St. Mary's College, Lagos"
						required
					/>
				</div>
				<div class="field">
					<label for="country">Country</label>
					<select id="country" bind:value={country} required>
						<option value="">Select country</option>
						{#each ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Tanzania', 'Uganda', 'Rwanda', 'Senegal', 'Ivory Coast', 'Cameroon', 'Ethiopia', 'Other'] as c}
							<option value={c}>{c}</option>
						{/each}
					</select>
				</div>
			{/if}

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

			<div class="field">
				<label for="password">Password</label>
				<div class="password-wrap">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						placeholder="At least 8 characters"
						required
						minlength="8"
						autocomplete="new-password"
					/>
					<button
						type="button"
						class="pw-toggle"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
						{/if}
					</button>
				</div>
			</div>

			{#if error}
				<div class="auth-error" role="alert">{error}</div>
			{/if}

			<p class="auth-terms">
				By signing up you agree to our
				<a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
			</p>

			<button type="submit" class="auth-submit" disabled={loading}>
				{#if loading}
					<span class="spinner"></span>
					{isSchool ? 'Creating school account…' : 'Creating account…'}
				{:else}
					{isSchool ? 'Register school — start free trial' : 'Create free account'}
				{/if}
			</button>
		</form>

		<p class="auth-switch">
			Already have an account? <a href="/auth/login">Sign in</a>
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
		max-width: 460px;
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
	.auth-sub { font-size: 0.9375rem; color: #64748b; margin-bottom: 1.5rem; }

	.type-toggle {
		display: flex;
		background: #f1f5f9;
		border-radius: 0.5rem;
		padding: 0.25rem;
		margin-bottom: 1.5rem;
	}
	.toggle-btn {
		flex: 1;
		text-align: center;
		padding: 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #64748b;
		transition: all 0.15s;
	}
	.toggle-btn.active {
		background: #fff;
		color: #0f172a;
		box-shadow: 0 1px 4px rgba(0,0,0,0.08);
	}

	.auth-form { display: flex; flex-direction: column; gap: 1.125rem; }
	.field { display: flex; flex-direction: column; gap: 0.375rem; }
	.field label { font-size: 0.875rem; font-weight: 600; color: #374151; }
	.field input, .field select {
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
	.field input:focus, .field select:focus {
		outline: none;
		border-color: #f59e0b;
		box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
		background: #fff;
	}
	.password-wrap { position: relative; }
	.password-wrap input { padding-right: 2.75rem; }
	.pw-toggle {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		color: #94a3b8;
		padding: 0.25rem;
		display: flex;
		align-items: center;
	}
	.pw-toggle:hover { color: #64748b; }

	.auth-terms {
		font-size: 0.8125rem;
		color: #94a3b8;
		line-height: 1.5;
		margin-top: -0.25rem;
	}
	.auth-terms a { color: #f59e0b; }
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
