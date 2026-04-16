<script lang="ts">
	import { isLoggedIn } from '$lib/stores/auth';

	const studentFeatures = {
		free: [
			'20 AI messages per day — forever',
			'WAEC, JAMB, KCSE, BECE & Cambridge',
			'Understand, Quiz & Exam Prep modes',
			'Conversation history (7 days)',
		],
		pro: [
			'Unlimited AI messages',
			'All study modes + Study Plan builder',
			'Full conversation history',
			'Priority response speed',
			'Exam countdown & daily reminders',
			'Everything in Free',
		],
	};

	const schoolFeatures = [
		'Everything in Pro — for every student',
		'School admin dashboard',
		'Student engagement analytics',
		'Invite-code onboarding',
		'Student conversations stay private',
		'Billed per active student seat',
	];

	const faqs = [
		{
			q: 'Can I upgrade or cancel anytime?',
			a: 'Yes. Cancel or change your plan at any time. If you cancel Pro, you keep access until the end of your billing period, then revert to Free automatically.',
		},
		{
			q: 'What payment methods are accepted?',
			a: 'We use Paystack, so you can pay via card (Visa, Mastercard), bank transfer, or mobile money across Nigeria, Kenya, Ghana, and South Africa.',
		},
		{
			q: 'How does the school seat limit work?',
			a: "A seat is a student who sends at least one message in a billing cycle. If a student is inactive that month, they don't count against your limit.",
		},
		{
			q: 'Is there a free trial for the school plan?',
			a: 'Yes — 14 days free when you register your school, no credit card required. Full access for all your students during the trial.',
		},
		{
			q: 'What happens if I hit the 20-message limit on Free?',
			a: "You'll see a friendly nudge. Your history is preserved and your streak is safe. Limits reset every midnight.",
		},
	];

	let openFaq = $state<number | null>(null);
	function toggleFaq(i: number) { openFaq = openFaq === i ? null : i; }
</script>

<svelte:head>
	<title>Pricing — XYLO</title>
	<meta name="description" content="Start free. Upgrade when you're ready. XYLO keeps it simple." />
</svelte:head>

<div class="lp">

<!-- ── Nav ── -->
<header class="lp-nav-wrap">
	<nav class="lp-nav">
		<a href="/" class="lp-wordmark">XYLO</a>
		<div class="lp-nav-links">
			<a href="/#features">Features</a>
			<a href="/pricing" class="active">Pricing</a>
		</div>
		<div class="lp-nav-ctas">
			{#if $isLoggedIn}
				<a href="/chat" class="lp-btn-primary">Open XYLO</a>
			{:else}
				<a href="/auth/login" class="lp-btn-ghost">Sign in</a>
				<a href="/auth/signup" class="lp-btn-primary">Start free</a>
			{/if}
		</div>
	</nav>
</header>

<!-- ── Hero ── -->
<section class="pricing-hero">
	<p class="section-eyebrow">Pricing</p>
	<h1 class="pricing-heading">Start free.<br>Upgrade when you're ready.</h1>
	<p class="pricing-sub">No hidden fees. No expiring trials. The Free plan stays free forever.</p>
</section>

<!-- ── Student plans ── -->
<section class="plans-section">
	<div class="plans-grid">

		<!-- Free -->
		<div class="plan-card">
			<div class="plan-top">
				<p class="plan-name">Free</p>
				<div class="plan-price-row">
					<span class="plan-price">₦0</span>
					<span class="plan-cadence">forever</span>
				</div>
				<p class="plan-tagline">Everything you need to get started.</p>
			</div>
			<ul class="plan-features">
				{#each studentFeatures.free as feat}
					<li>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
						{feat}
					</li>
				{/each}
			</ul>
			<div class="plan-cta">
				<a href="/auth/signup" class="plan-btn secondary">Create free account</a>
			</div>
		</div>

		<!-- Pro -->
		<div class="plan-card featured">
			<div class="plan-badge">Most popular</div>
			<div class="plan-top">
				<p class="plan-name">Pro</p>
				<div class="plan-price-row">
					<span class="plan-price">₦2,500</span>
					<span class="plan-cadence">/ month</span>
				</div>
				<p class="plan-tagline">Unlimited access. No more daily caps.</p>
			</div>
			<ul class="plan-features">
				{#each studentFeatures.pro as feat}
					<li>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
						{feat}
					</li>
				{/each}
			</ul>
			<div class="plan-cta">
				<a href="/api/paystack/initialize?plan=pro" class="plan-btn primary">
					Upgrade to Pro
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
			</div>
		</div>

	</div>

	<p class="plans-note">Prices shown in Nigerian Naira. Payments via Paystack — card, transfer, or mobile money.</p>
</section>

<!-- ── Divider ── -->
<div class="section-divider">
	<span>For schools &amp; institutions</span>
</div>

<!-- ── School plan ── -->
<section class="school-section">
	<div class="school-inner">
		<div class="school-left">
			<p class="section-eyebrow">School Plan</p>
			<h2 class="school-heading">One subscription.<br>Every student covered.</h2>
			<p class="school-body">
				XYLO gives every student at your school unlimited Pro access — and gives you
				a dashboard that shows engagement without ever reading their conversations.
			</p>
			<div class="school-price-block">
				<span class="school-price">Per active student seat</span>
				<span class="school-price-note">14-day free trial · no credit card</span>
			</div>
			<div class="school-actions">
				<a href="/auth/signup?type=school" class="plan-btn primary">
					Register your school
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
				<a href="mailto:schools@xyloxs.com" class="plan-btn secondary">Talk to us first</a>
			</div>
		</div>

		<ul class="school-features">
			{#each schoolFeatures as feat}
				<li>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
					{feat}
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- ── Comparison table ── -->
<section class="compare-section">
	<h2 class="compare-heading">Plan comparison</h2>

	<div class="compare-wrap">
		<table class="compare-table">
			<thead>
				<tr>
					<th class="feature-col">Feature</th>
					<th>Free</th>
					<th class="col-pro">Pro</th>
					<th>School</th>
				</tr>
			</thead>
			<tbody>
				{#each [
					['Daily messages',          '20 / day',  'Unlimited', 'Unlimited'],
					['Understand mode',          true,        true,        true],
					['Quiz mode',                true,        true,        true],
					['Exam Prep mode',           true,        true,        true],
					['Study Plan builder',       false,       true,        true],
					['Conversation history',     '7 days',    'Full',      'Full'],
					['Priority response speed',  false,       true,        true],
					['Exam countdown reminders', false,       true,        true],
					['Admin dashboard',          false,       false,       true],
					['Engagement analytics',     false,       false,       true],
					['Student privacy controls', false,       false,       true],
				] as row}
					<tr>
						<td class="feature-col">{row[0]}</td>
						{#each row.slice(1) as cell, i}
							<td class:col-pro={i === 1}>
								{#if cell === true}
									<svg class="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
								{:else if cell === false}
									<svg class="cross" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
								{:else}
									{cell}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<!-- ── FAQ ── -->
<section class="faq-section">
	<h2 class="faq-heading">Common questions</h2>
	<div class="faq-list">
		{#each faqs as faq, i}
			<div class="faq-item" class:open={openFaq === i}>
				<button class="faq-q" onclick={() => toggleFaq(i)}>
					{faq.q}
					<svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
				</button>
				<div class="faq-body">
					<div class="faq-body-inner">
						<p>{faq.a}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- ── CTA band ── -->
<section class="cta-section">
	<p class="section-eyebrow light">Ready?</p>
	<h2 class="cta-heading">Your next exam is closer<br>than you think.</h2>
	<p class="cta-sub">Start free in 30 seconds. No credit card.</p>
	<div class="cta-actions">
		<a href="/auth/signup" class="cta-btn-primary">Create free account</a>
		<a href="/auth/signup?type=school" class="cta-btn-ghost">Register your school →</a>
	</div>
</section>

<!-- ── Footer ── -->
<footer class="lp-footer">
	<div class="footer-inner">
		<span class="footer-logo">XYLO</span>
		<nav class="footer-links">
			<a href="/privacy">Privacy</a>
			<a href="/terms">Terms</a>
			<a href="mailto:hello@xyloxs.com">Contact</a>
		</nav>
		<span class="footer-copy">© 2025 XYLO</span>
	</div>
</footer>

</div>

<style>
/* ── Tokens ── */
.lp {
	--cream:      oklch(97.5% 0.018 85);
	--cream-warm: oklch(94.5% 0.025 80);
	--border:     oklch(87%   0.028 78);
	--ink:        oklch(18%   0.014 50);
	--ink-2:      oklch(40%   0.020 50);
	--ink-3:      oklch(62%   0.016 55);
	--amber:      oklch(72%   0.185 72);
	--amber-deep: oklch(63%   0.175 68);
	--dark-base:  oklch(16%   0.014 50);

	background: var(--cream);
	color: var(--ink);
	font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
	overflow-x: hidden;
}

/* ── Nav ── */
.lp-nav-wrap {
	position: sticky;
	top: 1rem;
	z-index: 50;
	padding: 0 1.5rem;
}

.lp-nav {
	max-width: 1100px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1.5rem;
	background: oklch(99% 0.008 85 / 0.85);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border);
	border-radius: 999px;
	padding: 0.75rem 1.5rem;
	box-shadow: 0 2px 16px oklch(18% 0.014 50 / 0.06);
}

.lp-wordmark {
	font-size: 1.125rem;
	font-weight: 800;
	color: var(--amber);
	letter-spacing: -0.05em;
	flex-shrink: 0;
}

.lp-nav-links {
	display: flex;
	gap: 0.25rem;
	flex: 1;
	justify-content: center;
}

.lp-nav-links a {
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--ink-3);
	padding: 0.375rem 0.875rem;
	border-radius: 999px;
	transition: color 0.12s, background 0.12s;
}
.lp-nav-links a:hover { color: var(--ink); background: var(--cream-warm); }
.lp-nav-links a.active { color: var(--ink); font-weight: 700; }

.lp-nav-ctas { display: flex; gap: 0.5rem; flex-shrink: 0; }

.lp-btn-ghost {
	padding: 0.4375rem 1rem;
	font-size: 0.875rem;
	font-weight: 700;
	color: var(--ink-2);
	border-radius: 999px;
	transition: color 0.12s;
}
.lp-btn-ghost:hover { color: var(--ink); }

.lp-btn-primary {
	padding: 0.4375rem 1.125rem;
	font-size: 0.875rem;
	font-weight: 700;
	background: var(--ink);
	color: var(--cream);
	border-radius: 999px;
	transition: background 0.12s;
}
.lp-btn-primary:hover { background: oklch(25% 0.016 50); }

/* ── Shared ── */
.section-eyebrow {
	font-size: 0.6875rem;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--amber-deep);
	margin-bottom: 1rem;
}
.section-eyebrow.light { color: oklch(72% 0.185 72 / 0.85); }

/* ── Hero ── */
.pricing-hero {
	max-width: 1100px;
	margin: 0 auto;
	padding: 5rem 2rem 3.5rem;
}

.pricing-heading {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: clamp(2.5rem, 6vw, 4rem);
	font-weight: 700;
	line-height: 1.08;
	letter-spacing: -0.03em;
	color: var(--ink);
	margin-bottom: 1rem;
}

.pricing-sub {
	font-size: 1.0625rem;
	color: var(--ink-3);
	max-width: 44ch;
}

/* ── Plans ── */
.plans-section {
	max-width: 1100px;
	margin: 0 auto;
	padding: 0 2rem 2rem;
}

.plans-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1.25rem;
	max-width: 760px;
}

.plan-card {
	background: oklch(99% 0.008 85);
	border: 1px solid var(--border);
	border-radius: 1.25rem;
	padding: 2.25rem;
	display: flex;
	flex-direction: column;
	gap: 1.75rem;
	position: relative;
}

.plan-card.featured {
	background: var(--ink);
	border-color: transparent;
	box-shadow: 0 8px 32px oklch(18% 0.014 50 / 0.2);
}

.plan-badge {
	position: absolute;
	top: -0.875rem;
	left: 50%;
	transform: translateX(-50%);
	background: var(--amber);
	color: var(--ink);
	font-size: 0.6875rem;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	padding: 0.25rem 0.875rem;
	border-radius: 999px;
	white-space: nowrap;
}

.plan-top { display: flex; flex-direction: column; gap: 0.375rem; }

.plan-name {
	font-size: 0.75rem;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--ink-3);
}
.plan-card.featured .plan-name { color: oklch(70% 0.016 50); }

.plan-price-row { display: flex; align-items: baseline; gap: 0.375rem; }

.plan-price {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: 2.5rem;
	font-weight: 700;
	line-height: 1;
	color: var(--ink);
	letter-spacing: -0.03em;
}
.plan-card.featured .plan-price { color: var(--cream); }

.plan-cadence {
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--ink-3);
}
.plan-card.featured .plan-cadence { color: oklch(60% 0.014 50); }

.plan-tagline {
	font-size: 0.875rem;
	color: var(--ink-3);
	line-height: 1.5;
	margin-top: 0.125rem;
}
.plan-card.featured .plan-tagline { color: oklch(60% 0.014 50); }

.plan-features {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	flex: 1;
}

.plan-features li {
	display: flex;
	align-items: flex-start;
	gap: 0.625rem;
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--ink-2);
	line-height: 1.45;
}
.plan-card.featured .plan-features li { color: oklch(75% 0.012 50); }

.plan-features svg { color: var(--amber); flex-shrink: 0; margin-top: 0.1875rem; }

/* ── Buttons ── */
.plan-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.375rem;
	width: 100%;
	padding: 0.75rem 1.25rem;
	border-radius: 0.75rem;
	font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
	font-size: 0.9375rem;
	font-weight: 700;
	transition: background 0.12s, color 0.12s, border-color 0.12s;
	text-align: center;
}

.plan-btn.primary {
	background: var(--amber);
	color: var(--ink);
	border: none;
}
.plan-btn.primary:hover { background: oklch(65% 0.185 72); }

.plan-btn.secondary {
	background: none;
	color: var(--ink-2);
	border: 1px solid var(--border);
}
.plan-btn.secondary:hover { border-color: var(--ink-3); color: var(--ink); }

.plans-note {
	font-size: 0.8125rem;
	color: var(--ink-3);
	margin-top: 1.5rem;
}

/* ── Section divider ── */
.section-divider {
	max-width: 1100px;
	margin: 3rem auto 0;
	padding: 0 2rem;
	display: flex;
	align-items: center;
	gap: 1.5rem;
}
.section-divider::before, .section-divider::after {
	content: '';
	flex: 1;
	height: 1px;
	background: var(--border);
}
.section-divider span {
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--ink-3);
	white-space: nowrap;
}

/* ── School plan ── */
.school-section {
	max-width: 1100px;
	margin: 0 auto;
	padding: 3rem 2rem 0;
}

.school-inner {
	display: grid;
	grid-template-columns: 1.1fr 0.9fr;
	gap: 4rem;
	align-items: center;
	background: oklch(99% 0.008 85);
	border: 1px solid var(--border);
	border-radius: 1.25rem;
	padding: 3rem;
}

.school-left { display: flex; flex-direction: column; gap: 1.25rem; }

.school-heading {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: clamp(1.75rem, 3vw, 2.25rem);
	font-weight: 700;
	line-height: 1.15;
	letter-spacing: -0.03em;
	color: var(--ink);
}

.school-body {
	font-size: 0.9375rem;
	color: var(--ink-3);
	line-height: 1.7;
}

.school-price-block {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	padding: 1.25rem 1.5rem;
	background: var(--cream-warm);
	border: 1px solid var(--border);
	border-radius: 0.75rem;
}

.school-price {
	font-family: 'Fraunces', Georgia, serif;
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--ink);
}

.school-price-note {
	font-size: 0.8125rem;
	color: var(--ink-3);
	font-weight: 600;
}

.school-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.school-actions .plan-btn { width: auto; flex: 1; min-width: 140px; }

.school-features {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	border-top: 1px solid var(--border);
	align-self: stretch;
}

.school-features li {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	padding: 1.125rem 0;
	border-bottom: 1px solid var(--border);
	font-size: 0.9375rem;
	font-weight: 500;
	color: var(--ink-2);
	line-height: 1.45;
}
.school-features svg { color: var(--amber); flex-shrink: 0; margin-top: 0.2rem; }

/* ── Compare table ── */
.compare-section {
	max-width: 1100px;
	margin: 5rem auto 0;
	padding: 0 2rem;
}

.compare-heading {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: clamp(1.5rem, 3vw, 2rem);
	font-weight: 700;
	color: var(--ink);
	letter-spacing: -0.02em;
	margin-bottom: 2rem;
}

.compare-wrap { border: 1px solid var(--border); border-radius: 1rem; overflow: hidden; }

.compare-table { width: 100%; border-collapse: collapse; }

.compare-table thead tr {
	background: var(--cream-warm);
	border-bottom: 1px solid var(--border);
}

.compare-table th {
	padding: 1rem 1.5rem;
	font-size: 0.75rem;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--ink-3);
	text-align: center;
}
.compare-table th.feature-col { text-align: left; }

.compare-table th.col-pro,
.compare-table td.col-pro { background: oklch(96% 0.022 80); }

.compare-table tbody tr { border-bottom: 1px solid oklch(92% 0.020 82); }
.compare-table tbody tr:last-child { border-bottom: none; }
.compare-table tbody tr:hover { background: oklch(98.5% 0.012 84); }

.compare-table td {
	padding: 0.9375rem 1.5rem;
	font-size: 0.875rem;
	color: var(--ink-3);
	text-align: center;
	font-weight: 500;
}
.compare-table td.feature-col { text-align: left; font-weight: 600; color: var(--ink-2); }

.check { color: var(--amber-deep); display: inline-block; }
.cross { color: var(--border); display: inline-block; }

/* ── FAQ ── */
.faq-section {
	max-width: 1100px;
	margin: 5rem auto 0;
	padding: 0 2rem;
}

.faq-heading {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: clamp(1.5rem, 3vw, 2rem);
	font-weight: 700;
	color: var(--ink);
	letter-spacing: -0.02em;
	margin-bottom: 2rem;
}

.faq-list {
	display: flex;
	flex-direction: column;
	border-top: 1px solid var(--border);
	max-width: 760px;
}

.faq-item { border-bottom: 1px solid var(--border); }

.faq-q {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	width: 100%;
	padding: 1.375rem 0;
	background: none;
	border: none;
	font-family: inherit;
	font-size: 0.9375rem;
	font-weight: 700;
	color: var(--ink);
	text-align: left;
	cursor: pointer;
	transition: color 0.12s;
}
.faq-q:hover { color: var(--amber-deep); }

.faq-chevron {
	flex-shrink: 0;
	color: var(--ink-3);
	transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.faq-item.open .faq-chevron { transform: rotate(180deg); }

.faq-body {
	display: grid;
	grid-template-rows: 0fr;
	transition: grid-template-rows 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.faq-item.open .faq-body { grid-template-rows: 1fr; }
.faq-body-inner { overflow: hidden; }
.faq-body-inner p {
	padding: 0 0 1.375rem;
	font-size: 0.9375rem;
	color: var(--ink-3);
	line-height: 1.75;
}

/* ── CTA band ── */
.cta-section {
	margin: 5rem 0 0;
	background: var(--dark-base);
	padding: 5rem 2rem;
}

.cta-heading {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: clamp(2rem, 5vw, 3.25rem);
	font-weight: 700;
	line-height: 1.1;
	letter-spacing: -0.03em;
	color: oklch(96% 0.010 80);
	margin-bottom: 0.875rem;
	max-width: 20ch;
}

.cta-sub { font-size: 1rem; color: oklch(55% 0.014 50); margin-bottom: 2.5rem; }

.cta-actions { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }

.cta-btn-primary {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.875rem 1.75rem;
	background: var(--amber);
	color: var(--ink);
	font-weight: 700;
	font-size: 0.9375rem;
	border-radius: 0.625rem;
	transition: background 0.12s;
}
.cta-btn-primary:hover { background: oklch(65% 0.185 72); }

.cta-btn-ghost {
	font-size: 0.9375rem;
	font-weight: 600;
	color: oklch(55% 0.014 50);
	transition: color 0.12s;
}
.cta-btn-ghost:hover { color: oklch(75% 0.012 50); }

/* ── Footer ── */
.lp-footer {
	background: var(--dark-base);
	border-top: 1px solid oklch(25% 0.014 50);
	padding: 1.75rem 2rem;
}

.footer-inner {
	max-width: 1100px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1.5rem;
	flex-wrap: wrap;
}

.footer-logo { font-size: 1rem; font-weight: 800; color: var(--amber); letter-spacing: -0.04em; }

.footer-links { display: flex; gap: 1.5rem; }
.footer-links a { font-size: 0.8125rem; font-weight: 600; color: oklch(50% 0.014 50); transition: color 0.12s; }
.footer-links a:hover { color: oklch(70% 0.012 50); }

.footer-copy { font-size: 0.8125rem; color: oklch(40% 0.012 50); }

/* ── Responsive ── */
@media (max-width: 900px) {
	.school-inner { grid-template-columns: 1fr; gap: 2.5rem; }
	.school-features { border-top: 1px solid var(--border); }
}

@media (max-width: 720px) {
	.plans-grid { grid-template-columns: 1fr; max-width: 440px; }
	.plan-card.featured { order: -1; }
	.compare-wrap { overflow-x: auto; }
	.compare-table { min-width: 500px; }
}

@media (max-width: 600px) {
	.pricing-hero { padding: 3.5rem 1.25rem 2.5rem; }
	.plans-section, .school-section, .compare-section, .faq-section { padding: 0 1.25rem; }
	.school-inner { padding: 2rem 1.5rem; }
	.lp-nav-links { display: none; }
	.cta-section { padding: 4rem 1.25rem; }
}
</style>
