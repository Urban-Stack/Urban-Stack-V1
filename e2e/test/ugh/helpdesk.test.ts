import test, { expect } from 'playwright/test';
import { createKeycloakUser } from '../helper/keycloak';
import { grogStrongjaw } from '../helper/test-user';
import { signInWithUser } from '../helper/ugh';

test.describe('Helpdesk', () => {
	test('Submit request', async ({ page }) => {
		const grog = await createKeycloakUser(grogStrongjaw(), ['guetersloh', `guetersloh/read`]);
		await signInWithUser(page, grog);

		await page.getByRole('link', { name: 'Helpdesk', exact: true }).click();

		await page.getByRole('textbox', { name: 'Grund*' }).fill('Any reason');
		await page
			.getByRole('textbox', { name: 'Beschreibung*' })
			.fill('Something does not work as expected.');
		await page.getByRole('button', { name: 'Senden' }).click();

		await expect(page.getByText('Ihre Anfrage wurde erfolgreich übermittelt')).toBeVisible();
	});
});
