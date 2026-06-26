import { expect, Page, test } from 'playwright/test';
import { DISCOURSE, UGH } from '../helper/urls';
import { createKeycloakUser, signIn } from '../helper/keycloak';
import { grogStrongjaw, scanlanShorthalt, TestUser } from '../helper/test-user';
import { signInDiscourse } from '../helper/discourse';
import { inSeparateBrowser, getRandomString } from '../helper/util';

async function signInWaitForDiscourseIframe(page: Page, user: TestUser) {
	await page.goto(UGH);
	await Promise.all([
		page.waitForResponse(`${DISCOURSE}session/current.json`), // allow hidden iframe to login to discourse
		signIn(page, user)
	]);
	await expect(page.getByTestId('app-sidebar')).toBeVisible();
}

const DISCOURSE_IFRAME_LOCATOR = 'iframe[title="discourse-iframe"]';

test.describe('Community', () => {
	test.skip(
		({ browserName }) => browserName === 'firefox',
		'Discourse tests are unstable on Firefox, will be fixed'
	);

	let grog: TestUser;
	let scanlan: TestUser;

	test.beforeAll('Setup - Create Community users', async ({ browser }) => {
		await Promise.all([
			inSeparateBrowser(browser, async (page) => {
				// Create Keycloak users
				scanlan = await createKeycloakUser(scanlanShorthalt());

				// Create Discourse user for Scanlan
				await signInDiscourse(page, scanlan);
			}),
			inSeparateBrowser(browser, async (page) => {
				// Create Keycloak users
				grog = await createKeycloakUser(grogStrongjaw());

				// Create Discourse user for Grog
				await signInDiscourse(page, grog);
			})
		]);
	});

	test('Show correct Avatar in Discourse', async ({ page }) => {
		await signInDiscourse(page, grog);

		const img = page
			.getByRole('button', { name: `Benachrichtigungen und Konto` })
			.locator('.avatar');
		await expect(img).toBeVisible();
		await expect(img).toHaveCSS('content', `url("${DISCOURSE}images/settings_icon.svg")`);
	});

	test('Show Community topics on home page', async ({ page }) => {
		await page.goto(UGH);
		await signInWaitForDiscourseIframe(page, scanlan);

		// expect Community topics to show up
		await expect(page.getByRole('link', { name: 'Willkommen bei Discourse! 👋' })).toBeVisible();
	});

	test('Welcome buttons lead to correct community page', async ({ page }) => {
		await page.goto(UGH);
		await signInWaitForDiscourseIframe(page, scanlan);

		await page.getByRole('link', { name: 'Nachricht schreiben' }).click();
		await expect(
			page
				.locator('iframe[title="discourse-iframe"]')
				.contentFrame()
				.getByRole('button', { name: 'Persönlichen Chat erstellen' })
		).toBeVisible();

		await page.getByLabel('Startseite').click();

		await page.getByRole('link', { name: 'Beitrag verfassen' }).click();
		await expect(
			page
				.locator('iframe[title="discourse-iframe"]')
				.contentFrame()
				.getByText('Neues Thema erstellen')
		).toBeVisible({ timeout: 30000 });
	});

	test('Send chat message between two users', async ({ browser, page }) => {
		await signInWaitForDiscourseIframe(page, grog);
		await page.getByTestId('app-sidebar').getByLabel('Chat').click();

		await page.getByTestId('app-sidebar-toggle').click(); // expand sidebar

		// assert that notification count is NOT visible
		for (const name of ['Community', 'Chat']) {
			await expect(
				page
					.getByTestId('app-sidebar')
					.getByRole('link', { name })
					.getByTestId('flowbite-sidebar-label')
			).not.toBeVisible();
		}

		// sign in to Discourse as Scanlan & send direct message to Grog
		const scanlanPage = await browser.newPage();
		await signInWaitForDiscourseIframe(scanlanPage, scanlan);

		// send message from Scanlan to Grog
		await scanlanPage.getByTestId('app-sidebar').getByLabel('Chat').click();
		const iframe = scanlanPage.frameLocator(DISCOURSE_IFRAME_LOCATOR);

		await iframe.getByRole('button', { name: 'Eine Unterhaltung starten' }).click();
		await iframe.getByPlaceholder('Filter').fill(grog.email.split(/@/)[0]);
		await iframe.getByRole('button', { name: grog.email.split(/@/)[0] }).click();

		const msgOne = `Hi ${grog.firstName}, I'm ${scanlan.firstName} ${getRandomString(6)}`;
		const chatInputField = iframe.getByPlaceholder(`Chat mit ${grog.firstName} ${grog.lastName}`);

		await chatInputField.fill(msgOne);
		await iframe.getByRole('button', { name: 'Senden' }).click();

		// assert that notification count is visible
		await expect(
			page
				.getByTestId('app-sidebar')
				.getByRole('link', { name: 'Community' })
				.getByTestId('flowbite-sidebar-label')
		).not.toBeVisible();
		await expect(
			page.getByTestId('app-sidebar').getByRole('link', { name: 'Chat' }).getByText('1')
		).toBeVisible();

		// assert message received by Grog
		const iframeGrog = page.frameLocator(DISCOURSE_IFRAME_LOCATOR);
		await iframeGrog
			.locator('#main-outlet')
			.getByRole('link', { name: `${scanlan.firstName} ${scanlan.lastName}` })
			.click();
		await expect(iframeGrog.getByText(msgOne)).toBeVisible();

		await scanlanPage.close();
	});

	test('Post new topic and mention user', async ({ browser, page }) => {
		await signInWaitForDiscourseIframe(page, grog);
		await page.getByTestId('app-sidebar-toggle').click(); // expand sidebar
		await expect(
			page
				.getByTestId('app-sidebar')
				.getByRole('link', { name: 'Community' })
				.getByTestId('flowbite-sidebar-label')
		).not.toBeVisible();

		// sign in to Discourse as Scanlan & send direct message to Grog
		const scanlanPage = await browser.newPage();
		await signInWaitForDiscourseIframe(scanlanPage, scanlan);

		// create new topic and mention Grog
		await scanlanPage.getByRole('link', { name: 'Beitrag verfassen' }).click();
		const iframe = scanlanPage.frameLocator(DISCOURSE_IFRAME_LOCATOR);
		await iframe
			.getByPlaceholder('Gib einen Titel ein oder füge')
			.fill(`${getRandomString(6)}: This is a test topic`);
		await iframe.getByRole('switch', { name: 'Zum Standard-Markdown-Editor' }).click();
		await iframe
			.getByPlaceholder('Schreib hier. Verwende')
			.fill(`@${grog.email.split('@')[0]} Hey ${grog.firstName}, this is my first topic.`);
		await iframe.getByPlaceholder('Schreib hier. Verwende').press('End');
		await iframe.getByRole('button', { name: 'Thema erstellen' }).click();

		// assert that notification count is visible
		await expect(
			page.getByTestId('app-sidebar').getByRole('link', { name: 'Community' }).getByText('1')
		).toBeVisible();

		await scanlanPage.close();
	});
});
