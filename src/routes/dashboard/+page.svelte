<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	const { data } = $props<{ data: App.PageData & { org: any; students: any[] } }>();
	const { org, profile } = data;

	let students = $state<any[]>(data.students);

	let totalStudents = $derived(students.length);
	let activeToday = $derived(students.filter((s) => s.messages_today > 0).length);
	let activeThisWeek = $derived(students.filter((s) => s.messages_this_week > 0).length);
	let totalMessagesToday = $derived(students.reduce((sum: number, s) => sum + (s.messages_today || 0), 0));
	let weeklyEngagement = $derived(totalStudents > 0 ? Math.round((activeThisWeek / totalStudents) * 100) : 0);

	let codeCopied = $state(false);
	function copyInviteCode() {
		if (!org?.invite_code) return;
		navigator.clipboard.writeText(org.invite_code);
		codeCopied = true;
		setTimeout(() => { codeCopied = false; }, 2000);
	}

	let confirmId = $state<string | null>(null);

	let inviteEmails = $state('');
	let inviteSending = $state(false);
	let inviteResult = $state<{ sent: number; failed: number; message: string } | null>(null);

	let search = $state('');
	let filteredStudents = $derived(
		search.trim()
			? students.filter((s: any) => {
					const q = search.toLowerCase();
					return (
						s.full_name?.toLowerCase().includes(q) ||
						s.level?.toLowerCase().includes(q) ||
						s.curriculum?.toLowerCase().includes(q)
					);
				})
			: students
	);

</script>

<svelte:head>
	<title>{org?.name || 'School'} Dashboard — XYLO</title>
</svelte:head>

<div class="dash">
	<!-- ── Header ── -->
	<header class="dash-header">
		<div class="header-inner">
			<div class="header-left">
				<a href="/?preview" class="wordmark">XYLO</a>
				<span class="admin-pill">School Admin</span>
			</div>
			<div class="header-actions">
				<a href="/settings" class="settings-link">Settings</a>
				<button
					class="signout-btn"
					onclick={async () => { await data.supabase.auth.signOut(); goto('/auth/login'); }}
				>
					Sign out
				</button>
			</div>
		</div>
	</header>

	<main class="dash-main">
		{#if !org}
			<!-- ── No org state ── -->
			<div class="no-org">
				<div class="no-org-inner">
					<p class="no-org-label">Setup required</p>
					<h2 class="no-org-heading">Organization not linked</h2>
					<p class="no-org-body">
						Your account isn't connected to a school organization yet.
						Contact XYLO support or finish your setup to view student data.
					</p>
				</div>
			</div>
		{:else}
			<!-- ── Dashboard heading ── -->
			<div class="page-head">
				<p class="page-eyebrow">Overview</p>
				<h1 class="page-title">{org.name}</h1>
				<p class="page-meta">
					Plan: <strong>{org.plan}</strong>
					&nbsp;·&nbsp;
					Seats: <strong>{totalStudents} / {org.seat_limit}</strong>
				</p>
			</div>

			<!-- ── Stats row ── -->
			<div class="stats-row">
				<div class="stat-item">
					<span class="stat-num">{totalStudents}</span>
					<span class="stat-label">Enrolled</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat-item">
					<span class="stat-num active">{activeToday}</span>
					<span class="stat-label">Active today</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat-item">
					<span class="stat-num">{activeThisWeek}</span>
					<span class="stat-label">Active this week</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat-item">
					<span class="stat-num">{totalMessagesToday}</span>
					<span class="stat-label">Messages today</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat-item">
					<span class="stat-num">{weeklyEngagement}%</span>
					<span class="stat-label">Weekly engagement</span>
				</div>
			</div>

			<!-- ── Invite students ── -->
			<div class="invite-card">
				<div class="invite-card-head">
					<div>
						<h2 class="invite-card-title">Invite Students</h2>
						<p class="invite-card-sub">Paste email addresses — one per line or comma-separated. Max 100 per batch.</p>
					</div>
					{#if org.invite_code}
						<div class="invite-code-row">
							<span class="invite-code-label">Invite code</span>
							<code class="invite-code">{org.invite_code}</code>
							<button class="copy-code-btn" onclick={copyInviteCode}>
								{#if codeCopied}
									<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
									Copied
								{:else}
									<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
									Copy
								{/if}
							</button>
						</div>
					{/if}
				</div>
				<form method="POST" action="?/inviteStudents"
					use:enhance={() => {
						inviteSending = true;
						inviteResult = null;
						return ({ result }) => {
							inviteSending = false;
							if (result.type === 'success' && result.data) {
								inviteResult = { sent: result.data.sent as number, failed: result.data.failed as number, message: result.data.message as string };
								if ((result.data.failed as number) === 0) inviteEmails = '';
							}
						};
					}}>
					<textarea
						class="invite-textarea"
						name="emails"
						bind:value={inviteEmails}
						placeholder="student@school.edu&#10;another@school.edu&#10;..."
						rows="4"
					></textarea>
					{#if inviteResult}
						<p class="invite-result" class:invite-result-error={inviteResult.failed > 0}>
							{inviteResult.message}
						</p>
					{/if}
					<button type="submit" class="invite-send-btn" disabled={inviteSending || !inviteEmails.trim()}>
						{#if inviteSending}
							Sending…
						{:else}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
							Send Invites
						{/if}
					</button>
				</form>
			</div>

			<!-- ── Student table ── -->
			<div class="table-section">
				<div class="table-head">
					<div class="table-head-left">
						<h2 class="table-title">Student Directory</h2>
						<span class="student-count">
							{filteredStudents.length}{search ? ` of ${totalStudents}` : ''} student{totalStudents !== 1 ? 's' : ''}
						</span>
					</div>
					<div class="search-wrap">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
						<input class="search-input" type="search" placeholder="Search by name, level, curriculum…" bind:value={search} />
					</div>
				</div>

				{#if students.length === 0}
					<div class="table-empty">
						<p class="empty-heading">No students yet</p>
						<p class="empty-sub">Share your invite code above to add your first students.</p>
					</div>
				{:else if filteredStudents.length === 0}
					<div class="table-empty">
						<p class="empty-heading">No results for "{search}"</p>
						<p class="empty-sub">Try a different name, level, or curriculum.</p>
					</div>
				{:else}
					<div class="table-wrap">
						<table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Level</th>
									<th>Curriculum</th>
									<th>Last active</th>
									<th class="right">This week</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each filteredStudents as student}
									<tr class:confirming={confirmId === student.id}>
										<td class="name-cell">{student.full_name || 'Anonymous'}</td>
										<td>{student.level || '—'}</td>
										<td>
											{#if student.curriculum}
												<span class="curriculum-tag">{student.curriculum}</span>
											{:else}
												<span class="not-set">Not set</span>
											{/if}
										</td>
										<td>
											{#if student.last_active}
												{#if student.messages_today > 0}
													<span class="status active"><span class="status-dot active"></span> Today</span>
												{:else}
													<span class="status inactive"><span class="status-dot"></span> {new Date(student.last_active).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
												{/if}
											{:else}
												<span class="not-set">Never</span>
											{/if}
										</td>
										<td class="right">
											<span class="msg-count" class:has-msgs={student.messages_this_week > 0}>
												{student.messages_this_week}
											</span>
										</td>
										<td class="action-cell">
											{#if confirmId === student.id}
												<span class="confirm-label">Remove?</span>
												<form method="POST" action="?/removeStudent"
													use:enhance={() => {
														return ({ result }) => {
															if (result.type === 'success') {
																students = students.filter((s: any) => s.id !== student.id);
															}
															confirmId = null;
														};
													}}>
													<input type="hidden" name="studentId" value={student.id} />
													<button type="submit" class="btn-confirm">Yes</button>
												</form>
												<button class="btn-cancel" onclick={() => confirmId = null}>No</button>
											{:else}
												<button class="btn-remove" onclick={() => confirmId = student.id} title="Remove student">
													<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
												</button>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>

<style>
	/* ── Tokens ── */
	.dash {
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
	.dash-header {
		position: sticky;
		top: 0;
		z-index: 50;
		/* Liquid Glass header */
		background: oklch(100% 0 0 / 0.78);
		backdrop-filter: blur(20px) saturate(150%);
		-webkit-backdrop-filter: blur(20px) saturate(150%);
		border-bottom: 1px solid var(--border);
		box-shadow:
			inset 0 -1px 0 oklch(100% 0 0 / 0.6),
			0 1px 0 oklch(87% 0.028 78 / 0.5),
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

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.wordmark {
		font-size: 1.125rem;
		font-weight: 800;
		color: var(--amber);
		letter-spacing: -0.05em;
	}

	.admin-pill {
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

	.header-actions { display: flex; align-items: center; gap: 0.75rem; }

	.settings-link {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--ink-3);
		text-decoration: none;
		transition: color 0.12s;
	}
	.settings-link:hover { color: var(--ink); }

	.signout-btn {
		padding: 0.375rem 0.875rem;
		background: none;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--ink-3);
		cursor: pointer;
		transition: color 0.12s, border-color 0.12s;
	}
	.signout-btn:hover { color: var(--ink); border-color: var(--ink-3); }

	/* ── Main content ── */
	.dash-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem 5rem;
	}

	/* ── No org state ── */
	.no-org {
		max-width: 600px;
		margin: 4rem auto 0;
	}

	.no-org-inner {
		border-left: 3px solid var(--amber);
		padding: 2rem 2rem 2rem 2.5rem;
		background: oklch(99% 0.008 85);
		border-radius: 0 0.875rem 0.875rem 0;
		border-top: 1px solid var(--border);
		border-right: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}

	.no-org-label {
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--amber-deep);
		margin-bottom: 0.75rem;
	}

	.no-org-heading {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--ink);
		margin-bottom: 0.75rem;
	}

	.no-org-body {
		font-size: 0.9375rem;
		color: var(--ink-2);
		line-height: 1.65;
	}

	/* ── Page heading ── */
	.page-head {
		margin-bottom: 3rem;
	}

	.page-eyebrow {
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--amber-deep);
		margin-bottom: 0.75rem;
	}

	.page-title {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: clamp(1.875rem, 4vw, 2.75rem);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.03em;
		color: var(--ink);
		margin-bottom: 0.75rem;
	}

	.page-meta {
		font-size: 0.9375rem;
		color: var(--ink-3);
	}
	.page-meta strong { color: var(--ink-2); font-weight: 700; }

	/* ── Stats row (editorial — not identical cards) ── */
	.stats-row {
		display: flex;
		align-items: center;
		gap: 0;
		margin-bottom: 3.5rem;
		border: 1px solid oklch(100% 0 0 / 0.88);
		border-radius: 0.875rem;
		/* Liquid Glass stats container */
		background: oklch(100% 0 0 / 0.65);
		backdrop-filter: blur(20px) saturate(150%);
		-webkit-backdrop-filter: blur(20px) saturate(150%);
		box-shadow:
			inset 0 1px 0 oklch(100% 0 0 / 1),
			0 2px 8px oklch(18% 0.014 50 / 0.04),
			0 8px 24px oklch(18% 0.014 50 / 0.05);
		overflow: hidden;
		position: relative;
	}

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 1.75rem 2rem;
	}

	.stat-divider {
		width: 1px;
		align-self: stretch;
		background: var(--border);
		flex-shrink: 0;
	}

	.stat-num {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1;
		color: var(--ink);
		letter-spacing: -0.02em;
	}
	.stat-num.active { color: var(--success); }

	.stat-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--ink-3);
	}

	/* ── Table section ── */
	.table-section {
		/* Liquid Glass table container */
		background: oklch(100% 0 0 / 0.62);
		backdrop-filter: blur(20px) saturate(140%);
		-webkit-backdrop-filter: blur(20px) saturate(140%);
		border: 1px solid oklch(100% 0 0 / 0.85);
		box-shadow:
			inset 0 1px 0 oklch(100% 0 0 / 1),
			0 2px 8px oklch(18% 0.014 50 / 0.03),
			0 8px 24px oklch(18% 0.014 50 / 0.04);
		border-radius: 1rem;
		overflow: hidden;
	}

	.table-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border);
		gap: 1rem;
		flex-wrap: wrap;
	}

	.table-head-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.table-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--ink);
	}

	.student-count {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--ink-3);
		background: var(--cream-warm);
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		border: 1px solid var(--border);
	}

	.search-wrap {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		background: oklch(99% 0.008 85);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		color: var(--ink-3);
		transition: border-color 0.12s, box-shadow 0.12s;
	}
	.search-wrap:focus-within {
		border-color: var(--amber);
		box-shadow: 0 0 0 3px oklch(72% 0.185 72 / 0.12);
	}
	.search-input {
		border: none;
		background: transparent;
		outline: none;
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--ink);
		width: 220px;
	}
	.search-input::placeholder { color: var(--ink-3); }

	.invite-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.invite-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ink-3);
	}

	.invite-code {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--amber-deep);
		background: oklch(96% 0.04 80);
		border: 1px solid oklch(85% 0.06 78);
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
		letter-spacing: 0.04em;
	}

	/* ── Invite card ── */
	.invite-card {
		background: oklch(100% 0 0 / 0.62);
		backdrop-filter: blur(20px) saturate(140%);
		-webkit-backdrop-filter: blur(20px) saturate(140%);
		border: 1px solid oklch(100% 0 0 / 0.85);
		box-shadow:
			inset 0 1px 0 oklch(100% 0 0 / 1),
			0 2px 8px oklch(18% 0.014 50 / 0.03),
			0 8px 24px oklch(18% 0.014 50 / 0.04);
		border-radius: 1rem;
		padding: 1.5rem 2rem;
		margin-bottom: 1.5rem;
	}

	.invite-card-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.invite-card-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--ink);
		margin-bottom: 0.25rem;
	}

	.invite-card-sub {
		font-size: 0.8125rem;
		color: var(--ink-3);
	}

	.invite-code-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-shrink: 0;
	}

	.invite-code-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ink-3);
	}

	.invite-textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		background: oklch(99% 0.008 85);
		border: 1px solid var(--border);
		border-radius: 0.625rem;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.8125rem;
		color: var(--ink);
		resize: vertical;
		outline: none;
		box-sizing: border-box;
		transition: border-color 0.12s, box-shadow 0.12s;
		display: block;
		margin-bottom: 0.75rem;
	}
	.invite-textarea:focus {
		border-color: var(--amber);
		box-shadow: 0 0 0 3px oklch(72% 0.185 72 / 0.12);
	}
	.invite-textarea::placeholder { color: var(--ink-3); }

	.invite-result {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--success);
		margin-bottom: 0.75rem;
	}
	.invite-result-error { color: oklch(52% 0.2 20); }

	.invite-send-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1.125rem;
		background: var(--amber);
		color: var(--ink);
		border: none;
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.12s, opacity 0.12s;
	}
	.invite-send-btn:hover { background: var(--amber-deep); }
	.invite-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }

	.copy-code-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
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
	.copy-code-btn:hover { color: var(--ink); border-color: var(--ink-3); background: var(--cream-warm); }

	/* ── Empty ── */
	.table-empty {
		padding: 4rem 2rem;
		text-align: center;
	}

	.empty-heading {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--ink-2);
		margin-bottom: 0.5rem;
	}

	.empty-sub {
		font-size: 0.9375rem;
		color: var(--ink-3);
	}

	/* ── Table ── */
	.table-wrap { overflow-x: auto; }

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead tr {
		border-bottom: 1px solid var(--border);
		background: var(--cream);
	}

	th {
		padding: 0.875rem 1.5rem;
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-3);
		text-align: left;
	}
	th.right { text-align: right; }

	tbody tr {
		border-bottom: 1px solid oklch(92% 0.020 82);
		transition: background 0.1s;
	}
	tbody tr:last-child { border-bottom: none; }
	tbody tr:hover { background: oklch(98% 0.012 84); }

	td {
		padding: 1rem 1.5rem;
		font-size: 0.875rem;
		color: var(--ink-2);
	}
	td.right { text-align: right; }
	td.name-cell { font-weight: 700; color: var(--ink); }

	.curriculum-tag {
		display: inline-block;
		padding: 0.1875rem 0.5625rem;
		background: var(--cream-warm);
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.not-set {
		font-size: 0.8125rem;
		color: var(--ink-3);
		font-style: italic;
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.status.active { color: var(--success); }
	.status.inactive { color: var(--ink-3); }

	.status-dot {
		width: 7px; height: 7px;
		border-radius: 50%;
		background: var(--border);
		flex-shrink: 0;
	}
	.status-dot.active {
		background: var(--success);
		box-shadow: 0 0 0 3px oklch(60% 0.16 145 / 0.2);
	}

	.msg-count {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--ink-3);
	}
	.msg-count.has-msgs { color: var(--ink); }

	/* ── Row actions ── */
	.action-cell {
		text-align: right;
		white-space: nowrap;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.375rem;
		padding-right: 1.25rem;
	}

	tr .btn-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px; height: 26px;
		border: none;
		background: none;
		border-radius: 0.375rem;
		color: var(--ink-3);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.12s, background 0.12s, color 0.12s;
	}
	tr:hover .btn-remove, tr.confirming .btn-remove { opacity: 1; }
	.btn-remove:hover { background: oklch(92% 0.08 20 / 0.15); color: oklch(52% 0.2 20); }

	.confirm-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: oklch(52% 0.2 20);
	}

	.btn-confirm {
		padding: 0.2rem 0.625rem;
		background: oklch(52% 0.2 20);
		color: #fff;
		border: none;
		border-radius: 0.375rem;
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		transition: opacity 0.12s;
	}
	.btn-confirm:hover { opacity: 0.85; }

	.btn-cancel {
		padding: 0.2rem 0.625rem;
		background: none;
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--ink-3);
		cursor: pointer;
		transition: border-color 0.12s, color 0.12s;
	}
	.btn-cancel:hover { border-color: var(--ink-3); color: var(--ink); }

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.stats-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		.stat-divider { display: none; }
		.stat-item {
			border-bottom: 1px solid var(--border);
		}
		.stat-item:nth-child(1), .stat-item:nth-child(3) {
			border-right: 1px solid var(--border);
		}
		.stat-item:nth-last-child(1), .stat-item:nth-last-child(2) {
			border-bottom: none;
		}
	}

	@media (max-width: 600px) {
		.dash-main { padding: 2rem 1rem 4rem; }
		.header-inner { padding: 0 1rem; }
		.table-head { padding: 1.25rem; }
		th, td { padding: 0.875rem 1rem; }
		.stats-row { grid-template-columns: 1fr; }
		.stat-item { border-right: none !important; border-bottom: 1px solid var(--border) !important; }
		.stat-item:last-child { border-bottom: none !important; }
	}
</style>
