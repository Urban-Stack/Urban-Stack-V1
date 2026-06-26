import test, { expect } from 'playwright/test';
import { getRandomString } from '../helper/util';
import { DATA_HUB_ADMIN_PASSWORD } from '../helper/keycloak';
import { KEYCLOAK, MAILHOG } from '../helper/urls';
import { getMailhogClient } from '../helper/mail';
import { decode as decodeQuotedPrintable } from 'libqp';

test('can register and delete account', async ({ page }) => {
	const email = `${getRandomString(6)}@example.com`;
	await test.step('register', async () => {
		await page.goto(`${KEYCLOAK}realms/citizenhub/account`);
		await page.getByRole('button', { name: 'Registrieren' }).click();
		await page.getByRole('textbox', { name: 'E-Mail:' }).fill(email);
		await page.getByRole('textbox', { name: 'Passwort:' }).fill(DATA_HUB_ADMIN_PASSWORD);
		await page.getByRole('textbox', { name: 'Passwort bestätigen' }).fill(DATA_HUB_ADMIN_PASSWORD);
		await page.getByRole('textbox', { name: 'Vorname' }).fill('A');
		// terms and conditions
		await page.getByRole('checkbox', { name: 'Ich habe die' }).check();
		await page.getByRole('button', { name: 'Registrieren' }).click();
	});
	await test.step('confirm email', async () => {
		await page.waitForTimeout(5_000);
		let mail: any;
		await expect(async () => {
			const mailhogClient = getMailhogClient();
			mail = JSON.parse(
				(
					await mailhogClient.get<string>(
						`${MAILHOG}api/v2/search?kind=to&query=${encodeURIComponent(email)}`
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
	});
	await test.step('update user info', async () => {
		await page.getByTestId('lastName').fill('F');
		await page.getByTestId('save').click();
		await expect(page.getByText('Ihr Benutzerkonto wurde aktualisiert')).toBeVisible();
	});
	await test.step('delete user', async () => {
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
	});
});
