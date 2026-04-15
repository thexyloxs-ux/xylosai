<script lang="ts">
	import type { User } from '@supabase/supabase-js';
	import { goto } from '$app/navigation';

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

	// Steps where selecting one option should advance automatically (not subjects or form fields)
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

	// ── Async ─────────────────────────────────────────────────────────────────────
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
		WAEC:      ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics',
		            'Government', 'Literature', 'Geography', 'Commerce', 'Accounting',
		            'Agriculture', 'Further Mathematics', 'CRS / IRS'],
		KCSE:      ['English', 'Kiswahili', 'Mathematics', 'Biology', 'Chemistry', 'Physics',
		            'History', 'Geography', 'CRE / IRE', 'Business Studies', 'Agriculture',
		            'Computer Studies'],
		BECE:      ['English', 'Mathematics', 'Integrated Science', 'Social Studies', 'French',
		            'RME', 'BDT', 'ICT'],
		Cambridge: ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History',
		            'Geography', 'Business Studies', 'Economics', 'Computer Science',
		            'Art & Design', 'French', 'Spanish'],
		Other:     ['English', 'Mathematics', 'Sciences', 'Humanities', 'Social Studies',
		            'Arts', 'ICT', 'Business', 'Languages'],
	};

	const CHALLENGES = [
		{ value: 'consistency',   label: 'Staying consistent',    icon: '⏰' },
		{ value: 'understanding', label: 'Understanding concepts', icon: '💡' },
		{ value: 'exam_pressure', label: 'Exam pressure',          icon: '😰' },
		{ value: 'motivation',    label: 'Staying motivated',      icon: '🔋' },
	] as const;

	const STUDENT_COUNTS = ['1–15', '16–30', '31–60', '61–100', '100+'] as const;

	const COUNTRIES = [
		'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Tanzania',
		'Uganda', 'Rwanda', 'Senegal', 'Ivory Coast', 'Cameroon',
		'Ethiopia', 'Other',
	] as const;

	// 100+ → 200 gives breathing room; admins request more via support
	const SEAT_LIMIT: Record<string, number> = {
		'1–15': 15, '16–30': 30, '31–60': 60, '61–100': 100, '100+': 200,
	};

	// ── Derived ───────────────────────────────────────────────────────────────────
	const subjectList = $derived(SUBJECTS[curriculum] ?? SUBJECTS.Other);

	const stepTitle = $derived(
		isSchoolAdmin
			? (['School info', 'Curriculum', 'Student count'] as const)[step - 1]
			: (['Your level', 'Your curriculum', 'Your subjects', 'Your challenge'] as const)[step - 1],
	);

	// ── Validation ────────────────────────────────────────────────────────────────
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

	// Select a single-choice option and advance to the next step after a brief delay.
	// The delay lets the user see the selection animation before the step flies in.
	function selectAndAdvance(setter: () => void) {
		setter();
		if (isAutoStep && step < TOTAL_STEPS) {
			setTimeout(next, 380);
		}
	}

	function next() { step++; error = ''; }
	function back() { step--; error = ''; }

	// 6-char code using 32 unambiguous chars (no I/O/0/1).
	// 256 % 32 === 0, so no modulo bias.
	function generateInviteCode(): string {
		const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		return Array.from(crypto.getRandomValues(new Uint8Array(6)))
			.map(b => CHARS[b % 32])
			.join('');
	}

	// ── Submit ────────────────────────────────────────────────────────────────────
	async function handleComplete() {
		saving = true;
		error = '';

		try {
			if (isSchoolAdmin) {
				const inviteCode = generateInviteCode();

				const { data: org, error: orgErr } = await supabase
					.from('organizations')
					.insert({
						name: schoolName.trim(),
						country,
						curriculum,
						invite_code: inviteCode,
						seat_limit: SEAT_LIMIT[studentCount] ?? 30,
					})
					.select('id')
					.single();

				if (orgErr) throw new Error(orgErr.message);

				const { error: profErr } = await supabase
					.from('profiles')
					.update({ org_id: org.id, onboarded: true })
					.eq('id', user.id);

				if (profErr) throw new Error(profErr.message);

				goto('/dashboard');
			} else {
				const { error: profErr } = await supabase
					.from('profiles')
					.update({
						level,
						curriculum,
						subjects: selectedSubjects,
						study_challenge: challenge,
						onboarded: true,
					})
					.eq('id', user.id);

				if (profErr) throw new Error(profErr.message);

				goto('/chat');
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Get started — XYLO</title>
</svelte:head>

<div class="ob-page">
	<div class="ob-card">

		<!-- ── Header ──────────────────────────────────────────────────────────────── -->
		<div class="ob-header">
			<a href="/" class="ob-logo">XYLO</a>

			<!-- Progress track: line + numbered dots -->
			<nav class="ob-track" aria-label="Onboarding steps">
				<div class="ob-track-rail">
					<div class="ob-track-fill" style="width: {progressPct}%"></div>
				</div>
				{#each stepNumbers as s}
					<div class="ob-node" class:done={s < step} class:active={s === step}>
						{#if s < step}
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
								<path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.8"
									stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{:else}
							{s}
						{/if}
					</div>
				{/each}
			</nav>
		</div>

		<!-- Step label + animated content -->
		{#key step}
			<div class="step-body">

				<p class="ob-step-label">{stepTitle}</p>

				<!-- ══ SCHOOL ADMIN ════════════════════════════════════════════════════ -->
				{#if isSchoolAdmin}

					{#if step === 1}
						<h1 class="ob-title">Tell us about your school</h1>
						<p class="ob-sub">We'll use this to personalise the experience for your students.</p>

						<div class="ob-fields">
							<div class="field">
								<label for="schoolName">School name</label>
								<input id="schoolName" type="text" bind:value={schoolName}
									placeholder="St. Mary's College, Lagos"
									autocomplete="organization" />
							</div>
							<div class="field">
								<label for="country">Country</label>
								<select id="country" bind:value={country}>
									<option value="">Select country</option>
									{#each COUNTRIES as c}
										<option value={c}>{c}</option>
									{/each}
								</select>
							</div>
						</div>

					{:else if step === 2}
						<h1 class="ob-title">Which curriculum do you follow?</h1>
						<p class="ob-sub">XYLO will match its knowledge base and question style to your students' exams.</p>

						<div class="ob-grid">
							{#each CURRICULA as c}
								<button type="button" class="ob-card-option"
									class:selected={curriculum === c.value}
									onclick={() => selectAndAdvance(() => (curriculum = c.value))}>
									<span class="ob-card-label">{c.label}</span>
									<span class="ob-card-sub">{c.sub}</span>
									<span class="ob-card-check" class:show={curriculum === c.value}>
										<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
											<path d="M1.5 4.5l2 2 4-4" stroke="#000" stroke-width="1.8"
												stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									</span>
								</button>
							{/each}
						</div>

					{:else if step === 3}
						<h1 class="ob-title">How many students will use XYLO?</h1>
						<p class="ob-sub">Sets your initial seat count. You can add more anytime from the dashboard.</p>

						<div class="ob-grid">
							{#each STUDENT_COUNTS as n}
								<button type="button" class="ob-card-option ob-card-option--compact"
									class:selected={studentCount === n}
									onclick={() => selectAndAdvance(() => (studentCount = n))}>
									<span class="ob-card-label">{n}</span>
									<span class="ob-card-sub">students</span>
									<span class="ob-card-check" class:show={studentCount === n}>
										<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
											<path d="M1.5 4.5l2 2 4-4" stroke="#000" stroke-width="1.8"
												stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									</span>
								</button>
							{/each}
						</div>
					{/if}

				<!-- ══ INDIVIDUAL / STUDENT ════════════════════════════════════════════ -->
				{:else}

					{#if step === 1}
						<h1 class="ob-title">What level are you studying at?</h1>
						<p class="ob-sub">XYLO adjusts its depth and language to match where you are in your education.</p>

						<div class="ob-list">
							{#each LEVELS as l}
								<button type="button" class="ob-row" class:selected={level === l.value}
									onclick={() => selectAndAdvance(() => (level = l.value))}>
									<span class="ob-row-icon">{l.icon}</span>
									<span class="ob-row-label">{l.label}</span>
									<span class="ob-row-check" class:show={level === l.value}>
										<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
											<path d="M1.5 4.5l2 2 4-4" stroke="#000" stroke-width="1.8"
												stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									</span>
								</button>
							{/each}
						</div>

					{:else if step === 2}
						<h1 class="ob-title">Which curriculum are you on?</h1>
						<p class="ob-sub">XYLO matches the exact syllabus and question style you'll face in exams.</p>

						<div class="ob-grid">
							{#each CURRICULA as c}
								<button type="button" class="ob-card-option"
									class:selected={curriculum === c.value}
									onclick={() => selectAndAdvance(() => (curriculum = c.value))}>
									<span class="ob-card-label">{c.label}</span>
									<span class="ob-card-sub">{c.sub}</span>
									<span class="ob-card-check" class:show={curriculum === c.value}>
										<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
											<path d="M1.5 4.5l2 2 4-4" stroke="#000" stroke-width="1.8"
												stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									</span>
								</button>
							{/each}
						</div>

					{:else if step === 3}
						<h1 class="ob-title">Which subjects do you study?</h1>
						<p class="ob-sub">Pick up to 6. XYLO uses these to suggest relevant topics and study sessions.</p>

						<div class="ob-chips">
							{#each subjectList as subject}
								<button
									type="button"
									class="ob-chip"
									class:selected={selectedSubjects.includes(subject)}
									disabled={!selectedSubjects.includes(subject) && selectedSubjects.length >= 6}
									onclick={() => toggleSubject(subject)}
								>
									{subject}
								</button>
							{/each}
						</div>

						<p class="ob-chip-hint">
							{#if selectedSubjects.length === 0}
								Select at least one subject to continue
							{:else}
								{selectedSubjects.length} of 6 selected
							{/if}
						</p>

					{:else if step === 4}
						<h1 class="ob-title">What's your biggest study challenge?</h1>
						<p class="ob-sub">Be honest — XYLO will shape your experience around this to help you improve.</p>

						<div class="ob-list">
							{#each CHALLENGES as ch}
								<button type="button" class="ob-row" class:selected={challenge === ch.value}
									onclick={() => selectAndAdvance(() => (challenge = ch.value))}>
									<span class="ob-row-icon">{ch.icon}</span>
									<span class="ob-row-label">{ch.label}</span>
									<span class="ob-row-check" class:show={challenge === ch.value}>
										<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
											<path d="M1.5 4.5l2 2 4-4" stroke="#000" stroke-width="1.8"
												stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									</span>
								</button>
							{/each}
						</div>
					{/if}

				{/if}

				<!-- Error -->
				{#if error}
					<div class="ob-error" role="alert">{error}</div>
				{/if}

				<!-- Navigation -->
				<div class="ob-nav">
					{#if step > 1}
						<button type="button" class="ob-back" onclick={back}>← Back</button>
					{:else}
						<span></span>
					{/if}

					{#if step < TOTAL_STEPS}
						<button type="button" class="ob-next" disabled={!canProceed()} onclick={next}>
							Continue →
						</button>
					{:else}
						<button type="button" class="ob-finish" disabled={!canProceed() || saving}
							onclick={handleComplete}>
							{#if saving}
								<span class="spinner"></span>
								{isSchoolAdmin ? 'Setting up your school…' : 'Setting up your account…'}
							{:else}
								{isSchoolAdmin ? 'Create school account →' : 'Start learning →'}
							{/if}
						</button>
					{/if}
				</div>

			</div><!-- /step-body -->
		{/key}

	</div>
</div>

<style>
	/* ── Page ─────────────────────────────────────────────────────────────────── */
	.ob-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		/* Subtle dot grid — lightweight visual character */
		background-color: #f8fafc;
		background-image: radial-gradient(circle, #dde3ed 1px, transparent 1px);
		background-size: 28px 28px;
	}

	.ob-card {
		width: 100%;
		max-width: 520px;
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 1.25rem;
		padding: 2.25rem 2.25rem 2rem;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.04),
			0 8px 32px rgba(0, 0, 0, 0.08);
		/* Slide up on page load */
		animation: cardIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes cardIn {
		from { opacity: 0; transform: translateY(20px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* ── Header ───────────────────────────────────────────────────────────────── */
	.ob-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2rem;
	}
	.ob-logo {
		font-size: 1.25rem;
		font-weight: 800;
		color: #f59e0b;
		letter-spacing: -0.03em;
	}

	/* Progress track */
	.ob-track {
		display: flex;
		align-items: center;
		gap: 0;
		position: relative;
	}
	.ob-track-rail {
		position: absolute;
		left: 10px;
		right: 10px;
		height: 2px;
		background: #e2e8f0;
		z-index: 0;
	}
	.ob-track-fill {
		height: 100%;
		background: #f59e0b;
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.ob-node {
		position: relative;
		z-index: 1;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #fff;
		border: 2px solid #e2e8f0;
		font-size: 0.6875rem;
		font-weight: 700;
		color: #94a3b8;
		display: grid;
		place-items: center;
		transition: border-color 0.25s, background 0.25s, color 0.25s;
		margin: 0 6px;
	}
	.ob-node.done {
		background: #f59e0b;
		border-color: #f59e0b;
		color: #000;
	}
	.ob-node.active {
		border-color: #f59e0b;
		color: #f59e0b;
	}

	/* ── Step body (animated container) ──────────────────────────────────────── */
	/* {#key step} remounts this element on every step change, re-triggering the animation */
	.step-body { animation: stepIn 0.22s ease-out both; }
	@keyframes stepIn {
		from { opacity: 0; transform: translateX(14px); }
		to   { opacity: 1; transform: translateX(0); }
	}

	.ob-step-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #f59e0b;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 0.625rem;
	}
	.ob-title {
		font-size: 1.625rem;
		font-weight: 800;
		color: #0f172a;
		letter-spacing: -0.025em;
		margin-bottom: 0.4rem;
		line-height: 1.25;
	}
	.ob-sub {
		font-size: 0.9375rem;
		color: #64748b;
		line-height: 1.6;
		margin-bottom: 1.75rem;
	}

	/* ── Form fields (school step 1) ──────────────────────────────────────────── */
	.ob-fields {
		display: flex;
		flex-direction: column;
		gap: 1.125rem;
		margin-bottom: 2rem;
	}
	.field { display: flex; flex-direction: column; gap: 0.375rem; }
	.field label { font-size: 0.875rem; font-weight: 600; color: #374151; }
	.field input,
	.field select {
		width: 100%;
		padding: 0.625rem 0.875rem;
		background: #f8fafc;
		color: #0f172a;
		border: 1.5px solid #e2e8f0;
		border-radius: 0.625rem;
		font-size: 0.9375rem;
		min-height: 44px;
		font-family: inherit;
		transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
	}
	.field input:focus,
	.field select:focus {
		outline: none;
		border-color: #f59e0b;
		box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
		background: #fff;
	}
	.field input::placeholder { color: #94a3b8; }

	/* ── List-style choice rows (levels, challenges) ──────────────────────────── */
	.ob-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.75rem;
	}
	.ob-row {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		width: 100%;
		padding: 0.875rem 1rem;
		background: #f8fafc;
		border: 1.5px solid #e2e8f0;
		border-radius: 0.75rem;
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
	}
	.ob-row:hover { border-color: #fcd34d; background: #fffbeb; }
	.ob-row.selected {
		border-color: #f59e0b;
		background: #fffbeb;
		box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
	}
	.ob-row-icon {
		font-size: 1.25rem;
		line-height: 1;
		flex-shrink: 0;
		width: 28px;
		text-align: center;
	}
	.ob-row-label {
		flex: 1;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #0f172a;
	}
	.ob-row-check {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #f59e0b;
		display: grid;
		place-items: center;
		color: #000;
		opacity: 0;
		transform: scale(0.4);
		transition: opacity 0.2s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
		flex-shrink: 0;
	}
	.ob-row-check.show { opacity: 1; transform: scale(1); }

	/* ── Card-style option grid (curricula, student counts) ───────────────────── */
	.ob-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 0.625rem;
		margin-bottom: 1.75rem;
	}
	.ob-card-option {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 1.125rem 0.75rem;
		background: #f8fafc;
		border: 1.5px solid #e2e8f0;
		border-radius: 0.875rem;
		cursor: pointer;
		font-family: inherit;
		text-align: center;
		min-height: 84px;
		transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s;
	}
	.ob-card-option:hover {
		border-color: #fcd34d;
		background: #fffbeb;
		transform: translateY(-1px);
	}
	.ob-card-option.selected {
		border-color: #f59e0b;
		background: #fffbeb;
		box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
	}
	.ob-card-option--compact { min-height: 64px; }
	.ob-card-label { font-size: 0.9375rem; font-weight: 700; color: #0f172a; }
	.ob-card-sub   { font-size: 0.75rem;   color: #64748b; }
	.ob-card-check {
		position: absolute;
		top: 7px;
		right: 7px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #f59e0b;
		display: grid;
		place-items: center;
		opacity: 0;
		transform: scale(0.4);
		transition: opacity 0.2s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.ob-card-check.show { opacity: 1; transform: scale(1); }

	/* ── Subject chips ────────────────────────────────────────────────────────── */
	.ob-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.625rem;
	}
	.ob-chip {
		padding: 0.45rem 1rem;
		background: #f1f5f9;
		border: 1.5px solid #e2e8f0;
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 500;
		color: #475569;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}
	.ob-chip:hover:not(:disabled) { border-color: #fcd34d; background: #fffbeb; color: #0f172a; }
	.ob-chip.selected {
		background: #f59e0b;
		border-color: #f59e0b;
		color: #000;
		font-weight: 600;
	}
	.ob-chip:disabled { opacity: 0.35; cursor: not-allowed; }
	.ob-chip-hint {
		font-size: 0.8125rem;
		color: #94a3b8;
		margin-bottom: 1.75rem;
	}

	/* ── Error ────────────────────────────────────────────────────────────────── */
	.ob-error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #dc2626;
		margin-bottom: 1.25rem;
	}

	/* ── Navigation ───────────────────────────────────────────────────────────── */
	.ob-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 0.25rem;
		border-top: 1px solid #f1f5f9;
		margin-top: 0.25rem;
	}
	.ob-back {
		background: none;
		border: none;
		color: #94a3b8;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		padding: 0.625rem 0;
		transition: color 0.15s;
	}
	.ob-back:hover { color: #0f172a; }
	.ob-next,
	.ob-finish {
		min-height: 44px;
		padding: 0 1.5rem;
		background: #f59e0b;
		color: #000;
		font-weight: 700;
		font-size: 0.9375rem;
		border: none;
		border-radius: 0.625rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: inherit;
		transition: background 0.15s, transform 0.1s;
	}
	.ob-next:hover:not(:disabled),
	.ob-finish:hover:not(:disabled) { background: #d97706; }
	.ob-next:active:not(:disabled),
	.ob-finish:active:not(:disabled) { transform: scale(0.97); }
	.ob-next:disabled,
	.ob-finish:disabled { opacity: 0.4; cursor: not-allowed; }

	.spinner {
		flex-shrink: 0;
		width: 15px;
		height: 15px;
		border: 2px solid rgba(0, 0, 0, 0.2);
		border-top-color: #000;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
</style>
