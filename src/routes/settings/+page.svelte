<script lang="ts">
	import { enhance } from '$app/forms';
	import { slide, fade } from 'svelte/transition';
	import '../landing.css';

	const { data, form } = $props<{ data: any, form: any }>();
	const { profile, organization } = data;

	let activeTab = $state('profile'); // 'profile' | 'academic' | 'organization' | 'billing'
	let saving = $state(false);

	const CURRICULA = ['WAEC', 'KCSE', 'BECE', 'Cambridge', 'Other'];
	const LEVELS = [
		{ value: 'primary', label: 'Primary School' },
		{ value: 'jss', label: 'Junior Secondary' },
		{ value: 'sss', label: 'Senior Secondary' },
		{ value: 'university', label: 'University' }
	];

	const SUBJECT_OPTIONS = ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Geography', 'Government', 'Accounting', 'French'];

	let selectedSubjects = $state<string[]>(profile?.subjects || []);

	function toggleSubject(s: string) {
		if (selectedSubjects.includes(s)) {
			selectedSubjects = selectedSubjects.filter((item) => item !== s);
		} else if (selectedSubjects.length < 6) {
			selectedSubjects = [...selectedSubjects, s];
		}
	}
</script>

<svelte:head>
	<title>Settings | XYLO</title>
</svelte:head>

<div class="aw-page settings-page">
	<div class="glow-aura"></div>

	<div class="settings-layout">
		<!-- Sidebar Navigation -->
		<aside class="settings-sidebar glass-deck">
			<div class="sidebar-header">
				<a href="/chat" class="aw-logo">XYLO</a>
				<p class="sidebar-sub">User Settings</p>
			</div>

			<nav class="settings-tabs">
				<button class="tab-link" class:active={activeTab === 'profile'} onclick={() => activeTab = 'profile'}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
					Personal Info
				</button>
				<button class="tab-link" class:active={activeTab === 'academic'} onclick={() => activeTab = 'academic'}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
					Academic Focus
				</button>
				{#if profile?.role === 'school_admin'}
					<button class="tab-link" class:active={activeTab === 'organization'} onclick={() => activeTab = 'organization'}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/></svg>
						My School
					</button>
				{/if}
				<button class="tab-link" class:active={activeTab === 'billing'} onclick={() => activeTab = 'billing'}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
					Membership
				</button>
			</nav>

			<div class="sidebar-footer">
				<a href="/chat" class="aw-btn aw-btn-secondary back-to-chat">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
					Back to Chat
				</a>
			</div>
		</aside>

		<!-- Main Settings Content -->
		<main class="settings-main">
			{#key activeTab}
				<div class="tab-panel" in:fade={{ duration: 200, delay: 100 }}>
					
					<!-- ── Personal Info ──────────────── -->
					{#if activeTab === 'profile'}
						<div class="settings-header">
							<h1>Personal Information</h1>
							<p>Manage your account identity and contact details.</p>
						</div>

						<form method="POST" action="?/updateProfile" use:enhance={() => { saving = true; return ({ update }) => { saving = false; update(); }; }} class="settings-form">
							<div class="glass-deck form-section">
								<div class="field">
									<label for="fullName">Full Name</label>
									<div class="field-island">
										<input id="fullName" name="fullName" type="text" value={profile?.full_name} placeholder="e.g. Amara Okafor" required />
									</div>
								</div>
								<div class="field">
									<label>Email Address</label>
									<div class="field-island disabled">
										<input type="email" value={profile?.email} disabled />
										<span class="lock-icon">🔒</span>
									</div>
									<p class="field-hint">Email cannot be changed directly. Contact support if needed.</p>
								</div>
								<button type="submit" class="aw-btn aw-btn-primary" disabled={saving}>
									{saving ? 'Saving...' : 'Update Profile'}
								</button>
							</div>
						</form>

					<!-- ── Academic Focus ──────────────── -->
					{:else if activeTab === 'academic'}
						<div class="settings-header">
							<h1>Academic Focus</h1>
							<p>Adjust your level and subjects so XYLO stays relevant to your studies.</p>
						</div>

						<form method="POST" action="?/updateProfile" use:enhance={() => { saving = true; return ({ update }) => { saving = false; update(); }; }} class="settings-form">
							<!-- Level & Curriculum -->
							<div class="glass-deck form-section mb-6">
								<div class="field-grid">
									<div class="field">
										<label for="level">Study Level</label>
										<div class="field-island select-wrap">
											<select id="level" name="level" value={profile?.level}>
												{#each LEVELS as l}<option value={l.value}>{l.label}</option>{/each}
											</select>
										</div>
									</div>
									<div class="field">
										<label for="curriculum">Curriculum</label>
										<div class="field-island select-wrap">
											<select id="curriculum" name="curriculum" value={profile?.curriculum}>
												{#each CURRICULA as c}<option value={c}>{c}</option>{/each}
											</select>
										</div>
									</div>
								</div>
							</div>

							<!-- Subjects -->
							<div class="glass-deck form-section">
								<label class="section-label">Selected Subjects (Max 6)</label>
								<div class="subjects-grid">
									{#each SUBJECT_OPTIONS as s}
										<label class="subject-island" class:active={selectedSubjects.includes(s)}>
											<input type="checkbox" name="subjects" value={s} checked={selectedSubjects.includes(s)} onchange={() => toggleSubject(s)} class="hidden-input" />
											<span class="subject-name">{s}</span>
											{#if selectedSubjects.includes(s)}
												<span class="check-dot" in:slide={{ axis: 'x', duration: 200 }}>✓</span>
											{/if}
										</label>
									{/each}
								</div>
								<button type="submit" class="aw-btn aw-btn-primary mt-8" disabled={saving}>
									{saving ? 'Saving Focus...' : 'Save Academic Focus'}
								</button>
							</div>
						</form>

					<!-- ── Organization (Admin Only) ────── -->
					{:else if activeTab === 'organization'}
						<div class="settings-header">
							<h1>School Settings</h1>
							<p>Manage your school's identity and invite code.</p>
						</div>

						<form method="POST" action="?/updateOrg" use:enhance={() => { saving = true; return ({ update }) => { saving = false; update(); }; }} class="settings-form">
							<div class="glass-deck form-section">
								<div class="field">
									<label for="orgName">School Name</label>
									<div class="field-island">
										<input id="orgName" name="name" type="text" value={organization?.name} required />
									</div>
								</div>
								
								<div class="field">
									<label>Invite Code</label>
									<div class="field-island code-island">
										<span class="invite-code">{organization?.invite_code}</span>
										<button type="button" class="copy-pill" onclick={() => navigator.clipboard.writeText(organization.invite_code)}>Copy Link</button>
									</div>
									<p class="field-hint">Share this code with students to join your school on XYLO.</p>
								</div>

								<button type="submit" class="aw-btn aw-btn-primary" disabled={saving}>
									{saving ? 'Saving...' : 'Update School Details'}
								</button>
							</div>
						</form>

					<!-- ── Membership / Billing ────────── -->
					{:else if activeTab === 'billing'}
						<div class="settings-header">
							<h1>Membership & Billing</h1>
							<p>Manage your subscription and usage limits.</p>
						</div>

						<div class="glass-deck billing-card">
							<div class="plan-status">
								<div class="plan-info">
									<span class="plan-badge">{profile?.plan?.toUpperCase() || 'FREE'}</span>
									<h2 class="plan-title">{profile?.plan === 'free' ? 'Xylo Standard' : 'Xylo Pro'}</h2>
									<p class="plan-expiry">Next reset: Tomorrow</p>
								</div>
								<div class="usage-meter">
									<div class="meter-labels">
										<span>Daily Usage</span>
										<span>{profile?.messages_today || 0} / 20 msgs</span>
									</div>
									<div class="meter-rail">
										<div class="meter-fill" style="width: {(profile?.messages_today / 20) * 100}%"></div>
									</div>
								</div>
							</div>

							{#if profile?.plan === 'free'}
								<div class="upgrade-banner">
									<div class="banner-content">
										<h3>Ready for unlimited learning?</h3>
										<p>Get priority AI access, unlimited messages, and specialized exam prep tools.</p>
									</div>
									<a href="/pricing" class="aw-btn aw-btn-primary">Upgrade — $5/mo</a>
								</div>
							{/if}
						</div>
					{/if}

					{#if form?.message}
						<div class="feedback-toast" class:error={!form.success} in:slide>
							{form.message}
						</div>
					{/if}

				</div>
			{/key}
		</main>
	</div>
</div>

<style>
	.settings-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2.5rem;
		position: relative;
		overflow: hidden;
	}

	.glow-aura {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 1000px;
		height: 1000px;
		background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
		pointer-events: none;
	}

	.settings-layout {
		width: 100%;
		max-width: 1100px;
		display: grid;
		grid-template-columns: 320px 1fr;
		gap: 2.5rem;
		position: relative;
		z-index: 1;
	}

	/* ── Sidebar Navigation ────────── */
	.settings-sidebar {
		padding: 3rem 2rem;
		display: flex;
		flex-direction: column;
		height: fit-content;
	}

	.sidebar-header { margin-bottom: 3.5rem; }
	.sidebar-sub { font-size: 0.8125rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.5rem; }

	.settings-tabs { display: flex; flex-direction: column; gap: 0.5rem; }
	.tab-link {
		display: flex; align-items: center; gap: 1rem;
		padding: 1rem 1.25rem;
		border: none; background: transparent;
		font-size: 1rem; font-weight: 700; color: #64748b;
		border-radius: 1.25rem;
		cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
		text-align: left;
	}
	.tab-link:hover { background: rgba(0,0,0,0.03); color: #1e293b; }
	.tab-link.active {
		background: #fff; color: #f59e0b;
		box-shadow: 0 4px 12px rgba(0,0,0,0.05);
		transform: scale(1.02);
	}

	.sidebar-footer { margin-top: 5rem; padding-top: 2rem; border-top: 1px solid rgba(0,0,0,0.04); }
	.back-to-chat { width: 100%; justify-content: center; }

	/* ── Main Content ────────── */
	.settings-main { min-height: 600px; }
	.settings-header { margin-bottom: 3rem; }
	.settings-header h1 { font-size: 2.25rem; font-weight: 900; color: #1e293b; letter-spacing: -0.04em; margin-bottom: 0.5rem; }
	.settings-header p { font-size: 1.0625rem; color: #64748b; font-weight: 500; }

	.form-section { padding: 3rem; }
	.field { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
	.field:last-of-type { margin-bottom: 2.5rem; }
	.field label { font-size: 0.8125rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
	
	.field-island { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 1.25rem; padding: 0.125rem; transition: all 0.3s; }
	.field-island:focus-within { border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }
	.field-island input, .field-island select { width: 100%; padding: 0.875rem 1.25rem; background: transparent; border: none; outline: none; font-size: 1rem; font-weight: 600; color: #1e293b; font-family: inherit; }
	
	.field-island.disabled { background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: space-between; }
	.lock-icon { margin-right: 1.25rem; opacity: 0.4; }
	.field-hint { font-size: 0.8125rem; color: #94a3b8; font-weight: 500; }

	.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

	.section-label { font-size: 0.8125rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem; display: block; }
	
	.subjects-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
	.subject-island {
		padding: 0.75rem 1.25rem;
		background: #fff; border: 1px solid rgba(0,0,0,0.06);
		border-radius: 999px; cursor: pointer;
		display: flex; align-items: center; gap: 0.75rem;
		transition: all 0.3s;
		font-weight: 700; color: #64748b;
	}
	.subject-island:hover { background: #fffcf0; border-color: #f59e0b; }
	.subject-island.active { background: #f59e0b; color: #fff; border-color: #f59e0b; box-shadow: 0 4px 12px rgba(245,158,11,0.2); }
	.hidden-input { display: none; }

	/* Billing Card */
	.billing-card { padding: 0; overflow: hidden; }
	.plan-status { padding: 3.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
	.plan-badge { font-size: 0.75rem; font-weight: 900; color: #f59e0b; background: rgba(245,158,11,0.1); padding: 0.25rem 0.75rem; border-radius: 999px; letter-spacing: 0.05em; }
	.plan-title { font-size: 2rem; font-weight: 900; color: #1e293b; margin-top: 0.5rem; }
	.plan-expiry { font-size: 0.875rem; color: #94a3b8; font-weight: 600; margin-top: 0.25rem; }
	
	.usage-meter { width: 240px; }
	.meter-labels { display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 800; color: #64748b; margin-bottom: 0.75rem; }
	.meter-rail { height: 8px; background: rgba(0,0,0,0.04); border-radius: 4px; overflow: hidden; }
	.meter-fill { height: 100%; background: #f59e0b; transition: width 0.4s; }

	.upgrade-banner {
		background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
		padding: 3rem 3.5rem;
		display: flex; align-items: center; justify-content: space-between;
	}
	.banner-content h3 { color: #fff; font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
	.banner-content p { color: #94a3b8; font-size: 1rem; font-weight: 500; max-width: 400px; }

	.feedback-toast {
		position: fixed; bottom: 2rem; right: 2rem;
		background: #059669; color: #fff;
		padding: 1rem 2rem; border-radius: 1rem;
		font-weight: 700; box-shadow: 0 12px 24px rgba(0,0,0,0.1);
	}
	.feedback-toast.error { background: #dc2626; }

	@media (max-width: 900px) {
		.settings-layout { grid-template-columns: 1fr; }
		.settings-sidebar { display: none; }
	}
</style>
