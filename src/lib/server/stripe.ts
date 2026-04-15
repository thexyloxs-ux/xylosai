import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2026-03-25.dahlia'
});

export async function createOrRetrieveCustomer(email: string, name?: string): Promise<string> {
	const existing = await stripe.customers.list({ email, limit: 1 });
	if (existing.data.length > 0) return existing.data[0].id;

	const customer = await stripe.customers.create({ email, name });
	return customer.id;
}

export async function updateSubscriptionQuantity(
	subscriptionId: string,
	newQuantity: number
): Promise<void> {
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
	const itemId = subscription.items.data[0]?.id;
	if (!itemId) return;

	await stripe.subscriptions.update(subscriptionId, {
		items: [{ id: itemId, quantity: Math.max(1, newQuantity) }]
	});
}
