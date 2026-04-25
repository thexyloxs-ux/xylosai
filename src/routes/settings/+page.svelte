<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';

	const { data, form } = $props<{ data: any; form: any }>();
	const profile = $derived(data.profile);
	const organization = $derived(data.organization);

	let activeTab = $state('profile');
	let saving = $state(false);

	const CURRICULA = ['WAEC', 'KCSE', 'BECE', 'Cambridge', 'Other'];
	const LEVELS = [
		{ value: 'primary', label: 'Primary School' },
		{ value: 'jss', label: 'Junior Secondary' },
		{ value: 'sss', label: 'Senior Secondary' },
		{ value: 'university', label: 'University' }
	];
	const SUBJECT_OPTIONS = [
		'English', 'Mathematics', 'Biology', 'Chemistry', 'Physics',
		'Economics', 'Geography', 'Government', 'Accounting', 'French'
	];

	let selectedSubjects = $state<string[]>(profile?.subjects || []);
	let codeCopied = $state(false);

	function toggleSubject(s: string) {
		if (selectedSubjects.includes(s)) {
			selectedSubjects = selectedSubjects.filter((x) => x !== s);
		} else if (selectedSubjects.length < 6) {
			selectedSubjects = [...selectedSubjects, s];
		}
	}

	function copyInviteCode() {
		if (!organization?.invite_code) return;
		navigator.clipboard.writeText(organization.invite_code);
		codeCopied = true;
		setTimeout(() => { codeCopied = false; }, 2000);
	}
</script>

<svelte:head>
	<title>Settings — XYLO</title>
</svelte:head>

<div class="page">
	<!-- ── Header ── -->
	<header class="page-header">
		<div class="header-inner">
			<div class="header-left">
				<a href="/chat" class="wordmark">XYLO</a>
				<span class="page-pill">Settings</span>
			</div>
			<a href="/chat" class="back-link">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
				Back to Chat
			</a>
		</div>
	</header>

	<div class="page-body">
		<!-- ── Sidebar nav ── -->
		<aside class="settings-nav">
			<nav>
				<button class="nav-item" class:active={activeTab === 'profile'} onclick={() => activeTab = 'profile'}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
					Personal Info
				</button>
				<button class="nav-item" class:active={activeTab === 'academic'} onclick={() => activeTab = 'academic'}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
					Academic Focus
				</button>
				{#if profile?.role === 'school_admin'}
					<button class="nav-item" class:active={activeTab === 'organization'} onclick={() => activeTab = 'organization'}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/></svg>
						My School
					</button>
				{/if}
				<button class="nav-item" class:active={activeTab === 'billing'} onclick={() => activeTab = 'billing'}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
					Membership
				</button>
			</nav>
		</aside>

		<!-- ── Main content ── -->
		<main class="settings-main">
			{#key activeTab}
				<div in:fade={{ duration: 180 }}>

					<!-- ── Personal Info ── -->
					{#if activeTab === 'profile'}
						<div class="section-head">
							<p class="eyebrow">Account</p>
							<h1 class="section-title">Personal Information</h1>
							<p class="section-desc">Manage your name and contact details.</p>
						</div>

						<form method="POST" action="?/updateProfile"
							use:enhance={() => { saving = true; return ({ update }) => { saving = false; update(); }; }}>
							<div class="card">
								<div class="field">
									<label for="fullName">Full Name</label>
									<input id="fullName" name="fullName" type="text" value={profile?.full_name} placeholder="e.g. Amara Okafor" required />
								</div>
								<div class="field">
									<label for="emailDisplay">Email Address</label>
									<input id="emailDisplay" type="email" value={profile?.email} disabled />
									<p class="hint">Email cannot be changed. Contact support if needed.</p>
								</div>
								<button type="submit" class="btn-primary" disabled={saving}>
									{saving ? 'Saving…' : 'Update Profile'}
								</button>
							</div>
						</form>

					<!-- ── Academic Focus ── -->
					{:else if activeTab === 'academic'}
						<div class="section-head">
							<p class="eyebrow">AI Personalisation</p>
							<h1 class="section-title">Academic Focus</h1>
							<p class="section-desc">XYLO uses this to tailor every response to your level and goals.</p>
						</div>

						<form method="POST" action="?/updateProfile"
							use:enhance={() => { saving = true; return ({ update }) => { saving = false; update(); }; }}>

							<div class="card" style="margin-bottom: 1.5rem;">
								<div class="field-row">
									<div class="field">
										<label for="level">Study Level</label>
										<div class="select-wrap">
											<select id="level" name="level" value={profile?.level}>
												{#each LEVELS as l}<option value={l.value}>{l.label}</option>{/each}
											</select>
											<svg class="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
										</div>
									</div>
									<div class="field">
										<label for="curriculum">Curriculum</label>
										<div class="select-wrap">
											<select id="curriculum" name="curriculum" value={profile?.curriculum}>
												{#each CURRICULA as c}<option value={c}>{c}</option>{/each}
											</select>
											<svg class="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
										</div>
									</div>
								</div>
							</div>

							<div class="card" style="margin-bottom: 1.5rem;">
								<div class="field">
									<label for="studyChallenge">Biggest Study Challenge</label>
									<textarea id="studyChallenge" name="studyChallenge" rows="3"
										placeholder="e.g. I struggle with maths formulas and essay writing under time pressure"
									>{profile?.study_challenge || ''}</textarea>
									<p class="hint">XYLO reads this before every session.</p>
								</div>
							</div>

							<div class="card">
								<p class="field-label">Subjects <span class="count-pill">{selectedSubjects.length} / 6</span></p>
								<div class="subjects-grid">
									{#each SUBJECT_OPTIONS as s}
										<label class="subject-chip" class:active={selectedSubjects.includes(s)}>
											<input type="checkbox" name="subjects" value={s}
												checked={selectedSubjects.includes(s)}
												onchange={() => toggleSubject(s)} />
											{s}
										</label>
									{/each}
								</div>
								<button type="submit" class="btn-primary" style="margin-top: 2rem;" disabled={saving}>
									{saving ? 'Saving…' : 'Save Academic Focus'}
								</button>
							</div>
						</form>

					<!-- ── My School ── -->
					{:else if activeTab === 'organization'}
						<div class="section-head">
							<p class="eyebrow">Admin</p>
							<h1 class="section-title">School Settings</h1>
							<p class="section-desc">Manage your school's profile and student invite code.</p>
						</div>

						<form method="POST" action="?/updateOrg"
							use:enhance={() => { saving = true; return ({ update }) => { saving = false; update(); }; }}>
							<div class="card">
								<div class="field">
									<label for="orgName">School Name</label>
									<input id="orgName" name="name" type="text" value={organization?.name} required />
								</div>

								<div class="field">
									<p class="field-label">Invite Code</p>
									<div class="invite-row">
										<code class="invite-code">{organization?.invite_code}</code>
										<button type="button" class="btn-ghost" onclick={copyInviteCode}>
											{#if codeCopied}
												<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
												Copied
											{:else}
												<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
												Copy
											{/if}
										</button>
									</div>
									<p class="hint">Share this with students so they can join your school on XYLO.</p>
								</div>

								<button type="submit" class="btn-primary" disabled={saving}>
									{saving ? 'Saving…' : 'Update School Details'}
								</button>
							</div>
						</form>

					<!-- ── Membership ── -->
					{:else if activeTab === 'billing'}
						<div class="section-head">
							<p class="eyebrow">Plan</p>
							<h1 class="section-title">Membership</h1>
							<p class="section-desc">Your current plan and daily usage.</p>
						</div>

						<div class="card billing-card">
							<div class="plan-row">
								<div>
									<span class="plan-badge">{profile?.plan?.toUpperCase() || 'FREE'}</span>
									<p class="plan-name">{profile?.plan === 'free' ? 'XYLO Standard' : 'XYLO Pro'}</p>
									<p class="plan-reset">Resets daily at midnight</p>
								</div>
								<div class="meter-wrap">
									<div class="meter-labels">
										<span>Daily messages</span>
										<span>{profile?.messages_today || 0} / 20</span>
									</div>
									<div class="meter-rail">
										<div class="meter-fill" style="width: {Math.min(((profile?.messages_today || 0) / 20) * 100, 100)}%"></div>
									</div>
								</div>
							</div>
						</div>

						{#if profile?.plan === 'free'}
							<div class="upgrade-card">
								<div class="upgrade-text">
									<h3>Upgrade to Pro</h3>
									<p>Unlimited messages, priority AI access, and advanced exam tools.</p>
								</div>
								<a href="/pricing" class="btn-primary">Upgrade — $5 / mo</a>
							</div>
						{/if}
					{/if}

					{#if form?.message}
						<div class="toast" class:toast-error={!form?.success}>{form.message}</div>
					{/if}

				</div>
			{/key}
		</main>
	</div>
</div>

<style>
	/* ── Tokens (match dashboard + chat exactly) ── */
	.page {
		--cream:      oklch(97.5% 0.018 85);
		--cream-warm: oklch(94.5% 0.025 80);
		--border:     oklch(87%   0.028 78);
		--ink:        oklch(18%   0.014 50);
		--ink-2:      oklch(40%   0.020 50);
		--ink-3:      oklch(62%   0.016 55);
		--amber:      oklch(72%   0.185 72);
		--amber-deep: oklch(63%   0.175 68);
		--success:    oklch(60%   0.16  145);

		min-height: 100dvh;
		background: var(--cream);
		color: var(--ink);
		font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	/* ── Header ── */
	.page-header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: oklch(100% 0 0 / 0.78);
		backdrop-filter: blur(20px) saturate(150%);
		-webkit-backdrop-filter: blur(20px) saturate(150%);
		border-bottom: 1px solid var(--border);
		box-shadow:
			inset 0 -1px 0 oklch(100% 0 0 / 0.6),
			0 4px 16px oklch(18% 0.014 50 / 0.04);
	}

	.header-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-left { display: flex; align-items: center; gap: 1rem; }

	.wordmark {
		font-size: 1.125rem;
		font-weight: 800;
		color: var(--amber);
		letter-spacing: -0.05em;
		text-decoration: none;
	}

	.page-pill {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-3);
		background: var(--cream-warm);
		border: 1px solid var(--border);
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--ink-3);
		text-decoration: none;
		transition: color 0.12s;
	}
	.back-link:hover { color: var(--ink); }

	/* ── Page body ── */
	.page-body {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem 5rem;
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 3rem;
		align-items: start;
	}

	/* ── Sidebar nav ── */
	.settings-nav {
		position: sticky;
		top: 80px;
		background: oklch(100% 0 0 / 0.62);
		backdrop-filter: blur(20px) saturate(140%);
		-webkit-backdrop-filter: blur(20px) saturate(140%);
		border: 1px solid oklch(100% 0 0 / 0.85);
		box-shadow:
			inset 0 1px 0 oklch(100% 0 0 / 1),
			0 2px 8px oklch(18% 0.014 50 / 0.04);
		border-radius: 1rem;
		padding: 0.5rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.625rem 0.875rem;
		background: none;
		border: none;
		border-radius: 0.625rem;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--ink-3);
		cursor: pointer;
		text-align: left;
		transition: background 0.12s, color 0.12s;
	}
	.nav-item:hover { background: var(--cream-warm); color: var(--ink-2); }
	.nav-item.active { background: var(--cream-warm); color: var(--amber-deep); font-weight: 700; }
	.nav-item.active svg { stroke: var(--amber); }

	/* ── Section head ── */
	.section-head { margin-bottom: 2rem; }

	.eyebrow {
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--amber-deep);
		margin-bottom: 0.5rem;
	}

	.section-title {
		font-family: 'Fraunces', Georgia, serif;
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--ink);
		margin-bottom: 0.375rem;
	}

	.section-desc {
		font-size: 0.9375rem;
		color: var(--ink-3);
	}

	/* ── Card ── */
	.card {
		background: oklch(100% 0 0 / 0.62);
		backdrop-filter: blur(20px) saturate(140%);
		-webkit-backdrop-filter: blur(20px) saturate(140%);
		border: 1px solid oklch(100% 0 0 / 0.85);
		box-shadow:
			inset 0 1px 0 oklch(100% 0 0 / 1),
			0 2px 8px oklch(18% 0.014 50 / 0.03),
			0 8px 24px oklch(18% 0.014 50 / 0.04);
		border-radius: 1rem;
		padding: 2rem;
	}

	/* ── Form fields ── */
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.field:last-of-type { margin-bottom: 0; }

	.field label, .field-label {
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-3);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.field input, .field textarea, .select-wrap select {
		width: 100%;
		padding: 0.625rem 0.875rem;
		background: oklch(99% 0.008 85);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--ink);
		outline: none;
		transition: border-color 0.12s, box-shadow 0.12s;
		box-sizing: border-box;
	}
	.field input:focus, .field textarea:focus, .select-wrap select:focus {
		border-color: var(--amber);
		box-shadow: 0 0 0 3px oklch(72% 0.185 72 / 0.15);
	}
	.field input:disabled {
		background: var(--cream-warm);
		color: var(--ink-3);
		cursor: not-allowed;
	}
	.field textarea {
		resize: vertical;
		min-height: 80px;
		line-height: 1.6;
	}

	.field-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.select-wrap {
		position: relative;
	}
	.select-wrap select {
		appearance: none;
		-webkit-appearance: none;
		padding-right: 2.25rem;
		cursor: pointer;
	}
	.select-chevron {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		color: var(--ink-3);
	}

	.hint {
		font-size: 0.8125rem;
		color: var(--ink-3);
		line-height: 1.5;
	}

	/* ── Subjects ── */
	.count-pill {
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--ink-3);
		background: var(--cream-warm);
		border: 1px solid var(--border);
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		text-transform: none;
		letter-spacing: 0;
	}

	.subjects-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.subject-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.875rem;
		background: oklch(99% 0.008 85);
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--ink-2);
		cursor: pointer;
		transition: all 0.12s;
	}
	.subject-chip input { display: none; }
	.subject-chip:hover { border-color: var(--amber); color: var(--amber-deep); background: oklch(96% 0.04 80); }
	.subject-chip.active { background: oklch(96% 0.04 80); border-color: var(--amber); color: var(--amber-deep); font-weight: 700; box-shadow: 0 0 0 3px oklch(72% 0.185 72 / 0.12); }

	/* ── Invite code ── */
	.invite-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.invite-code {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 1rem;
		font-weight: 700;
		color: var(--amber-deep);
		background: oklch(96% 0.04 80);
		border: 1px solid oklch(85% 0.06 78);
		padding: 0.375rem 0.875rem;
		border-radius: 0.375rem;
		letter-spacing: 0.06em;
	}

	/* ── Billing ── */
	.billing-card { margin-bottom: 1.5rem; }

	.plan-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.plan-badge {
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--amber-deep);
		background: oklch(96% 0.04 80);
		border: 1px solid oklch(85% 0.06 78);
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		display: inline-block;
		margin-bottom: 0.5rem;
	}

	.plan-name {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--ink);
		margin-bottom: 0.25rem;
	}

	.plan-reset {
		font-size: 0.8125rem;
		color: var(--ink-3);
	}

	.meter-wrap { min-width: 200px; }
	.meter-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--ink-3);
		margin-bottom: 0.5rem;
	}
	.meter-rail {
		height: 6px;
		background: var(--cream-warm);
		border: 1px solid var(--border);
		border-radius: 999px;
		overflow: hidden;
	}
	.meter-fill {
		height: 100%;
		background: var(--amber);
		border-radius: 999px;
		transition: width 0.4s;
	}

	.upgrade-card {
		background: oklch(100% 0 0 / 0.62);
		backdrop-filter: blur(20px) saturate(140%);
		-webkit-backdrop-filter: blur(20px) saturate(140%);
		border: 1px solid oklch(100% 0 0 / 0.85);
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 1), 0 2px 8px oklch(18% 0.014 50 / 0.03);
		border-radius: 1rem;
		padding: 1.75rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
		border-left: 3px solid var(--amber);
	}

	.upgrade-text h3 {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--ink);
		margin-bottom: 0.25rem;
	}
	.upgrade-text p { font-size: 0.875rem; color: var(--ink-3); }

	/* ── Buttons ── */
	.btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.625rem 1.375rem;
		background: var(--amber);
		color: oklch(18% 0.014 50);
		border: none;
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 700;
		cursor: pointer;
		text-decoration: none;
		transition: background 0.12s, opacity 0.12s;
	}
	.btn-primary:hover { background: var(--amber-deep); }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

	.btn-ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: none;
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--ink-3);
		cursor: pointer;
		transition: color 0.12s, border-color 0.12s, background 0.12s;
	}
	.btn-ghost:hover { color: var(--ink); border-color: var(--ink-3); background: var(--cream-warm); }

	/* ── Toast ── */
	.toast {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		padding: 0.875rem 1.5rem;
		background: var(--success);
		color: #fff;
		border-radius: 0.625rem;
		font-size: 0.875rem;
		font-weight: 700;
		box-shadow: 0 8px 24px oklch(18% 0.014 50 / 0.12);
		z-index: 100;
	}
	.toast-error { background: oklch(52% 0.2 20); }

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.page-body {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		.settings-nav {
			position: static;
			display: flex;
			overflow-x: auto;
			padding: 0.375rem;
			gap: 0.25rem;
			border-radius: 0.75rem;
		}
		.settings-nav nav {
			display: flex;
			gap: 0.25rem;
			width: max-content;
		}
		.nav-item { white-space: nowrap; }
	}

	@media (max-width: 600px) {
		.header-inner { padding: 0 1rem; }
		.page-body { padding: 1.5rem 1rem 4rem; }
		.field-row { grid-template-columns: 1fr; }
		.plan-row { flex-direction: column; align-items: flex-start; }
		.meter-wrap { width: 100%; }
	}
</style>
