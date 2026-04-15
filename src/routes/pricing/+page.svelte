<script lang="ts">
	import '../landing.css';
	
	const plans = [
		{
			id: 'free',
			name: 'Xylo Standard',
			price: '$0',
			period: 'forever',
			sub: 'Essential study companion',
			features: [
				'20 AI messages / day',
				'Standard study modes',
				'Personal study history',
				'Community support'
			],
			cta: 'Get Started',
			href: '/auth/signup',
			highlight: false
		},
		{
			id: 'pro',
			name: 'Xylo Pro',
			price: '$5',
			period: 'per month',
			sub: 'For the serious student',
			features: [
				'Unlimited AI messages',
				'Priority exam prep modes',
				'Custom study plans',
				'Early access to new tools'
			],
			cta: 'Upgrade to Pro',
			href: '/api/paystack/initialize?plan=pro',
			highlight: true
		},
		{
			id: 'school',
			name: 'Xylo for Schools',
			price: '$2',
			period: 'per student / mo',
			sub: 'Power up your classroom',
			features: [
				'Full Pro access for all students',
				'Admin analytics dashboard',
				'Seat management tools',
				'Priority school support'
			],
			cta: 'Register School',
			href: '/auth/signup?type=school',
			highlight: false
		}
	];
</script>

<svelte:head>
	<title>Pricing | XYLO</title>
</svelte:head>

<div class="aw-page pricing-page">
	<div class="glow-aura"></div>
	
	<div class="pricing-container">
		<header class="pricing-header">
			<a href="/" class="aw-logo" style="margin-bottom: 2.5rem;">XYLO</a>
			<p class="pricing-pill">Simple, Transparent Pricing</p>
			<h1 class="pricing-title">Invest in your academic future.</h1>
			<p class="pricing-sub">Built for African students. Priced for your reality.</p>
		</header>

		<div class="plans-grid">
			{#each plans as plan}
				<div class="plan-card glass-deck" class:highlight={plan.highlight}>
					{#if plan.highlight}
						<div class="popular-badge">Most Popular</div>
					{/if}
					
					<div class="plan-top">
						<h2 class="plan-name">{plan.name}</h2>
						<p class="plan-sub">{plan.sub}</p>
						<div class="plan-price">
							<span class="currency">$</span>
							<span class="amount">{plan.price.replace('$', '')}</span>
							<span class="period">/ {plan.period}</span>
						</div>
					</div>

					<ul class="plan-features">
						{#each plan.features as feat}
							<li>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
								{feat}
							</li>
						{/each}
					</ul>

					<div class="plan-footer">
						<a href={plan.href} class="aw-btn {plan.highlight ? 'aw-btn-primary' : 'aw-btn-secondary'} purchase-btn">
							{plan.cta}
						</a>
						<p class="footer-note">No credit card required for free tier.</p>
					</div>
				</div>
			{/each}
		</div>

		<div class="pricing-fyi glass-deck">
			<div class="fyi-icon">💡</div>
			<div class="fyi-text">
				<h3>Already part of a school?</h3>
				<p>If your school is subscribed to XYLO, you get full Pro access for free. 
				Just use the invite code provided by your teacher.</p>
			</div>
			<a href="/join" class="aw-btn aw-btn-primary">Join via Code</a>
		</div>
	</div>
</div>

<style>
	.pricing-page {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 5rem 1.5rem;
		position: relative;
		overflow-x: hidden;
	}

	.glow-aura {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 1200px;
		height: 1200px;
		background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
		pointer-events: none;
	}

	.pricing-container {
		width: 100%;
		max-width: 1200px;
		position: relative;
		z-index: 1;
	}

	.pricing-header { text-align: center; margin-bottom: 5rem; }
	.pricing-pill { font-size: 0.8125rem; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 1.5rem; }
	.pricing-title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; color: #1e293b; letter-spacing: -0.04em; margin-bottom: 1rem; }
	.pricing-sub { font-size: 1.125rem; color: #64748b; font-weight: 500; }

	.plans-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.plan-card.glass-deck {
		padding: 3.5rem 2.5rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
		transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.plan-card:hover { transform: translateY(-8px); border-color: rgba(245,158,11,0.3); }

	.plan-card.highlight {
		border-color: #f59e0b;
		box-shadow: 0 32px 64px -12px rgba(245,158,11,0.15);
		transform: scale(1.03);
	}
	.plan-card.highlight:hover { transform: scale(1.05) translateY(-8px); }

	.popular-badge {
		position: absolute;
		top: 0; left: 50%;
		transform: translate(-50%, -50%);
		background: #f59e0b; color: #000;
		padding: 0.5rem 1.25rem;
		border-radius: 999px;
		font-size: 0.75rem; font-weight: 800;
		text-transform: uppercase; letter-spacing: 0.05em;
	}

	.plan-top { margin-bottom: 2.5rem; }
	.plan-name { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; }
	.plan-sub { font-size: 0.9375rem; color: #64748b; font-weight: 500; margin-bottom: 2rem; }
	
	.plan-price { display: flex; align-items: baseline; gap: 0.25rem; }
	.plan-price .currency { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
	.plan-price .amount { font-size: 3.5rem; font-weight: 900; color: #1e293b; letter-spacing: -0.04em; }
	.plan-price .period { font-size: 0.9375rem; font-weight: 600; color: #94a3b8; }

	.plan-features {
		list-style: none; padding: 0; margin: 0 0 3.5rem 0;
		display: flex; flex-direction: column; gap: 1rem;
	}
	.plan-features li {
		display: flex; align-items: flex-start; gap: 1rem;
		font-size: 0.9375rem; font-weight: 600; color: #475569;
	}
	.plan-features li svg { color: #f59e0b; margin-top: 0.125rem; }

	.plan-footer { margin-top: auto; }
	.purchase-btn { width: 100%; justify-content: center; height: 56px; font-size: 1rem; }
	.footer-note { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-align: center; margin-top: 1.25rem; }

	.pricing-fyi {
		display: flex; align-items: center; gap: 2.5rem;
		padding: 2.5rem 3.5rem;
		background: rgba(255, 255, 255, 0.4);
	}
	.fyi-icon { font-size: 2.5rem; }
	.fyi-text { flex: 1; }
	.fyi-text h3 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; }
	.fyi-text p { font-size: 0.9375rem; color: #64748b; font-weight: 500; line-height: 1.6; }

	@media (max-width: 1024px) {
		.plans-grid { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto 4rem; }
		.plan-card.highlight { transform: none; }
		.plan-card.highlight:hover { transform: translateY(-8px); }
		.pricing-fyi { flex-direction: column; text-align: center; padding: 3rem 2rem; }
	}
</style>
