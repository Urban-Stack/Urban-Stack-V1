import { expect, test } from 'playwright/test';
import { KEYCLOAK, UGH } from '../helper/urls';
import { createKeycloakUser, signInWith } from '../helper/keycloak';
import { getRandomString } from '../helper/util';
import { DATA_HUB_ADMIN_PASSWORD } from '../helper/keycloak';

test('login.BASE_DOMAIN/ redirects to govhub', async ({ page }) => {
	const govhubRequest = page.waitForRequest(UGH);
	await page.goto(KEYCLOAK);
	await govhubRequest;
});

test('authentication flow', async ({ page }) => {
	const email = `e2e-ugh-fe-${getRandomString(6)}@example.com`;
	const password = DATA_HUB_ADMIN_PASSWORD;

	// create user
	await createKeycloakUser({ email, password });

	// visit UGH and expect redirect to Keycloak login page
	await page.goto(UGH);
	expect(page.url()).toContain(KEYCLOAK);

	// Assert visibility of element on login page
	await expect(page.getByRole('heading', { name: '👋 Willkommen zurück!' })).toBeVisible();
	await expect(page.getByText('E-Mail:')).toBeVisible();
	await expect(page.getByText('Passwort:')).toBeVisible();
	await expect(page.getByText('Angemeldet bleiben')).toBeVisible();
	await expect(page.getByText('Passwort vergessen?')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible();

	await expect(page.getByRole('heading', { name: 'Urban Gov Hub' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Mehr erfahren' })).toBeVisible();

	// sign in and expect home page
	await signInWith(page, email, password);
	expect(page.url()).toContain(UGH);

	// click sign out button and expect redirect to Keycloak logout page
	await page.getByTestId('app-navbar').getByTestId('udp-avatar').click();
	await page.getByRole('link', { name: 'Abmelden' }).click();
	await expect(page.getByRole('button', { name: 'Abmelden' })).toBeVisible();
	expect(page.url()).toContain(KEYCLOAK);

	// Assert visibility of element on login page
	await expect(page.getByRole('heading', { name: 'Abmelden' })).toBeVisible();
	await expect(page.getByText('Wollen Sie sich abmelden?')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Abmelden' })).toBeVisible();
	await expect(page.getByRole('link', { name: '« Zurück zur Applikation' })).toBeVisible();

	// logout from Keycloak and expect redirect to Keycloak login page
	await page.getByRole('button', { name: 'Abmelden' }).click();
	await expect(page.getByRole('heading', { name: 'Willkommen zurück!' })).toBeVisible();
	expect(page.url()).toContain(KEYCLOAK);

	// visit random page and expect ended FE session with redirect to Keycloak
	await page.goto(`${UGH}legal-notice`);
	expect(page.url()).toContain(KEYCLOAK);
});
