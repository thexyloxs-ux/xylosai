import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/types/database';

// Admin client — bypasses RLS (server-side only, never expose)
// Singleton: safe because there is no per-request state on this client.
let _adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createSupabaseAdminClient() {
	if (!_adminClient) {
		_adminClient = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
	}
	return _adminClient;
}
