import test, { expect } from 'playwright/test';
import {
	createKeycloakUser,
	createResources,
	DATA_HUB_ADMIN_PASSWORD,
	DATA_HUB_ADMIN_USERNAME,
	signIn,
	signInWith
} from './helper/keycloak';
import { grogStrongjaw } from './helper/test-user';
import { NIFI } from './helper/urls';
import { inSeparateBrowser, RandomTenantManager } from './helper/util';

const TENANT_MGR = new RandomTenantManager();

test('basic admin and onboarding', async ({ page, browser }) => {
	const tenant = TENANT_MGR.get();
	await createResources([`tenants/${tenant}`]);
	const grog = await createKeycloakUser(grogStrongjaw(), [`${tenant}/admin`]);

	await test.step('other user cannot log in yet', () =>
		inSeparateBrowser(browser, async (page) => {
			await page.goto(NIFI);
			await signIn(page, grog);
			await expect(page.getByText('Unable to view the user interface')).toBeVisible();
		}));

	await test.step('initial admin login', async () => {
		await page.goto(NIFI);
		await signInWith(page, DATA_HUB_ADMIN_USERNAME, DATA_HUB_ADMIN_PASSWORD);
		await expect(page.locator('operation-control').getByText('Process Group')).toBeVisible();
	});

	await test.step('create group for use in policy', async () => {
		await page.getByRole('button', { name: '' }).click();
		await page.getByRole('menuitem', { name: ' Users' }).click();
		await page.getByRole('button', { name: '' }).click();
		await page.getByRole('radio', { name: 'Group' }).check();
		await page.getByRole('textbox', { name: 'Identity' }).click();
		await page.getByRole('textbox', { name: 'Identity' }).fill(tenant);
		await page.getByRole('button', { name: 'Add' }).click();
	});

	await test.step('create policy', async () => {
		await page.getByRole('button', { name: '' }).click();
		await page.getByRole('menuitem', { name: ' Policies' }).click();
		await page.getByRole('button', { name: '' }).click();
		await page
			.getByRole('option', { name: ` ${tenant}` })
			.locator('div')
			.first()
			.click();
		await page.getByRole('button', { name: 'Add' }).click();
	});

	await test.step('log out', async () => {
		await page.getByText('log out').click();
		await expect(page.getByRole('heading', { name: 'Logout successful' })).toBeVisible();
	});

	await test.step('login possible now', () =>
		inSeparateBrowser(browser, async (page) => {
			await page.goto(NIFI);
			await signIn(page, grog);
			await expect(page.getByText(grog.email)).toBeVisible();
		}));
});
