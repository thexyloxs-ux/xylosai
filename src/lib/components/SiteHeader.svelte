<script lang="ts">
	import { isLoggedIn } from '$lib/stores/auth';

	/** Highlight the matching nav link. Pass 'pricing', 'home', etc. */
	const { activePage = '' } = $props<{ activePage?: string }>();

	let mobileOpen = $state(false);

	function close() { mobileOpen = false; }
</script>

<header class="site-header">
	<div class="site-header-inner">
		<a href="/" class="site-logo">XYLO</a>

		<nav class="site-nav" aria-label="Main navigation">
			<a href="/#features"    class:active={activePage === 'features'}>Features</a>
			<a href="/#schools"     class:active={activePage === 'schools'}>Schools</a>
			<a href="/pricing"      class:active={activePage === 'pricing'}>Pricing</a>
			<a href="/#faq"         class:active={activePage === 'faq'}>FAQ</a>
		</nav>

		<div class="site-header-ctas">
			{#if $isLoggedIn}
				<a href="/chat" class="sh-btn-primary">Open XYLO</a>
			{:else}
				<a href="/auth/login"  class="sh-btn-ghost">Sign in</a>
				<a href="/auth/signup" class="sh-btn-primary">Get started free</a>
			{/if}
		</div>

		<button
			class="site-hamburger"
			onclick={() => mobileOpen = !mobileOpen}
			aria-label="Toggle menu"
			aria-expanded={mobileOpen}
		>
			<span class="hline" class:open={mobileOpen}></span>
			<span class="hline" class:open={mobileOpen}></span>
			<span class="hline" class:open={mobileOpen}></span>
		</button>
	</div>

	{#if mobileOpen}
		<div class="site-mobile-menu">
			<a href="/#features" onclick={close}>Features</a>
			<a href="/#schools"  onclick={close}>Schools</a>
			<a href="/pricing"   onclick={close} class:active={activePage === 'pricing'}>Pricing</a>
			<a href="/#faq"      onclick={close}>FAQ</a>
			<div class="site-mobile-ctas">
				{#if $isLoggedIn}
					<a href="/chat" class="sh-btn-primary" onclick={close}>Open XYLO</a>
				{:else}
					<a href="/auth/login"  class="sh-btn-outline" onclick={close}>Sign in</a>
					<a href="/auth/signup" class="sh-btn-primary" onclick={close}>Get started free</a>
				{/if}
			</div>
		</div>
	{/if}
</header>

<style>
	/* ── Tokens ── */
	.site-header {
		--cream:      oklch(97.5% 0.018 85);
		--cream-warm: oklch(94.5% 0.025 80);
		--border:     oklch(87%   0.028 78);
		--ink:        oklch(18%   0.014 50);
		--ink-2:      oklch(40%   0.020 50);
		--ink-3:      oklch(62%   0.016 55);
		--amber:      oklch(72%   0.185 72);
		--amber-deep: oklch(63%   0.175 68);

		position: sticky;
		top: 1rem;
		z-index: 100;
		padding: 0 1rem;
	}

	/* ── Pill bar ── */
	.site-header-inner {
		max-width: 72rem;
		margin: 0 auto;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		background: oklch(97% 0.018 85 / 0.88);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0 1.25rem;
	}

	/* ── Logo ── */
	.site-logo {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: 1.375rem;
		font-weight: 900;
		color: var(--amber);
		letter-spacing: -0.02em;
		text-decoration: none;
		flex-shrink: 0;
	}

	/* ── Desktop nav ── */
	.site-nav {
		display: flex;
		gap: 0.25rem;
		flex: 1;
		justify-content: center;
	}

	.site-nav a {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--ink-2);
		padding: 0.375rem 0.875rem;
		border-radius: 999px;
		text-decoration: none;
		transition: color 0.15s, background 0.15s;
	}
	.site-nav a:hover { color: var(--ink); background: oklch(91% 0.022 80); }
	.site-nav a.active { color: var(--ink); font-weight: 700; background: oklch(91% 0.022 80); }

	/* ── CTAs ── */
	.site-header-ctas {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-shrink: 0;
	}

	.sh-btn-ghost {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--ink-2);
		padding: 0.4375rem 1rem;
		border-radius: 999px;
		transition: color 0.15s;
		text-decoration: none;
	}
	.sh-btn-ghost:hover { color: var(--ink); }

	.sh-btn-primary {
		font-size: 0.875rem;
		font-weight: 700;
		background: var(--ink);
		color: var(--cream);
		padding: 0.4375rem 1.125rem;
		border-radius: 999px;
		transition: background 0.15s;
		text-decoration: none;
		white-space: nowrap;
	}
	.sh-btn-primary:hover { background: oklch(25% 0.016 50); }

	.sh-btn-outline {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--ink-2);
		border: 1px solid var(--border);
		padding: 0.625rem 1rem;
		border-radius: 0.875rem;
		text-decoration: none;
		transition: border-color 0.15s, color 0.15s;
		text-align: center;
	}
	.sh-btn-outline:hover { border-color: var(--ink-3); color: var(--ink); }

	/* ── Hamburger ── */
	.site-hamburger {
		display: none;
		flex-direction: column;
		gap: 5px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.375rem;
		border-radius: 0.5rem;
	}

	.hline {
		display: block;
		width: 20px;
		height: 2px;
		background: var(--ink);
		border-radius: 1px;
		transition: transform 0.25s, opacity 0.25s;
		transform-origin: center;
	}
	.hline.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
	.hline.open:nth-child(2) { opacity: 0; }
	.hline.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

	/* ── Mobile menu ── */
	.site-mobile-menu {
		max-width: 72rem;
		margin: 0.5rem auto 0;
		background: var(--cream);
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.site-mobile-menu a {
		display: block;
		padding: 0.75rem 1rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--ink-2);
		border-radius: 0.75rem;
		text-decoration: none;
		transition: background 0.15s, color 0.15s;
	}
	.site-mobile-menu a:hover { background: var(--cream-warm); color: var(--ink); }
	.site-mobile-menu a.active { color: var(--ink); font-weight: 700; }

	.site-mobile-ctas {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border);
		margin-top: 0.5rem;
	}
	.site-mobile-ctas .sh-btn-primary,
	.site-mobile-ctas .sh-btn-outline {
		justify-content: center;
		width: 100%;
		border-radius: 0.875rem;
		display: block;
		padding: 0.75rem 1rem;
	}

	/* ── Responsive ── */
	@media (max-width: 1024px) {
		.site-nav { display: none; }
		.site-header-ctas { display: none; }
		.site-hamburger { display: flex; }
	}
</style>
