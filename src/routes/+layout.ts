import { createSupabaseLoadClient } from '$lib/supabase';

export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient(fetch);

	const {
		data: { session }
	} = await supabase.auth.getSession();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	return {
		...data,
		session,
		user,
		supabase
	};
};
