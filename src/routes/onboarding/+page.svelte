<script lang="ts">
	import type { User } from '@supabase/supabase-js';
	import { goto } from '$app/navigation';

	const { data } = $props<{ data: App.PageData }>();

	const supabase = data.supabase;
	const user     = data.user as User;
	const profile  = data.profile;

	const role          = profile?.role ?? (user?.user_metadata?.role as string | undefined) ?? 'individual';
	const isSchoolAdmin = role === 'school_admin';
	const meta          = (user?.user_metadata || {}) as Record<string, string>;

	// ── Step state ──────────────────────────────────────────────────────────────
	let step = $state(1);

	const TOTAL_STEPS  = isSchoolAdmin ? 3 : 4;
	const stepNumbers  = $derived(Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1));
	const progressPct  = $derived(((step - 1) / (TOTAL_STEPS - 1)) * 100);

	const isAutoStep = $derived(
		isSchoolAdmin ? step === 2 || step === 3 : step === 1 || step === 2 || step === 4,
	);

	// ── Field state ─────────────────────────────────────────────────────────────
	let schoolName       = $state(meta.school_name ?? '');
	let country          = $state(meta.country ?? '');
	let curriculum       = $state('');
	let studentCount     = $state('');
	let level            = $state('');
	let selectedSubjects = $state<string[]>([]);
	let challenge        = $state('');

	let saving = $state(false);
	let error  = $state('');

	// ── Content ─────────────────────────────────────────────────────────────────
	const LEVELS = [
		{ value: 'primary',      label: 'Primary School'   },
		{ value: 'jss',          label: 'Junior Secondary'  },
		{ value: 'sss',          label: 'Senior Secondary'  },
		{ value: 'university',   label: 'University'        },
		{ value: 'professional', label: 'Professional'      },
	] as const;

	const CURRICULA = [
		{ value: 'WAEC',      label: 'WAEC',      sub: 'West Africa'      },
		{ value: 'KCSE',      label: 'KCSE',      sub: 'Kenya'            },
		{ value: 'BECE',      label: 'BECE',      sub: 'Ghana'            },
		{ value: 'Cambridge', label: 'Cambridge', sub: 'International'    },
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
		{ value: 'consistency',   label: 'Staying consistent'    },
		{ value: 'understanding', label: 'Understanding concepts' },
		{ value: 'exam_pressure', label: 'Exam pressure'          },
		{ value: 'motivation',    label: 'Staying motivated'      },
	] as const;

	const STUDENT_COUNTS = ['1–15', '16–30', '31–60', '61–100', '100+'] as const;
	const COUNTRIES = ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Tanzania', 'Uganda', 'Rwanda', 'Senegal', 'Ivory Coast', 'Cameroon', 'Ethiopia', 'Other'] as const;
	const SEAT_LIMIT: Record<string, number> = { '1–15': 15, '16–30': 30, '31–60': 60, '61–100': 100, '100+': 200 };

	const subjectList = $derived(SUBJECTS[curriculum] ?? SUBJECTS.Other);
	const stepTitle   = $derived(
		isSchoolAdmin
			? (['School Info', 'Curriculum', 'Students'][step - 1])
			: (['Your Level',  'Curriculum',  'Subjects', 'Challenge'][step - 1])
	);

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
				const res = await fetch('/api/auth/setup-org', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						schoolName: schoolName.trim(),
						country,
						curriculum,
						seatLimit: SEAT_LIMIT[studentCount] ?? 30,
					})
				});
				if (!res.ok) {
					const body = await res.json().catch(() => ({}));
					throw new Error(body.message || 'Could not set up your school');
				}
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
	<title>Get started — XYLO</title>
</svelte:head>

<div class="ob-page">
	<div class="ob-card">

		<!-- Logo + Stepper -->
		<div class="ob-head">
			<a href="/" class="ob-logo">XYLO</a>
			<div class="ob-stepper" aria-label="Progress">
				<div class="stepper-track">
					<div class="stepper-fill" style="width: {progressPct}%"></div>
				</div>
				{#each stepNumbers as s}
					<div class="step-dot" class:done={s < step} class:active={s === step}>
						{#if s < step}
							<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17l-5-5"/></svg>
						{:else}
							{s}
						{/if}
					</div>
				{/each}
			</div>
		</div>

		{#key step}
			<div class="step-pane">

				<!-- Step heading -->
				<header class="step-head">
					<p class="step-label">Step {step} · {stepTitle}</p>

					{#if isSchoolAdmin}
						{#if step === 1}
							<h1 class="step-title">Tell us about your school.</h1>
							<p class="step-desc">We'll personalize the study experience for your students.</p>
						{:else if step === 2}
							<h1 class="step-title">Which curriculum?</h1>
							<p class="step-desc">XYLO matches its knowledge base to your students' specific exams.</p>
						{:else if step === 3}
							<h1 class="step-title">How many students?</h1>
							<p class="step-desc">Sets your initial seat limit. You can adjust this any time.</p>
						{/if}
					{:else}
						{#if step === 1}
							<h1 class="step-title">What's your study level?</h1>
							<p class="step-desc">XYLO adjusts its tone and depth to match your stage.</p>
						{:else if step === 2}
							<h1 class="step-title">Which curriculum?</h1>
							<p class="step-desc">Aligns XYLO with the exact syllabus you'll face in exams.</p>
						{:else if step === 3}
							<h1 class="step-title">Select your subjects.</h1>
							<p class="step-desc">Pick up to 6. This tailors every study session.</p>
						{:else if step === 4}
							<h1 class="step-title">Your biggest challenge?</h1>
							<p class="step-desc">Be honest — we'll shape your experience around it.</p>
						{/if}
					{/if}
				</header>

				<!-- Step content -->
				<div class="step-body">

					{#if isSchoolAdmin}

						{#if step === 1}
							<div class="fields">
								<div class="field">
									<label for="sn">School name</label>
									<input id="sn" class="ob-input" bind:value={schoolName} placeholder="St. Mary's College" />
								</div>
								<div class="field">
									<label for="ct">Country</label>
									<div class="ob-select-wrap">
										<select id="ct" class="ob-input ob-select" bind:value={country}>
											<option value="">Select country</option>
											{#each COUNTRIES as c}<option value={c}>{c}</option>{/each}
										</select>
									</div>
								</div>
							</div>

						{:else if step === 2}
							<div class="ob-grid">
								{#each CURRICULA as c}
									<button class="tile" class:active={curriculum === c.value} onclick={() => selectAndAdvance(() => (curriculum = c.value))}>
										<span class="tile-label">{c.label}</span>
										<span class="tile-sub">{c.sub}</span>
									</button>
								{/each}
							</div>

						{:else if step === 3}
							<div class="ob-grid compact">
								{#each STUDENT_COUNTS as n}
									<button class="tile" class:active={studentCount === n} onclick={() => selectAndAdvance(() => (studentCount = n))}>
										<span class="tile-label">{n}</span>
										<span class="tile-sub">students</span>
									</button>
								{/each}
							</div>
						{/if}

					{:else}

						{#if step === 1}
							<div class="ob-list">
								{#each LEVELS as l}
									<button class="row-tile" class:active={level === l.value} onclick={() => selectAndAdvance(() => (level = l.value))}>
										<span class="row-label">{l.label}</span>
										<span class="row-check">
											<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17l-5-5"/></svg>
										</span>
									</button>
								{/each}
							</div>

						{:else if step === 2}
							<div class="ob-grid">
								{#each CURRICULA as c}
									<button class="tile" class:active={curriculum === c.value} onclick={() => selectAndAdvance(() => (curriculum = c.value))}>
										<span class="tile-label">{c.label}</span>
										<span class="tile-sub">{c.sub}</span>
									</button>
								{/each}
							</div>

						{:else if step === 3}
							<div class="chip-wrap">
								{#each subjectList as s}
									<button
										class="chip"
										class:active={selectedSubjects.includes(s)}
										disabled={!selectedSubjects.includes(s) && selectedSubjects.length >= 6}
										onclick={() => toggleSubject(s)}
									>{s}</button>
								{/each}
							</div>
							<p class="chip-count">{selectedSubjects.length}/6 selected</p>

						{:else if step === 4}
							<div class="ob-list">
								{#each CHALLENGES as ch}
									<button class="row-tile" class:active={challenge === ch.value} onclick={() => selectAndAdvance(() => (challenge = ch.value))}>
										<span class="row-label">{ch.label}</span>
										<span class="row-check">
											<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17l-5-5"/></svg>
										</span>
									</button>
								{/each}
							</div>
						{/if}

					{/if}
				</div>

				{#if error}
					<p class="ob-error">{error}</p>
				{/if}

				<!-- Nav -->
				<footer class="step-foot">
					<button class="back-btn" disabled={step === 1} onclick={back}>
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
						Back
					</button>

					{#if step < TOTAL_STEPS}
						<button class="next-btn" disabled={!canProceed()} onclick={next}>
							Continue
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
						</button>
					{:else}
						<button class="next-btn" disabled={!canProceed() || saving} onclick={handleComplete}>
							{#if saving}
								<span class="spinner"></span> Working…
							{:else}
								Start learning
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
							{/if}
						</button>
					{/if}
				</footer>

			</div>
		{/key}

	</div>
</div>

<style>
	/* ── Tokens ── */
	.ob-page {
		--cream:      oklch(97.5% 0.018 85);
		--cream-warm: oklch(94.5% 0.025 80);
		--border:     oklch(87%   0.028 78);
		--ink:        oklch(18%   0.014 50);
		--ink-2:      oklch(40%   0.020 50);
		--ink-3:      oklch(62%   0.016 55);
		--amber:      oklch(72%   0.185 72);
		--amber-deep: oklch(63%   0.175 68);
		--amber-tint: oklch(96.5% 0.030 83);

		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.25rem;
		background: var(--cream);
		font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
		color: var(--ink);
	}

	/* ── Card ── */
	.ob-card {
		width: 100%;
		max-width: 520px;
		background: oklch(100% 0 0 / 0.72);
		backdrop-filter: blur(24px) saturate(160%);
		border: 1px solid oklch(100% 0 0 / 0.88);
		border-radius: 1.5rem;
		padding: 2.75rem;
		box-shadow:
			inset 0 1px 0 oklch(100% 0 0 / 1),
			0 4px 8px oklch(18% 0.014 50 / 0.04),
			0 16px 48px oklch(18% 0.014 50 / 0.10);
		position: relative;
		isolation: isolate;
		overflow: hidden;
		animation: ob-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	@keyframes ob-in {
		from { opacity: 0; transform: translateY(14px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* ── Header ── */
	.ob-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2.5rem;
	}

	.ob-logo {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: 1.375rem;
		font-weight: 900;
		color: var(--amber);
		letter-spacing: -0.02em;
		text-decoration: none;
	}

	/* ── Stepper ── */
	.ob-stepper {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		position: relative;
	}

	.stepper-track {
		position: absolute;
		left: 11px;
		right: 11px;
		height: 2px;
		background: var(--border);
		border-radius: 2px;
		overflow: hidden;
	}

	.stepper-fill {
		height: 100%;
		background: var(--amber);
		transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.step-dot {
		position: relative;
		z-index: 1;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--cream);
		border: 2px solid var(--border);
		display: grid;
		place-items: center;
		font-size: 0.625rem;
		font-weight: 800;
		color: var(--ink-3);
		transition: border-color 0.25s, background 0.25s, color 0.25s;
	}
	.step-dot.active {
		border-color: var(--amber);
		color: var(--amber-deep);
	}
	.step-dot.done {
		background: var(--amber);
		border-color: var(--amber);
		color: oklch(99% 0.01 85);
	}

	/* ── Step pane ── */
	.step-pane {
		animation: step-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	@keyframes step-in {
		from { opacity: 0; transform: translateX(8px); }
		to   { opacity: 1; transform: translateX(0); }
	}

	/* ── Step header ── */
	.step-head { margin-bottom: 2rem; }

	.step-label {
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--amber-deep);
		margin-bottom: 0.75rem;
	}

	.step-title {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.025em;
		color: var(--ink);
		margin-bottom: 0.5rem;
	}

	.step-desc {
		font-size: 0.9375rem;
		color: var(--ink-3);
		line-height: 1.6;
	}

	/* ── Tile grid ── */
	.ob-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 0.625rem;
	}
	.ob-grid.compact {
		grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
	}

	.tile {
		background: oklch(100% 0 0 / 0.55);
		backdrop-filter: blur(12px) saturate(130%);
		border: 1px solid oklch(100% 0 0 / 0.75);
		border-radius: 1rem;
		padding: 1.125rem 0.875rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.25rem;
		cursor: pointer;
		transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.2s;
		font-family: inherit;
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.9);
	}
	.tile:hover {
		border-color: oklch(72% 0.185 72 / 0.5);
		background: oklch(100% 0 0 / 0.75);
		transform: translateY(-2px);
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 1), 0 4px 12px oklch(18% 0.014 50 / 0.08);
	}
	.tile.active {
		border-color: oklch(72% 0.185 72 / 0.6);
		background: oklch(72% 0.185 72 / 0.08);
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.9), 0 4px 16px oklch(72% 0.185 72 / 0.12);
	}

	.tile-label {
		font-size: 1rem;
		font-weight: 800;
		color: var(--ink);
	}
	.tile.active .tile-label { color: var(--amber-deep); }

	.tile-sub {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--ink-3);
	}

	/* ── Row list ── */
	.ob-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.row-tile {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: oklch(100% 0 0 / 0.55);
		backdrop-filter: blur(12px) saturate(130%);
		border: 1px solid oklch(100% 0 0 / 0.75);
		border-radius: 1rem;
		cursor: pointer;
		transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
		text-align: left;
		width: 100%;
		font-family: inherit;
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.9);
	}
	.row-tile:hover {
		border-color: oklch(72% 0.185 72 / 0.5);
		background: oklch(100% 0 0 / 0.75);
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 1), 0 2px 8px oklch(18% 0.014 50 / 0.06);
	}
	.row-tile.active {
		border-color: oklch(72% 0.185 72 / 0.6);
		background: oklch(72% 0.185 72 / 0.08);
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.9), 0 2px 8px oklch(72% 0.185 72 / 0.10);
	}

	.row-label {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--ink);
	}

	.row-check {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1.5px solid var(--border);
		display: grid;
		place-items: center;
		color: transparent;
		flex-shrink: 0;
		transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
	}
	.row-tile.active .row-check {
		background: var(--amber);
		border-color: var(--amber);
		color: oklch(99% 0.01 85);
		transform: scale(1.1);
	}

	/* ── Subject chips ── */
	.chip-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		padding: 0.5625rem 1.125rem;
		border-radius: 999px;
		background: oklch(94% 0.016 80);
		border: 1px solid transparent;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--ink-2);
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s, color 0.15s;
		font-family: inherit;
	}
	.chip:hover:not(:disabled) {
		background: oklch(72% 0.185 72 / 0.12);
		color: var(--amber-deep);
	}
	.chip.active {
		background: var(--amber);
		color: var(--ink);
		font-weight: 700;
	}
	.chip:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.chip-count {
		margin-top: 1rem;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--ink-3);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	/* ── Form fields ── */
	.fields {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field label {
		font-size: 0.75rem;
		font-weight: 800;
		color: var(--ink-3);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.ob-input {
		width: 100%;
		padding: 0.8125rem 1rem;
		background: oklch(99.5% 0.006 85);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--ink);
		font-family: inherit;
		transition: border-color 0.15s;
		outline: none;
		box-sizing: border-box;
	}
	.ob-input:focus { border-color: var(--amber); }
	.ob-input::placeholder { color: var(--ink-3); font-weight: 500; }

	.ob-select-wrap { position: relative; }
	.ob-select-wrap::after {
		content: '';
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		width: 16px;
		height: 16px;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23778490' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-size: contain;
		pointer-events: none;
	}
	.ob-select { appearance: none; padding-right: 2.5rem; cursor: pointer; }

	/* ── Error ── */
	.ob-error {
		margin-top: 1.25rem;
		padding: 0.75rem 1rem;
		background: oklch(95% 0.025 25);
		border: 1px solid oklch(80% 0.05 25);
		border-radius: 0.625rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(40% 0.12 25);
	}

	/* ── Nav footer ── */
	.step-foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--ink-3);
		cursor: pointer;
		transition: color 0.15s;
		padding: 0;
	}
	.back-btn:hover:not(:disabled) { color: var(--ink); }
	.back-btn:disabled { opacity: 0.3; cursor: not-allowed; }

	.next-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: var(--ink);
		color: oklch(97.5% 0.018 85);
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 700;
		border: none;
		border-radius: 999px;
		cursor: pointer;
		transition: background 0.15s;
		white-space: nowrap;
	}
	.next-btn:hover:not(:disabled) { background: oklch(25% 0.016 50); }
	.next-btn:disabled { opacity: 0.4; cursor: not-allowed; }

	/* ── Spinner ── */
	.spinner {
		display: inline-block;
		width: 15px;
		height: 15px;
		border: 2px solid oklch(97% 0.01 85 / 0.3);
		border-top-color: oklch(97% 0.01 85);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	/* ── Responsive ── */
	@media (max-width: 560px) {
		.ob-card { padding: 2rem 1.25rem; border-radius: 1.25rem; }
		.ob-grid { grid-template-columns: 1fr 1fr; }
		.step-title { font-size: 1.5rem; }
	}
</style>
