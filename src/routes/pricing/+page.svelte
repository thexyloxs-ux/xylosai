<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	const { data } = $props<{ data: App.PageData & { billingAvailability?: { plus?: boolean; pro?: boolean; org?: boolean } } }>();
	const billingAvailability = $derived(data.billingAvailability ?? { plus: false, pro: false, org: false });

	const memberFeatures = {
		free: [
			'5 AI messages per day — forever',
			'Personalized guidance across your focus areas',
			'Understand, Quiz & Deep Practice modes',
			'Conversation history (7 days)',
		],
		plus: [
			'Unlimited AI messages',
			'Understand, Quiz & Deep Practice modes',
			'Full conversation history',
			'Personalized focus profile',
			'Everything in Free',
		],
		pro: [
			'Unlimited AI messages',
			'All focus modes + Plan builder',
			'Full conversation history',
			'Priority response speed',
			'Goal countdowns & daily reminders',
			'Everything in Free',
		],
	};

	const orgFeatures = [
		'Everything in Pro — for every member',
		'Organization admin dashboard',
		'Member engagement analytics',
		'Invite-code onboarding',
		'Member conversations stay private',
		'Billing activation from the organization admin dashboard',
	];

	const faqs = [
		{
			q: 'Can I upgrade or cancel anytime?',
			a: 'Yes. You can upgrade, open Paystack subscription management, or request cancellation from Settings.',
		},
		{
			q: 'What payment methods are accepted?',
			a: 'We use Paystack, so you can pay via card (Visa, Mastercard), bank transfer, or mobile money across Nigeria, Kenya, Ghana, and South Africa.',
		},
		{
			q: 'How does the organization seat limit work?',
			a: 'Organization admins start with invite-code onboarding and activate organization billing from their dashboard when the organization is ready to go live.',
		},
		{
			q: 'Is there a free trial for the organization plan?',
			a: 'Yes — 14 days free when you register your organization, no credit card required. Full access for all your members during the trial.',
		},
		{
			q: 'What happens if I hit the 5-message limit on Free?',
			a: "You'll see a friendly nudge. Your history is preserved and your streak is safe. Limits reset every midnight.",
		},
	];

	let openFaq = $state<number | null>(null);
	function toggleFaq(i: number) { openFaq = openFaq === i ? null : i; }
</script>

<svelte:head>
	<title>Pricing — XYLO</title>
	<meta name="description" content="Start free. Upgrade when you're ready. XYLO keeps it simple." />
	<meta property="og:title" content="Pricing — XYLO" />
	<meta property="og:description" content="Start free. Upgrade when you're ready. XYLO keeps it simple." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://xyloss.tech/pricing" />
	<meta property="og:image" content="https://xyloss.tech/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Pricing — XYLO" />
	<meta name="twitter:description" content="Start free. Upgrade when you're ready. XYLO keeps it simple." />
	<link rel="canonical" href="https://xyloss.tech/pricing" />
</svelte:head>

<div class="lp">

<SiteHeader activePage="pricing" />

<!-- ── Hero ── -->
<section class="pricing-hero">
	<p class="section-eyebrow">Pricing</p>
	<h1 class="pricing-heading">Start free.<br>Upgrade when you're ready.</h1>
	<p class="pricing-sub">No hidden fees. No expiring trials. The Free plan stays free forever.</p>
</section>

<!-- ── Individual plans ── -->
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
				{#each memberFeatures.free as feat}
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

		<!-- Plus -->
		<div class="plan-card featured">
			<div class="plan-badge">Best value</div>
			<div class="plan-top">
				<p class="plan-name">Plus</p>
				<div class="plan-price-row">
					<span class="plan-price">₦3,000</span>
					<span class="plan-cadence">/ month</span>
				</div>
				<p class="plan-tagline">Unlimited access. No more daily caps.</p>
			</div>
			<ul class="plan-features">
				{#each memberFeatures.plus as feat}
					<li>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
						{feat}
					</li>
				{/each}
			</ul>
			<div class="plan-cta">
				{#if billingAvailability.plus}
					<a href="/api/paystack/initialize?plan=plus" class="plan-btn primary">
						Upgrade to Plus
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
					</a>
				{:else}
					<div class="plan-btn primary disabled">Plus checkout coming soon</div>
				{/if}
			</div>
		</div>

		<!-- Pro -->
		<div class="plan-card">
			<div class="plan-top">
				<p class="plan-name">Pro</p>
				<div class="plan-price-row">
					<span class="plan-price">₦5,000</span>
					<span class="plan-cadence">/ month</span>
				</div>
				<p class="plan-tagline">Advanced tools for deeper, more structured work.</p>
			</div>
			<ul class="plan-features">
				{#each memberFeatures.pro as feat}
					<li>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
						{feat}
					</li>
				{/each}
			</ul>
			<div class="plan-cta">
				{#if billingAvailability.pro}
					<a href="/api/paystack/initialize?plan=pro" class="plan-btn secondary">
						Upgrade to Pro
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
					</a>
				{:else}
					<div class="plan-btn secondary disabled">Pro checkout coming soon</div>
				{/if}
			</div>
		</div>

	</div>

	<p class="plans-note">
		Prices shown in Nigerian Naira.
		{#if billingAvailability.plus && billingAvailability.pro}
			Payments via Paystack — card, transfer, or mobile money.
		{:else}
			Checkout is still being configured right now.
		{/if}
	</p>
</section>

<!-- ── Divider ── -->
<div class="section-divider">
	<span>For organizations &amp; institutions</span>
</div>

<!-- ── Organization plan ── -->
<section class="org-section">
	<div class="org-inner">
		<div class="org-left">
			<p class="section-eyebrow">Organization Plan</p>
			<h2 class="org-heading">One subscription.<br>Every member covered.</h2>
			<p class="org-body">
				XYLO gives every member in your organization unlimited Pro access — and gives you
				a dashboard that shows engagement without ever reading their conversations.
			</p>
			<div class="org-price-block">
				<span class="org-price">Custom organization subscription</span>
				<span class="org-price-note">14-day onboarding trial · activate billing from Settings</span>
			</div>
			<div class="org-actions">
				<a href="/auth/signup?type=org" class="plan-btn primary">
					Register your organization
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
				<a href="mailto:hello@xyloxs.com" class="plan-btn secondary">Talk to us first</a>
			</div>
		</div>

		<ul class="org-features">
			{#each orgFeatures as feat}
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
					<th class="col-pro">Plus</th>
					<th>Pro</th>
					<th>Organization</th>
				</tr>
			</thead>
			<tbody>
				{#each [
					['Daily messages',          '5 / day',   'Unlimited', 'Unlimited', 'Unlimited'],
					['Understand mode',          true,        true,        true,        true],
					['Quiz mode',                true,        true,        true,        true],
					['Deep Practice mode',       true,        true,        true,        true],
					['Study Plan builder',       false,       false,       true,        true],
					['Conversation history',     '7 days',    'Full',      'Full',      'Full'],
					['Priority response speed',  false,       false,       true,        true],
					['Goal countdown reminders', false,       false,       true,        true],
					['Admin dashboard',          false,       false,       false,       true],
					['Engagement analytics',     false,       false,       false,       true],
					['Member privacy controls', false,       false,       false,       true],
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
	<h2 class="cta-heading">Your next breakthrough is closer<br>than you think.</h2>
	<p class="cta-sub">Start free in 30 seconds. No credit card.</p>
	<div class="cta-actions">
		<a href="/auth/signup" class="cta-btn-primary">Create free account</a>
		<a href="/auth/signup?type=org" class="cta-btn-ghost">Register your organization →</a>
	</div>
</section>

<SiteFooter />

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
	grid-template-columns: repeat(3, 1fr);
	gap: 1.25rem;
	max-width: 1100px;
}

.plan-card {
	background: oklch(100% 0 0 / 0.68);
	backdrop-filter: blur(20px) saturate(150%);
	border: 1px solid oklch(100% 0 0 / 0.85);
	border-radius: 1.25rem;
	padding: 2.25rem;
	display: flex;
	flex-direction: column;
	gap: 1.75rem;
	position: relative;
	isolation: isolate;
	overflow: hidden;
	box-shadow:
		inset 0 1px 0 oklch(100% 0 0 / 1),
		0 2px 4px oklch(18% 0.014 50 / 0.04),
		0 8px 24px oklch(18% 0.014 50 / 0.08);
	transition: box-shadow 0.22s ease, transform 0.22s ease;
}
.plan-card:hover {
	transform: translateY(-2px);
	box-shadow:
		inset 0 1px 0 oklch(100% 0 0 / 1),
		0 4px 8px oklch(18% 0.014 50 / 0.06),
		0 16px 40px oklch(18% 0.014 50 / 0.12);
}

.plan-card.featured {
	background: oklch(18% 0.014 50 / 0.92);
	backdrop-filter: blur(24px) saturate(160%);
	border: 1px solid oklch(100% 0 0 / 0.08);
	box-shadow:
		inset 0 1px 0 oklch(100% 0 0 / 0.10),
		0 8px 32px oklch(18% 0.014 50 / 0.30),
		0 0 0 1px oklch(72% 0.185 72 / 0.15);
}
.plan-card.featured:hover {
	box-shadow:
		inset 0 1px 0 oklch(100% 0 0 / 0.12),
		0 16px 48px oklch(18% 0.014 50 / 0.40),
		0 0 0 1px oklch(72% 0.185 72 / 0.25);
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
.plan-btn.disabled {
	opacity: 0.55;
	cursor: not-allowed;
	pointer-events: none;
}

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

/* ── Org plan ── */
.org-section {
	max-width: 1100px;
	margin: 0 auto;
	padding: 3rem 2rem 0;
}

.org-inner {
	display: grid;
	grid-template-columns: 1.1fr 0.9fr;
	gap: 4rem;
	align-items: center;
	background: oklch(100% 0 0 / 0.68);
	backdrop-filter: blur(20px) saturate(150%);
	border: 1px solid oklch(100% 0 0 / 0.85);
	border-radius: 1.25rem;
	padding: 3rem;
	position: relative;
	isolation: isolate;
	overflow: hidden;
	box-shadow:
		inset 0 1px 0 oklch(100% 0 0 / 1),
		0 4px 8px oklch(18% 0.014 50 / 0.04),
		0 16px 48px oklch(18% 0.014 50 / 0.10);
}

.org-left { display: flex; flex-direction: column; gap: 1.25rem; }

.org-heading {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: clamp(1.75rem, 3vw, 2.25rem);
	font-weight: 700;
	line-height: 1.15;
	letter-spacing: -0.03em;
	color: var(--ink);
}

.org-body {
	font-size: 0.9375rem;
	color: var(--ink-3);
	line-height: 1.7;
}

.org-price-block {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	padding: 1.25rem 1.5rem;
	background: var(--cream-warm);
	border: 1px solid var(--border);
	border-radius: 0.75rem;
}

.org-price {
	font-family: 'Fraunces', Georgia, serif;
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--ink);
}

.org-price-note {
	font-size: 0.8125rem;
	color: var(--ink-3);
	font-weight: 600;
}

.org-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.org-actions .plan-btn { width: auto; flex: 1; min-width: 140px; }

.org-features {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	border-top: 1px solid var(--border);
	align-self: stretch;
}

.org-features li {
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
.org-features svg { color: var(--amber); flex-shrink: 0; margin-top: 0.2rem; }

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
	background-image:
		radial-gradient(ellipse 70% 60% at 20% 50%, oklch(72% 0.185 72 / 0.08) 0%, transparent 60%),
		radial-gradient(ellipse 50% 80% at 80% 30%, oklch(60% 0.12 240 / 0.06) 0%, transparent 55%);
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

/* ── Responsive ── */
@media (max-width: 900px) {
	.org-inner { grid-template-columns: 1fr; gap: 2.5rem; }
	.org-features { border-top: 1px solid var(--border); }
}

@media (max-width: 720px) {
	.plans-grid { grid-template-columns: 1fr; max-width: 440px; }
	.plan-card.featured { order: -1; }
	.compare-wrap { overflow-x: auto; }
	.compare-table { min-width: 620px; }
}

@media (max-width: 600px) {
	.pricing-hero { padding: 3.5rem 1.25rem 2.5rem; }
	.plans-section, .org-section, .compare-section, .faq-section { padding: 0 1.25rem; }
	.org-inner { padding: 2rem 1.5rem; }
	.cta-section { padding: 4rem 1.25rem; }
}
</style>
