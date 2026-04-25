<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import type { Conversation, Organization, Profile } from '$lib/types/database';

	const { data } = $props<{
		data: App.PageData & { profile: Profile | null; organization: Organization | null; conversations: any[] };
	}>();
	const profile = $derived(data.profile);
	let conversations = $state<Conversation[]>([]);
	$effect(() => { conversations = data.conversations; });

	type Message = { role: 'user' | 'assistant'; content: string };

	let messages: Message[] = $state([]);
	let input = $state('');
	let loading = $state(false);
	let fetchingHistory = $state(false);
	let chatWindow: HTMLElement;
	let sidebarOpen = $state(false);

	let conversationId = $state<string | null>(null);

	async function loadConversation(id: string) {
		if (fetchingHistory || id === conversationId) return;
		fetchingHistory = true;
		conversationId = id;
		messages = [];
		sidebarOpen = false;
		try {
			const res = await fetch(`/api/conversations/${id}/messages`);
			if (!res.ok) throw new Error('Failed to fetch history');
			const { messages: history } = await res.json();
			messages = history.map((m: any) => ({ role: m.role, content: m.content }));
			scrollToBottom();
		} catch (err) {
			console.error('History error:', err);
		} finally {
			fetchingHistory = false;
		}
	}

	function startNewChat() {
		messages = [];
		conversationId = null;
		input = '';
		sidebarOpen = false;
	}

	marked.setOptions({ breaks: true, gfm: true });

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	async function sendMessage() {
		if (!input.trim() || loading) return;
		const userMsg = input.trim();
		messages.push({ role: 'user', content: userMsg });
		input = '';
		loading = true;
		scrollToBottom();

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: messages.map(m => ({ role: m.role, content: m.content })),
					conversationId
				})
			});

			const newConvId = response.headers.get('X-Conversation-Id');
			if (newConvId) conversationId = newConvId;

			if (!response.ok) throw new Error('Failed to fetch response');
			if (!response.body) throw new Error('No response body');

			loading = false;
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			messages.push({ role: 'assistant', content: '' });
			let lastIdx = messages.length - 1;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				messages[lastIdx].content += decoder.decode(value, { stream: true });
				scrollToBottom();
			}
		} catch (err) {
			console.error('Chat error:', err);
			messages.push({ role: 'assistant', content: 'Sorry, I hit a snag. Please try again or check your connection.' });
			loading = false;
		}
	}

	async function scrollToBottom() {
		await tick();
		if (chatWindow) chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
	}

	const suggestions = [
		"Explain photosynthesis like I'm 10",
		"Give me a WAEC Biology study plan",
		"Quiz me on English grammar for BECE",
		"How does the kidney work?"
	];
</script>

<svelte:head>
	<title>Chat — XYLO</title>
</svelte:head>

<!-- Mobile sidebar overlay -->
{#if sidebarOpen}
	<div class="sidebar-overlay" onclick={() => sidebarOpen = false} role="presentation"></div>
{/if}

<div class="chat-shell">
	<!-- ── Sidebar ───────────────────────────────────── -->
	<aside class="sidebar" class:open={sidebarOpen}>
		<div class="sidebar-top">
			<a href="/?preview" class="wordmark">XYLO</a>
			<button class="new-chat-btn" onclick={startNewChat}>
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
				New chat
			</button>
		</div>

		<div class="sidebar-section grow">
			<p class="section-label">History</p>
			<div class="history-list">
				{#if !conversationId}
					<div class="history-item current">Current session</div>
				{/if}
				{#each conversations as conv}
					<button
						class="history-item"
						class:active={conversationId === conv.id}
						onclick={() => loadConversation(conv.id)}
					>
						<span class="conv-title">{conv.title}</span>
						<span class="conv-date">{new Date(conv.last_message_at).toLocaleDateString()}</span>
					</button>
				{:else}
					{#if conversationId}
						<button class="history-item current" onclick={startNewChat}>New chat</button>
					{/if}
					<p class="history-empty">No history yet</p>
				{/each}
			</div>
		</div>

		<div class="sidebar-foot">
			{#if profile?.role === 'school_admin'}
				<a href="/dashboard" class="dashboard-link">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
					School Dashboard
				</a>
			{/if}
			<a href="/settings" class="user-row user-row-link">
				<div class="avatar">{profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}</div>
				<div class="user-info">
					<span class="user-name">{profile?.full_name || 'Student'}</span>
					<span class="user-level">{profile?.level || 'Free'}</span>
				</div>
				<svg class="settings-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
			</a>
			<button
				class="signout-btn"
				onclick={async () => { await data.supabase.auth.signOut(); goto('/'); }}
			>
				Sign out
			</button>
		</div>
	</aside>

	<!-- ── Main area ─────────────────────────────────── -->
	<div class="chat-main">
		<!-- Mobile top bar -->
		<div class="mobile-bar">
			<button class="menu-btn" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Menu">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
			</button>
			<span class="mobile-wordmark">XYLO</span>
			<button class="new-chat-mobile" onclick={startNewChat} aria-label="New chat">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
			</button>
		</div>

		<!-- Chat window -->
		<div class="chat-window" bind:this={chatWindow}>
			{#if messages.length === 0}
				<div class="empty-state">
					<h1 class="empty-heading">What are we studying today?</h1>
					<p class="empty-sub">Ask me anything — or pick a suggestion below.</p>
					<div class="suggestions">
						{#each suggestions as s, i}
							<button class="suggestion" onclick={() => { input = s; sendMessage(); }}>
								<span class="sug-num">{String(i + 1).padStart(2, '0')}</span>
								<span>{s}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="message-list">
				{#each messages as m}
					<div class="msg-row {m.role}">
						{#if m.role === 'assistant'}
							<div class="msg-avatar-ai">X</div>
						{/if}
						<div class="bubble {m.role}">
							{#if m.role === 'assistant'}
								{@html marked.parse(m.content)}
								<button class="copy-btn" onclick={() => copyToClipboard(m.content)} title="Copy" aria-label="Copy message">
									<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
								</button>
							{:else}
								{m.content}
							{/if}
						</div>
					</div>
				{/each}

				{#if loading}
					<div class="msg-row assistant">
						<div class="msg-avatar-ai">X</div>
						<div class="bubble assistant loading">
							<span class="dot"></span><span class="dot"></span><span class="dot"></span>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Input area -->
		<div class="input-area">
			<div class="input-box">
				<textarea
					placeholder="Ask XYLO anything…"
					bind:value={input}
					onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
					rows="1"
				></textarea>
				<button
					class="send-btn"
					disabled={!input.trim() || loading}
					onclick={sendMessage}
					aria-label="Send"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
				</button>
			</div>
			<p class="input-note">XYLO can make mistakes. Verify important info.</p>
		</div>
	</div>
</div>

<style>
	/* ── Tokens ── */
	:global(html), :global(body) {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden;
	}

	.chat-shell {
		--cream:      oklch(97.5% 0.018 85);
		--cream-warm: oklch(95%   0.022 82);
		--border:     oklch(87%   0.028 78);
		--ink:        oklch(18%   0.014 50);
		--ink-2:      oklch(40%   0.020 50);
		--ink-3:      oklch(62%   0.016 55);
		--amber:      oklch(72%   0.185 72);
		--amber-deep: oklch(63%   0.175 68);

		display: grid;
		grid-template-columns: 280px 1fr;
		height: 100dvh;
		background: var(--cream);
		color: var(--ink);
		font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
		overflow: hidden;
	}

	/* ── Sidebar ── */
	.sidebar {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: oklch(100% 0 0 / 0.65);
		backdrop-filter: blur(20px) saturate(150%);
		border-right: 1px solid oklch(100% 0 0 / 0.70);
		padding: 1.5rem 1.25rem;
		overflow: hidden;
		box-shadow: inset -1px 0 0 oklch(100% 0 0 / 0.5), 2px 0 12px oklch(18% 0.014 50 / 0.06);
	}

	.sidebar-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2rem;
	}

	.wordmark {
		font-size: 1.125rem;
		font-weight: 800;
		color: var(--amber);
		letter-spacing: -0.05em;
	}

	.new-chat-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.4375rem 0.75rem;
		background: var(--cream);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--ink-2);
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
	}
	.new-chat-btn:hover { border-color: var(--ink-3); color: var(--ink); }

	.sidebar-section {
		margin-bottom: 1.5rem;
	}
	.sidebar-section.grow { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

	.section-label {
		font-size: 0.6875rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-3);
		margin-bottom: 0.625rem;
	}

	.history-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.history-item {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5625rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		background: none;
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.12s;
		width: 100%;
	}
	.history-item:hover { background: var(--cream); }
	.history-item.active { background: oklch(95% 0.04 80); border-color: oklch(85% 0.06 78); }
	.history-item.current { font-size: 0.8125rem; font-weight: 700; color: var(--amber-deep); cursor: default; }
	.history-item.current:hover { background: transparent; }

	.conv-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--ink-2);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}
	.conv-date {
		font-size: 0.6875rem;
		color: var(--ink-3);
	}
	.history-empty {
		font-size: 0.8125rem;
		color: var(--ink-3);
		padding: 0.5rem 0.75rem;
	}

	.sidebar-foot {
		border-top: 1px solid var(--border);
		padding-top: 1.25rem;
		margin-top: auto;
	}

	.user-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.875rem;
	}

	.dashboard-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		margin-bottom: 0.5rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--amber-deep);
		text-decoration: none;
		background: oklch(96% 0.04 80 / 0.6);
		border: 1px solid oklch(85% 0.06 78 / 0.6);
		transition: background 0.12s, border-color 0.12s;
	}
	.dashboard-link:hover { background: oklch(94% 0.05 80); border-color: oklch(80% 0.08 78); }

	.user-row-link {
		text-decoration: none;
		border-radius: 0.625rem;
		padding: 0.375rem 0.5rem;
		margin: -0.375rem -0.5rem 0.5rem;
		transition: background 0.15s;
	}
	.user-row-link:hover { background: var(--cream-warm); }
	.user-row-link:hover .settings-icon { opacity: 1; }
	.settings-icon { margin-left: auto; color: var(--ink-3); opacity: 0; flex-shrink: 0; transition: opacity 0.15s; }

	.avatar {
		width: 34px; height: 34px;
		background: var(--ink);
		color: var(--cream);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8125rem;
		font-weight: 800;
		flex-shrink: 0;
	}

	.user-info { display: flex; flex-direction: column; gap: 0.0625rem; min-width: 0; }
	.user-name { font-size: 0.875rem; font-weight: 700; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.user-level { font-size: 0.75rem; color: var(--ink-3); font-weight: 600; }

	.signout-btn {
		width: 100%;
		padding: 0.4375rem 0.75rem;
		background: none;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--ink-3);
		cursor: pointer;
		transition: color 0.12s, border-color 0.12s;
		text-align: center;
	}
	.signout-btn:hover { color: var(--ink); border-color: var(--ink-3); }

	/* ── Mobile bar ── */
	.mobile-bar {
		display: none;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid oklch(100% 0 0 / 0.70);
		background: oklch(100% 0 0 / 0.75);
		backdrop-filter: blur(16px) saturate(140%);
		box-shadow: inset 0 -1px 0 oklch(100% 0 0 / 0.5), 0 2px 8px oklch(18% 0.014 50 / 0.05);
	}

	.menu-btn, .new-chat-mobile {
		background: none;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		width: 36px; height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--ink-2);
		cursor: pointer;
	}

	.mobile-wordmark {
		font-size: 1rem;
		font-weight: 800;
		color: var(--amber);
		letter-spacing: -0.04em;
	}

	/* ── Main ── */
	.chat-main {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
		position: relative;
	}

	/* ── Chat window ── */
	.chat-window {
		flex: 1;
		overflow-y: auto;
		padding: 2rem 1.5rem 12rem;
		display: flex;
		flex-direction: column;
	}

	/* ── Empty state ── */
	.empty-state {
		max-width: 680px;
		margin: 6vh auto 0;
		padding: 0 1rem;
	}

	.empty-heading {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.03em;
		color: var(--ink);
		margin-bottom: 0.5rem;
	}

	.empty-sub {
		font-size: 1rem;
		color: var(--ink-3);
		margin-bottom: 2rem;
	}

	.suggestions {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--border);
	}

	.suggestion {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem 0;
		border: none;
		border-bottom: 1px solid var(--border);
		background: none;
		text-align: left;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--ink-2);
		cursor: pointer;
		transition: color 0.15s, padding-left 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		line-height: 1.5;
		width: 100%;
	}
	.suggestion:hover { color: var(--ink); padding-left: 0.375rem; }
	.sug-num {
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-weight: 300;
		font-size: 1.25rem;
		color: var(--amber);
		line-height: 1.3;
		flex-shrink: 0;
		width: 2rem;
	}

	/* ── Messages ── */
	.message-list {
		max-width: 760px;
		width: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.msg-row {
		display: flex;
		gap: 0.875rem;
		align-items: flex-start;
		animation: msg-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	@keyframes msg-in {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}
	.msg-row.user { flex-direction: row-reverse; }

	.msg-avatar-ai {
		width: 30px; height: 30px;
		background: var(--amber);
		color: oklch(14% 0.01 50);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fraunces', Georgia, serif;
		font-optical-sizing: auto;
		font-size: 0.8125rem;
		font-weight: 700;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.bubble {
		max-width: 78%;
		padding: 1rem 1.25rem;
		border-radius: 1rem;
		font-size: 0.9375rem;
		line-height: 1.7;
		position: relative;
	}

	.bubble.user {
		background: var(--ink);
		color: var(--cream);
		border-bottom-right-radius: 0.25rem;
		font-weight: 500;
	}

	.bubble.assistant {
		background: oklch(100% 0 0 / 0.72);
		backdrop-filter: blur(16px) saturate(140%);
		border: 1px solid oklch(100% 0 0 / 0.85);
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 1), 0 2px 8px oklch(18% 0.014 50 / 0.06);
		color: var(--ink);
		border-bottom-left-radius: 0.25rem;
	}

	/* Markdown inside AI bubbles */
	.bubble.assistant :global(p) { margin: 0 0 1rem; }
	.bubble.assistant :global(p:last-child) { margin-bottom: 0; }
	.bubble.assistant :global(code) {
		background: var(--cream);
		padding: 0.15rem 0.375rem;
		border-radius: 0.3125rem;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.875em;
		color: var(--amber-deep);
	}
	.bubble.assistant :global(pre) {
		background: var(--ink);
		color: var(--cream);
		padding: 1.25rem;
		border-radius: 0.75rem;
		overflow-x: auto;
		margin: 1rem 0;
	}
	.bubble.assistant :global(pre code) { background: transparent; padding: 0; color: inherit; }
	.bubble.assistant :global(ul), .bubble.assistant :global(ol) { padding-left: 1.25rem; margin: 0 0 1rem; }
	.bubble.assistant :global(li) { margin-bottom: 0.5rem; }

	.copy-btn {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		width: 28px; height: 28px;
		background: var(--cream);
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--ink-3);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s, color 0.15s;
	}
	.bubble.assistant:hover .copy-btn { opacity: 1; }
	.copy-btn:hover { color: var(--amber-deep); }

	/* Loading dots */
	.bubble.loading {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 1rem 1.375rem;
	}
	.dot {
		width: 6px; height: 6px;
		background: var(--amber);
		border-radius: 50%;
		animation: dot-bounce 1.4s ease-in-out infinite;
	}
	.dot:nth-child(2) { animation-delay: 0.2s; }
	.dot:nth-child(3) { animation-delay: 0.4s; }
	@keyframes dot-bounce {
		0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
		40% { transform: scale(1); opacity: 1; }
	}

	/* ── Input area ── */
	.input-area {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1rem 1.5rem 1.5rem;
		background: linear-gradient(to top, oklch(97.5% 0.018 85 / 0.95) 55%, transparent);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.input-box {
		width: 100%;
		max-width: 760px;
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		background: oklch(100% 0 0 / 0.78);
		backdrop-filter: blur(20px) saturate(150%);
		border: 1px solid oklch(100% 0 0 / 0.90);
		border-radius: 1rem;
		padding: 0.625rem 0.625rem 0.625rem 1.125rem;
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 1), 0 4px 20px oklch(18% 0.014 50 / 0.10);
	}
	.input-box:focus-within {
		border-color: oklch(72% 0.185 72 / 0.5);
		box-shadow: inset 0 1px 0 oklch(100% 0 0 / 1), 0 4px 20px oklch(18% 0.014 50 / 0.10), 0 0 0 3px oklch(72% 0.185 72 / 0.10);
	}

	textarea {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		resize: none;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--ink);
		line-height: 1.5;
		max-height: 160px;
		padding: 0.25rem 0;
	}
	textarea::placeholder { color: var(--ink-3); }

	.send-btn {
		width: 40px; height: 40px;
		background: var(--amber);
		border: none;
		border-radius: 0.625rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: oklch(14% 0.01 50);
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.12s, transform 0.1s;
	}
	.send-btn:hover { background: var(--amber-deep); }
	.send-btn:active { transform: scale(0.95); }
	.send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

	.input-note {
		margin-top: 0.625rem;
		font-size: 0.6875rem;
		color: var(--ink-3);
		font-weight: 500;
	}

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.chat-shell { grid-template-columns: 1fr; }

		.sidebar {
			position: fixed;
			left: 0; top: 0;
			width: 280px;
			z-index: 100;
			transform: translateX(-100%);
			transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
			box-shadow: 4px 0 24px oklch(18% 0.014 50 / 0.1);
		}
		.sidebar.open { transform: translateX(0); }

		.sidebar-overlay {
			position: fixed;
			inset: 0;
			background: oklch(18% 0.014 50 / 0.3);
			z-index: 99;
			backdrop-filter: blur(2px);
		}

		.mobile-bar { display: flex; }

		.chat-window { padding-top: 1.5rem; }
	}

	@media (max-width: 600px) {
		.suggestions { gap: 0; }
		.mode-bar { overflow-x: auto; max-width: 100%; }
		.input-area { padding: 0.75rem 1rem 1.25rem; }
	}
</style>
