import test, { expect } from 'playwright/test';
import { checkedGraphqlRequest, graphql, makeGraphqlRequest } from './helper/graphql';
import { RandomTenantManager } from './helper/util';
import { sharedApp } from './helper/urls';
import { DATA_HUB_ADMIN_PASSWORD, DATA_HUB_ADMIN_USERNAME, signInWith } from './helper/keycloak';

const TENANT_MGR = new RandomTenantManager();

test('can be installed and uninstalled', async ({ page }) => {
	const tenant = TENANT_MGR.get();
	await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!) {
				createTenant(tenant: $tenant) {
					createSharedApp(
						sharedApp: "my-cool-app"
						config: {
							adminContact: "me"
							description: "something cool"
							displayName: "Wow, such a cool App!"
							imageRepository: "ol-teuto/external-citytool-container"
							imageDigest: "sha256:fe40cf592b6460c7892846df4e6989cd7dc0106830e1467bce458940d2403275"
							imageRegistry: "ghcr.io"
							categories: [INTELLIGENT_AUTOMATION]
						}
					) {
						sharedApp
					}
				}
			}
		`,
		{ tenant }
	);
	await expect(async () => {
		await page.goto(sharedApp(tenant, 'my-cool-app'));
		await expect(page.getByRole('heading', { name: 'Urban Gov Hub' })).toBeVisible();
	}).toPass({ intervals: [5_000] });
	await signInWith(page, DATA_HUB_ADMIN_USERNAME, DATA_HUB_ADMIN_PASSWORD);
	await expect(page.getByText('Data Hub Admin', { exact: true })).toBeVisible();
	await expect(page.locator('#clientId')).toHaveText(`${tenant}.my-cool-app`);
	await expect(page.locator('#time')).toContainText('current time:');

	await expect(
		makeGraphqlRequest(
			graphql`
				query ($tenant: String!) {
					sharedApp(tenant: $tenant, sharedApp: "my-cool-app") {
						sharedApp
						containerLogs(lines: 10)
						containerStatus {
							restartCount
							running
							waiting
							ready
							waitingReason
							waitingMessage
						}
						config {
							categories
						}
					}
				}
			`,
			{ tenant }
		)
	).resolves.toEqual({
		errors: [],
		data: {
			sharedApp: {
				sharedApp: 'my-cool-app',
				containerLogs: expect.stringContaining('"GET /readyz HTTP/1.1" 200'),
				containerStatus: {
					restartCount: 0,
					running: true,
					waiting: false,
					ready: true
				},
				config: {
					categories: ['INTELLIGENT_AUTOMATION']
				}
			}
		},
		dataPresent: true
	});

	// make sure invalid image shas are rejected
	await expect(
		makeGraphqlRequest(
			graphql`
				mutation ($tenant: String!) {
					tenant(tenant: $tenant) {
						sharedApp(sharedApp: "my-cool-app") {
							update(config: { imageDigest: "invalid" }) {
								config {
									description
								}
							}
						}
					}
				}
			`,
			{ tenant }
		)
	).resolves.toEqual({
		dataPresent: true,
		errors: [
			{
				errorType: 'DataFetchingException',
				exception: {
					message: 'bad request',
					suppressed: []
				},
				locations: [
					{
						column: 8,
						line: 5
					}
				],
				message: 'Exception while fetching data (/tenant/sharedApp/update) : bad request',
				path: ['tenant', 'sharedApp', 'update']
			}
		]
	});

	await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!) {
				tenant(tenant: $tenant) {
					sharedApp(sharedApp: "my-cool-app") {
						update(
							config: {
								imageDigest: "sha256:20ba568f6c3bd361bb434dac943eedd521e721ebb981756a034e30e2a337dd80"
								categories: [APPS_TOOLS, OFFICE, OFFICE]
							}
						) {
							config {
								description
							}
						}
					}
				}
			}
		`,
		{ tenant }
	);

	await expect(async () => {
		await expect(
			makeGraphqlRequest(
				graphql`
					query ($tenant: String!) {
						sharedApp(tenant: $tenant, sharedApp: "my-cool-app") {
							sharedApp
							containerLogs(lines: 50)
							containerStatus {
								restartCount
								running
								waiting
								ready
								waitingReason
								waitingMessage
							}
							config {
								categories
							}
						}
					}
				`,
				{ tenant }
			)
		).resolves.toEqual({
			errors: [],
			data: {
				sharedApp: {
					sharedApp: 'my-cool-app',
					containerLogs: expect.stringContaining("I'm a new version!"),
					containerStatus: {
						restartCount: 0,
						running: true,
						waiting: false,
						ready: true
					},
					config: {
						categories: ['OFFICE', 'APPS_TOOLS']
					}
				}
			},
			dataPresent: true
		});
	}).toPass({ intervals: [4_000] });

	await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!) {
				tenant(tenant: $tenant) {
					deleteSharedApp(sharedApp: "my-cool-app")
				}
			}
		`,
		{ tenant }
	);
});

test('returns correct url', async () => {
	const tenant = TENANT_MGR.get();
	const tenantDisplayName = `Display Name of: ${tenant}`;
	const createResult = await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!, $tenantDisplayName: String!) {
				createTenant(tenant: $tenant) {
					patchAttributes(attributes: { key: "tenant-name", value: $tenantDisplayName }) {
						key
					}
					createSharedApp(
						sharedApp: "my-cool-app"
						config: {
							adminContact: "me"
							description: "something cool"
							displayName: "Wow, such a cool App!"
							imageRepository: "ol-teuto/external-citytool-container"
							imageDigest: "sha256:fe40cf592b6460c7892846df4e6989cd7dc0106830e1467bce458940d2403275"
							imageRegistry: "ghcr.io"
							pictureUri: "https://www.guetersloh.de/de-wAssets/img/aktuelles/bilder-pm-2019/Luftbild.png"
							categories: []
						}
					) {
						url
					}
				}
			}
		`,
		{ tenant, tenantDisplayName }
	);
	const sharedAppUrl = createResult.data.createTenant.createSharedApp.url;
	expect(sharedAppUrl).toEqual(sharedApp(tenant, 'my-cool-app'));
	const publicSharedAppsResult = await checkedGraphqlRequest(
		graphql`
			query publicSharedApps {
				publicSharedApps {
					adminContact
					description
					displayName
					sharedApp
					tenant
					tenantDisplayName
					categories
					url
					pictureUri
				}
			}
		`,
		{}
	);
	const mySharedApp = publicSharedAppsResult.data.publicSharedApps.find(
		(app) => app.tenant == tenant && app.sharedApp == 'my-cool-app'
	);
	expect(mySharedApp).toEqual({
		adminContact: 'me',
		description: 'something cool',
		displayName: 'Wow, such a cool App!',
		sharedApp: 'my-cool-app',
		tenant,
		tenantDisplayName,
		categories: [],
		url: sharedApp(tenant, 'my-cool-app'),
		pictureUri: 'https://www.guetersloh.de/de-wAssets/img/aktuelles/bilder-pm-2019/Luftbild.png'
	});
});
