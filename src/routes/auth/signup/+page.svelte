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
			await fetch('/api/auth/welcome', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: fullName, email })
			}).catch(() => {});

			if (joinCode) goto(`/join/${joinCode}`);
			else goto('/onboarding');
		}
	}
</script>

<svelte:head>
	<title>{isSchool ? 'Register your school' : 'Create account'} — XYLO</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-bg-grain"></div>

	<nav class="auth-nav">
		<a href="/" class="auth-wordmark">XYLO</a>
		<a href="/auth/login" class="auth-nav-link">Already have an account? Sign in →</a>
	</nav>

	<main class="auth-main">
		<div class="auth-card" class:is-school={isSchool}>
			{#if joinCode}
				<div class="auth-badge">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
					Joining via school invite
				</div>
			{/if}

			<h1 class="auth-heading">
				{#if isSchool}Register your school.{:else}Start learning free.{/if}
			</h1>
			<p class="auth-sub">
				{#if isSchool}
					14-day free trial. No credit card needed. Full access for all your students.
				{:else}
					20 messages a day, forever. No credit card. No nonsense.
				{/if}
			</p>

			{#if !joinCode}
				<div class="type-toggle">
					<a href="/auth/signup" class="toggle-btn" class:active={!isSchool}>
						Student
					</a>
					<a href="/auth/signup?type=school" class="toggle-btn" class:active={isSchool}>
						School
					</a>
				</div>
			{/if}

			{#if !isSchool}
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
				<div class="divider"><span>or sign up with email</span></div>
			{/if}

			<form class="auth-form" onsubmit={handleSignup}>
				<div class="field">
					<label for="fullName">{isSchool ? 'Admin name' : 'Full name'}</label>
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
							placeholder="St. Mary's College"
							required
						/>
					</div>
					<div class="field">
						<label for="country">Country</label>
						<div class="select-wrap">
							<select id="country" bind:value={country} required>
								<option value="">Select country</option>
								{#each ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Tanzania', 'Uganda', 'Rwanda', 'Senegal', 'Ivory Coast', 'Cameroon', 'Ethiopia', 'Other'] as c}
									<option value={c}>{c}</option>
								{/each}
							</select>
						</div>
					</div>
				{/if}

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
					<label for="password">Password</label>
					<div class="pw-wrap">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="Minimum 8 characters"
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
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
							{:else}
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
							{/if}
						</button>
					</div>
				</div>

				{#if error}
					<div class="auth-error" role="alert">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
						{error}
					</div>
				{/if}

				<p class="auth-terms">
					By signing up you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
				</p>

				<button type="submit" class="submit-btn" disabled={loading}>
					{#if loading}
						<span class="spinner-white"></span>
						Creating account…
					{:else}
						{isSchool ? 'Register School — Start Trial' : 'Create Free Account'}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
					{/if}
				</button>
			</form>

			<p class="auth-switch">
				Already have an account? <a href="/auth/login">Sign in here</a>
			</p>
		</div>

		{#if !isSchool}
			<aside class="auth-aside">
				<div class="aside-headline">
					<span class="aside-label">Trusted by students across Africa</span>
					<p class="aside-tagline">The senior student who's available at midnight before your WAEC exam.</p>
				</div>

				<div class="aside-features">
					{#each [
						{ num: '01', text: 'WAEC, JAMB, KCSE, BECE, Cambridge — all supported.' },
						{ num: '02', text: 'Personalized study plans built around your exam date.' },
						{ num: '03', text: 'Streaks that build real daily habits over time.' },
						{ num: '04', text: '20 free messages every day. No trial. No tricks.' },
					] as feat}
						<div class="aside-feat">
							<span class="feat-num">{feat.num}</span>
							<span class="feat-text">{feat.text}</span>
						</div>
					{/each}
				</div>
			</aside>
		{:else}
			<aside class="auth-aside">
				<div class="aside-headline">
					<span class="aside-label">For school leaders</span>
					<p class="aside-tagline">One dashboard. Every student's engagement, at a glance.</p>
				</div>
				<div class="aside-features">
					{#each [
						{ num: '01', text: 'One subscription covers all your students.' },
						{ num: '02', text: 'See who\'s engaged and who\'s struggling — before it\'s a crisis.' },
						{ num: '03', text: 'Student conversations remain fully private.' },
						{ num: '04', text: '14-day free trial. No credit card required.' },
					] as feat}
						<div class="aside-feat">
							<span class="feat-num">{feat.num}</span>
							<span class="feat-text">{feat.text}</span>
						</div>
					{/each}
				</div>
			</aside>
		{/if}
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

	/* ── Main layout ── */
	.auth-main {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: start;
		max-width: 1100px;
		width: 100%;
		margin: 0 auto;
		padding: 2rem 2.5rem 4rem;
		position: relative;
		z-index: 1;
	}

	/* ── Auth card ── */
	.auth-card {
		background: oklch(100% 0 0 / 0.72);
		backdrop-filter: blur(24px) saturate(160%);
		border: 1px solid oklch(100% 0 0 / 0.88);
		border-radius: 1.25rem;
		padding: 2.5rem;
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
		margin-bottom: 1.25rem;
	}

	/* ── Heading ── */
	.auth-heading {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: clamp(1.75rem, 3.5vw, 2.5rem);
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
		margin-bottom: 1.75rem;
	}

	/* ── Type toggle ── */
	.type-toggle {
		display: flex;
		background: oklch(91% 0.022 80 / 0.6);
		backdrop-filter: blur(8px);
		border-radius: 0.625rem;
		padding: 0.25rem;
		margin-bottom: 1.75rem;
		gap: 0.25rem;
	}
	.toggle-btn {
		flex: 1;
		text-align: center;
		padding: 0.5rem 1rem;
		border-radius: 0.4375rem;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--ink-3);
		transition: background 0.15s, color 0.15s, box-shadow 0.15s;
	}
	.toggle-btn.active {
		background: oklch(100% 0 0 / 0.82);
		color: var(--ink);
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 1), 0 1px 3px oklch(18% 0.014 50 / 0.08);
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
		margin-bottom: 0.25rem;
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
		margin: 1rem 0 1.25rem;
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
		gap: 1.125rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4375rem;
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
		padding: 0.6875rem 1rem;
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

	/* ── Password wrapper ── */
	.pw-wrap {
		display: flex;
		align-items: center;
		background: var(--cream);
		border: 1px solid var(--border);
		border-radius: 0.625rem;
		overflow: hidden;
		transition: border-color 0.15s, box-shadow 0.15s;
		min-height: 44px;
	}
	.pw-wrap:focus-within {
		border-color: var(--amber);
		box-shadow: 0 0 0 3px oklch(72% 0.185 72 / 0.12);
	}
	.pw-wrap input {
		flex: 1;
		padding: 0.6875rem 1rem;
		background: transparent;
		border: none;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--ink);
		min-height: unset;
	}
	.pw-wrap input:focus { outline: none; box-shadow: none; border: none; }

	.pw-toggle {
		background: none;
		border: none;
		padding: 0 0.875rem;
		color: var(--ink-3);
		cursor: pointer;
		display: flex;
		align-items: center;
		transition: color 0.15s;
	}
	.pw-toggle:hover { color: var(--ink); }

	/* ── Select ── */
	.select-wrap {
		position: relative;
	}
	.select-wrap::after {
		content: '';
		position: absolute;
		right: 0.875rem;
		top: 50%;
		transform: translateY(-50%);
		width: 0;
		height: 0;
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		border-top: 5px solid var(--ink-3);
		pointer-events: none;
	}
	.select-wrap select {
		width: 100%;
		padding: 0.6875rem 2.5rem 0.6875rem 1rem;
		background: var(--cream);
		border: 1px solid var(--border);
		border-radius: 0.625rem;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--ink);
		appearance: none;
		cursor: pointer;
		min-height: 44px;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.select-wrap select:focus {
		outline: none;
		border-color: var(--amber);
		box-shadow: 0 0 0 3px oklch(72% 0.185 72 / 0.12);
	}

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

	/* ── Terms ── */
	.auth-terms {
		font-size: 0.8125rem;
		color: var(--ink-3);
		line-height: 1.6;
	}
	.auth-terms a { color: var(--ink-2); font-weight: 600; transition: color 0.15s; }
	.auth-terms a:hover { color: var(--amber-deep); }

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
		margin-top: 0.25rem;
	}
	.submit-btn:hover { background: oklch(25% 0.016 50); }
	.submit-btn:active { transform: scale(0.99); }
	.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

	/* ── Footer links ── */
	.auth-switch {
		margin-top: 1.5rem;
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

	/* ── Aside ── */
	.auth-aside {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		padding: 2.5rem 1.5rem;
		position: sticky;
		top: 2rem;
	}

	.aside-label {
		display: block;
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--ink-3);
		margin-bottom: 0.875rem;
	}

	.aside-tagline {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: clamp(1.25rem, 2.5vw, 1.625rem);
		font-weight: 500;
		line-height: 1.4;
		color: var(--ink);
		font-style: italic;
	}

	.aside-features {
		display: flex;
		flex-direction: column;
		gap: 0;
		border-top: 1px solid var(--border);
	}

	.aside-feat {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--border);
	}

	.feat-num {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--amber);
		flex-shrink: 0;
		min-width: 1.5rem;
	}

	.feat-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--ink-2);
		line-height: 1.5;
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
			max-width: 560px;
			padding: 2rem 1.5rem 4rem;
			gap: 2rem;
		}
		.auth-aside {
			position: static;
			padding: 0;
		}
	}

	@media (max-width: 560px) {
		.auth-nav { padding: 1.25rem; }
		.auth-nav-link { display: none; }
		.auth-card { padding: 1.75rem 1.25rem; }
		.auth-aside { display: none; }
	}
</style>
