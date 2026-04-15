<script lang="ts">
	import '../../landing.css';
</script>

<svelte:head>
	<title>Joining School | XYLO</title>
</svelte:head>

<div class="aw-page join-wrapper">
	<div class="glow-aura"></div>
	
	<div class="auth-card glass-deck join-island">
		<div class="loading-content">
			<div class="spinner-aura">
				<div class="spinner"></div>
			</div>
			<div class="text-content">
				<h1 class="join-title">Linking your account...</h1>
				<p class="join-sub">Connecting you to your school's AI resources.</p>
			</div>
		</div>
	</div>
</div>

<style>
	.join-wrapper {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		position: relative;
		overflow: hidden;
	}

	.glow-aura {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%);
		pointer-events: none;
		z-index: 0;
	}

	.join-island.glass-deck {
		width: 100%;
		max-width: 440px;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(48px);
		border-radius: 2.5rem;
		padding: 3rem 2.5rem;
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1);
		position: relative;
		z-index: 1;
		animation: auth-reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		text-align: center;
	}

	.spinner-aura {
		position: relative;
		width: 64px;
		height: 64px;
		display: grid;
		place-items: center;
	}
	.spinner-aura::after {
		content: '';
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 80%);
		animation: pulse 2s ease-in-out infinite;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(245, 158, 11, 0.1);
		border-top-color: #f59e0b;
		border-radius: 50%;
		animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
	}

	.join-title {
		font-size: 1.5rem;
		font-weight: 900;
		color: #0f172a;
		letter-spacing: -0.03em;
		margin-bottom: 0.5rem;
	}
	.join-sub {
		font-size: 0.9375rem;
		color: #64748b;
		font-weight: 500;
		line-height: 1.6;
	}

	@keyframes spin { to { transform: rotate(360deg); } }
	@keyframes pulse {
		0%, 100% { transform: scale(1); opacity: 0.5; }
		50% { transform: scale(1.2); opacity: 1; }
	}
	@keyframes auth-reveal {
		from { opacity: 0; transform: translateY(20px) scale(0.98); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}
</style>
