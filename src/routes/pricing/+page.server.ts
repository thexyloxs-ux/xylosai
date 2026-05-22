import { getBillingAvailability } from '$lib/server/runtime-config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		billingAvailability: getBillingAvailability()
	};
};
