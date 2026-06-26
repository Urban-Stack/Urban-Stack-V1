import test, { expect, Page } from 'playwright/test';
import {
	createKeycloakUserInKeycloakUI,
	createRandomTestUser,
	createResources,
	createTestUser,
	DATA_HUB_ADMIN_PASSWORD,
	signIn,
	withSetupClient
} from './helper/keycloak';
import { CKAN, DISCOURSE, KEYCLOAK, RESOURCE_API, SUPERSET } from './helper/urls';
import {
	inSeparateBrowser,
	getRandomString,
	getAuthenticatedAutoprovisioningClient,
	RandomTenantManager
} from './helper/util';
import { checkedGraphqlRequest, graphql } from './helper/graphql';
import { TestUserCreation } from './helper/test-user';
import { confirmDiscourseLogin } from './helper/discourse';
import { docsScreenshot } from './helper/screenshot';

const TENANT_MGR = new RandomTenantManager();

test('keycloak user self management', async ({ browser, page }) => {
	const tenant = TENANT_MGR.get();
	await withSetupClient((client) => client.put(`${RESOURCE_API}tenants/${tenant}`));
	const testUser = {
		email: `${getRandomString(6)}@example.com`,
		password: DATA_HUB_ADMIN_PASSWORD,
		username: ''
	};
	await createTestUser(testUser, [tenant, `${tenant}/admin`]);
	await page.goto(`${KEYCLOAK}admin/udh/console`);
	await signIn(page, testUser);
	await page.getByRole('link', { name: 'Benutzer' }).click();
	await page.getByTestId('add-user').click();
	// set email to verified
	await page.getByText('AnAus').click();
	const otherUser = {
		email: `${getRandomString(6)}@example.com`,
		password: DATA_HUB_ADMIN_PASSWORD,
		username: ''
	};
	await page.getByTestId('email').fill(otherUser.email);
	await page.getByTestId('firstName').fill('Test');
	await page.getByTestId('lastName').fill('User');
	await page.getByTestId('join-groups-button').click();
	await page.getByPlaceholder('Gruppen suchen').fill(tenant);
	await page.getByLabel('Search').click();
	await page.getByTestId(tenant).getByText(`/${tenant}`).click();
	await page.getByTestId('admin-check').check();
	await page.getByTestId('join-button').click();
	await page.getByTestId('user-creation-save').click();
	await expect(page.getByText('The user has been created')).toBeVisible();

	// set password
	await page.getByTestId('credentials').click();
	await page.getByTestId('no-credentials-empty-action').click();
	await page.getByTestId('passwordField').fill(DATA_HUB_ADMIN_PASSWORD);
	await page.getByTestId('passwordConfirmationField').fill(DATA_HUB_ADMIN_PASSWORD);
	// password is not temporary
	await page.getByLabel('Set password for').getByText('AnAus').click();
	await page.getByTestId('confirm').click();
	await expect(page.getByText('Set password?')).toBeVisible();
	await page.getByTestId('confirm').click();

	async function canSeeGroup(page: Page) {
		await page.getByRole('link', { name: 'Gruppen' }).click();
		await page.getByPlaceholder('Gruppen suchen').fill(tenant);
		await page.getByTestId('table-search-input').getByLabel('Search').click();
		await page.locator('button').filter({ hasText: tenant }).click();
		await expect(page.getByRole('link', { name: 'admin' })).toBeVisible();
	}

	await canSeeGroup(page);
	await inSeparateBrowser(browser, async (otherPage) => {
		await otherPage.goto(`${KEYCLOAK}admin/udh/console`);
		await signIn(otherPage, otherUser);
		await otherPage.getByText('Ja, meinen Namen').click();
		await otherPage.getByRole('button', { name: 'Absenden' }).click();
		await canSeeGroup(otherPage);
	});
});

test('can link to groups', async ({ page }) => {
	const tenant = TENANT_MGR.get();
	const result = await checkedGraphqlRequest(
		graphql`
			mutation createTenant($tenant: String!) {
				createTenant(tenant: $tenant) {
					keycloakGroupPath
					group(group: "admin") {
						keycloakGroupPath
					}
				}
			}
		`,
		{
			tenant
		}
	);
	const tenantGroupPath = result.data.createTenant.keycloakGroupPath;
	const adminGroupPath = result.data.createTenant.group.keycloakGroupPath;

	const testUser = {
		email: `${getRandomString(6)}@example.com`,
		password: DATA_HUB_ADMIN_PASSWORD,
		username: ''
	};
	await createTestUser(testUser, [tenant, `${tenant}/admin`]);
	await page.goto(`${KEYCLOAK}admin/udh/console`);
	await signIn(page, testUser);
	await expect(page.getByRole('heading', { name: 'Welcome to' })).toBeVisible();

	await page.goto(`${KEYCLOAK}admin/udh/console/#/udh/groups/${tenantGroupPath}`);
	await expect(page.getByTestId('view-header')).toContainText(tenant);
	await expect(page.getByRole('link', { name: 'admin' })).toBeVisible();
	await page.goto(`${KEYCLOAK}admin/udh/console/#/udh/groups/${adminGroupPath}`);
	await expect(page.getByTestId('view-header')).toContainText('Admin');
	await expect(page.getByRole('link', { name: tenant })).toBeVisible();
	await page.getByRole('heading', { name: 'No groups in this sub group' }).click();
});

test("user password is rejected if it doesn't meet password policy", async () => {
	await expect(createRandomTestUser([], '123')).rejects.toThrow();
});

test(
	'_repair request fixes missing default groups+permissions',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await createResources([`tenants/${tenant}`]);
		await withSetupClient((client) =>
			client.delete(`${RESOURCE_API}tenants/${tenant}/groups/admin`)
		);

		expect(
			(
				await (
					await getAuthenticatedAutoprovisioningClient()
				).post<string>(`${RESOURCE_API}_repair`)
			).status
		).toBe(204);

		await withSetupClient(async (client) => {
			expect((await client.get(`${RESOURCE_API}tenants/${tenant}/groups/admin`)).status).toBe(204);
			expect((await client.get(`${RESOURCE_API}tenants/${tenant}/permissions/admin`)).status).toBe(
				200
			);
		});
	}
);

test('pseudonymization', async ({ browser, page }) => {
	let user: TestUserCreation;

	await test.step('manually created users need to make a choice about pseudonymization', async () => {
		user = await createKeycloakUserInKeycloakUI(page, {
			email: `${getRandomString(6)}@example.com`,
			password: DATA_HUB_ADMIN_PASSWORD,
			firstName: 'Max',
			lastName: 'Mustermann'
		});
		await page.goto(`${KEYCLOAK}realms/udh/account`);
		await signIn(page, user);
		await docsScreenshot('keycloak-set-pseudonymization', page.getByText('Dürfen Name und E-Mail'));
		await page.getByText('Ja, meinen Namen').click();
		await page.getByRole('button', { name: 'Absenden' }).click();
	});

	const checkNameShownInAllProfiles = async (page: Page, expectShown: boolean) => {
		const checkNameShown = async () => {
			const name = page.getByText('max').first();
			if (expectShown) await expect(name).toBeVisible();
			else await expect(name).not.toBeVisible();
		};

		await page.goto(DISCOURSE);
		await confirmDiscourseLogin(page);
		await page.getByRole('button', { name: 'Benachrichtigungen und Konto' }).click();
		await page.getByRole('tab', { name: 'Profil' }).click();
		await page.getByRole('tab', { name: 'Profil' }).click();
		await expect(page.getByText('Lesezeit')).toBeVisible();
		await checkNameShown();

		await page.goto(`${SUPERSET}users/userinfo`);
		await expect(page.getByText('Ihre Benutzerinformationen')).toBeVisible();
		await page
			.getByText(user.email)
			.evaluate((e) => (e.textContent = 'never exposed but used for reports'));
		await checkNameShown();

		await page.goto(CKAN);
		await page.getByRole('link', { name: 'Einloggen' }).click();
		await page.getByRole('link', { name: 'Profileinstellungen' }).click();
		await expect(page.getByText('Vollständiger Name')).toBeVisible();
		await checkNameShown();
	};

	await test.step('profile pages contain real name when configured', () =>
		checkNameShownInAllProfiles(page, true));

	await test.step('pseudonymization setting can be changed', async () => {
		await page.goto(`${KEYCLOAK}realms/udh/account`);
		await page
			.getByTestId('username')
			.evaluate((el) => ((el as HTMLInputElement).value = 'max@example.com'));
		await page
			.getByTestId('email')
			.evaluate((el) => ((el as HTMLInputElement).value = 'max@example.com'));
		await docsScreenshot('keycloak-change-pseudonymization', page.getByText('Nein, meinen Namen'), {
			crop: false
		});
		await page.getByText('Nein, meinen Namen').click();
		await page.getByTestId('save').click();
		await expect(page.getByText('Ihr Benutzerkonto wurde aktualisiert.')).toBeVisible();
	});

	await test.step("profile pages don't contain real name when pseudonymization is configured", async () =>
		inSeparateBrowser(browser, async (page) => {
			await page.goto(`${KEYCLOAK}realms/udh/account`);
			await signIn(page, user);
			await checkNameShownInAllProfiles(page, false);
		}));
});
