<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isLoggedIn, profile } from '$lib/stores/auth';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	$effect(() => {
		if ($isLoggedIn && $profile) {
			goto($profile.role === 'school_admin' ? '/dashboard' : '/chat');
		}
	});

	const features = [
		{ num: '01', title: 'Curriculum-Aligned', desc: 'Knows WAEC, JAMB, KCSE, BECE, and Cambridge by name — not by guess. Every answer is shaped by your actual syllabus.' },
		{ num: '02', title: 'Personalized Study Plans', desc: 'Give XYLO your exam date. Get a day-by-day plan built around your actual life, not a generic template.' },
		{ num: '03', title: 'Daily Consistency', desc: 'Streaks and gentle check-ins that build lasting habits. Not motivation bursts. Real change over time.' },
		{ num: '04', title: 'Emotionally Intelligent', desc: 'Academic pressure is real. XYLO acknowledges how you feel before diving into content. Never judgmental.' },
		{ num: '05', title: 'Progress Tracking', desc: 'See exactly what you\'ve covered, what still needs work, and how your consistency compares week over week.' },
		{ num: '06', title: 'School Dashboard', desc: 'Admins see who\'s engaged and who\'s struggling — without ever reading a student\'s private messages.' },
	];

	const steps = [
		{ num: '01', title: 'Sign up free', desc: 'No credit card. 20 AI messages per day, forever.' },
		{ num: '02', title: 'Set your profile', desc: 'Level, curriculum, subjects. One setup, every answer personalized.' },
		{ num: '03', title: 'Pick a mode', desc: 'Understand, quiz, plan, or exam prep — you choose how to learn.' },
		{ num: '04', title: 'Build your streak', desc: 'Come back daily. XYLO remembers where you left off.' },
	];

	const faqs = [
		{ q: 'Is XYLO really free?', a: '20 messages a day, forever. No credit card, no trial period that suddenly expires. Upgrade to unlimited when you\'re ready.' },
		{ q: 'Which curriculums does XYLO support?', a: 'WAEC, NECO, JAMB (Nigeria), KCSE (Kenya), BECE and WASSCE (Ghana), Cambridge, IGCSE, and more are actively supported.' },
		{ q: 'Can XYLO help with any subject?', a: 'Maths, English, Sciences, Humanities, Commerce — if it\'s in your curriculum, XYLO can teach it and quiz you on it.' },
		{ q: 'Does XYLO replace my teacher?', a: 'No. XYLO fills the gap when your teacher isn\'t available. Think of it as the senior student who helps after school — available 24/7.' },
		{ q: 'How does the school plan work?', a: 'One subscription covers all your students. You manage invites, see engagement data, and get billed per active student seat each month.' },
		{ q: 'Is student chat private?', a: 'Yes. School admins only see engagement metrics — messages sent, active days, subjects studied. The actual conversations are never visible.' },
	];

	const testimonials = [
		{ quote: 'XYLO explained organic chemistry in a way my teacher never did. I actually get it now.', name: 'Amara T.', role: 'SS3 · Lagos, Nigeria' },
		{ quote: 'I prepped for KCSE maths every evening with XYLO. My grade jumped from C to A–.', name: 'Brian K.', role: 'Form 4 · Nairobi, Kenya' },
		{ quote: 'The dashboard shows exactly who needs help before it becomes a crisis. Invaluable for our teachers.', name: 'Mrs. Adeola F.', role: 'Deputy Principal · Ibadan' },
	];

	let openFaq = $state<number | null>(null);
	function toggleFaq(i: number) { openFaq = openFaq === i ? null : i; }

	onMount(() => {
		// Add lp-js just for the stagger animation trigger
		document.querySelector('.lp')?.classList.add('lp-js');
	});
</script>

<svelte:head>
	<title>XYLO — AI Study Companion for African Students</title>
	<meta name="description" content="XYLO is the AI academic companion built for African students. Curriculum-aligned, emotionally intelligent, always available." />
</svelte:head>

<div class="lp">

<!-- ═══════════════════════════════════════════════════
     § 1  HEADER
════════════════════════════════════════════════════ -->
<SiteHeader activePage="home" />


<!-- ═══════════════════════════════════════════════════
     § 2  HERO
════════════════════════════════════════════════════ -->
<section class="lp-hero">
	<div class="lp-container lp-hero-grid">

		<!-- Text side -->
		<div class="lp-hero-text">
			<p class="lp-eyebrow">AI wey understand your world</p>

			<h1 class="lp-hero-h1">
				Smarter Learning.<br>
				Stronger Students.<br>
				Better Outcomes.
			</h1>

			<p class="lp-hero-body">
				The AI study companion built specifically for African students.
				Knows your curriculum. Guides your sessions.
				Keeps you consistent — and never makes you feel stupid.
			</p>

			<div class="lp-hero-actions">
				<a href="/auth/signup" class="lp-btn-primary lp-btn-lg">
					Start for free
					<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
				<a href="/auth/signup?type=school" class="lp-btn-outline lp-btn-lg">For schools →</a>
			</div>

			<p class="lp-hero-note">No credit card · 20 free messages/day · Cancel anytime</p>
		</div>

		<!-- Chat preview -->
		<div class="lp-hero-visual">
			<div class="lp-chat-card" aria-hidden="true">
				<div class="lp-chat-card-bar">
					<span class="lp-dot lp-dot-r"></span>
					<span class="lp-dot lp-dot-a"></span>
					<span class="lp-dot lp-dot-g"></span>
					<span class="lp-chat-card-label">XYLO · Study Session</span>
				</div>
				<div class="lp-chat-body">
					<div class="lp-msg lp-msg-ai">
						<strong>XYLO:</strong> How far! What do you want to learn today? 🌍
					</div>
					<div class="lp-msg lp-msg-user">
						Help me understand photosynthesis for WAEC
					</div>
					<div class="lp-msg lp-msg-ai">
						<strong>XYLO:</strong> Good choice — photosynthesis is in almost every WAEC Biology paper. Let's break it into three parts: what happens, where it happens, and why it matters. Ready?
					</div>
					<div class="lp-msg lp-msg-user">Yes, let's go!</div>
					<div class="lp-msg lp-msg-ai lp-typing">
						<span></span><span></span><span></span>
					</div>
				</div>
			</div>
		</div>

	</div>
</section>


<!-- ═══════════════════════════════════════════════════
     § 3  CURRICULUM MARQUEE
════════════════════════════════════════════════════ -->
<div class="lp-marquee-section">
	<p class="lp-marquee-label">Curriculum coverage</p>
	<div class="lp-marquee-track-wrap">
		<!-- Row 1: left to right -->
		<div class="lp-marquee-track">
			<div class="lp-marquee-inner">
				{#each ['WAEC', 'NECO', 'JAMB', 'KCSE', 'BECE', 'WASSCE', 'Cambridge', 'IGCSE', 'WAEC', 'NECO', 'JAMB', 'KCSE', 'BECE', 'WASSCE', 'Cambridge', 'IGCSE'] as c}
					<span class="lp-marquee-chip">{c}</span>
				{/each}
			</div>
		</div>
	</div>
</div>


<!-- ═══════════════════════════════════════════════════
     § 4  FEATURES  (bento grid)
════════════════════════════════════════════════════ -->
<section class="lp-section" id="features">
	<div class="lp-container">
		<div class="lp-section-intro lp-reveal">
			<p class="lp-eyebrow">What XYLO does</p>
			<h2 class="lp-h2" style="font-size: clamp(1.75rem, 3vw, 2.5rem);">Six capabilities.<br>One companion.</h2>
		</div>

		<div class="lp-bento lp-reveal">

			<!-- Card 1: Hero — Curriculum-Aligned (spans 2 cols, row 1) -->
			<div class="lp-bento-card lp-bento-a lp-stagger">
				<div class="lp-bento-icon">
					<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
				</div>
				<h3 class="lp-bento-title">Curriculum-Aligned</h3>
				<p class="lp-bento-desc">Knows WAEC, JAMB, KCSE, BECE, and Cambridge by name — not by guess. Every answer is shaped by your actual syllabus.</p>
				<div class="lp-bento-tags">
					{#each ['WAEC', 'JAMB', 'KCSE', 'BECE', 'Cambridge'] as tag}
						<span class="lp-bento-tag">{tag}</span>
					{/each}
				</div>
			</div>

			<!-- Card 2: Study Plans (row 1, col 3) -->
			<div class="lp-bento-card lp-bento-b lp-stagger">
				<div class="lp-bento-icon">
					<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
				</div>
				<h3 class="lp-bento-title">Personalized Study Plans</h3>
				<p class="lp-bento-desc">Give XYLO your exam date. Get a day-by-day plan built around your actual life, not a generic template.</p>
			</div>

			<!-- Card 3: Daily Consistency (row 2, col 1) -->
			<div class="lp-bento-card lp-bento-c lp-stagger">
				<div class="lp-bento-icon">
					<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-6"/></svg>
				</div>
				<h3 class="lp-bento-title">Daily Consistency</h3>
				<p class="lp-bento-desc">Streaks and gentle check-ins that build lasting habits. Not motivation bursts. Real change over time.</p>
			</div>

			<!-- Card 4: Emotionally Intelligent (row 2, cols 2-3) -->
			<div class="lp-bento-card lp-bento-d lp-stagger">
				<div class="lp-bento-icon">
					<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
				</div>
				<h3 class="lp-bento-title">Emotionally Intelligent</h3>
				<p class="lp-bento-desc">Academic pressure is real. XYLO acknowledges how you feel before diving into content. Never judgmental.</p>
			</div>

			<!-- Card 5: Progress Tracking (row 3, cols 1-2) -->
			<div class="lp-bento-card lp-bento-e lp-stagger">
				<div class="lp-bento-icon">
					<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
				</div>
				<h3 class="lp-bento-title">Progress Tracking</h3>
				<p class="lp-bento-desc">See exactly what you've covered, what still needs work, and how your consistency compares week over week.</p>
			</div>

			<!-- Card 6: School Dashboard (row 3, col 3) -->
			<div class="lp-bento-card lp-bento-f lp-stagger">
				<div class="lp-bento-icon">
					<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
				</div>
				<h3 class="lp-bento-title">School Dashboard</h3>
				<p class="lp-bento-desc">Admins see who's engaged and who's struggling — without ever reading a student's private messages.</p>
			</div>

		</div>
	</div>
</section>


<!-- ═══════════════════════════════════════════════════
     § 5  STUDY MODES
════════════════════════════════════════════════════ -->
<section class="lp-section lp-section-warm" id="modes">
	<div class="lp-container lp-split">

		<div class="lp-split-text lp-reveal">
			<p class="lp-eyebrow">Four study modes</p>
			<h2 class="lp-h2">Pick how you want to learn today</h2>
			<p class="lp-body-lg">
				Every session starts with a choice. Tell XYLO what kind of
				help you need — it adapts the entire conversation around that goal.
			</p>
		</div>

		<div class="lp-modes-list lp-reveal">
			{#each [
				{ accent: 'oklch(32% 0.016 55)', label: 'Help me understand this topic', desc: 'Concepts broken down clearly with examples and follow-up questions' },
				{ accent: 'oklch(50% 0.022 60)', label: 'Quiz me on what I know', desc: 'One question at a time, with feedback and a score at the end' },
				{ accent: 'var(--lp-amber)', label: 'Create a study plan for me', desc: 'A structured daily plan based on your exam date and weak areas' },
				{ accent: 'oklch(62% 0.018 65)', label: 'Exam prep mode', desc: 'High-yield topics, past question patterns, and tight summaries' },
			] as m, i}
				<div class="lp-mode-row lp-stagger">
					<div class="lp-mode-index">{String(i + 1).padStart(2, '0')}</div>
					<div class="lp-mode-accent-bar" style="background:{m.accent}"></div>
					<div>
						<p class="lp-mode-label">{m.label}</p>
						<p class="lp-mode-desc">{m.desc}</p>
					</div>
				</div>
			{/each}
		</div>

	</div>
</section>


<!-- ═══════════════════════════════════════════════════
     § 6  HOW IT WORKS
════════════════════════════════════════════════════ -->
<section class="lp-section">
	<div class="lp-container">
		<div class="lp-section-intro lp-reveal">
			<p class="lp-eyebrow">How it works</p>
			<h2 class="lp-h2">Up and studying<br>in four steps</h2>
		</div>

		<div class="lp-steps lp-reveal">
			{#each steps as s}
				<div class="lp-step lp-stagger">
					<div class="lp-step-num">{s.num}</div>
					<h3 class="lp-step-title">{s.title}</h3>
					<p class="lp-step-desc">{s.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>


<!-- ═══════════════════════════════════════════════════
     § 7  TESTIMONIALS  (editorial pullquote)
════════════════════════════════════════════════════ -->
<section class="lp-section lp-section-warm" id="testimonials">
	<div class="lp-container">
		<p class="lp-eyebrow lp-reveal" style="margin-bottom: 3rem">What students say</p>

		<div class="lp-quotes lp-reveal">
			{#each testimonials as t, i}
				<figure class="lp-quote lp-stagger" class:lp-quote-featured={i === 0}>
					<blockquote class="lp-quote-text">"{t.quote}"</blockquote>
					<figcaption class="lp-quote-attr">
						<strong>{t.name}</strong>
						<span>{t.role}</span>
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>
</section>


<!-- ═══════════════════════════════════════════════════
     § 8  FOR SCHOOLS
════════════════════════════════════════════════════ -->
<section class="lp-section" id="schools">
	<div class="lp-container lp-split lp-split-flip">

		<!-- Dark school card -->
		<div class="lp-school-card lp-reveal">
			<div class="lp-school-card-head">
				<p class="lp-school-plan-label">School Plan</p>
				<p class="lp-school-plan-trial">14-day free trial · No credit card</p>
			</div>
			<ul class="lp-school-features">
				{#each [
					'Full AI access for all students',
					'Admin engagement dashboard',
					'CSV reports & data export',
					'Curriculum focus settings',
					'Student management tools',
					'Seat-based billing',
				] as f}
					<li>
						<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
						{f}
					</li>
				{/each}
			</ul>
			<a href="/auth/signup?type=school" class="lp-school-cta">Start free trial →</a>
		</div>

		<!-- Text -->
		<div class="lp-split-text lp-reveal">
			<p class="lp-eyebrow">For Schools & Institutions</p>
			<h2 class="lp-h2">Give every student a personal AI tutor</h2>
			<p class="lp-body-lg">
				One subscription covers all your students. Set your curriculum,
				invite via link, and get real-time engagement data —
				without ever reading private conversations.
			</p>
			<ul class="lp-checklist">
				{#each [
					'Admin dashboard with engagement metrics',
					'Early identification of at-risk students',
					'Student invites via link or email',
					'Seat-based billing — pay only for enrolled students',
					'14-day free trial, no commitment',
				] as item}
					<li>
						<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
						{item}
					</li>
				{/each}
			</ul>
			<a href="/auth/signup?type=school" class="lp-btn-primary lp-btn-lg" style="margin-top: 2rem; display: inline-flex;">
				Register your school
				<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
			</a>
		</div>

	</div>
</section>


<!-- ═══════════════════════════════════════════════════
     § 9  FAQ
════════════════════════════════════════════════════ -->
<section class="lp-section lp-section-warm" id="faq">
	<div class="lp-container lp-faq-layout">

		<div class="lp-faq-header lp-reveal">
			<p class="lp-eyebrow">FAQ</p>
			<h2 class="lp-h2">Common questions, honest answers</h2>
		</div>

		<div class="lp-faq-list">
			{#each faqs as faq, i}
				<div class="lp-faq-item">
					<button
						class="lp-faq-trigger"
						onclick={() => toggleFaq(i)}
						aria-expanded={openFaq === i}
					>
						<span>{faq.q}</span>
						<svg
							class="lp-faq-chevron"
							class:lp-faq-chevron-open={openFaq === i}
							width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<polyline points="6 9 12 15 18 9"/>
						</svg>
					</button>
					<div class="lp-faq-panel" class:lp-faq-panel-open={openFaq === i}>
						<div class="lp-faq-panel-inner">{faq.a}</div>
					</div>
				</div>
			{/each}
		</div>

	</div>
</section>


<!-- ═══════════════════════════════════════════════════
     § 10  FINAL CTA
════════════════════════════════════════════════════ -->
<section class="lp-cta-band">
	<div class="lp-container lp-cta-inner lp-reveal">
		<h2 class="lp-cta-h2">Ready to study smarter?</h2>
		<p class="lp-cta-sub">Join thousands of African students preparing for their exams with XYLO.</p>
		<div class="lp-cta-actions">
			<a href="/auth/signup" class="lp-btn-primary lp-btn-lg">
				Get started free
				<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
			</a>
			<a href="/auth/signup?type=school" class="lp-btn-ghost-dark lp-btn-lg">Register your school</a>
		</div>
	</div>
</section>


<!-- ═══════════════════════════════════════════════════
     § 11  FOOTER
════════════════════════════════════════════════════ -->
<SiteFooter />

</div><!-- /lp -->


<style>
/* ─── Design tokens (scoped to landing page) ─────── */
.lp {
	--lp-cream:        oklch(97.5% 0.018 85);
	--lp-cream-warm:   oklch(94.5% 0.025 80);
	--lp-border:       oklch(87%   0.028 78);
	--lp-ink:          oklch(18%   0.014 50);
	--lp-ink-2:        oklch(40%   0.020 50);
	--lp-ink-3:        oklch(60%   0.016 55);
	--lp-amber:        oklch(72%   0.185 72);
	--lp-amber-dark:   oklch(63%   0.190 70);
	--lp-amber-pale:   oklch(95%   0.045 85);

	font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
	background: var(--lp-cream);
	color: var(--lp-ink);
	min-height: 100dvh;
	overflow-x: hidden;
}

/* ─── Container ─────────────────────────────────── */
.lp-container {
	width: 100%;
	max-width: 72rem;
	margin: 0 auto;
	padding: 0 clamp(1.25rem, 5vw, 3rem);
}

/* ─── Shared typography ──────────────────────────── */
.lp-eyebrow {
	font-size: 0.6875rem;
	font-weight: 800;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: var(--lp-amber);
	margin-bottom: 1.25rem;
	display: block;
}
.lp-h2 {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: clamp(2rem, 4.5vw, 3rem);
	font-weight: 700;
	line-height: 1.1;
	letter-spacing: -0.025em;
	color: var(--lp-ink);
	margin-bottom: 1.5rem;
}
.lp-body-lg {
	font-size: clamp(1rem, 1.5vw, 1.125rem);
	color: var(--lp-ink-2);
	line-height: 1.75;
	max-width: 44ch;
}

/* ─── Buttons ────────────────────────────────────── */
.lp-btn-primary {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1.5rem;
	background: var(--lp-amber);
	color: oklch(14% 0.01 50);
	font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
	font-size: 0.9375rem;
	font-weight: 700;
	border-radius: 999px;
	border: none;
	cursor: pointer;
	text-decoration: none;
	transition: background 0.2s, transform 0.15s;
	white-space: nowrap;
}
.lp-btn-primary:hover {
	background: var(--lp-amber-dark);
	transform: translateY(-1px);
}
.lp-btn-primary:active { transform: scale(0.98); }
.lp-btn-lg { padding: 0.875rem 1.875rem; font-size: 1rem; }

.lp-btn-outline {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1.5rem;
	background: transparent;
	color: var(--lp-ink);
	font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
	font-size: 0.9375rem;
	font-weight: 600;
	border-radius: 999px;
	border: 1.5px solid var(--lp-border);
	cursor: pointer;
	text-decoration: none;
	transition: border-color 0.2s, background 0.2s, transform 0.15s;
	white-space: nowrap;
}
.lp-btn-outline:hover {
	border-color: var(--lp-ink-2);
	background: oklch(95% 0.01 80);
	transform: translateY(-1px);
}
.lp-btn-outline.lp-btn-lg { padding: 0.875rem 1.875rem; font-size: 1rem; }

.lp-btn-ghost {
	display: inline-flex;
	align-items: center;
	padding: 0.625rem 1rem;
	background: transparent;
	color: var(--lp-ink-2);
	font-size: 0.9375rem;
	font-weight: 600;
	border-radius: 999px;
	border: none;
	cursor: pointer;
	text-decoration: none;
	transition: color 0.2s;
}
.lp-btn-ghost:hover { color: var(--lp-ink); }

.lp-btn-ghost-dark {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.875rem 1.875rem;
	background: transparent;
	color: oklch(88% 0.01 85);
	font-size: 1rem;
	font-weight: 600;
	border-radius: 999px;
	border: 1.5px solid oklch(88% 0.01 85 / 0.3);
	cursor: pointer;
	text-decoration: none;
	transition: border-color 0.2s, background 0.2s;
}
.lp-btn-ghost-dark:hover {
	border-color: oklch(88% 0.01 85 / 0.6);
	background: oklch(88% 0.01 85 / 0.08);
}

/* ─── § 2  HERO ──────────────────────────────────── */
.lp-hero {
	padding: clamp(3rem, 6vw, 5rem) 0 clamp(2.5rem, 5vw, 4rem);
	position: relative;
	overflow: hidden;
}
.lp-hero::before {
	content: '';
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(oklch(60% 0 0 / 0.035) 1px, transparent 1px),
		linear-gradient(90deg, oklch(60% 0 0 / 0.035) 1px, transparent 1px);
	background-size: 52px 52px;
	mask-image: radial-gradient(ellipse 70% 80% at 50% 0%, black 10%, transparent 100%);
	-webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 0%, black 10%, transparent 100%);
	pointer-events: none;
}
.lp-hero-grid {
	display: grid;
	grid-template-columns: 1.05fr 0.95fr;
	gap: clamp(2rem, 5vw, 5rem);
	align-items: center;
	position: relative;
}
.lp-hero-text { padding-right: 1rem; }
.lp-hero-h1 {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: clamp(2rem, 3.5vw, 3rem);
	font-weight: 800;
	line-height: 1.08;
	letter-spacing: -0.03em;
	color: var(--lp-ink);
	margin-bottom: 1.25rem;
}
.lp-hero-body {
	font-size: clamp(0.9375rem, 1.2vw, 1.0625rem);
	color: var(--lp-ink-2);
	line-height: 1.75;
	margin-bottom: 1.75rem;
	max-width: 44ch;
}
.lp-hero-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-bottom: 1rem;
}
.lp-hero-note {
	font-size: 0.8125rem;
	color: var(--lp-ink-3);
	font-weight: 500;
}

/* Chat preview card */
.lp-hero-visual {
	display: flex;
	justify-content: flex-end;
	perspective: 1200px;
}
.lp-chat-card {
	width: 100%;
	max-width: 400px;
	background: oklch(99% 0.01 85);
	border: 1px solid var(--lp-border);
	border-radius: 1.25rem;
	overflow: hidden;
	box-shadow:
		0 2px 4px oklch(18% 0.01 50 / 0.04),
		0 16px 40px oklch(18% 0.01 50 / 0.08),
		0 32px 80px oklch(72% 0.18 72 / 0.08);
	transform: perspective(1200px) rotateX(7deg) rotateY(-5deg) rotateZ(1deg);
	transform-origin: center right;
	animation: chat-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes chat-reveal {
	from { opacity: 0; transform: perspective(1200px) translateY(30px) rotateX(18deg) rotateY(-10deg) rotateZ(2deg); }
	to   { opacity: 1; transform: perspective(1200px) rotateX(7deg) rotateY(-5deg) rotateZ(1deg); }
}
.lp-chat-card:hover {
	transform: perspective(1200px) rotateX(2deg) rotateY(-2deg) rotateZ(0deg) scale(1.02);
	box-shadow: 0 24px 60px oklch(18% 0.01 50 / 0.12), 0 48px 100px oklch(72% 0.18 72 / 0.12);
	transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s;
}
.lp-chat-card-bar {
	background: var(--lp-cream-warm);
	border-bottom: 1px solid var(--lp-border);
	padding: 0.875rem 1rem;
	display: flex;
	align-items: center;
	gap: 0.4rem;
}
.lp-dot {
	width: 11px; height: 11px;
	border-radius: 50%;
	border: 1px solid oklch(0% 0 0 / 0.08);
}
.lp-dot-r { background: oklch(65% 0.18 27); }
.lp-dot-a { background: oklch(75% 0.16 75); }
.lp-dot-g { background: oklch(68% 0.18 145); }
.lp-chat-card-label {
	font-size: 0.75rem;
	font-weight: 700;
	color: var(--lp-ink-3);
	margin-left: 0.375rem;
}
.lp-chat-body {
	padding: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 0.875rem;
}
.lp-msg {
	font-size: 0.875rem;
	line-height: 1.6;
	padding: 0.75rem 1rem;
	border-radius: 1rem;
	max-width: 90%;
}
.lp-msg-ai {
	background: var(--lp-cream-warm);
	color: var(--lp-ink-2);
	align-self: flex-start;
	border-bottom-left-radius: 0.25rem;
	border: 1px solid var(--lp-border);
}
.lp-msg-ai strong { color: var(--lp-ink); }
.lp-msg-user {
	background: var(--lp-amber);
	color: oklch(14% 0.01 50);
	align-self: flex-end;
	border-bottom-right-radius: 0.25rem;
	font-weight: 600;
}
.lp-typing {
	display: flex;
	gap: 5px;
	align-items: center;
	padding: 0.875rem 1rem;
	background: var(--lp-cream-warm);
	border: 1px solid var(--lp-border);
}
.lp-typing span {
	width: 7px; height: 7px;
	border-radius: 50%;
	background: var(--lp-ink-3);
	animation: lp-bounce 1.4s ease-in-out infinite;
}
.lp-typing span:nth-child(2) { animation-delay: 0.18s; }
.lp-typing span:nth-child(3) { animation-delay: 0.36s; }
@keyframes lp-bounce {
	0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
	30% { transform: translateY(-4px); opacity: 1; }
}

/* ─── § 3  MARQUEE ───────────────────────────────── */
.lp-marquee-section {
	border-top: 1px solid var(--lp-border);
	border-bottom: 1px solid var(--lp-border);
	background: oklch(95.5% 0.022 82);
	padding: 1.5rem 0;
	overflow: hidden;
}
.lp-marquee-label {
	text-align: center;
	font-size: 0.6rem;
	font-weight: 800;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--lp-ink-3);
	margin-bottom: 0.875rem;
}
.lp-marquee-track-wrap {
	position: relative;
	overflow: hidden;
}
.lp-marquee-track-wrap::before,
.lp-marquee-track-wrap::after {
	content: '';
	position: absolute;
	top: 0; bottom: 0;
	width: 5rem;
	z-index: 2;
	pointer-events: none;
}
.lp-marquee-track-wrap::before {
	left: 0;
	background: linear-gradient(to right, oklch(95.5% 0.022 82), transparent);
}
.lp-marquee-track-wrap::after {
	right: 0;
	background: linear-gradient(to left, oklch(95.5% 0.022 82), transparent);
}
.lp-marquee-track {
	display: flex;
	width: max-content;
	animation: lp-marquee 22s linear infinite;
}
@keyframes lp-marquee {
	from { transform: translateX(0); }
	to   { transform: translateX(-50%); }
}
.lp-marquee-inner {
	display: flex;
	gap: 0.75rem;
	align-items: center;
	padding-right: 0.75rem;
}
.lp-marquee-chip {
	display: inline-flex;
	align-items: center;
	padding: 0.375rem 1.125rem;
	background: var(--lp-cream);
	border: 1px solid var(--lp-border);
	border-radius: 999px;
	font-size: 0.8125rem;
	font-weight: 700;
	color: var(--lp-ink-2);
	letter-spacing: 0.04em;
	white-space: nowrap;
	transition: border-color 0.2s, color 0.2s;
}
.lp-marquee-chip:hover {
	border-color: var(--lp-amber);
	color: var(--lp-amber-dark);
}
@media (prefers-reduced-motion: reduce) {
	.lp-marquee-track { animation: none; }
}

/* ─── Sections ───────────────────────────────────── */
.lp-section {
	padding: clamp(4rem, 8vw, 6.5rem) 0;
}
.lp-section-warm { background: oklch(95.5% 0.022 82); }
.lp-section-intro {
	margin-bottom: clamp(2rem, 4vw, 3rem);
}

/* ─── § 4  BENTO FEATURES ───────────────────────── */
.lp-bento {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-areas:
		"a a b"
		"c d d"
		"e e f";
	gap: 1rem;
}
.lp-bento-a { grid-area: a; background: var(--lp-amber-pale); }
.lp-bento-b { grid-area: b; }
.lp-bento-c { grid-area: c; }
.lp-bento-d { grid-area: d; }
.lp-bento-e { grid-area: e; }
.lp-bento-f { grid-area: f; }
.lp-bento-card {
	background: oklch(99% 0.01 85);
	border: 1px solid var(--lp-border);
	border-radius: 1.25rem;
	padding: 2rem;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	position: relative;
	overflow: hidden;
	transition: box-shadow 0.25s, border-color 0.25s, transform 0.25s;
}
.lp-bento-card::before {
	content: '';
	position: absolute;
	inset: 0;
	background: radial-gradient(circle at 0% 0%, oklch(72% 0.185 72 / 0.07), transparent 60%);
	opacity: 0;
	transition: opacity 0.3s;
	pointer-events: none;
}
.lp-bento-card:hover {
	border-color: oklch(87% 0.05 78);
	box-shadow: 0 8px 32px oklch(18% 0.014 50 / 0.07);
	transform: translateY(-2px);
}
.lp-bento-card:hover::before { opacity: 1; }
.lp-bento-icon {
	width: 44px;
	height: 44px;
	background: var(--lp-amber-pale);
	border: 1px solid oklch(87% 0.05 78);
	border-radius: 0.75rem;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--lp-amber-dark);
	flex-shrink: 0;
	margin-bottom: 0.25rem;
}
.lp-bento-title {
	font-size: 1.0625rem;
	font-weight: 700;
	color: var(--lp-ink);
	line-height: 1.3;
}
.lp-bento-hero .lp-bento-title { font-size: 1.25rem; }
.lp-bento-desc {
	font-size: 0.9375rem;
	color: var(--lp-ink-2);
	line-height: 1.7;
	flex: 1;
}
.lp-bento-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.375rem;
	margin-top: 0.5rem;
}
.lp-bento-tag {
	padding: 0.2rem 0.625rem;
	background: var(--lp-amber-pale);
	border: 1px solid oklch(87% 0.06 80);
	border-radius: 999px;
	font-size: 0.6875rem;
	font-weight: 700;
	color: var(--lp-amber-dark);
	letter-spacing: 0.04em;
}

/* ─── § 5  STUDY MODES ───────────────────────────── */
.lp-split {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: clamp(2.5rem, 5vw, 6rem);
	align-items: center;
}
.lp-split-flip { direction: rtl; }
.lp-split-flip > * { direction: ltr; }
.lp-split-text {}

.lp-modes-list { display: flex; flex-direction: column; gap: 0; }
.lp-mode-row {
	display: flex;
	align-items: flex-start;
	gap: 1.125rem;
	padding: 1.25rem 0;
	border-bottom: 1px solid var(--lp-border);
	position: relative;
}
.lp-mode-row:last-child { border-bottom: none; }
.lp-mode-index {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: 1.25rem;
	font-weight: 300;
	color: var(--lp-ink-3);
	flex-shrink: 0;
	width: 2rem;
	line-height: 1.4;
}
.lp-mode-accent-bar {
	width: 3px;
	height: 100%;
	min-height: 40px;
	border-radius: 2px;
	flex-shrink: 0;
	margin-top: 0.25rem;
}
.lp-mode-label {
	font-size: 0.9375rem;
	font-weight: 700;
	color: var(--lp-ink);
	margin-bottom: 0.25rem;
	line-height: 1.4;
}
.lp-mode-desc {
	font-size: 0.875rem;
	color: var(--lp-ink-2);
	line-height: 1.65;
}

/* ─── § 6  STEPS ─────────────────────────────────── */
.lp-steps {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 0;
	border-top: 1px solid var(--lp-border);
}
.lp-step {
	padding: 2.5rem 2rem 2.5rem 0;
	border-right: 1px solid var(--lp-border);
	position: relative;
}
.lp-step::before {
	content: '';
	position: absolute;
	top: -5px;
	left: 0;
	width: 9px;
	height: 9px;
	border-radius: 50%;
	background: var(--lp-border);
	border: 2px solid var(--lp-cream);
	transform: translateY(-50%);
}
.lp-step:first-child::before {
	background: var(--lp-amber);
	box-shadow: 0 0 0 3px var(--lp-amber-pale);
}
.lp-step:last-child { border-right: none; }
.lp-step:not(:first-child) { padding-left: 2rem; }
.lp-step-num {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: 3rem;
	font-weight: 300;
	color: var(--lp-amber);
	line-height: 1;
	margin-bottom: 1.25rem;
	display: block;
}
.lp-step-title {
	font-size: 1.0625rem;
	font-weight: 700;
	color: var(--lp-ink);
	margin-bottom: 0.625rem;
	line-height: 1.3;
}
.lp-step-desc {
	font-size: 0.9rem;
	color: var(--lp-ink-2);
	line-height: 1.7;
}

/* ─── § 7  TESTIMONIALS ──────────────────────────── */
.lp-quotes {
	display: grid;
	grid-template-columns: 1.4fr 1fr 1fr;
	gap: 0;
	border-top: 1px solid var(--lp-border);
}
.lp-quote {
	padding: 2.5rem 2rem 2.5rem 0;
	border-right: 1px solid var(--lp-border);
}
.lp-quote:last-child { border-right: none; }
.lp-quote:not(:first-child) { padding-left: 2rem; }
.lp-quote-featured {
	position: relative;
	padding-top: 4rem;
}
.lp-quote-featured::before {
	content: '\201C';
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: 7rem;
	line-height: 1;
	font-weight: 300;
	color: var(--lp-amber);
	position: absolute;
	top: 0;
	left: -0.125rem;
}
.lp-quote-featured .lp-quote-text {
	font-size: clamp(1.25rem, 2.2vw, 1.75rem);
	line-height: 1.45;
	font-style: italic;
}
.lp-quote-text {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-style: italic;
	font-size: 0.9375rem;
	line-height: 1.65;
	color: var(--lp-ink);
	margin-bottom: 1.5rem;
}
.lp-quote-attr {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}
.lp-quote-attr strong {
	font-size: 0.875rem;
	font-weight: 700;
	color: var(--lp-ink);
}
.lp-quote-attr span {
	font-size: 0.8125rem;
	color: var(--lp-ink-3);
}

/* ─── § 8  SCHOOLS ───────────────────────────────── */
.lp-school-card {
	background: oklch(16% 0.014 50);
	color: oklch(93% 0.01 85);
	border-radius: 1.5rem;
	padding: clamp(2rem, 4vw, 2.75rem);
	display: flex;
	flex-direction: column;
}
.lp-school-card-head { margin-bottom: 2rem; }
.lp-school-plan-label {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: 1.375rem;
	font-weight: 700;
	color: oklch(93% 0.01 85);
	margin-bottom: 0.375rem;
}
.lp-school-plan-trial {
	font-size: 0.8125rem;
	color: oklch(60% 0.01 85);
}
.lp-school-features {
	list-style: none;
	padding: 0;
	margin: 0 0 2rem 0;
	display: flex;
	flex-direction: column;
	gap: 0.875rem;
}
.lp-school-features li {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	font-size: 0.9rem;
	color: oklch(78% 0.01 85);
}
.lp-school-features li svg { color: var(--lp-amber); flex-shrink: 0; }
.lp-school-cta {
	display: block;
	width: 100%;
	text-align: center;
	padding: 0.875rem;
	background: var(--lp-amber);
	color: oklch(14% 0.01 50);
	font-weight: 700;
	font-size: 0.9375rem;
	border-radius: 0.875rem;
	text-decoration: none;
	transition: background 0.2s;
	margin-top: auto;
}
.lp-school-cta:hover { background: var(--lp-amber-dark); }
.lp-checklist {
	list-style: none;
	padding: 0;
	margin: 1.25rem 0 0;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}
.lp-checklist li {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	font-size: 0.9375rem;
	color: var(--lp-ink-2);
	line-height: 1.5;
}
.lp-checklist li svg { color: var(--lp-amber); flex-shrink: 0; margin-top: 0.2rem; }

/* ─── § 9  FAQ ───────────────────────────────────── */
.lp-faq-layout {
	display: grid;
	grid-template-columns: 1fr 1.6fr;
	gap: clamp(2rem, 6vw, 6rem);
	align-items: flex-start;
}
.lp-faq-header { position: sticky; top: 5rem; }
.lp-faq-list { display: flex; flex-direction: column; }
.lp-faq-item { border-bottom: 1px solid var(--lp-border); }
.lp-faq-item:first-child { border-top: 1px solid var(--lp-border); }
.lp-faq-trigger {
	width: 100%;
	text-align: left;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 1.25rem 0;
	background: none;
	border: none;
	cursor: pointer;
	font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
	font-size: 0.9375rem;
	font-weight: 600;
	color: var(--lp-ink);
	transition: color 0.15s;
}
.lp-faq-trigger:hover { color: var(--lp-amber); }
.lp-faq-chevron {
	flex-shrink: 0;
	color: var(--lp-ink-3);
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.lp-faq-chevron-open { transform: rotate(180deg); }
.lp-faq-panel {
	display: grid;
	grid-template-rows: 0fr;
	transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.lp-faq-panel-open { grid-template-rows: 1fr; }
.lp-faq-panel-inner {
	overflow: hidden;
	font-size: 0.9375rem;
	color: var(--lp-ink-2);
	line-height: 1.75;
	padding-bottom: 0;
}
.lp-faq-panel-open .lp-faq-panel-inner { padding-bottom: 1.25rem; }

/* ─── § 10  CTA BAND ─────────────────────────────── */
.lp-cta-band {
	background: oklch(16% 0.014 50);
	padding: clamp(4rem, 8vw, 6rem) 0;
}
.lp-cta-inner {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
.lp-cta-h2 {
	font-family: 'Fraunces', Georgia, serif;
	font-optical-sizing: auto;
	font-size: clamp(2rem, 4vw, 3rem);
	font-weight: 700;
	line-height: 1.1;
	letter-spacing: -0.025em;
	color: oklch(96% 0.012 85);
	margin-bottom: 1rem;
}
.lp-cta-sub {
	font-size: clamp(1rem, 1.5vw, 1.125rem);
	color: oklch(60% 0.01 85);
	margin-bottom: 2.25rem;
	max-width: 44ch;
	line-height: 1.7;
}
.lp-cta-actions { display: flex; flex-wrap: wrap; gap: 0.875rem; }

/* ─── Responsive ─────────────────────────────────── */

/* ── Mid-size laptops & wide tablets ──────────────── */
@media (max-width: 1024px) {
	.lp-hero-grid {
		grid-template-columns: 1fr 1fr;
		gap: clamp(1.5rem, 3vw, 3rem);
	}
	.lp-hero-h1 { font-size: clamp(2.25rem, 4.5vw, 3.5rem); }
	.lp-chat-card { max-width: 340px; }
}

/* ── Tablet ────────────────────────────────────────── */
@media (max-width: 768px) {
	/* Hero — stacked, centered */
	.lp-hero {
		padding: clamp(3rem, 8vw, 5rem) 0 clamp(2.5rem, 6vw, 4rem);
	}
	.lp-hero-grid {
		grid-template-columns: 1fr;
		gap: 2.5rem;
		text-align: center;
	}
	.lp-hero-text {
		padding-right: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.lp-eyebrow { margin-left: auto; margin-right: auto; }
	.lp-hero-body { max-width: 52ch; text-align: center; }
	.lp-hero-h1 { font-size: clamp(2.125rem, 6vw, 3rem); }
	.lp-hero-actions {
		justify-content: center;
		gap: 0.75rem;
	}
	.lp-hero-note { text-align: center; }

	/* Chat card — flat, centered, slightly smaller */
	.lp-hero-visual { justify-content: center; }
	.lp-chat-card {
		max-width: 420px;
		width: 100%;
		transform: none;
		animation: none;
		opacity: 1;
	}
	.lp-chat-card:hover { transform: none; }

	/* Bento — 2 cols on tablet */
	.lp-bento {
		grid-template-columns: repeat(2, 1fr);
		grid-template-areas:
			"a a"
			"b c"
			"d d"
			"e e"
			"f f";
	}

	.lp-split {
		grid-template-columns: 1fr;
	}
	.lp-split-flip { direction: ltr; }

	.lp-steps {
		grid-template-columns: 1fr 1fr;
	}
	.lp-step { padding: 1.75rem 1rem 1.75rem 0; }
	.lp-step:nth-child(even) { border-right: none; padding-left: 1rem; }

	.lp-quotes {
		grid-template-columns: 1fr;
	}
	.lp-quote { border-right: none; padding: 2rem 0; }
	.lp-quote:first-child { padding-top: 0; }

	.lp-faq-layout {
		grid-template-columns: 1fr;
	}
	.lp-faq-header { position: static; }

	.lp-cta-inner { align-items: flex-start; }
}

/* ── Mobile ────────────────────────────────────────── */
@media (max-width: 480px) {
	/* Hero — compact, stacked, full-width buttons */
	.lp-hero {
		padding: 2.5rem 0 2rem;
	}
	.lp-hero-h1 {
		font-size: clamp(1.875rem, 8vw, 2.5rem);
		margin-bottom: 1rem;
	}
	.lp-hero-body {
		font-size: 1rem;
		margin-bottom: 1.75rem;
	}
	.lp-hero-actions {
		flex-direction: column;
		align-items: stretch;
		width: 100%;
		max-width: 320px;
	}
	.lp-hero-actions > * {
		justify-content: center;
		width: 100%;
		text-align: center;
	}

	/* Compact chat card on mobile */
	.lp-chat-card { max-width: 100%; }
	.lp-chat-body { padding: 1rem; gap: 0.625rem; }
	.lp-msg { font-size: 0.8125rem; padding: 0.625rem 0.875rem; }
	/* Hide the long AI response on mobile to keep card compact */
	.lp-msg-ai:nth-child(3) { display: none; }

	.lp-steps { grid-template-columns: 1fr; }
	.lp-step { border-right: none; padding: 1.5rem 0; }

	/* Bento — single column on mobile */
	.lp-bento {
		grid-template-columns: 1fr;
		grid-template-areas:
			"a" "b" "c" "d" "e" "f";
	}

	.lp-cta-actions { flex-direction: column; }

	.lp-quotes { border-top: none; }
}

/* ─── Scroll reveals — CSS-only, always visible ── */
@keyframes lp-fade-up {
	from { opacity: 0; transform: translateY(20px); }
	to   { opacity: 1; transform: translateY(0); }
}
@keyframes lp-fade-up-sm {
	from { opacity: 0; transform: translateY(14px); }
	to   { opacity: 1; transform: translateY(0); }
}

.lp-reveal {
	animation: lp-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.lp-stagger {
	animation: lp-fade-up-sm 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Stagger delays for child items */
.lp-stagger:nth-child(1) { animation-delay: 0.05s; }
.lp-stagger:nth-child(2) { animation-delay: 0.13s; }
.lp-stagger:nth-child(3) { animation-delay: 0.21s; }
.lp-stagger:nth-child(4) { animation-delay: 0.29s; }
.lp-stagger:nth-child(5) { animation-delay: 0.37s; }
.lp-stagger:nth-child(6) { animation-delay: 0.45s; }

/* ─── Reduced motion ─────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
	.lp-reveal, .lp-stagger {
		animation: none !important;
		opacity: 1 !important;
		transform: none !important;
	}
	.lp-chat-card { animation: none; opacity: 1; transform: none; }
	.lp-typing span { animation: none; opacity: 0.5; }
	* { transition-duration: 0.01ms !important; }
}
</style>
