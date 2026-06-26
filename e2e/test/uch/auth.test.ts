import { expect, Page, test } from 'playwright/test';
import { KEYCLOAK, MAILHOG, UCH } from '../helper/urls';
import { DATA_HUB_ADMIN_PASSWORD, signInWith } from '../helper/keycloak';
import { getMailhogClient } from '../helper/mail';
import { decode as decodeQuotedPrintable } from 'libqp';
import { grogStrongjaw, TestUserCreation } from '../helper/test-user';

const createUser = async (page: Page, userInfo: TestUserCreation) => {
	await page.goto(`${KEYCLOAK}realms/citizenhub/account`);
	await page.getByRole('button', { name: 'Registrieren' }).click();
	await page.getByRole('textbox', { name: 'E-Mail:' }).fill(userInfo.email);
	await page.getByRole('textbox', { name: 'Passwort:' }).fill(DATA_HUB_ADMIN_PASSWORD);
	await page.getByRole('textbox', { name: 'Passwort bestätigen' }).fill(DATA_HUB_ADMIN_PASSWORD);
	await page.getByRole('textbox', { name: 'Vorname' }).fill(userInfo.firstName);
	await page.getByRole('textbox', { name: 'Nachname' }).fill(userInfo.lastName);
	// terms and conditions
	await page.getByRole('checkbox', { name: 'Ich habe die' }).check();
	await page.getByRole('button', { name: 'Registrieren' }).click();

	await page.waitForTimeout(5_000);
	let mail: any;
	await expect(async () => {
		const mailhogClient = getMailhogClient();
		mail = JSON.parse(
			(
				await mailhogClient.get<string>(
					`${MAILHOG}api/v2/search?kind=to&query=${encodeURIComponent(userInfo.email)}`
				)
			).data
		).items[0];
		expect(mail).toBeDefined();
	}).toPass({ intervals: [2_000] });
	const body = new TextDecoder('utf-8').decode(
		decodeQuotedPrintable(mail.MIME.Parts[0].Body as string)
	);

	const link = /^https:.*$/m.exec(body)[0];
	expect(link).toBeTruthy();

	await page.goto(link);

	await page.getByRole('button', { name: `${userInfo.firstName} ${userInfo.lastName}` }).click();
	await page.getByRole('menuitem', { name: 'Abmelden' }).click();
	await expect(page.getByRole('heading', { name: 'Urban Citizen Hub' })).toBeVisible();
};

const deleteUser = async (page: Page, userInfo: TestUserCreation) => {
	await page.goto(`${KEYCLOAK}realms/citizenhub/account`);
	await signInWith(page, userInfo.email, userInfo.password);
	await page.getByRole('button', { name: 'Benutzerkonto löschen' }).click();
	await page.getByRole('button', { name: 'Löschen', exact: true }).click();
	if (
		!(
			await page.getByRole('button', { name: /Löschung bestätigen|Anmelden/ }).inputValue()
		).includes('Löschung bestätigen')
	) {
		// sometimes it asks for the password again
		await page.getByRole('textbox', { name: 'Passwort:' }).fill(DATA_HUB_ADMIN_PASSWORD);
		await page.getByRole('button', { name: 'Anmelden' }).click();
	}
	await page.getByRole('button', { name: 'Löschung bestätigen' }).click();
	await expect(page.getByText('Nutzer erfolgreich gelöscht')).toBeVisible();
};

test('authentication flow', async ({ page }) => {
	// create user
	const grog = grogStrongjaw();
	await createUser(page, grog);
	await page.goto(UCH);

	const signinButton = page.getByRole('button', { name: 'Anmelden/Registrieren' });
	await expect(signinButton).toBeVisible();
	await signinButton.click();

	// Assert visibility of element on login page
	await expect(page.getByRole('heading', { name: '👋 Willkommen zurück!' })).toBeVisible();
	await expect(page.getByText('E-Mail:')).toBeVisible();
	await expect(page.getByText('Passwort:')).toBeVisible();
	await expect(page.getByText('Angemeldet bleiben')).toBeVisible();
	await expect(page.getByText('Passwort vergessen?')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible();

	await expect(page.getByRole('heading', { name: 'Urban Citizen Hub' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Mehr erfahren' })).toBeVisible();

	// sign in and expect home page
	await signInWith(page, grog.email, grog.password);
	expect(page.url()).toContain(UCH);

	// click settings button and expect redirect to Keycloak account page
	const avatar = page.getByTestId('app-navbar').getByTestId('udp-avatar');
	await avatar.click();

	const dropdownMenu = page.getByTestId('flowbite-dropdown');
	await expect(dropdownMenu).toBeVisible();
	await expect(dropdownMenu.getByText(grog.email)).toBeVisible();
	await expect(dropdownMenu.getByText(`${grog.firstName} ${grog.lastName}`)).toBeVisible();

	// opens settings page in new tab
	const settingsButton = page.getByRole('link', { name: 'Einstellungen' });
	const [settingsPage] = await Promise.all([page.waitForEvent('popup'), settingsButton.click()]);
	await settingsPage.waitForLoadState();
	await expect(settingsPage).toHaveURL((url) =>
		url.toString().includes(`${KEYCLOAK}realms/citizenhub/account`)
	);
	await expect(settingsPage.getByRole('heading', { name: 'Persönliche Angaben' })).toBeVisible();
	await settingsPage.close();

	await page.goto(UCH);
	expect(page.url()).toContain(UCH);

	// click sign out button and expect redirect to Keycloak logout page
	await avatar.click();
	await page.getByRole('link', { name: 'Abmelden' }).click();
	await expect(page.getByRole('button', { name: 'Abmelden' })).toBeVisible();
	expect(page.url()).toContain(KEYCLOAK);

	// Assert visibility of element on login page
	await expect(page.getByRole('heading', { name: 'Abmelden' })).toBeVisible();
	await expect(page.getByText('Wollen Sie sich abmelden?')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Abmelden' })).toBeVisible();
	await expect(page.getByRole('link', { name: '« Zurück zur Applikation' })).toBeVisible();

	// logout from Keycloak and expect redirect to citizenhub
	await page.getByRole('button', { name: 'Abmelden' }).click();
	expect(page.url()).toContain(UCH);
	await expect(signinButton).toBeVisible();

	await deleteUser(page, grog);
});
