import { expect, Page } from 'playwright/test';
import { TestUserCreation } from './test-user';
import { signIn } from './keycloak';
import { DISCOURSE } from './urls';

export const signInDiscourse: (page: Page, user: TestUserCreation) => Promise<void> = async (
	page,
	user
) => {
	await page.goto(DISCOURSE);
	await signIn(page, user);
	await confirmDiscourseLogin(page);
};

export async function confirmDiscourseLogin(page: Page) {
	const content = await page.getByText(/Neues Thema|Dein Benutzername ist verfügbar/).textContent();
	if (content.includes('Benutzername')) {
		await page.getByRole('button', { name: 'Registrieren' }).click();
	}
	await expect(page.getByRole('button', { name: 'Benachrichtigungen und Konto' })).toBeVisible();
}
