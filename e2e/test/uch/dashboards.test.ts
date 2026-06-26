import { expect, Page, test } from 'playwright/test';
import { SUPERSET, UCH, UGH } from '../helper/urls';
import { createKeycloakUser, signIn } from '../helper/keycloak';
import { grogStrongjaw, TestUser } from '../helper/test-user';
import { getRandomString, inSeparateBrowser } from '../helper/util';
import { docsScreenshot } from '../helper/screenshot';

const SUPERSET_IFRAME_LOCATOR = 'iframe[title="superset-dashboard"]';

async function signInWaitForSupersetIframe(page: Page, user: TestUser) {
	await page.goto(UGH);
	await signIn(page, user);
	await expect(page.getByTestId('app-sidebar')).toBeVisible();
	await page.waitForResponse(`${SUPERSET}api/v1/dashboard/_info?q=(keys:!(permissions))`); // allow hidden iframe to log in to Superset
}

test.describe('Dashboards', () => {
	const TENANT = 'guetersloh';
	const UCH_TENANT = `${UCH}${TENANT}`;
	let grog: TestUser;

	test.beforeAll('Create user', async ({ browser }) => {
		await inSeparateBrowser(browser, async () => {
			grog = await createKeycloakUser(grogStrongjaw(), [TENANT, `${TENANT}/admin`]);
		});
	});

	test('Show published dashboards', async ({ page }) => {
		const dashboardName = `public-${getRandomString(6)}`;

		await signInWaitForSupersetIframe(page, grog);
		await page.getByTestId('app-sidebar-toggle').click();
		await page.getByTestId('app-sidebar').getByLabel('Dashboards').click();

		// create dashboard
		await page.getByRole('button', { name: 'Dashboard erstellen' }).click();
		const modal = page.getByRole('dialog');
		await modal.getByRole('textbox', { name: 'Dashboard-Name' }).fill(dashboardName);
		await modal.getByRole('button', { name: 'Dashboard erstellen' }).click();
		await page
			.locator(SUPERSET_IFRAME_LOCATOR)
			.contentFrame()
			.getByRole('button', { name: 'Verwerfen' })
			.click();

		// publish dashboard
		await page
			.locator(SUPERSET_IFRAME_LOCATOR)
			.contentFrame()
			.getByRole('button', { name: 'Intern' })
			.click();

		await expect(
			page
				.locator(SUPERSET_IFRAME_LOCATOR)
				.contentFrame()
				.getByRole('button', { name: 'Veröffentlicht' })
		).toBeVisible();

		// validate that dashboard is published
		await page.goto(UCH_TENANT);
		await page.getByTestId('app-sidebar-toggle').click();
		await docsScreenshot('citizenhub-ckan', page.getByRole('link', { name: 'CKAN' }));
		await page.getByTestId('app-sidebar').getByLabel('Dashboards').click();
		await expect(page.getByRole('link', { name: dashboardName })).toBeVisible();

		// make dashboard private
		await page.goto(UGH);
		await page.getByTestId('app-sidebar').getByLabel('Dashboards').click();
		await page.getByRole('link', { name: dashboardName }).click();
		await page
			.locator(SUPERSET_IFRAME_LOCATOR)
			.contentFrame()
			.getByRole('button', { name: 'Veröffentlicht' })
			.click();

		// validate that dashboard is NOT shown in UCH
		await page.goto(UCH_TENANT);
		await page.getByTestId('app-sidebar').getByLabel('Dashboards').click();
		await expect(page.getByRole('link', { name: dashboardName })).not.toBeVisible();
	});
});
