<script lang="ts">
	// No props — footer is fully static
</script>

<footer class="site-footer">
	<div class="sf-inner sf-grid">
		<!-- Brand -->
		<div class="sf-brand">
			<span class="sf-logo">XYLO</span>
			<p>The AI study companion built for African students. Always available.</p>
			<div class="sf-social">
				<a href="https://twitter.com/xyloxs" aria-label="Twitter">𝕏</a>
				<a href="https://instagram.com/xyloxs" aria-label="Instagram">Ig</a>
				<a href="https://linkedin.com/company/xyloxs" aria-label="LinkedIn">in</a>
			</div>
		</div>

		<!-- Product -->
		<div class="sf-col">
			<p class="sf-col-title">Product</p>
			<a href="/pricing">Pricing</a>
			<a href="/#features">Features</a>
			<a href="/#schools">For Schools</a>
			<a href="/#faq">FAQ</a>
		</div>

		<!-- Account -->
		<div class="sf-col">
			<p class="sf-col-title">Account</p>
			<a href="/auth/login">Sign in</a>
			<a href="/auth/signup">Get started free</a>
			<a href="/auth/signup?type=school">School signup</a>
		</div>

		<!-- Curricula -->
		<div class="sf-col">
			<p class="sf-col-title">Curricula</p>
			<span>WAEC / NECO</span>
			<span>JAMB</span>
			<span>KCSE</span>
			<span>BECE / WASSCE</span>
			<span>Cambridge / IGCSE</span>
		</div>
	</div>

	<div class="sf-base">
		<div class="sf-inner sf-base-inner">
			<span>© 2025 Xyloxs Ltd</span>
			<span class="sf-tagline">AI that understands your world 🌍</span>
			<nav class="sf-legal">
				<a href="/privacy">Privacy</a>
				<a href="/terms">Terms</a>
				<a href="mailto:hello@xyloxs.com">Contact</a>
			</nav>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		--cream:      oklch(97.5% 0.018 85);
		--border:     oklch(87%   0.028 78);
		--ink:        oklch(18%   0.014 50);
		--ink-2:      oklch(40%   0.020 50);
		--ink-3:      oklch(62%   0.016 55);
		--amber:      oklch(72%   0.185 72);
		--dark-base:  oklch(16%   0.014 50);
		--dark-mid:   oklch(25%   0.014 50);
		--dark-muted: oklch(50%   0.012 50);
		--dark-dim:   oklch(40%   0.012 50);

		background: var(--dark-base);
		color: var(--cream);
		font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.sf-inner {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	/* ── Main grid ── */
	.sf-grid {
		display: grid;
		grid-template-columns: 1.6fr 1fr 1fr 1fr;
		gap: 3rem;
		padding-top: 4rem;
		padding-bottom: 4rem;
		border-bottom: 1px solid var(--dark-mid);
	}

	/* ── Brand column ── */
	.sf-logo {
		display: block;
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: 1.375rem;
		font-weight: 900;
		color: var(--amber);
		letter-spacing: -0.02em;
		margin-bottom: 0.875rem;
	}

	.sf-brand p {
		font-size: 0.875rem;
		color: var(--dark-muted);
		line-height: 1.65;
		margin-bottom: 1.5rem;
		max-width: 22ch;
	}

	.sf-social {
		display: flex;
		gap: 0.5rem;
	}

	.sf-social a {
		width: 34px;
		height: 34px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--dark-mid);
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--dark-muted);
		text-decoration: none;
		transition: border-color 0.15s, color 0.15s;
	}
	.sf-social a:hover { border-color: oklch(40% 0.014 50); color: oklch(80% 0.010 50); }

	/* ── Link columns ── */
	.sf-col {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.sf-col-title {
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: oklch(60% 0.012 50);
		margin-bottom: 0.375rem;
	}

	.sf-col a {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--dark-muted);
		text-decoration: none;
		transition: color 0.15s;
	}
	.sf-col a:hover { color: oklch(80% 0.010 50); }

	.sf-col span {
		font-size: 0.875rem;
		font-weight: 500;
		color: oklch(38% 0.010 50);
	}

	/* ── Base bar ── */
	.sf-base {
		padding: 1.25rem 0;
	}

	.sf-base-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.sf-base span {
		font-size: 0.8125rem;
		color: var(--dark-dim);
		font-weight: 500;
	}

	.sf-tagline {
		font-size: 0.8125rem;
		color: oklch(38% 0.010 50) !important;
	}

	.sf-legal {
		display: flex;
		gap: 1.25rem;
	}

	.sf-legal a {
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(40% 0.012 50);
		text-decoration: none;
		transition: color 0.15s;
	}
	.sf-legal a:hover { color: var(--dark-muted); }

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.sf-grid {
			grid-template-columns: 1fr 1fr;
			gap: 2.5rem;
		}
		.sf-brand { grid-column: 1 / -1; }
	}

	@media (max-width: 560px) {
		.sf-grid { grid-template-columns: 1fr; }
		.sf-base-inner { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
		.sf-tagline { display: none; }
	}
</style>
