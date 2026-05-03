import { expect, test } from '@playwright/test';

test('public pricing shows the live plan model', async ({ page }) => {
	await page.goto('/pricing');

	await expect(page.getByRole('heading', { name: /Start free/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /Upgrade to Plus/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /Upgrade to Pro/i })).toBeVisible();
	await expect(page.getByText('3,000')).toBeVisible();
	await expect(page.getByText('5,000')).toBeVisible();
	await expect(page.getByText('Custom school subscription')).toBeVisible();

	await expect(page.getByRole('link', { name: /Upgrade to Plus/i })).toHaveAttribute(
		'href',
		'/api/paystack/initialize?plan=plus'
	);
	await expect(page.getByRole('link', { name: /Upgrade to Pro/i })).toHaveAttribute(
		'href',
		'/api/paystack/initialize?plan=pro'
	);
});

test('home page and school signup entry points are reachable', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByLabel('Main navigation').getByRole('link', { name: /pricing/i })).toBeVisible();
	await page.getByLabel('Main navigation').getByRole('link', { name: /pricing/i }).click();
	await expect(page).toHaveURL(/\/pricing/);

	await expect(page.getByRole('link', { name: 'Register your school', exact: true })).toHaveAttribute(
		'href',
		'/auth/signup?type=school'
	);
});
