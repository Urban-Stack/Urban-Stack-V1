import { expect, test } from 'playwright/test';
import { KEYCLOAK } from './helper/urls';
import { hasLegalLinks } from './helper/util';
import { DATA_HUB_ADMIN_PASSWORD, DATA_HUB_ADMIN_USERNAME, signInWith } from './helper/keycloak';

test.describe('has legal links', () => {
	test('in udh login form', async ({ page }) => {
		await page.goto(`${KEYCLOAK}realms/udh/account/`);
		await hasLegalLinks(page);
	});

	test('in account console', async ({ page }) => {
		await page.goto(`${KEYCLOAK}realms/udh/account/`);
		await signInWith(page, DATA_HUB_ADMIN_USERNAME, DATA_HUB_ADMIN_PASSWORD);
		await expect(page.getByRole('button', { name: 'Kontosicherheit' })).toBeVisible();
		await hasLegalLinks(page);
	});

	test('in admin console', async ({ page }) => {
		await page.goto(`${KEYCLOAK}admin/udh/console/`);
		await signInWith(page, DATA_HUB_ADMIN_USERNAME, DATA_HUB_ADMIN_PASSWORD);
		await expect(page.getByRole('link', { name: 'Gruppen' })).toBeVisible();
		await hasLegalLinks(page);
	});

	test('in password reset form', async ({ page }) => {
		await page.goto(`${KEYCLOAK}admin/udh/console/`);
		await page.getByRole('link', { name: 'Passwort vergessen?' }).click();
		await expect(page.getByText('mit weiteren Instruktionen')).toBeVisible();
		await hasLegalLinks(page);
	});
});
