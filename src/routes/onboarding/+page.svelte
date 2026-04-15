<script lang="ts">
	import type { User } from '@supabase/supabase-js';
	import { goto } from '$app/navigation';
	import '../landing.css';

	const { data } = $props<{ data: App.PageData }>();

	const supabase = data.supabase;
	const user     = data.user as User;
	const profile  = data.profile;

	const role         = profile?.role ?? (user.user_metadata?.role as string | undefined) ?? 'individual';
	const isSchoolAdmin = role === 'school_admin';
	const meta          = user.user_metadata as Record<string, string>;

	// ── Step state ────────────────────────────────────────────────────────────────
	let step = $state(1);

	const TOTAL_STEPS  = isSchoolAdmin ? 3 : 4;
	const stepNumbers  = $derived(Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1));
	const progressPct  = $derived(((step - 1) / (TOTAL_STEPS - 1)) * 100);

	const isAutoStep = $derived(
		isSchoolAdmin ? step === 2 || step === 3 : step === 1 || step === 2 || step === 4,
	);

	// ── Field state ───────────────────────────────────────────────────────────────
	let schoolName      = $state(meta.school_name ?? '');
	let country         = $state(meta.country ?? '');
	let curriculum      = $state('');
	let studentCount    = $state('');
	let level           = $state('');
	let selectedSubjects = $state<string[]>([]);
	let challenge       = $state('');

	let saving = $state(false);
	let error  = $state('');

	// ── Content ───────────────────────────────────────────────────────────────────
	const LEVELS = [
		{ value: 'primary',      label: 'Primary School',   icon: '📚' },
		{ value: 'jss',          label: 'Junior Secondary',  icon: '✏️' },
		{ value: 'sss',          label: 'Senior Secondary',  icon: '🎓' },
		{ value: 'university',   label: 'University',        icon: '🏛️' },
		{ value: 'professional', label: 'Professional',      icon: '💼' },
	] as const;

	const CURRICULA = [
		{ value: 'WAEC',      label: 'WAEC',      sub: 'West Africa' },
		{ value: 'KCSE',      label: 'KCSE',      sub: 'Kenya' },
		{ value: 'BECE',      label: 'BECE',      sub: 'Ghana' },
		{ value: 'Cambridge', label: 'Cambridge', sub: 'International' },
		{ value: 'Other',     label: 'Other',     sub: 'Different system' },
	] as const;

	const SUBJECTS: Record<string, readonly string[]> = {
		WAEC:      ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Government', 'Literature', 'Geography', 'Commerce', 'Accounting', 'Agriculture', 'Further Math', 'CRS / IRS'],
		KCSE:      ['English', 'Kiswahili', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'CRE / IRE', 'Business', 'Agriculture', 'Computer'],
		BECE:      ['English', 'Mathematics', 'Integrated Science', 'Social Studies', 'French', 'RME', 'BDT', 'ICT'],
		Cambridge: ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Business', 'Economics', 'CompSci', 'French', 'Spanish'],
		Other:     ['English', 'Mathematics', 'Sciences', 'Humanities', 'Social Studies', 'Arts', 'ICT', 'Business', 'Languages'],
	};

	const CHALLENGES = [
		{ value: 'consistency',   label: 'Staying consistent',    icon: '⏰' },
		{ value: 'understanding', label: 'Understanding concepts', icon: '💡' },
		{ value: 'exam_pressure', label: 'Exam pressure',          icon: '😰' },
		{ value: 'motivation',    label: 'Staying motivated',      icon: '🔋' },
	] as const;

	const STUDENT_COUNTS = ['1–15', '16–30', '31–60', '61–100', '100+'] as const;
	const COUNTRIES = ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Tanzania', 'Uganda', 'Rwanda', 'Senegal', 'Ivory Coast', 'Cameroon', 'Ethiopia', 'Other'] as const;
	const SEAT_LIMIT: Record<string, number> = { '1–15': 15, '16–30': 30, '31–60': 60, '61–100': 100, '100+': 200 };

	const subjectList = $derived(SUBJECTS[curriculum] ?? SUBJECTS.Other);
	const stepTitle = $derived(isSchoolAdmin ? (['School Info', 'Curriculum', 'Students'][step - 1]) : (['Your Level', 'Curriculum', 'Subjects', 'Challenge'][step - 1]));

	function canProceed(): boolean {
		if (isSchoolAdmin) {
			if (step === 1) return schoolName.trim().length > 0 && country.length > 0;
			if (step === 2) return curriculum.length > 0;
			if (step === 3) return studentCount.length > 0;
		} else {
			if (step === 1) return level.length > 0;
			if (step === 2) return curriculum.length > 0;
			if (step === 3) return selectedSubjects.length > 0;
			if (step === 4) return challenge.length > 0;
		}
		return false;
	}

	function toggleSubject(subject: string) {
		if (selectedSubjects.includes(subject)) {
			selectedSubjects = selectedSubjects.filter(s => s !== subject);
		} else if (selectedSubjects.length < 6) {
			selectedSubjects = [...selectedSubjects, subject];
		}
	}

	function selectAndAdvance(setter: () => void) {
		setter();
		if (isAutoStep && step < TOTAL_STEPS) {
			setTimeout(next, 380);
		}
	}

	function next() { step++; error = ''; }
	function back() { step--; error = ''; }

	async function handleComplete() {
		saving = true;
		error = '';
		try {
			if (isSchoolAdmin) {
				const inviteCode = Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
				const { data: org, error: orgErr } = await supabase.from('organizations').insert({
					name: schoolName.trim(), country, curriculum, invite_code: inviteCode, seat_limit: SEAT_LIMIT[studentCount] ?? 30,
				}).select('id').single();
				if (orgErr) throw new Error(orgErr.message);
				const { error: profErr } = await supabase.from('profiles').update({ org_id: org.id, onboarded: true }).eq('id', user.id);
				if (profErr) throw new Error(profErr.message);
				goto('/dashboard');
			} else {
				const { error: profErr } = await supabase.from('profiles').update({
					level, curriculum, subjects: selectedSubjects, study_challenge: challenge, onboarded: true,
				}).eq('id', user.id);
				if (profErr) throw new Error(profErr.message);
				goto('/chat');
			}
		} catch (e: any) { error = e.message || 'Error occurred'; saving = false; }
	}
</script>

<svelte:head>
	<title>Get started | XYLO</title>
</svelte:head>

<div class="aw-page ob-wrapper">
	<div class="glow-aura"></div>
	
	<div class="auth-card glass-deck ob-card">
		<!-- Stepper Header -->
		<div class="ob-header">
			<a href="/" class="aw-logo">XYLO</a>
			<nav class="ob-stepper" aria-label="Progress">
				<div class="stepper-rail">
					<div class="stepper-fill" style="width: {progressPct}%"></div>
				</div>
				{#each stepNumbers as s}
					<div class="step-node" class:done={s < step} class:active={s === step}>
						{#if s < step}
							<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17l-5-5"/></svg>
						{:else}
							{s}
						{/if}
					</div>
				{/each}
			</nav>
		</div>

		{#key step}
			<div class="step-container">
				<header class="step-header">
					<p class="step-pill">Step {step}: {stepTitle}</p>
					
					{#if isSchoolAdmin}
						{#if step === 1}
							<h1 class="ob-title">Tell us about your school</h1>
							<p class="ob-sub">We'll use this to personalize the study experience for your students.</p>
						{:else if step === 2}
							<h1 class="ob-title">Which curriculum?</h1>
							<p class="ob-sub">XYLO matches its knowledge base to your students' specific exams.</p>
						{:else if step === 3}
							<h1 class="ob-title">Student count</h1>
							<p class="ob-sub">Sets your initial seat limit. You can add more easily later.</p>
						{/if}
					{:else}
						{#if step === 1}
							<h1 class="ob-title">What's your study level?</h1>
							<p class="ob-sub">XYLO adjusts its tone and depth to match your education stage.</p>
						{:else if step === 2}
							<h1 class="ob-title">Which curriculum?</h1>
							<p class="ob-sub">This helps XYLO align with the exact syllabus you'll see in exams.</p>
						{:else if step === 3}
							<h1 class="ob-title">Select your subjects</h1>
							<p class="ob-sub">Choose up to 6. This tailors suggestions for your study sessions.</p>
						{:else if step === 4}
							<h1 class="ob-title">Your biggest challenge?</h1>
							<p class="ob-sub">Be honest — we'll shape your experience to help you improve here.</p>
						{/if}
					{/if}
				</header>

				<div class="step-content">
					<!-- School Steps -->
					{#if isSchoolAdmin}
						{#if step === 1}
							<div class="field-grid">
								<div class="field">
									<label for="sn">School Name</label>
									<div class="field-island"><input id="sn" bind:value={schoolName} placeholder="St. Mary's College" /></div>
								</div>
								<div class="field">
									<label for="ct">Country</label>
									<div class="field-island select-wrap">
										<select id="ct" bind:value={country}>
											<option value="">Select country</option>
											{#each COUNTRIES as c}<option value={c}>{c}</option>{/each}
										</select>
									</div>
								</div>
							</div>
						{:else if step === 2}
							<div class="ob-grid">
								{#each CURRICULA as c}
									<button class="choice-island" class:active={curriculum === c.value} onclick={() => selectAndAdvance(() => (curriculum = c.value))}>
										<span class="choice-label">{c.label}</span>
										<span class="choice-sub">{c.sub}</span>
									</button>
								{/each}
							</div>
						{:else if step === 3}
							<div class="ob-grid">
								{#each STUDENT_COUNTS as n}
									<button class="choice-island compact" class:active={studentCount === n} onclick={() => selectAndAdvance(() => (studentCount = n))}>
										<span class="choice-label">{n}</span>
										<span class="choice-sub">Students</span>
									</button>
								{/each}
							</div>
						{/if}
					<!-- Student Steps -->
					{:else}
						{#if step === 1}
							<div class="ob-list">
								{#each LEVELS as l}
									<button class="row-island" class:active={level === l.value} onclick={() => selectAndAdvance(() => (level = l.value))}>
										<span class="row-icon">{l.icon}</span>
										<div class="row-info"><span class="row-label">{l.label}</span></div>
										<div class="row-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17l-5-5"/></svg></div>
									</button>
								{/each}
							</div>
						{:else if step === 2}
							<div class="ob-grid">
								{#each CURRICULA as c}
									<button class="choice-island" class:active={curriculum === c.value} onclick={() => selectAndAdvance(() => (curriculum = c.value))}>
										<span class="choice-label">{c.label}</span>
										<span class="choice-sub">{c.sub}</span>
									</button>
								{/each}
							</div>
						{:else if step === 3}
							<div class="chip-container">
								{#each subjectList as s}
									<button class="ob-chip" class:active={selectedSubjects.includes(s)} disabled={!selectedSubjects.includes(s) && selectedSubjects.length >= 6} onclick={() => toggleSubject(s)}>{s}</button>
								{/each}
							</div>
							<p class="chip-note">{selectedSubjects.length} of 6 selected</p>
						{:else if step === 4}
							<div class="ob-list">
								{#each CHALLENGES as ch}
									<button class="row-island" class:active={challenge === ch.value} onclick={() => selectAndAdvance(() => (challenge = ch.value))}>
										<span class="row-icon">{ch.icon}</span>
										<div class="row-info"><span class="row-label">{ch.label}</span></div>
										<div class="row-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17l-5-5"/></svg></div>
									</button>
								{/each}
							</div>
						{/if}
					{/if}
				</div>

				{#if error}<div class="auth-error-chip glass-red" style="margin-top: 1.5rem;">{error}</div>{/if}

				<footer class="ob-nav">
					<button class="nav-back" disabled={step === 1} onclick={back}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
						Back
					</button>
					
					{#if step < TOTAL_STEPS}
						<button class="aw-btn aw-btn-primary nav-next" disabled={!canProceed()} onclick={next}>
							Continue
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
						</button>
					{:else}
						<button class="aw-btn aw-btn-primary nav-next" disabled={!canProceed() || saving} onclick={handleComplete}>
							{#if saving}<span class="spinner"></span> Working…{:else}
								Start Learning
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
							{/if}
						</button>
					{/if}
				</footer>
			</div>
		{/key}
	</div>
</div>

<style>
	.ob-wrapper {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2.5rem 1.5rem;
		position: relative;
		overflow: hidden;
	}

	.glow-aura {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 800px;
		height: 800px;
		background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
		pointer-events: none;
		z-index: 0;
	}

	.ob-card.glass-deck {
		width: 100%;
		max-width: 540px;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(48px);
		border-radius: 2.5rem;
		padding: 3.5rem 2.75rem;
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1);
		position: relative;
		z-index: 1;
		animation: auth-reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	@keyframes auth-reveal {
		from { opacity: 0; transform: translateY(20px) scale(0.98); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}
	.ob-card.glass-deck::before {
		content: ''; position: absolute; inset: -1px; border-radius: 2.5rem; border: 1px solid rgba(0, 0, 0, 0.06); pointer-events: none;
	}

	.ob-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; }
	.aw-logo { font-size: 1.375rem; }

	.ob-stepper { display: flex; align-items: center; gap: 0.75rem; position: relative; }
	.stepper-rail { position: absolute; left: 10px; right: 10px; height: 3px; background: rgba(0,0,0,0.04); border-radius: 10px; overflow: hidden; }
	.stepper-fill { height: 100%; background: #f59e0b; transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
	.step-node {
		position: relative; z-index: 1; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 2.5px solid rgba(0,0,0,0.06);
		display: grid; place-items: center; font-size: 0.625rem; font-weight: 800; color: #94a3b8; transition: all 0.3s;
	}
	.step-node.active { border-color: #f59e0b; color: #f59e0b; box-shadow: 0 0 12px rgba(245,158,11,0.2); }
	.step-node.done { background: #f59e0b; border-color: #f59e0b; color: #fff; }

	.step-container { animation: slide-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
	@keyframes slide-in { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }

	.step-header { margin-bottom: 2.5rem; }
	.step-pill { font-size: 0.75rem; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
	.ob-title { font-size: 1.75rem; font-weight: 900; color: #1e293b; letter-spacing: -0.04em; margin-bottom: 0.5rem; line-height: 1.25; }
	.ob-sub { font-size: 0.9375rem; color: #64748b; line-height: 1.6; font-weight: 500; }

	/* Grids & Selection */
	.ob-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; }
	.choice-island {
		background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 1.25rem; padding: 1.25rem 1rem;
		display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.25rem;
		cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 4px 6px rgba(0,0,0,0.02);
	}
	.choice-island:hover { transform: translateY(-3px); border-color: #f59e0b; background: #fffcf0; }
	.choice-island.active { border-color: #f59e0b; background: #fffcf0; box-shadow: 0 8px 24px rgba(245,158,11,0.1); }
	.choice-label { font-size: 1rem; font-weight: 800; color: #1e293b; }
	.choice-sub { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }

	.ob-list { display: flex; flex-direction: column; gap: 0.75rem; }
	.row-island {
		display: flex; align-items: center; gap: 1.25rem; padding: 1rem 1.25rem;
		background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 1.25rem;
		cursor: pointer; transition: all 0.3s;
	}
	.row-island:hover { background: #fffcf0; border-color: #f59e0b; }
	.row-island.active { background: #fffcf0; border-color: #f59e0b; box-shadow: 0 4px 12px rgba(245,158,11,0.1); }
	.row-icon { font-size: 1.25rem; }
	.row-info { flex: 1; }
	.row-label { font-size: 1rem; font-weight: 700; color: #1e293b; }
	.row-check { width: 22px; height: 22px; border-radius: 50%; background: #f1f5f9; border: 1.5px solid rgba(0,0,0,0.04); display: grid; place-items: center; color: transparent; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
	.active .row-check { background: #f59e0b; color: #fff; border-color: #f59e0b; transform: scale(1.1); }

	.chip-container { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.ob-chip {
		padding: 0.625rem 1.25rem; border-radius: 999px; background: rgba(0,0,0,0.04); border: 1px solid transparent;
		font-size: 0.875rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s;
	}
	.ob-chip:hover:not(:disabled) { background: rgba(245,158,11,0.1); color: #b45309; }
	.ob-chip.active { background: #f59e0b; color: #fff; box-shadow: 0 4px 12px rgba(245,158,11,0.25); }
	.ob-chip:disabled { opacity: 0.3; cursor: not-allowed; }
	.chip-note { font-size: 0.8125rem; color: #94a3b8; font-weight: 800; margin-top: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }

	/* Fields */
	.field-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
	.field { display: flex; flex-direction: column; gap: 0.625rem; }
	.field label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
	.field-island { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 1.25rem; padding: 0.125rem; }
	.field-island input, .field-island select { width: 100%; padding: 0.875rem 1.25rem; background: transparent; border: none; outline: none; font-size: 1rem; font-weight: 600; color: #1e293b; font-family: inherit; }
	.select-wrap { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.25rem center; }
	.select-wrap select { appearance: none; padding-right: 2.5rem; }

	.auth-error-chip { padding: 0.875rem 1.25rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 1.25rem; color: #dc2626; font-size: 0.875rem; font-weight: 600; }

	.ob-nav { margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.04); display: flex; justify-content: space-between; align-items: center; }
	.nav-back { border: none; background: transparent; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; font-weight: 800; color: #94a3b8; cursor: pointer; }
	.nav-back:hover:not(:disabled) { color: #f59e0b; }
	.nav-back:disabled { opacity: 0.3; cursor: not-allowed; }
	.nav-next { min-width: 140px; }

	.spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }

	@media (max-width: 540px) {
		.ob-card.glass-deck { padding: 2.5rem 1.5rem; border-radius: 1.5rem; }
		.ob-grid { grid-template-columns: 1fr 1fr; }
	}
</style>
