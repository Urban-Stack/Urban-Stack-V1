import { expect, test } from 'playwright/test';
import { CKAN, RESOURCE_API } from './helper/urls';
import { grogStrongjaw } from './helper/test-user';
import { createKeycloakUser, createResources, signIn, withSetupClient } from './helper/keycloak';
import { getRandomString, RandomTenantManager, hasLegalLinks } from './helper/util';
import { docsScreenshot } from './helper/screenshot';

const TENANT_MGR = new RandomTenantManager();

test.describe('CKAN', () => {
	test('SSO login to ckan', async ({ page }) => {
		const grog = await createKeycloakUser(grogStrongjaw());
		await page.goto(CKAN);

		await docsScreenshot('ckan', page, { zoom: 0.8 });

		await page.getByRole('link', { name: 'Einloggen' }).click();
		await signIn(page, grog);
		await page.getByLabel('Profileinstellungen').click();

		await expect(page.getByPlaceholder('z.B. erika@example.com')).toHaveValue(grog.email);
		await page.getByRole('button', { name: 'Abmelden' }).click();
		await expect(page.getByRole('heading', { name: 'Abgemeldet' })).toBeVisible();
	});

	test('keycloak provision ckan orgs', async ({ page }) => {
		const tenantName = TENANT_MGR.get();
		await createResources([`tenants/${tenantName}`]);
		await page.goto(CKAN);
		await page.getByRole('link', { name: 'Organisationen' }).click();
		await page.getByPlaceholder('Organisationen suchen...').click();
		await page.getByPlaceholder('Organisationen suchen...').pressSequentially(tenantName);
		await page.locator('#organization-search-form').getByLabel('Absenden').click();
		await page.getByRole('link', { name: `${tenantName}` }).click();
		await expect(page.getByRole('heading', { name: 'Keine Datensätze gefunden' })).toBeVisible();
		await expect(page.getByRole('heading', { name: tenantName })).toBeVisible();
	});

	test('keycloak provision display name and image', async ({ page }) => {
		const postfix = getRandomString(6);
		const tenantName = TENANT_MGR.with(postfix);
		const tenantDisplayName = `Knuffingen ${postfix}`;
		const imageUrl =
			'https://www.guetersloh.de/de-wAssets/img/aktuelles/bilder-pm-2019/Luftbild.png';
		await withSetupClient(async (client) => {
			await client.put(`${RESOURCE_API}tenants/${tenantName}`);
			await client.put(
				`${RESOURCE_API}tenants/${tenantName}/attributes/tenant-name`,
				tenantDisplayName
			);
			await client.put(
				`${RESOURCE_API}tenants/${tenantName}/attributes/citizen-hub-image`,
				imageUrl
			);
		});
		await page.goto(CKAN);
		await page.locator('#organization-select').selectOption({ label: tenantDisplayName });
		await page.getByRole('link', { name: 'Organisationen' }).click();
		await page.getByRole('textbox', { name: 'Organisationen suchen...' }).click();
		await page.getByRole('textbox', { name: 'Organisationen suchen...' }).fill(tenantDisplayName);
		await page.getByRole('button', { name: 'Absenden' }).click();
		await page.getByRole('link', { name: `${tenantDisplayName}` }).click();
		await expect(page.getByRole('heading', { name: tenantDisplayName, exact: true })).toBeVisible();
		await expect(page.locator('#organization-info').getByRole('img')).toHaveAttribute(
			'src',
			imageUrl
		);
	});

	test('keycloak permissions', async ({ page }) => {
		const tenantAdmin = TENANT_MGR.get();
		const tenantEditor = TENANT_MGR.get();
		const tenantMember = TENANT_MGR.get();
		await withSetupClient(async (client) => {
			await client.put(`${RESOURCE_API}tenants/${tenantAdmin}`);
			await client.put(`${RESOURCE_API}tenants/${tenantEditor}`);
			await client.put(`${RESOURCE_API}tenants/${tenantMember}`);
		});
		await page.goto(CKAN);
		await page.getByRole('link', { name: 'Einloggen' }).click();

		const user = await createKeycloakUser(grogStrongjaw(), [
			`${tenantAdmin}/admin`,
			`${tenantEditor}/ckan-editor`,
			tenantMember
		]);
		await signIn(page, user);
		await page.getByLabel('Profil ansehen').click();
		await page.getByRole('link', { name: ' Organisationen' }).click();
		for (const [tenant, role] of [
			[tenantAdmin, 'Administrator'],
			[tenantEditor, 'Redakteur'],
			[tenantMember, 'Mitglied']
		]) {
			const card = page.locator('.card', { has: page.locator('h2', { hasText: tenant }) });
			await expect(card.locator('p > span')).toHaveText(role);
		}
	});

	test('has legal links', async ({ page }) => {
		await page.goto(CKAN);
		await hasLegalLinks(page);
	});
});
