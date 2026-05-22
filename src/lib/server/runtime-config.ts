import {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	PAYSTACK_PLUS_PLAN_CODE,
	PAYSTACK_PRO_PLAN_CODE,
	PAYSTACK_SCHOOL_PLAN_CODE
} from '$env/static/private';

export function isConfiguredSecret(value: string | undefined): value is string {
	if (!value) return false;

	const normalized = value.trim().toLowerCase();
	return (
		normalized.length > 0 &&
		!normalized.includes('placeholder') &&
		!normalized.includes('your_') &&
		!normalized.includes('_here')
	);
}

export function getAuthAvailability() {
	return {
		google: isConfiguredSecret(GOOGLE_CLIENT_ID) && isConfiguredSecret(GOOGLE_CLIENT_SECRET)
	};
}

export function getBillingAvailability() {
	return {
		plus: isConfiguredSecret(PAYSTACK_PLUS_PLAN_CODE),
		pro: isConfiguredSecret(PAYSTACK_PRO_PLAN_CODE),
		school: isConfiguredSecret(PAYSTACK_SCHOOL_PLAN_CODE)
	};
}
