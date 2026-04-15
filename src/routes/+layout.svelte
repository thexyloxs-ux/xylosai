<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { profile, session, user } from '$lib/stores/auth';

	const { data, children } = $props();

	$effect(() => {
		user.set(data.user ?? null);
		session.set(data.session ?? null);
		profile.set(data.profile ?? null);
	});

	onMount(() => {
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== data.session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

{@render children()}
