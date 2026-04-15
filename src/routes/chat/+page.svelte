<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import type { Organization, Profile } from '$lib/types/database';
	import '../landing.css';

	const { data } = $props<{
		data: App.PageData & { profile: Profile | null; organization: Organization | null; conversations: any[] };
	}>();
	const { profile, organization: _org, conversations: initialConversations } = data;
	let conversations = $state(initialConversations);
	
	type Message = { role: 'user' | 'assistant'; content: string };
	
	let messages: Message[] = $state([]);
	let input = $state('');
	let loading = $state(false);
	let fetchingHistory = $state(false);
	let chatWindow: HTMLElement;

	let sessionType = $state('understand');
	let subject = $state(profile?.subjects?.[0] || '');
	let conversationId = $state<string | null>(null);

	async function loadConversation(id: string) {
		if (fetchingHistory || id === conversationId) return;
		
		fetchingHistory = true;
		conversationId = id;
		messages = []; // Clear current chat
		
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
	}

	// Configure marked for safe rendering
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			alert('Copied to clipboard!');
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
					sessionType,
					subject,
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
			
			// Add placeholder assistant message
			messages.push({ role: 'assistant', content: '' });
			let lastIdx = messages.length - 1;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				
				const chunk = decoder.decode(value, { stream: true });
				messages[lastIdx].content += chunk;
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
		if (chatWindow) {
			chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
		}
	}

	const suggestions = [
		"Explain photosynthesis like I'm 10",
		"Give me a study plan for WAEC Biology",
		"Quiz me on English grammar for BECE",
		"How does the kidney work?"
	];
</script>

<svelte:head>
	<title>Chat | XYLO</title>
</svelte:head>

<div class="aw-page">
<div class="chat-layout">
	<!-- Sidebar: The Control Deck -->
	<aside class="sidebar island">
		<div class="sidebar-header">
			<a href="/" class="aw-logo" style="margin-bottom: 2rem; display: block;">XYLO</a>
			<button class="aw-btn aw-btn-secondary new-chat-btn" onclick={startNewChat}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
				New Chat
			</button>
		</div>
		
		<div class="chat-history">
			<div class="sidebar-section">
				<p class="history-label">Focus Subject</p>
				<select bind:value={subject} class="subject-select">
					<option value="">General Help</option>
					{#each profile?.subjects || ['Mathematics', 'English', 'Biology', 'Physics', 'Chemistry', 'Economics'] as s}
						<option value={s}>{s}</option>
					{/each}
				</select>
			</div>

			<div class="sidebar-section">
				<p class="history-label">Recent History</p>
				<div class="history-list">
					{#if !conversationId}
						<div class="history-item active">Current Session</div>
					{/if}
					
					{#each conversations as conv}
						<button 
							class="history-item island-card" 
							class:active={conversationId === conv.id}
							onclick={() => loadConversation(conv.id)}
						>
							<span class="conv-title">{conv.title}</span>
							<span class="conv-meta">{new Date(conv.last_message_at).toLocaleDateString()}</span>
						</button>
					{:else}
						{#if conversationId}
							<button class="history-item active" onclick={startNewChat}>New Chat</button>
						{/if}
						<div class="history-item empty">No history yet</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="sidebar-footer">
			<div class="user-pill glass">
				<div class="avatar">{profile?.full_name?.charAt(0) || 'U'}</div>
				<div class="user-info">
					<span class="user-name">{profile?.full_name || 'Student'}</span>
					<span class="user-role">{profile?.level || 'Basic'} Level</span>
				</div>
			</div>
			<button class="aw-btn aw-btn-ghost sign-out-btn" onclick={async () => { await data.supabase.auth.signOut(); goto('/'); }}>
				Sign out
			</button>
		</div>
	</aside>

	<!-- Main Chat Area -->
	<main class="main-content">
		<div class="chat-window" bind:this={chatWindow}>
			{#if messages.length === 0}
				<div class="empty-state">
					<div class="welcome-icon">🎓</div>
					<h1 class="hero-text-grad">How can I help you study?</h1>
					<div class="suggestions-grid">
						{#each suggestions as s}
							<button class="suggestion-card" onclick={() => { input = s; sendMessage(); }}>
								{s}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="message-list">
				{#each messages as m}
					<div class="message-row {m.role}">
						<div class="message-bubble {m.role === 'user' ? 'user-bubble' : 'ai-bubble'}">
							{#if m.role === 'assistant'}
								{@html marked.parse(m.content)}
								<button class="action-btn copy" onclick={() => copyToClipboard(m.content)} title="Copy message">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
								</button>
							{:else}
								{m.content}
							{/if}
						</div>
					</div>
				{/each}
				
				{#if loading}
					<div class="message-row assistant">
						<div class="message-bubble loading ai-bubble">
							<span class="aura">.</span><span class="aura">.</span><span class="aura">.</span>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Input Area: Command Island -->
		<div class="input-area">
			<div class="mode-selector">
				{#each [
					{ id: 'understand', label: 'Understand', color: '#3b82f6', icon: '📖' },
					{ id: 'quiz', label: 'Quiz Me', color: '#8b5cf6', icon: '✏️' },
					{ id: 'study_plan', label: 'Study Plan', color: '#f59e0b', icon: '📅' },
					{ id: 'exam_prep', label: 'Exam Prep', color: '#22c55e', icon: '🎯' }
				] as m}
					<button 
						class="mode-pill" 
						class:active={sessionType === m.id}
						style="--color: {m.color}"
						onclick={() => sessionType = m.id}
					>
						<span>{m.icon}</span> {m.label}
					</button>
				{/each}
			</div>

			<div class="input-container pill-island">
				<textarea 
					placeholder="Ask XYLO anything..." 
					bind:value={input}
					onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
				></textarea>
				<button class="aw-btn aw-btn-primary send-btn" disabled={!input.trim()} onclick={sendMessage}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
				</button>
			</div>
			<p class="input-note">XYLO can make mistakes. Verify important info.</p>
		</div>
	</main>
</div>
</div>

<style>
	:global(body) { margin: 0; background: #fafafa; font-family: 'Inter', sans-serif; overflow: hidden; }
	
	.chat-layout {
		display: grid;
		grid-template-columns: 320px 1fr;
		height: 100dvh;
		padding: 1.25rem;
		gap: 1.25rem;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
	}

	/* ── Sidebar: Floating Control Deck ────────────────── */
	.sidebar.island {
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(48px);
		-webkit-backdrop-filter: blur(48px);
		border: 1px solid rgba(255, 255, 255, 0.8);
		border-radius: 2rem;
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.04), 
			0 2px 4px rgba(0, 0, 0, 0.02),
			inset 0 1px 0 rgba(255, 255, 255, 1);
		position: relative;
	}
	/* Outer hairline for sidebar */
	.sidebar.island::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: 2rem;
		border: 1px solid rgba(0, 0, 0, 0.06);
		pointer-events: none;
	}

	.sidebar-header { margin-bottom: 2.5rem; }
	
	.sidebar-section { margin-bottom: 2.5rem; }
	.history-label { 
		font-size: 0.75rem; 
		font-weight: 800; 
		color: #94a3b8; 
		text-transform: uppercase; 
		letter-spacing: 0.1em; 
		margin-bottom: 1rem; 
	}
	
	.subject-select {
		width: 100%;
		padding: 0.875rem 1rem;
		background: #fff;
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 1rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #1e293b;
		outline: none;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 1rem center;
	}
	.subject-select:hover { border-color: rgba(245, 158, 11, 0.4); transform: translateY(-1px); }
	.subject-select:focus { border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }

	.history-list { display: flex; flex-direction: column; gap: 0.375rem; }
	.history-item { 
		padding: 0.75rem 1rem; 
		border-radius: 0.875rem; 
		font-size: 0.9375rem; 
		font-weight: 500;
		color: #475569; 
		cursor: pointer;
		transition: all 0.2s;
	}
	.history-item:hover { background: rgba(0, 0, 0, 0.03); color: #0f172a; }
	.history-item.active { 
		background: rgba(245, 158, 11, 0.08); 
		color: #d97706; 
		font-weight: 700; 
		border: 1px solid rgba(245, 158, 11, 0.15);
	}

	.sidebar-footer { border-top: 1px solid rgba(0, 0, 0, 0.05); padding-top: 1.5rem; margin-top: auto; }
	.user-pill.glass { 
		display: flex; 
		align-items: center; 
		gap: 1rem; 
		padding: 0.75rem; 
		border-radius: 1.25rem; 
		background: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(0, 0, 0, 0.04);
		margin-bottom: 1rem;
	}
	.avatar { 
		width: 40px; height: 40px; 
		background: linear-gradient(135deg, #f59e0b, #d97706); 
		border-radius: 50%; 
		display: flex; align-items: center; justify-content: center; 
		font-weight: 800; color: #fff; 
		box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
	}
	.user-info { display: flex; flex-direction: column; }
	.user-name { font-size: 0.9375rem; font-weight: 800; color: #1e293b; }
	.user-role { font-size: 0.75rem; color: #64748b; font-weight: 600; }

	/* ── Main Chat Area ────────────────────────────────── */
	.main-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2rem;
		overflow: hidden;
	}

	.chat-window {
		flex: 1;
		overflow-y: auto;
		padding: 2rem 2rem 10rem 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.message-list {
		width: 100%;
		max-width: 840px;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.message-row { display: flex; width: 100%; transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
	.message-row.user { justify-content: flex-end; }
	
	.message-bubble { 
		max-width: 80%; 
		padding: 1.25rem 1.75rem; 
		border-radius: 1.5rem; 
		line-height: 1.7;
		font-size: 1.0625rem;
		position: relative;
		animation: drop-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	@keyframes drop-in {
		from { opacity: 0; transform: translateY(-12px) scale(0.98); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.user-bubble { 
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
		color: #fff; 
		font-weight: 500;
		border-bottom-right-radius: 0.25rem;
		box-shadow: 0 12px 24px -8px rgba(217, 119, 6, 0.3);
	}
	.ai-bubble { 
		background: #fff; 
		color: #1e293b; 
		border: 1px solid rgba(0,0,0,0.06);
		border-bottom-left-radius: 0.25rem;
		box-shadow: 0 4px 20px rgba(0,0,0,0.03);
	}

	/* Markdown Rendering */
	.ai-bubble :global(p) { margin: 0 0 1.25rem 0; }
	.ai-bubble :global(p:last-child) { margin-bottom: 0; }
	.ai-bubble :global(code) { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.375rem; font-family: 'JetBrains Mono', monospace; font-size: 0.9375rem; color: #d97706; }
	.ai-bubble :global(pre) { background: #0f172a; color: #f8fafc; padding: 1.5rem; border-radius: 1rem; overflow-x: auto; margin: 1.5rem 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
	.ai-bubble :global(pre code) { background: transparent; padding: 0; color: inherit; }
	.ai-bubble :global(ul), .ai-bubble :global(ol) { margin: 0 0 1.25rem 1.5rem; }
	.ai-bubble :global(li) { margin-bottom: 0.75rem; }

	.action-btn {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		width: 32px; height: 32px;
		background: #fff;
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 0.75rem;
		display: flex; align-items: center; justify-content: center;
		color: #64748b; cursor: pointer;
		opacity: 0; transition: all 0.2s;
	}
	.message-bubble:hover .action-btn { opacity: 1; }
	.action-btn:hover { background: #fffbeb; color: #f59e0b; border-color: #f59e0b; transform: scale(1.1); }

	.loading .aura { 
		display: inline-block;
		animation: aura-pulse 1.5s infinite both; 
		font-weight: 900;
		color: #f59e0b;
	}
	.loading .aura:nth-child(2) { animation-delay: 0.2s; }
	.loading .aura:nth-child(3) { animation-delay: 0.4s; }
	@keyframes aura-pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }

	.empty-state {
		margin-top: 8vh;
		text-align: center;
		max-width: 640px;
	}
	.welcome-icon { font-size: 4rem; margin-bottom: 2rem; filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.2)); }
	.hero-text-grad { font-size: 2.25rem; font-weight: 900; letter-spacing: -0.04em; margin-bottom: 3rem; color: #1e293b; }
	.suggestions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
	.suggestion-card {
		padding: 1.5rem;
		background: #fff;
		border: 1px solid rgba(0,0,0,0.06);
		border-radius: 1.25rem;
		text-align: left;
		font-size: 1rem;
		font-weight: 600;
		color: #475569;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
		box-shadow: 0 4px 12px rgba(0,0,0,0.02);
	}
	.suggestion-card:hover { border-color: #f59e0b; background: #fffcf0; color: #d97706; transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(245,158,11,0.1); }

	/* ── Input Area: Command Island ──────────────────── */
	.input-area {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		width: calc(100% - 4rem);
		max-width: 840px;
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 10;
	}
	.mode-selector {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(20px);
		border-radius: 999px;
		border: 1px solid rgba(0, 0, 0, 0.04);
		box-shadow: 0 8px 24px rgba(0,0,0,0.04);
	}
	.mode-pill {
		padding: 0.5rem 1.25rem;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 700;
		color: #64748b;
		cursor: pointer;
		display: flex; align-items: center; gap: 0.625rem;
		transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.mode-pill.active { 
		background: #fff; 
		color: var(--color); 
		border-color: rgba(0, 0, 0, 0.06);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transform: scale(1.05);
	}

	.input-container.pill-island {
		width: 100%;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(32px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		border-radius: 1.75rem;
		padding: 0.75rem 1.25rem;
		display: flex;
		align-items: flex-end;
		gap: 1rem;
		box-shadow: 
			0 20px 50px rgba(0,0,0,0.08), 
			0 4px 12px rgba(0,0,0,0.02);
		position: relative;
	}
	.input-container.pill-island::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: 1.75rem;
		border: 1px solid rgba(0, 0, 0, 0.08);
		pointer-events: none;
	}
	
	textarea {
		flex: 1;
		border: none;
		outline: none;
		resize: none;
		padding: 0.5rem 0;
		font-size: 1.125rem;
		font-weight: 500;
		background: transparent;
		color: #1e293b;
		line-height: 1.5;
		max-height: 160px;
		font-family: inherit;
	}
	textarea::placeholder { color: #94a3b8; }

	.send-btn { 
		min-width: 44px; width: 44px; height: 44px; 
		padding: 0; justify-content: center;
		margin-bottom: 0.25rem;
	}

	.input-note { font-size: 0.75rem; color: #94a3b8; font-weight: 600; margin-top: 1rem; }

	@media (max-width: 1024px) {
		.chat-layout { grid-template-columns: 1fr; }
		.sidebar { display: none; }
	}
</style>
