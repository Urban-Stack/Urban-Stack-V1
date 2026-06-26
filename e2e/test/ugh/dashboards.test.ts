import { expect, Page, test } from 'playwright/test';
import { API, RESOURCE_API, SUPERSET, UGH } from '../helper/urls';
import { createKeycloakUser, signIn, withSetupClient } from '../helper/keycloak';
import { grogStrongjaw, TestUser } from '../helper/test-user';
import { docsScreenshot, fixupTenantName, fixupUghAvatarImage } from '../helper/screenshot';
import { getRandomString, RandomTenantManager } from '../helper/util';
import axios, { AxiosBasicCredentials } from 'axios';
import {
	createAndLoginRandomTestUser,
	createDashboard,
	SUPERSET_IFRAME_LOCATOR,
	visitDashboardPage
} from '../helper/ugh';
import { checkedGraphqlRequest, graphql } from '../helper/graphql';

const TENANT_MGR = new RandomTenantManager();

async function signInWaitForSupersetIframe(page: Page, user: TestUser) {
	await page.goto(UGH);
	await signIn(page, user);
	await expect(page.getByTestId('app-sidebar')).toBeVisible();
	await page.waitForResponse(`${SUPERSET}api/v1/dashboard/_info?q=(keys:!(permissions))`); // allow hidden iframe to log in to Superset
}

async function createTestUser(page: Page) {
	// create user
	const grog = await createKeycloakUser(grogStrongjaw(), ['guetersloh', 'guetersloh/admin']);

	await signInWaitForSupersetIframe(page, grog);

	return grog;
}

test('Correctly show dashboard overview and detail page', async ({ page }) => {
	await createTestUser(page);
	await visitDashboardPage(page);

	// assert that expected dashboard is shown
	await expect(page.getByRole('link', { name: 'unwetter' })).toBeVisible();

	// click on Dashboard card
	await page.getByRole('link', { name: 'unwetter' }).click();

	// expect Superset iframe to be shown for correct Dashboard
	await expect(
		page.frameLocator(SUPERSET_IFRAME_LOCATOR).getByLabel('Dashboard Titel')
	).toContainText('unwetter');

	// navigate back to overview
	await page.getByText('Zurück zur Übersicht').click();

	// switch to list view
	await page.getByTitle('Liste').click();

	// focus Dashboard and navigate
	await page.getByRole('link', { name: 'unwetter' }).focus();
	await page.keyboard.press('Enter');

	// expect to be inside Dashboard view
	await expect(page.getByText('Zurück zur Übersicht')).toBeVisible();
});

test('Create and delete dashboard', async ({ page }) => {
	const _grog = await createTestUser(page);
	await visitDashboardPage(page);

	await docsScreenshot(
		'ugh-dashboard-create',
		page.getByRole('button', { name: 'Dashboard erstellen' })
	);

	// create dashboard
	const dashboardTitle = await createDashboard(page, 'sccon');

	const iframe = page.frameLocator(SUPERSET_IFRAME_LOCATOR);

	// expect dashboard iframe is shown in edit mode
	expect(await iframe.getByLabel('Dashboard Titel').inputValue()).toContain(
		dashboardTitle.slice(0, 15)
	);
	await expect(iframe.getByRole('button', { name: 'Verwerfen' })).toBeVisible();
	await expect(iframe.getByRole('button', { name: 'Speichern' })).toBeVisible();

	// opens in iframe instead of new tab
	await iframe.getByRole('button', { name: 'plus-small Neues Diagramm erstellen' }).click();
	await expect(iframe.getByText('Diagrammtyp auswählen')).toBeVisible();

	// menu not shown in iframe
	await expect(page.getByRole('link', { name: 'Anmelden' })).not.toBeVisible();

	// delete dashboard
	await page.getByTestId('delete-dashboard-button').click();
	await page.getByRole('button', { name: 'Dashboard löschen' }).click();

	// expect dashboard is not linked on dashboards overview page anymore
	await page.waitForURL(UGH + 'dashboards');
	await expect(page.getByRole('link', { name: dashboardTitle })).toHaveCount(0);
});

test('Read-only dashboard', async ({ page }) => {
	const tenant = TENANT_MGR.get();
	const dashboardTitle = 'My Cool Dashboard';
	await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!, $title: String!) {
				createTenant(tenant: $tenant) {
					createVizGroup(vizGroup: "test") {
						createDashboardWithTitle(title: $title) {
							slug
						}
					}
				}
			}
		`,
		{ tenant, title: dashboardTitle }
	);
	// create user
	const grog = await createKeycloakUser(grogStrongjaw(), [`${tenant}/read`]);

	await signInWaitForSupersetIframe(page, grog);
	await visitDashboardPage(page);

	await page.getByRole('link', { name: dashboardTitle }).click();
	const iframe = page.frameLocator(SUPERSET_IFRAME_LOCATOR);
	await expect(iframe.getByLabel('Dashboard Titel')).toContainText(dashboardTitle);
	await expect(iframe.getByRole('button', { name: 'Dashboard bearbeiten' })).not.toBeVisible();
});

test('screenshots', async ({ browser }) => {
	const postfix = getRandomString(6);
	const tenantName = TENANT_MGR.with(postfix);
	// const tenantName = `knuffingen-${postfix}`;
	const tenantDisplayName = `Knuffingen ${postfix}`;
	const dataCreds = await withSetupClient(async (client) => {
		await client.put(`${RESOURCE_API}tenants/${tenantName}`);
		await client.put(
			`${RESOURCE_API}tenants/${tenantName}/attributes/tenant-name`,
			tenantDisplayName
		);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/viz-groups/umwelt`);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/projects/data`);
		await client.put(
			`${RESOURCE_API}tenants/${tenantName}/projects/data/permissions/viz-group-read`,
			{
				scopes: ['project:read'],
				principals: [{ type: 'vizGroup', tenant: tenantName, vizGroup: 'umwelt' }]
			}
		);
		return (
			await client.put<AxiosBasicCredentials>(
				`${RESOURCE_API}tenants/${tenantName}/projects/data/sensor-credentials/c`
			)
		).data;
	});
	function toTemperature(seed: number) {
		const x = Math.sin(seed) * 10000;
		return (x - Math.floor(x)) * 7 + 19;
	}

	for (let i = 1; i < 10; i++) {
		await axios.post(
			`${API}api/v2/sensor/message/direct`,
			JSON.stringify({
				time: Math.floor(Date.now() / 1000),
				sensor_id: `Sensor ${i}`,
				temperature_outside: toTemperature(i)
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				},
				auth: dataCreds
			}
		);
	}
	const userPage = await createAndLoginRandomTestUser(browser, [`${tenantName}/admin`]);

	await userPage.getByTestId('app-sidebar').getByRole('link', { name: 'Dashboards' }).click();

	await fixupUghAvatarImage(userPage, 'd');
	await userPage.getByRole('button', { name: 'Dashboard erstellen' }).click();
	await userPage.getByRole('textbox', { name: 'Dashboard-Name' }).fill('Wetter');
	await fixupTenantName(userPage, postfix);
	await docsScreenshot(
		'ugh-create-dashboard',
		userPage.getByRole('button', { name: 'Dashboard erstellen' }),
		{ crop: false }
	);
	await userPage.getByRole('textbox', { name: 'Dashboard-Name' }).fill('Wetter');
	await userPage.getByRole('button', { name: 'Dashboard erstellen' }).click();
	await userPage.getByRole('link', { name: 'Zurück zur Übersicht' }).click();
	await userPage.getByRole('link', { name: 'Wetter' }).click();

	const supersetIframe = userPage.locator('iframe[title="superset-dashboard"]').contentFrame();
	await supersetIframe.getByRole('button', { name: 'Dashboard bearbeiten' }).first().click();
	// only show own charts
	await supersetIframe.getByRole('checkbox', { name: 'Checkbox' }).setChecked(true);
	await docsScreenshot(
		'superset-to-new-chart',
		supersetIframe.getByRole('button', { name: 'plus-small Neues Diagramm' })
	);
	await supersetIframe.getByRole('button', { name: 'plus-small Neues Diagramm' }).click();
	await supersetIframe.getByRole('combobox', { name: 'Datensatz' }).click();
	await supersetIframe.getByText('sensor_messages', { exact: true }).click();
	await supersetIframe.getByRole('button', { name: 'Balkendiagramm' }).click();
	await docsScreenshot(
		'superset-create-new-chart',
		supersetIframe.getByRole('button', { name: 'Neues Diagramm erstellen' }),
		{ crop: false }
	);
	await supersetIframe.getByRole('button', { name: 'Neues Diagramm erstellen' }).click();

	await supersetIframe
		.getByText('time', { exact: true })
		.dragTo(supersetIframe.getByRole('button', { name: 'X-Achse' }));
	await supersetIframe
		.getByLabel('Daten', { exact: true })
		.getByRole('button', { name: 'Dimensionen' })
		.scrollIntoViewIfNeeded();
	await supersetIframe
		.getByText('temperature_outside')
		.dragTo(
			supersetIframe.getByLabel('Daten', { exact: true }).getByRole('button', { name: 'Metriken' })
		);
	await supersetIframe.getByRole('combobox', { name: 'Aggregierungsoptionen auswählen' }).click();
	await supersetIframe.getByTitle('AVG').click();
	await supersetIframe
		.locator('#metrics-edit-popover')
		.getByRole('button', { name: 'Speichern' })
		.click();
	await supersetIframe
		.getByText('sensor_id')
		.dragTo(supersetIframe.getByRole('button', { name: 'Dimensionen' }));

	await docsScreenshot(
		'superset-run-chart',
		supersetIframe.getByRole('button', { name: 'Diagramm erstellen' })
	);
	await supersetIframe.getByRole('button', { name: 'Diagramm erstellen' }).click();
	await docsScreenshot(
		'superset-save-chart',
		supersetIframe.getByRole('button', { name: 'Speichern' }),
		{ crop: false }
	);
	await supersetIframe.getByRole('button', { name: 'Speichern' }).click();
	await supersetIframe.getByRole('textbox', { name: 'Name' }).fill('Wetterbalken');
	await supersetIframe.getByRole('button', { name: 'Speichern & zum Dashboard' }).click();
	await docsScreenshot(
		'superset-make-dashboard-public',
		supersetIframe.getByRole('button', { name: 'minus Intern' })
	);

	await supersetIframe.getByRole('button', { name: 'Dashboard bearbeiten' }).click();
	await supersetIframe.getByRole('button', { name: 'Auslöser von Menüaktionen' }).click();
	await supersetIframe.getByText('Eigenschaften bearbeiten').click();
	await supersetIframe.locator('.ant-select-selection-overflow').click();
	await supersetIframe.getByText('Klima').click();
	await supersetIframe.getByRole('button', { name: 'Übernehmen' }).click();
	await docsScreenshot(
		'superset-dashboard-save',
		supersetIframe.getByRole('button', { name: 'Speichern' }),
		{ crop: false }
	);

	await docsScreenshot('superset-dashboard-view', userPage);
	await docsScreenshot(
		'superset-dashboard-delete',
		userPage.getByTestId('delete-dashboard-button')
	);

	// can only change tags on the superset dashboard list
	await userPage.goto(`${SUPERSET}dashboard/list`);

	await userPage
		.getByRole('row')
		.filter({ has: userPage.getByRole('link', { name: 'Wetter', exact: true }) })
		.getByRole('button', { name: 'edit-alt' })
		.click();
	await userPage.locator('.ant-select-selection-overflow').click();
	await userPage.getByText('Klima').click();
	await userPage.getByRole('button', { name: 'Speichern' }).click();

	await userPage.goto(`${UGH}dashboards`);

	await expect(async () => {
		await userPage.reload();
		await expect(userPage.getByTestId('udp-thumbnail-image')).toBeVisible();
	}).toPass({ intervals: [2_000] });
	await fixupTenantName(userPage, postfix);
	await docsScreenshot('ugh-dashboards-overview', userPage);
	await userPage.close();
});
