import { Browser, expect, Page } from 'playwright/test';
import { DISCOURSE, UGH } from './urls';
import { createKeycloakUser, signIn } from './keycloak';
import { scanlanShorthalt, TestUser } from './test-user';
import { signInDiscourse } from './discourse';
import { getRandomString } from './util';

export const SUPERSET_IFRAME_LOCATOR = 'iframe[title="superset-dashboard"]';

export const signInWithUser = async (page: Page, user: TestUser) => {
	await page.goto(UGH);
	await signIn(page, user);
	await expect(page.getByTestId('app-sidebar')).toBeVisible();
};

export const signOutFromUgh: (page: Page) => Promise<void> = async (page) => {
	await page.goto(UGH);
	await page.getByTestId('app-navbar').getByTestId('udp-avatar').click();
	await page.getByRole('link', { name: 'Abmelden' }).click();
	await page.getByRole('button', { name: /Logout|Abmelden/ }).click();
	await expect(
		page.getByRole('heading', { name: /Welcome back!|Willkommen zurück/ })
	).toBeVisible();
};

export async function createAndLoginRandomTestUser(
	browser: Browser,
	groups: string[]
): Promise<Page> {
	const page = await browser.newPage();
	const scanlan = await createKeycloakUser(scanlanShorthalt(), groups);
	await signInDiscourse(page, scanlan);
	await expect(async () => {
		await Promise.all([page.waitForResponse(`${DISCOURSE}session/current.json`), page.goto(UGH)]);
	}).toPass({ intervals: [2_000] });
	return page;
}

export async function visitDashboardPage(page: Page) {
	await page.getByTestId('app-sidebar-toggle').click();
	const sidebar = page.getByTestId('app-sidebar');
	await sidebar.getByLabel('Dashboards').click();
}

export const createDashboardGroup = async (page: Page) => {
	const vizGroup = `vizgroup-${Math.floor(Date.now() / 1000)}`;
	await page.getByRole('button', { name: 'Neue Dashboardgruppe' }).click();
	await page.getByRole('textbox', { name: 'Unbenannte Dashboardgruppe' }).fill(vizGroup);
	await page.getByRole('button', { name: 'Dashboardgruppe erstellen' }).click();
	return vizGroup;
};

export async function createDashboard(page: Page, vizGroup: string) {
	const dashboardTitle = `dashboard-${vizGroup}-${getRandomString(6)}`;
	await page.getByRole('button', { name: 'Dashboard erstellen' }).click();
	const modal = page.getByRole('dialog');
	const nameInput = modal.getByRole('textbox', { name: 'Dashboard-Name' });
	await nameInput.fill(dashboardTitle);
	const select = modal.getByRole('combobox');
	const optionToSelect = await page.locator('option', { hasText: vizGroup }).textContent();
	await select.selectOption(optionToSelect);
	await modal.getByRole('button', { name: 'Dashboard erstellen' }).click();
	return dashboardTitle;
}
