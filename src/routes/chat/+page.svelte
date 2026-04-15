<script lang="ts">
	// Placeholder — full chat UI with Groq streaming coming next
</script>

<svelte:head>
	<title>Chat — XYLO</title>
</svelte:head>

<div class="placeholder-page">
	<div class="placeholder-card">
		<a href="/" class="logo">XYLO</a>
		<h1>Chat is coming next</h1>
		<p>Sign-in is working. The full AI chat interface is being built.</p>
		<a href="/auth/login" class="sign-out">← Sign out</a>
	</div>
</div>

<style>
	.placeholder-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0f1117;
		padding: 1.5rem;
	}
	.placeholder-card {
		text-align: center;
		max-width: 400px;
	}
	.logo {
		display: block;
		font-size: 1.5rem;
		font-weight: 800;
		color: #f59e0b;
		letter-spacing: -0.03em;
		margin-bottom: 2rem;
	}
	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #f8fafc;
		margin-bottom: 0.75rem;
	}
	p {
		font-size: 0.9375rem;
		color: #64748b;
		margin-bottom: 2rem;
		line-height: 1.6;
	}
	.sign-out {
		font-size: 0.875rem;
		color: #f59e0b;
		font-weight: 600;
	}
</style>
