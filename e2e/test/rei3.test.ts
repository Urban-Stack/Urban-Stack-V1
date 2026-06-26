import test, { expect } from 'playwright/test';
import { RandomTenantManager } from './helper/util';
import { checkedGraphqlRequest, graphql } from './helper/graphql';
import { createRandomTestUser, DATA_HUB_ADMIN_PASSWORD, signInWith } from './helper/keycloak';

const TENANT_MGR = new RandomTenantManager();

// too flaky on firefox
test('can be installed and uninstalled', { tag: '@browserless' }, async ({ browser }) => {
	const tenant = TENANT_MGR.get();
	const result = await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!) {
				createTenant(tenant: $tenant) {
					createDedicatedApp(dedicatedApp: "rei3") {
						url
					}
				}
			}
		`,
		{ tenant }
	);
	const rei3Url = result.data.createTenant.createDedicatedApp.url as string;

	const user = await createRandomTestUser([tenant]);
	const userPage = await browser.newPage();
	const adminUser = await createRandomTestUser([`${tenant}/rei3-admin`]);
	const adminPage = await browser.newPage();

	await test.step('only admin login during maintenance', async () => {
		await expect(async () => {
			await userPage.goto(rei3Url);
			await expect(userPage.getByText('REI3')).toBeVisible({ timeout: 5_000 });
		}).toPass({ intervals: [5_000] });
		await userPage.getByText('keycloak').click();
		await signInWith(userPage, user.username, DATA_HUB_ADMIN_PASSWORD);
		// redirects back
		await expect(userPage.getByText('REI3')).toBeVisible();

		await expect(
			checkedGraphqlRequest(
				graphql`
					query ($tenant: String!) {
						dedicatedApp(tenant: $tenant, dedicatedApp: "rei3") {
							dedicatedApp
							containerLogs(lines: 10)
							containerStatus {
								restartCount
								running
								waiting
								ready
								waitingReason
								waitingMessage
							}
						}
					}
				`,
				{ tenant }
			)
		).resolves.toEqual({
			errors: [],
			data: {
				dedicatedApp: {
					dedicatedApp: 'rei3',
					containerLogs: expect.stringContaining(
						'websocket failed to authenticate user, maintenance mode is active, only admins may login'
					),
					containerStatus: {
						restartCount: 0,
						running: true,
						waiting: false,
						ready: true
					}
				}
			},
			dataPresent: true
		});
	});

	await test.step('admin user can turn off maintenance mode', async () => {
		await expect(async () => {
			await adminPage.goto(rei3Url);
			await expect(adminPage.getByText('REI3')).toBeVisible({ timeout: 5_000 });
		}).toPass({ intervals: [5_000] });
		await adminPage.getByText('keycloak').click();
		await signInWith(adminPage, adminUser.username, DATA_HUB_ADMIN_PASSWORD);
		// redirects back
		await expect(adminPage.getByText('Welcome to REI3')).toBeVisible();
		await adminPage.getByRole('link', { name: 'Maintenance' }).click();
		await adminPage.getByRole('row', { name: 'Maintenance mode' }).getByText('1').click();
		await adminPage.getByText('Apply changes').click();
		// there is no way to know when the request went through, because of rei3's truly awful accessibility
		await adminPage.waitForTimeout(5000);
	});

	await test.step('normal user can login when no maintenance mode', async () => {
		await userPage.goto(rei3Url);
		await userPage.getByText('keycloak').click();
		// redirects back, now logged in
		await expect(userPage.getByText('Test User')).toBeVisible();
	});

	await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!) {
				tenant(tenant: $tenant) {
					deleteDedicatedApp(dedicatedApp: "rei3")
				}
			}
		`,
		{ tenant }
	);
});

test('blocks access for non tenant member', async ({ page }) => {
	const tenant = TENANT_MGR.get();
	const otherTenant = TENANT_MGR.get();
	const result = await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!, $otherTenant: String!) {
				createTenant(tenant: $tenant) {
					createDedicatedApp(dedicatedApp: "rei3") {
						url
					}
				}
				t: createTenant(tenant: $otherTenant) {
					tenant
				}
			}
		`,
		{ tenant, otherTenant }
	);
	const rei3Url = result.data.createTenant.createDedicatedApp.url as string;

	const user = await createRandomTestUser([otherTenant]);

	await expect(async () => {
		await page.goto(rei3Url);
		await expect(page.getByText('REI3')).toBeVisible({ timeout: 5_000 });
	}).toPass({ intervals: [5_000] });
	await page.getByText('keycloak').click();
	await signInWith(page, user.username, DATA_HUB_ADMIN_PASSWORD);
	// error because user isn't part of the tenant
	await expect(
		page.getByText(
			'Sie haben nicht die nötigen Berechtigungen, um auf eine Anwendung dieses Mandanten zugreifen zu können'
		)
	).toBeVisible();
});
