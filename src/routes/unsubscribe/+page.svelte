<script lang="ts">
	const { data } = $props<{ data: { success: boolean; email: string } }>();
</script>

<svelte:head>
	<title>Unsubscribe — XYLO</title>
</svelte:head>

<main class="unsubscribe-page">
	<div class="card">
		<span class="logo">XYLO</span>

		{#if data.success}
			<h1>You're unsubscribed.</h1>
			<p>
				{#if data.email}
					<strong>{data.email}</strong> will no longer receive marketing emails from XYLO.
				{:else}
					You will no longer receive marketing emails from XYLO.
				{/if}
			</p>
			<p class="note">
				Account and billing notifications may still be sent as they are required to manage your
				account.
			</p>
		{:else}
			<h1>Something went wrong.</h1>
			<p>We couldn't process your unsubscribe request. Please try again or contact us at
				<a href="mailto:hello@xyloss.tech">hello@xyloss.tech</a>.
			</p>
		{/if}

		<a href="/" class="home-link">Back to XYLO</a>
	</div>
</main>

<style>
	.unsubscribe-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0f1117;
		padding: 24px;
	}

	.card {
		max-width: 480px;
		width: 100%;
		background: #161b2e;
		border: 1px solid #1e2336;
		border-radius: 12px;
		padding: 40px;
		text-align: center;
	}

	.logo {
		font-size: 20px;
		font-weight: 900;
		color: #f59e0b;
		letter-spacing: -0.04em;
		display: block;
		margin-bottom: 24px;
	}

	h1 {
		font-size: 22px;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0 0 12px;
	}

	p {
		font-size: 15px;
		color: #94a3b8;
		line-height: 1.6;
		margin: 0 0 12px;
	}

	.note {
		font-size: 13px;
		color: #4b5563;
		margin-top: 16px;
	}

	a {
		color: #f59e0b;
		text-decoration: none;
	}

	.home-link {
		display: inline-block;
		margin-top: 24px;
		font-size: 14px;
		color: #64748b;
	}

	.home-link:hover {
		color: #94a3b8;
	}
</style>
