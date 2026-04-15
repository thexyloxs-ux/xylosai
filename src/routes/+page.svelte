<script lang="ts">
	import { goto } from '$app/navigation';
	import { isLoggedIn, profile } from '$lib/stores/auth';
	import './landing.css';

	$effect(() => {
		if ($isLoggedIn && $profile) {
			goto($profile.role === 'school_admin' ? '/dashboard' : '/chat');
		}
	});

	const features = [
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
			title: 'Curriculum-Aligned',
			desc: 'Built around WAEC, JAMB, KCSE, BECE, and Cambridge. XYLO knows your syllabus and exams by name — not by guess.'
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
			title: 'Personalized Study Plans',
			desc: 'Tell XYLO your exam date and subjects. Get a structured daily plan built around your real life — not a generic template.'
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
			title: 'Daily Consistency',
			desc: 'Study streaks and gentle check-ins that build lasting habits — not just motivation bursts that fade after a week.'
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
			title: 'Emotionally Intelligent',
			desc: 'Academic pressure is real. XYLO acknowledges how you feel before diving into content. Never judgmental. Always encouraging.'
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
			title: 'Progress Tracking',
			desc: 'See exactly what you\'ve covered, what needs more work, and how your consistency compares week over week.'
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
			title: 'School Dashboard',
			desc: 'Admins see who\'s engaged, who\'s struggling, and subject trends — without ever reading a student\'s private chat.'
		}
	];

	const steps = [
		{ num: '01', title: 'Sign up free', desc: 'Create your account in under a minute. No credit card. 20 AI messages per day on the house.' },
		{ num: '02', title: 'Set your profile', desc: 'Tell XYLO your level, curriculum, and subjects. This personalizes every single response you get.' },
		{ num: '03', title: 'Start a session', desc: 'Pick a study mode — understand, quiz, plan, or exam prep — and let XYLO guide the session.' },
		{ num: '04', title: 'Build consistency', desc: 'Come back daily. Your history is saved. XYLO remembers where you left off and adapts over time.' }
	];

	const faqs = [
		{ q: 'Is XYLO really free?', a: 'Yes — 20 messages per day, no credit card needed. Upgrade to unlimited anytime for a small monthly fee.' },
		{ q: 'Which curriculums does XYLO support?', a: 'WAEC, NECO, JAMB (Nigeria), KCSE (Kenya), BECE/WASSCE (Ghana), Cambridge, and more. You set it during onboarding.' },
		{ q: 'Can XYLO help with any subject?', a: 'Yes. Maths, English, Sciences, Humanities, Commerce — if it\'s in your curriculum, XYLO can teach it.' },
		{ q: 'Does XYLO replace my teacher?', a: 'No — and it\'s not trying to. XYLO fills the gap when your teacher isn\'t available. It\'s the senior who helps after school.' },
		{ q: 'How does the school plan work?', a: 'One subscription covers all your students. You manage invites, see engagement data, and get billed per active student seat.' },
		{ q: 'Is student chat private?', a: 'Yes. Admins can only see engagement data (messages sent, active days, subjects studied) — never the actual conversation content.' }
	];

	const stats = [
		{ value: 'WAEC · JAMB', label: 'KCSE · BECE · Cambridge' },
		{ value: '20 msg/day', label: 'Free tier, no card needed' },
		{ value: '14 days', label: 'Free school trial' },
		{ value: '6+ languages', label: 'English, Pidgin, Swahili & more' }
	];

	const testimonials = [
		{ quote: 'XYLO explained organic chemistry in a way my teacher never did. I actually get it now.', name: 'Amara T.', role: 'SS3, Lagos, Nigeria' },
		{ quote: 'I prepped for KCSE maths every evening with XYLO. My grade jumped from C to A–.', name: 'Brian K.', role: 'Form 4, Nairobi, Kenya' },
		{ quote: 'The admin dashboard shows exactly who needs help before it becomes a crisis. Invaluable.', name: 'Mrs. Adeola F.', role: 'Deputy Principal, Ibadan' }
	];

	let openFaq = $state<number | null>(null);
	function toggleFaq(i: number) { openFaq = openFaq === i ? null : i; }
</script>

<svelte:head>
	<title>XYLO — AI Study Companion for African Students</title>
	<meta name="description" content="XYLO is the AI academic companion built for African students. Curriculum-aligned, emotionally intelligent, always available." />
</svelte:head>

<!-- ────────────────────── WRAPPER (light mode always) ────────────────────── -->
<div class="aw-page">

<!-- ── HEADER ────────────────────────────────────────────────────────────── -->
<header class="aw-header">
	<div class="aw-container aw-header-inner">
		<a href="/" class="aw-logo">XYLO</a>
		<nav class="aw-nav" aria-label="Main navigation">
			<a href="#features">Features</a>
			<a href="#schools">Schools</a>
			<a href="/pricing">Pricing</a>
			<a href="#faq">FAQ</a>
		</nav>
		<div class="aw-header-ctas">
			{#if $isLoggedIn}
				<a href="/chat" class="aw-btn aw-btn-primary">Open XYLO</a>
			{:else}
				<a href="/auth/login" class="aw-btn aw-btn-ghost">Sign in</a>
				<a href="/auth/signup" class="aw-btn aw-btn-primary">Get started free</a>
			{/if}
		</div>
	</div>
</header>

<!-- ── HERO ──────────────────────────────────────────────────────────────── -->
<section class="aw-hero">
	<div class="aw-container">
		<div class="aw-hero-content">
			<p class="aw-tagline">AI wey understand your world 🌍</p>
			<h1 class="aw-hero-h1">
				Smarter Learning.<br />
				<span class="aw-gradient-text">Stronger Students.</span><br />
				Better Outcomes.
			</h1>
			<p class="aw-hero-sub">
				The AI study companion built specifically for African students.
				Knows your curriculum. Guides your sessions.
				Keeps you consistent — and never makes you feel stupid.
			</p>
			<div class="aw-hero-btns">
				<a href="/auth/signup" class="aw-btn aw-btn-primary aw-btn-lg">
					Start for free
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
				<a href="/auth/signup?type=school" class="aw-btn aw-btn-secondary aw-btn-lg">For schools →</a>
			</div>
			<p class="aw-hero-note">No credit card · 20 free messages/day · Cancel anytime</p>
		</div>

		<!-- Hero visual — curriculum badges -->
		<div class="aw-hero-visual">
			<div class="aw-chat-preview">
				<div class="aw-chat-header">
					<span class="aw-chat-dot green"></span>
					<span class="aw-chat-dot amber"></span>
					<span class="aw-chat-dot red"></span>
					<span class="aw-chat-title">XYLO — Study Session</span>
				</div>
				<div class="aw-chat-body">
					<div class="aw-msg aw-msg-ai">
						<strong>XYLO:</strong> How far! What do you want to learn today? 🌍
					</div>
					<div class="aw-msg aw-msg-user">Help me understand photosynthesis for WAEC</div>
					<div class="aw-msg aw-msg-ai">
						<strong>XYLO:</strong> Good choice — photosynthesis comes up in almost every WAEC Biology paper. Let's break it down in three parts: what happens, where it happens, and why it matters. Ready?
					</div>
					<div class="aw-msg aw-msg-user">Yes, let's go!</div>
					<div class="aw-msg aw-msg-ai aw-typing">
						<span></span><span></span><span></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ── CURRICULUM STRIP ──────────────────────────────────────────────────── -->
<div class="aw-strip">
	<div class="aw-container aw-strip-inner">
		<span class="aw-strip-label">Supports:</span>
		{#each ['WAEC', 'NECO', 'JAMB', 'KCSE', 'BECE', 'WASSCE', 'Cambridge', 'IGCSE'] as c}
			<span class="aw-badge">{c}</span>
		{/each}
	</div>
</div>

<!-- ── FEATURES ──────────────────────────────────────────────────────────── -->
<section class="aw-section" id="features">
	<div class="aw-container">
		<div class="aw-section-header">
			<p class="aw-eyebrow">What XYLO does</p>
			<h2 class="aw-section-h2">Everything a student needs. One companion.</h2>
			<p class="aw-section-sub">Six capabilities, one goal: make you better at the subjects that matter most to you.</p>
		</div>
		<div class="aw-features-grid">
			{#each features as f}
				<div class="aw-feature-card">
					<div class="aw-feature-icon">{@html f.icon}</div>
					<h3>{f.title}</h3>
					<p>{f.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── STUDY MODES (content alternating) ─────────────────────────────────── -->
<section class="aw-section aw-section-alt">
	<div class="aw-container aw-content-row">
		<div class="aw-content-text">
			<p class="aw-eyebrow">Four study modes</p>
			<h2 class="aw-section-h2">Pick how you want to learn today</h2>
			<p class="aw-section-sub">
				Every session starts with a choice. Tell XYLO what kind of help you need
				and it adapts the entire conversation around that goal.
			</p>
			<div class="aw-modes-list">
				{#each [
					{ color: '#3b82f6', label: 'Help me understand this topic', desc: 'Concepts broken down clearly with examples and follow-up questions' },
					{ color: '#8b5cf6', label: 'Quiz me on what I know', desc: 'One question at a time, with feedback and a score at the end' },
					{ color: '#f59e0b', label: 'Create a study plan for me', desc: 'A structured daily plan based on your exam date and weak areas' },
					{ color: '#22c55e', label: 'Exam prep mode', desc: 'High-yield topics, past question patterns, and tight summaries' }
				] as m}
					<div class="aw-mode-item">
						<div class="aw-mode-dot" style="background:{m.color}"></div>
						<div>
							<div class="aw-mode-label">{m.label}</div>
							<div class="aw-mode-desc">{m.desc}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="aw-content-visual">
			<div class="aw-mode-cards">
				{#each [
					{ emoji: '📖', label: 'Understand', color: '#3b82f6' },
					{ emoji: '✏️', label: 'Quiz Me', color: '#8b5cf6' },
					{ emoji: '📅', label: 'Study Plan', color: '#f59e0b' },
					{ emoji: '🎯', label: 'Exam Prep', color: '#22c55e' }
				] as mc}
					<div class="aw-mode-card-item" style="--mc: {mc.color}">
						<span class="aw-mc-emoji">{mc.emoji}</span>
						<span class="aw-mc-label">{mc.label}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- ── HOW IT WORKS ──────────────────────────────────────────────────────── -->
<section class="aw-section">
	<div class="aw-container">
		<div class="aw-section-header">
			<p class="aw-eyebrow">How it works</p>
			<h2 class="aw-section-h2">Up and studying in minutes</h2>
		</div>
		<div class="aw-steps-grid">
			{#each steps as s, i}
				<div class="aw-step">
					<div class="aw-step-num">{s.num}</div>
					{#if i < steps.length - 1}
						<div class="aw-step-connector"></div>
					{/if}
					<h3>{s.title}</h3>
					<p>{s.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>



<!-- ── TESTIMONIALS ──────────────────────────────────────────────────────── -->
<section class="aw-section aw-section-alt">
	<div class="aw-container">
		<div class="aw-section-header">
			<p class="aw-eyebrow">What students say</p>
			<h2 class="aw-section-h2">Loved by students and educators across Africa</h2>
		</div>
		<div class="aw-testimonials-grid">
			{#each testimonials as t}
				<div class="aw-testimonial">
					<div class="aw-stars">★★★★★</div>
					<blockquote>"{t.quote}"</blockquote>
					<div class="aw-author">
						<strong>{t.name}</strong>
						<span>{t.role}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── FOR SCHOOLS ───────────────────────────────────────────────────────── -->
<section class="aw-section" id="schools">
	<div class="aw-container aw-content-row aw-content-row-reverse">
		<div class="aw-content-text">
			<p class="aw-eyebrow">For Schools & Institutions</p>
			<h2 class="aw-section-h2">Give every student a personal AI tutor</h2>
			<p class="aw-section-sub">
				One school subscription covers all your students.
				Set your curriculum, invite via link, and get real-time engagement data
				— without ever reading private conversations.
			</p>
			<ul class="aw-check-list">
				{#each [
					'Admin dashboard with engagement metrics',
					'Early identification of at-risk students',
					'Student invites via link or email',
					'Seat-based billing — pay only for enrolled students',
					'14-day free trial, no commitment'
				] as item}
					<li><span class="aw-check">✓</span>{item}</li>
				{/each}
			</ul>
			<div class="aw-hero-btns">
				<a href="/auth/signup?type=school" class="aw-btn aw-btn-primary aw-btn-lg">
					Register your school
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
			</div>
		</div>
		<div class="aw-school-card">
			<div class="aw-school-card-top">
				<div class="aw-school-icon">🏫</div>
				<div>
					<div class="aw-school-name">School Plan</div>
					<div class="aw-school-sub">14-day free trial · No credit card</div>
				</div>
			</div>
			{#each ['Full AI access for all students', 'Admin engagement dashboard', 'CSV reports & data export', 'Curriculum focus settings', 'Student management tools', 'Seat-based Stripe billing'] as f}
				<div class="aw-school-feature"><span class="aw-check green">✓</span>{f}</div>
			{/each}
			<a href="/auth/signup?type=school" class="aw-school-cta">Start free trial →</a>
		</div>
	</div>
</section>

<!-- ── FAQ ───────────────────────────────────────────────────────────────── -->
<section class="aw-section aw-section-alt" id="faq">
	<div class="aw-container aw-faq-wrap">
		<div class="aw-section-header">
			<p class="aw-eyebrow">FAQ</p>
			<h2 class="aw-section-h2">Common questions answered</h2>
		</div>
		<div class="aw-faq-list">
			{#each faqs as faq, i}
				<div class="aw-faq-item">
					<button class="aw-faq-q" onclick={() => toggleFaq(i)} aria-expanded={openFaq === i}>
						<span>{faq.q}</span>
						<svg class="aw-faq-arrow" class:open={openFaq === i} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
					</button>
					{#if openFaq === i}
						<div class="aw-faq-a">{faq.a}</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>




<!-- ── FOOTER ─────────────────────────────────────────────────────────────── -->
<footer class="aw-footer">
	<div class="aw-container">
		<div class="aw-footer-inner">
			<!-- Brand column -->
			<div class="aw-footer-brand">
				<div class="aw-logo">XYLO</div>
				<p>The AI study companion built for African students. Curriculum-aligned, emotionally intelligent, and always available.</p>
				<div class="aw-footer-social">
					<a href="https://twitter.com" aria-label="Twitter" title="Twitter">𝕏</a>
					<a href="https://instagram.com" aria-label="Instagram" title="Instagram">Ig</a>
					<a href="https://linkedin.com" aria-label="LinkedIn" title="LinkedIn">in</a>
				</div>
			</div>

			<!-- Product column -->
			<div>
				<p class="aw-footer-col-title">Product</p>
				<a href="/pricing">Pricing</a>
				<a href="#features">Features</a>
				<a href="#schools">For Schools</a>
				<a href="#faq">FAQ</a>
			</div>

			<!-- Account column -->
			<div>
				<p class="aw-footer-col-title">Account</p>
				<a href="/auth/login">Sign in</a>
				<a href="/auth/signup">Get started free</a>
				<a href="/auth/signup?type=school">School signup</a>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="aw-footer-copy">
			© 2025 Xyloxs Ltd · AI wey understand your world 🌍
		</div>
	</div>
</footer>


</div>


