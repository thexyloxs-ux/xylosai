import { writable, derived } from 'svelte/store';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '$lib/types/database';

export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const profile = writable<Profile | null>(null);
export const authLoading = writable(true);

export const isLoggedIn = derived(user, ($user) => !!$user);
export const isOrgAdmin = derived(
	profile,
	($profile) => $profile?.role === 'org_admin'
);
export const isMember = derived(
	profile,
	($profile) => $profile?.role === 'member'
);
export const isPaid = derived(profile, ($profile) => {
	if (!$profile) return false;
	return $profile.plan !== 'free' && $profile.plan_status === 'active';
});
