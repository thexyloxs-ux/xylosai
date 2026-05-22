import { getAuthAvailability } from '$lib/server/runtime-config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		authAvailability: getAuthAvailability()
	};
};
