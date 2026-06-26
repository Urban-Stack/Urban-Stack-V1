import test, { expect, Page } from 'playwright/test';
import {
	createKeycloakUser,
	createResources,
	signIn,
	signInWith,
	withSetupClient
} from './helper/keycloak';
import { DATA_HUB_ADMIN_PASSWORD, DATA_HUB_ADMIN_USERNAME } from './helper/keycloak';
import axios, { AxiosBasicCredentials } from 'axios';
import { API, RESOURCE_API, MQTT, MQTT_INTERNAL, SUPERSET, UGH, MAILHOG } from './helper/urls';
import {
	inSeparateBrowser,
	getRandomString,
	clickUntilGone,
	fetchInBrowser,
	getAuthenticatedAutoprovisioningClient,
	RandomTenantManager,
	hasLegalLinks
} from './helper/util';
import { grogStrongjaw, TestUser, TestUserCreation } from './helper/test-user';
import mqtt from 'mqtt';
import { TESTMQTT_CREDENTIALS } from './helper/mqtt';
import { Upload } from '@aws-sdk/lib-storage';
import { bucketAdminClient, bucketDatahubAdminClient } from './helper/bucket';
import { docsScreenshot, fixupTenantName } from './helper/screenshot';
import { runQuery } from './helper/clickhouse';
import { supersetClient } from './helper/superset';
import { getMailhogClient } from './helper/mail';

const TENANT_MGR = new RandomTenantManager();

async function supersetSignIn(page: Page, user?: TestUserCreation) {
	await page.goto(`${SUPERSET}login`);
	if (user) await signIn(page, user);
	else await signInWith(page, DATA_HUB_ADMIN_USERNAME, DATA_HUB_ADMIN_PASSWORD);
}

const httpDirectTemperature = 481516;
function postDataHttpDirect(creds: AxiosBasicCredentials) {
	return axios.post(
		`${API}api/v2/sensor/message/direct`,
		JSON.stringify({
			time: Math.floor(Date.now() / 1000),
			temperature_outside: httpDirectTemperature
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			},
			auth: creds
		}
	);
}

test.describe('with setup', () => {
	let grog: TestUser;
	let trainstationCreds: AxiosBasicCredentials;
	let busstationCreds: AxiosBasicCredentials;

	const testPostfix = getRandomString(6);
	const tenant = TENANT_MGR.with(testPostfix);

	const directTopic = `direct-${testPostfix}`;
	const lorawanTopic = `lorawan-${testPostfix}`;

	async function checkThumbnail(page: Page, dashboard: string) {
		const thumbnailUrl: string = (
			await fetchInBrowser(
				page,
				`${SUPERSET}api/v1/dashboard/${tenant}_trainstation_${dashboard}`,
				'json'
			)
		).result.thumbnail_url;

		const observedStatus = new Set();
		await expect(async () => {
			const status = await fetchInBrowser(page, thumbnailUrl, 'status');
			observedStatus.add(status);
			expect(status).toBe(200);
		}).toPass();

		expect(observedStatus).not.toContainEqual(500);
	}

	test.beforeAll(async () => {
		await createResources([
			`tenants/${tenant}/projects/trainstation`,
			`tenants/${tenant}/projects/busstation`,
			`tenants/${tenant}/projects/brokenuser`,
			`tenants/${tenant}/viz-groups/trainstation/dashboards/test1`,
			`tenants/${tenant}/viz-groups/trainstation/dashboards/test2`,
			`tenants/${tenant}/viz-groups/trainstation/dashboards/notvisible`,
			`tenants/${tenant}/viz-groups/trainstation/dashboards/testdelete`,
			`tenants/${tenant}/viz-groups/s3station/dashboards/tests3`,
			`tenants/${tenant}/viz-groups/trainstation/dashboards/testlegacy`
		]);

		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/permissions/view`, {
				principals: [{ type: 'tenant', tenant }],
				scopes: ['project:view', 'viz-group:view']
			});
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/trainread`,
				{
					principals: [
						{ type: 'tenant', tenant },
						{ type: 'vizGroup', tenant, vizGroup: `trainstation` }
					],
					scopes: ['project:read']
				}
			);
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/bucketwrite`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['project:bucket-write']
				}
			);
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/s3read`,
				{
					principals: [{ type: 'vizGroup', tenant, vizGroup: `s3station` }],
					scopes: ['project:clickhouse-read', 'project:bucket-write']
				}
			);
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/busstation/permissions/busread`,
				{
					principals: [{ type: 'vizGroup', tenant, vizGroup: `trainstation` }],
					scopes: ['project:clickhouse-read']
				}
			);
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/brokenuser/permissions/s3read`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['project:bucket-read']
				}
			);
			trainstationCreds = (
				await realmAdminClient.put<AxiosBasicCredentials>(
					`${RESOURCE_API}tenants/${tenant}/projects/trainstation/sensor-credentials/c`
				)
			).data;
			await realmAdminClient.put<AxiosBasicCredentials>(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/sensor-subscriptions/direct`,
				{
					uri: MQTT_INTERNAL,
					topic: directTopic,
					format: 'direct',
					...TESTMQTT_CREDENTIALS
				}
			);
			await realmAdminClient.put<AxiosBasicCredentials>(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/sensor-subscriptions/lorawan`,
				{
					uri: MQTT_INTERNAL,
					topic: lorawanTopic,
					format: 'lorawan',
					...TESTMQTT_CREDENTIALS
				}
			);
			busstationCreds = (
				await realmAdminClient.put<AxiosBasicCredentials>(
					`${RESOURCE_API}tenants/${tenant}/projects/busstation/sensor-credentials/c`
				)
			).data;
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/dashboards/test1/permissions/admin`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['dashboard:admin']
				}
			);
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/dashboards/test2/permissions/view`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['dashboard:view']
				}
			);
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/dashboards/testdelete/permissions/admin`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['dashboard:admin']
				}
			);
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/s3station/permissions/admin`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['dashboard:admin']
				}
			);
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/dashboards/testlegacy/permissions/admin`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['dashboard:admin']
				}
			);
		});

		await postDataHttpDirect(busstationCreds);
		await postDataHttpDirect(trainstationCreds);

		grog = await createKeycloakUser(grogStrongjaw(), [tenant]);
	});

	test.beforeEach(async ({ page }) => await supersetSignIn(page, grog));

	test('published dashboards are visible for logged-in and anonymous users (including thumbnails)', async ({
		browser,
		page
	}) => {
		async function checkPublishedDashboards(page: Page) {
			await page.goto(`${SUPERSET}dashboard/list`);

			const publishedDashboard = page.getByText(`${tenant}_trainstation_testpublished`);
			const draftDashboard = page.getByText(`${tenant}_trainstation_notvisible`);

			await expect(publishedDashboard).toBeVisible();
			await expect(draftDashboard).not.toBeVisible();
		}

		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/dashboards/testpublished`
			);
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/dashboards/testpublished/permissions/admin`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['dashboard:admin']
				}
			);
			await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_testpublished`);
			await page.getByRole('button', { name: 'Intern' }).click();
			await expect(page.getByRole('button', { name: 'Veröffentlicht' })).toBeVisible();
			await realmAdminClient.delete(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/dashboards/testpublished/permissions/admin`
			);
		});
		await checkPublishedDashboards(page);

		await inSeparateBrowser(browser, async (page) => {
			await checkPublishedDashboards(page);
			await checkThumbnail(page, 'testpublished');
		});
	});

	test('slugs cannot be changed', async ({ page }) => {
		await page.goto(`${SUPERSET}dashboard/list`);
		await page.getByText(`${tenant}_trainstation_test1`).click();
		await page.getByLabel('Dashboard bearbeiten').click();
		await page.getByLabel('Auslöser von Menüaktionen').click();
		await page.getByRole('menuitem', { name: 'Eigenschaften bearbeiten' }).click();

		const slugInput = page.getByLabel('URL Titelform');
		await expect(slugInput).toBeDisabled();
		await slugInput.evaluate((input) => input.removeAttribute('disabled'));
		await slugInput.fill(getRandomString(16));

		await page.getByText('Übernehmen').click();
		await page.getByText('Speichern', { exact: true }).click(); // unsuccessful
		await page.getByText('Verwerfen').click();
	});

	test('save as button is hidden', async ({ page }) => {
		await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_test1/`);
		await page.getByLabel('Auslöser von Menüaktionen').click();
		await expect(page.getByRole('menuitem', { name: 'Dashboard aktualisieren' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Speichern als' })).not.toBeVisible();
	});

	test('respects platform view permissions for dashboards', async ({ page }) => {
		await page.goto(`${SUPERSET}dashboard/list`);
		await expect(page.getByText(`${tenant}_trainstation_test1`)).toBeVisible();
		await expect(page.getByText(`${tenant}_trainstation_test2`)).toBeVisible();
		await expect(page.getByText('notvisible')).not.toBeVisible();
	});

	test('does not show edit button for readonly dashboards', async ({ page }) => {
		await page.goto(`${SUPERSET}dashboard/list`);
		await page.getByText(`${tenant}_trainstation_test2`).click();
		await expect(page.getByText('keine Diagramme')).toBeVisible();
		await expect(
			page.getByLabel('Dashboard bearbeiten'),
			'test2 should not be editable'
		).not.toBeVisible();
	});

	test('dashboards settings should hide owner controls', async ({ page }) => {
		await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_test1`);
		await page.getByLabel('Dashboard bearbeiten').click();
		await page.getByLabel('Auslöser von Menüaktionen').click();
		await page.getByRole('menuitem', { name: 'Eigenschaften bearbeiten' }).click();
		await expect(page.getByRole('heading', { name: 'Zugang' })).not.toBeVisible();
		await expect(page.getByText('Besitzende', { exact: true })).not.toBeVisible();
	});

	test('dashboards should not have any owners', async ({ page }) => {
		await page.goto(`${SUPERSET}dashboard/list`);
		await expect(page.locator('table .ant-avatar')).not.toBeVisible();
	});

	test('dashboards should not show dummy metadata', async ({ page }) => {
		await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_test2`);
		await page.getByLabel('plus').locator('svg').hover();
		await expect(page.getByText('Erstellt')).toBeVisible();
		await expect(page.getByText('Superset Admin')).not.toBeVisible();

		await page.getByLabel('edit').locator('svg').hover();
		await expect(page.getByText('Zuletzt geändert')).toBeVisible();
		await expect(page.getByText('Geändert durch')).not.toBeVisible();
	});

	test('list pages and alert/report modals should not show irrelevant metadata', async ({
		page
	}) => {
		await page.goto(`${SUPERSET}dashboard/list`);
		await expect(page.getByRole('button', { name: '+ Dashboard' })).toBeVisible();
		await expect(page.getByText('Besitzer*in')).not.toBeVisible();
		await expect(page.getByText('Geändert durch')).not.toBeVisible();
		await expect(page.getByText('Besitzende')).not.toBeVisible();

		await page.getByRole('button', { name: 'Charts' }).click();
		await expect(page.getByRole('button', { name: '+ Diagramm' })).toBeVisible();
		await expect(page.getByText('Besitzer*in')).not.toBeVisible();
		await expect(page.getByText('Geändert durch')).not.toBeVisible();

		await page.getByRole('button', { name: 'Datasets' }).click();
		await expect(page.getByText('Datensätze')).toBeVisible();
		await expect(page.getByText('Besitzer*in')).not.toBeVisible();
		await expect(page.getByText('Geändert durch')).not.toBeVisible();
		await expect(page.getByText('Besitzende')).not.toBeVisible();
		await expect(page.getByText('Zertifiziert')).not.toBeVisible();
		await expect(page.getByText('Schema')).not.toBeVisible();
		await expect(page.getByText('Typ')).not.toBeVisible();

		await page.getByText('Einstellungen').hover();
		await page.getByRole('link', { name: 'Alerts & Reports' }).click();
		await expect(
			page.getByRole('main').getByRole('navigation').getByRole('button', { name: '+ Alarm' })
		).toBeVisible();
		await expect(page.getByText('Benachrichtigungsmethode')).not.toBeVisible();
		await expect(page.getByText('Besitzer*in')).not.toBeVisible();
		await expect(page.getByText('Besitzende')).not.toBeVisible();
		await expect(page.getByText('Geändert durch')).not.toBeVisible();

		await page
			.getByRole('main')
			.getByRole('navigation')
			.getByRole('button', { name: '+ Alarm' })
			.click();
		await expect(page.getByText('Allgemeine Informationen')).toBeVisible();
		await expect(page.getByText('Besitzende*')).not.toBeVisible();
		await page.getByRole('button', { name: 'Close', exact: true }).click();

		await page.getByRole('link', { name: 'Berichte' }).click();
		await expect(
			page.getByRole('main').getByRole('navigation').getByRole('button', { name: '+ Bericht' })
		).toBeVisible();
		await expect(page.getByText('Benachrichtigungsmethode')).not.toBeVisible();
		await expect(page.getByText('Besitzer*in')).not.toBeVisible();
		await expect(page.getByText('Besitzende')).not.toBeVisible();
		await expect(page.getByText('Geändert durch')).not.toBeVisible();

		await page
			.getByRole('main')
			.getByRole('navigation')
			.getByRole('button', { name: '+ Bericht' })
			.click();
		await expect(page.getByText('Allgemeine Informationen')).toBeVisible();
		await expect(page.getByText('Besitzende*')).not.toBeVisible();
	});

	async function dummyChartSaveScreen(page: Page, dashboardId = '') {
		await page.goto(`${SUPERSET}explore?dashboard_id=${dashboardId}`);
		await page.getByLabel('more-vert').click();
		await page.getByRole('menuitem', { name: 'Datensatz austauschen' }).click();
		await page.getByRole('button', { name: 'sensor_messages', exact: true }).click();
		await page.getByRole('button', { name: 'Fortfahren' }).click();
		await page
			.getByText('time', { exact: true })
			.dragTo(page.getByText('Spalten hierhin ziehen oder klicken'));
		await page.getByRole('button', { name: 'Speichern' }).click();
	}

	test('dashboard save options are hidden on chart save without context dashboard', async ({
		page
	}) => {
		await dummyChartSaveScreen(page);

		await expect(page.getByText('Speichern unter...')).toBeVisible();
		await expect(page.getByText('Zu Dashboard hinzufügen')).not.toBeVisible();
		await expect(page.getByRole('combobox', { name: 'Dashboard auswählen' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'zum Dashboard' })).not.toBeVisible();
	});

	test('chart save with context dashboard is limited to that dashboard', async ({ page }) => {
		await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_test1/`);
		const dashboardId = await page.locator('div[data-test-id]').getAttribute('data-test-id');
		await dummyChartSaveScreen(page, dashboardId);

		await page.getByText('knuffingen-').click();
		await page.getByRole('combobox', { name: 'Dashboard auswählen' }).fill('newtitle');
		await expect(page.getByText('No Data')).toBeVisible();
		await expect(page.getByRole('button', { name: 'zum Dashboard' })).toBeVisible();
	});

	test('unsupported chart save/share menus are hidden', async ({ page }) => {
		await page.goto(`${SUPERSET}explore/`);
		await page.getByRole('button', { name: 'Auslöser von Menüaktionen' }).click();
		await expect(page.getByText('Ausführen in SQL Lab')).toBeVisible();
		await expect(page.getByText('Herunterladen', { exact: true })).not.toBeVisible();
		await expect(page.getByText('Teilen', { exact: true })).not.toBeVisible();
	});

	test('unsupported dashboard save menu is hidden', async ({ page }) => {
		await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_test1/`);
		await page.getByRole('button', { name: 'Auslöser von Menüaktionen' }).click();
		await expect(page.getByText('Dashboard aktualisieren')).toBeVisible();
	});

	test('dashboards can be exported as PDF', async ({ page }) => {
		await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_test2/`);
		await page.getByRole('button', { name: 'Auslöser von Menüaktionen' }).click();
		await expect(page.getByText('Dashboard aktualisieren')).toBeVisible();

		await page
			.getByLabel('Dashboard Titel')
			.evaluate((el) => (el.textContent = 'Beispieldashboard'));

		await page.getByText('Herunterladen', { exact: true }).hover();

		const dashboardExportPdfButton = page.getByRole('button', { name: 'In PDF exportieren' });
		await docsScreenshot('superset-dashboard-export-pdf', dashboardExportPdfButton, {
			scroll: false,
			crop: false
		});

		// try to reduce flakiness on firefox
		await expect(async () => {
			await page.getByText('Herunterladen', { exact: true }).hover();
			await Promise.all([page.waitForEvent('download'), dashboardExportPdfButton.click()]);
		}).toPass({ intervals: [0] });
	});

	test('connection settings are correct', async ({ page }) => {
		await page.goto(
			`${SUPERSET}sqllab?dbname=clickhouse&sql=${encodeURIComponent(`
				SELECT 'test ' || if(
					getSetting('output_format_write_statistics') = false
						AND getSetting('SQL_projects') = '${tenant}.trainstation'
						AND getSetting('readonly') = 1,
					'successful',
					'failed')`)}&autorun=true`
		);
		await expect(page.getByText('test successful')).toBeVisible();
	});

	test('allows row policies to work in SQL Lab', async ({ page }) => {
		const mqttDirectValue = 2342;
		const mqttLorawanValue = 4223;

		const sendMqtt = () => {
			return new Promise<void>((ok, nok) => {
				const mqttClient = mqtt.connect(MQTT, TESTMQTT_CREDENTIALS);
				mqttClient.on('connect', () => {
					mqttClient.publish(
						directTopic,
						JSON.stringify({ sensor_id: 'id-direct', temperature_outside: mqttDirectValue })
					);
					mqttClient.publish(
						lorawanTopic,
						JSON.stringify({
							end_device_ids: { dev_eui: 'id-lorawan' },
							uplink_message: {
								decoded_payload: { Temperature: mqttLorawanValue }
							}
						})
					);
					ok();
				});
				mqttClient.on('error', nok);
			});
		};

		await expect(async () => {
			// repeat MQTT in case ingestor configuration has not caught up yet
			await sendMqtt();

			await page.goto(
				`${SUPERSET}sqllab?dbname=clickhouse&sql=${encodeURIComponent('SELECT DISTINCT project, sensor_id, temperature_outside FROM sensor_messages')}&autorun=true`
			);
			await expect(page.getByText(`${httpDirectTemperature}`)).toBeVisible({ timeout: 2_000 });
			await expect(page.getByText(mqttDirectValue.toString())).toBeVisible({ timeout: 2_000 });
			await expect(page.getByText(mqttLorawanValue.toString())).toBeVisible({ timeout: 2_000 });
			await expect(page.getByText('id-direct'.toString())).toBeVisible({ timeout: 2_000 });
			await expect(page.getByText('id-lorawan'.toString())).toBeVisible({ timeout: 2_000 });
		}).toPass({ intervals: [0] });

		await expect(page.getByText('trainstation')).toHaveCount(3);
		await expect(page.getByText('busstation')).not.toBeVisible();

		await fixupTenantName(page, testPostfix);
		await docsScreenshot('superset-sqllab', page);
	});

	async function addColumnFilter(page: Page, columnName: string) {
		await page.getByRole('button', { name: 'collapse filter' }).click();
		await page.getByRole('button', { name: 'gear' }).click();
		await page.getByRole('button', { name: 'Add or edit filters' }).click();
		await page.getByLabel('Tabellenname').click();
		await page.getByLabel('Tabellenname').fill(`${columnName}filter`);
		await page.getByRole('combobox', { name: 'Spaltenauswahl' }).click();
		await page.getByTitle(columnName).locator('div').click();
		await page.getByRole('button', { name: 'Speichern' }).click();
	}

	test('charts on dashboards use viz-group permissions', async ({ page }) => {
		await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_test1`);
		await page.getByRole('button', { name: 'Dashboard bearbeiten' }).nth(1).click();
		const newtabPromise = page.waitForEvent('popup');
		await page.getByRole('button', { name: 'plus-small Neues Diagramm' }).click();
		const newtab = await newtabPromise;
		await newtab.getByRole('combobox', { name: 'Datensatz' }).click();
		await newtab.getByText('sensor_messages', { exact: true }).click();
		await newtab.getByRole('button', { name: 'Tabelle Tabelle' }).click();
		await newtab.getByRole('button', { name: 'Neues Diagramm erstellen' }).click();
		await newtab.getByText('Spalten hierhin ziehen oder klicken').click();
		await newtab.getByRole('combobox', { name: 'Spalte' }).click();
		await newtab.getByRole('combobox', { name: 'Spalte' }).fill('projec');
		await newtab.getByLabel('Einfach').locator('.ant-select-item').getByText('project').click();
		await newtab
			.locator('#metrics-edit-popover')
			.getByRole('button', { name: 'Speichern' })
			.click();

		await expect(async () => {
			await newtab.getByRole('button', { name: /Diagramm (erstellen|aktualisieren)/ }).click();
			await expect(newtab.getByText('trainstation').first()).toBeVisible({ timeout: 2_000 });
			await expect(newtab.getByText('busstation')).not.toBeVisible();

			await newtab.getByRole('tab', { name: 'Beispiele' }).click();
			await expect(newtab.getByText('N/A').first()).toBeVisible();
		}).toPass({ intervals: [0] });

		await test.step('column value completions work', async () => {
			await newtab.getByText('ziehen und ablegen').last().click();
			await newtab.getByRole('combobox', { name: 'Betreff auswählen' }).click();
			await newtab.getByRole('combobox', { name: 'Betreff auswählen' }).fill('projec');
			await newtab.getByLabel('Einfach').locator('.ant-select-item').getByText('project').click();
			await expect(newtab.getByText('1 Option(en)')).toBeVisible();
			await newtab.getByRole('button', { name: 'Schließen' }).click();
			await expect(newtab.getByText('1 Option(en)')).not.toBeVisible();
		});

		await newtab.locator('#app').getByRole('button', { name: 'Speichern' }).click();
		await newtab.getByPlaceholder('Name', { exact: true }).click();
		await newtab.getByPlaceholder('Name', { exact: true }).fill('visible projects');
		await newtab.getByRole('button', { name: 'Speichern & zum Dashboard' }).click();
		await addColumnFilter(newtab, 'project');

		await test.step('unsupported save menu is hidden in context menu', async () => {
			await newtab.getByRole('button', { name: 'More Options' }).click();
			await expect(newtab.getByRole('button', { name: 'Abfrage anzeigen' })).toBeVisible();
			await expect(newtab.getByText('Herunterladen', { exact: true })).not.toBeVisible();
			await newtab.getByRole('button', { name: 'More Options' }).click();
		});

		const chartDiv = newtab.locator('.dashboard-component');
		await expect(chartDiv.getByText('trainstation')).toBeVisible();
		// viz-group can see busstation too
		await expect(chartDiv.getByText('busstation')).toBeVisible();
		await expect(newtab.locator('.ant-select-selector').getByText('2 Optionen')).toBeVisible();

		const requestFromBrowser = newtab.waitForRequest((r) =>
			r.url().startsWith(`${SUPERSET}api/v1/chart/data`)
		);
		await newtab.getByLabel('More Options').click();
		await newtab.getByRole('menuitem', { name: 'Aktualisierung erzwingen' }).click();
		const browserRequestBody = (await requestFromBrowser).postDataJSON();

		const request = {
			datasource: {
				id: browserRequestBody.datasource.id,
				type: 'table'
			},
			queries: [
				{
					columns: ['project'],
					metrics: []
				}
			],
			form_data: {
				slice_id: browserRequestBody.form_data.slice_id,
				dashboardId: browserRequestBody.form_data.dashboardId
			}
		};
		expect(
			(
				await axios.post<any>(`${SUPERSET}api/v1/chart/data`, request, {
					validateStatus: (_) => true
				})
			).status
		).toBe(403);
		await newtab.getByRole('button', { name: 'Intern' }).click();
		await expect(newtab.getByRole('button', { name: 'Veröffentlicht' })).toBeVisible();
		expect(
			(await axios.post<any>(`${SUPERSET}api/v1/chart/data`, request)).data.result[0].rowcount
		).toBe(2);

		// without a valid dashboard no projects are accessible
		request.form_data.dashboardId = -123;
		expect(
			(await axios.post<any>(`${SUPERSET}api/v1/chart/data`, request)).data.result[0].rowcount
		).toBe(0);

		// time filters display a range = appropriate permissions are configured
		await newtab.getByRole('button', { name: 'gear' }).click();
		await newtab.getByRole('button', { name: 'Add or edit filters' }).click();
		await newtab.getByRole('button', { name: 'filter Add Filter' }).click();

		await newtab
			.locator('#rc-tabs-3-panel-configuration')
			.getByText('Wert', { exact: true })
			.click();
		await newtab.locator('#rc-tabs-3-panel-configuration').getByText('Zeitbereich').click();
		await newtab.getByRole('textbox', { name: 'Tabellenname *' }).fill('timefilter');
		await newtab.getByRole('button', { name: 'Speichern' }).click();
		await newtab.getByText('Kein Filter').click();
		await newtab.getByTitle('Kein Filter').click();
		await newtab.getByText('Letzte').click();
		await expect(newtab.getByText('≤ col <')).toBeVisible();
		await newtab.getByRole('button', { name: 'ABBRECHEN' }).click();

		// back to limited visibility for chart editing
		await newtab.getByRole('button', { name: 'More Options' }).click();
		await newtab.getByText('Diagramm bearbeiten').click();
		await expect(newtab.getByText('trainstation').first()).toBeVisible();
		await expect(newtab.getByText('busstation')).not.toBeVisible();

		await newtab.close();
	});

	test('legacy viz-type charts can be used', async ({ browser, page }) => {
		await page.goto(`${SUPERSET}chart/add`);

		await page.getByRole('combobox', { name: 'Datensatz' }).click();
		await page.getByText('sensor_messages', { exact: true }).click();
		await page.getByRole('button', { name: 'ballot Alle Diagramme' }).click();
		await page.getByRole('button', { name: 'Blasendiagramm (Legacy)' }).click();
		await page.getByRole('button', { name: 'Neues Diagramm erstellen' }).click();
		await page.getByText('Spalte hierhin ziehen oder').nth(1).click();
		await page.getByRole('tab', { name: 'Benutzerdefinierte SQL' }).click();
		await page.locator('.ace_content').click();
		await page
			.getByRole('textbox', { name: 'Cursor at row' })
			.fill(`substring(project, position(project, '.') + 1)`);
		await page.locator('#metrics-edit-popover').getByRole('button', { name: 'Speichern' }).click();
		await page
			.getByText('sensor_id', { exact: true })
			.dragTo(page.getByText('ziehen oder klicken').nth(1));
		await clickUntilGone(
			page.locator('#metrics-edit-popover').getByRole('button', { name: 'Speichern' })
		);
		await page
			.getByText('status', { exact: true })
			.dragTo(page.getByText('ziehen oder klicken').nth(1));
		await clickUntilGone(
			page.locator('#metrics-edit-popover').getByRole('button', { name: 'Speichern' })
		);
		await page
			.getByText('project', { exact: true })
			.dragTo(page.getByText('ziehen oder klicken').nth(1));
		await clickUntilGone(
			page.locator('#metrics-edit-popover').getByRole('button', { name: 'Speichern' })
		);
		await expect(async () => {
			await page.getByRole('button', { name: /Diagramm (erstellen|aktualisieren)/ }).click();
			await expect(page.getByText('trainstation')).toBeVisible({ timeout: 2_000 });
			await expect(page.getByText('busstation')).not.toBeVisible();
		}).toPass({ intervals: [0] });

		await page.locator('#app').getByRole('button', { name: 'Speichern' }).click();
		await page.getByRole('textbox', { name: 'Name' }).fill(`legacy-${testPostfix}`);
		await page.getByLabel('Diagramm speichern').getByRole('button', { name: 'Speichern' }).click();

		await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_testlegacy/?edit=true`);
		await page
			.getByText(`legacy-${testPostfix}`)
			.first()
			.dragTo(page.locator('.grid-content > .dragdroppable'));

		const chartDiv = page.locator('.dashboard-component');
		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.getByRole('button', { name: 'Intern' }).click();
		await expect(page.getByRole('button', { name: 'Veröffentlicht' })).toBeVisible();
		await expect(chartDiv.getByText('trainstation')).toBeVisible();

		// Superset only adds the Chart to the dashboard after the first query so our viz-group auth code doesn't grant it yet
		// at this point it is configured correctly and allowed
		await page.getByRole('button', { name: 'More Options' }).click();
		await page.getByRole('menuitem', { name: 'Aktualisierung erzwingen' }).click();
		await expect(chartDiv.getByText('busstation')).toBeVisible();

		await inSeparateBrowser(browser, async (anonymousPage) => {
			await anonymousPage.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_testlegacy/`);
			await expect(chartDiv.getByText('trainstation')).toBeVisible();
			await expect(chartDiv.getByText('busstation')).toBeVisible();
		});
	});

	test('dashboards deletion', async ({ page }) => {
		await test.step('missing dashboards are re-created by _repair', async () => {
			const dashboardId = JSON.parse(
				(
					await (
						await supersetClient()
					).get<string>(`${SUPERSET}api/v1/dashboard/${tenant}_trainstation_testdelete`)
				).data
			).result.id;
			await (await supersetClient()).delete(`${SUPERSET}api/v1/dashboard/${dashboardId}`);
			await (await getAuthenticatedAutoprovisioningClient()).post<string>(`${RESOURCE_API}_repair`);
			await page.goto(`${SUPERSET}dashboard/list`);
			await expect(page.getByText(`${tenant}_trainstation_testdelete`)).toBeVisible();
		});

		await test.step('dashboards cannot be deleted directly', async () => {
			const dashboardRow = page.getByRole('row', { name: `${tenant}_trainstation_testdelete` });
			await expect(dashboardRow).toBeVisible();
			await expect(dashboardRow.getByLabel('trash')).not.toBeVisible();
		});

		await test.step('dashboards can be deleted via resource API', async () => {
			// only succeeds if direct deletion was ignored
			await withSetupClient((realmAdminClient) =>
				realmAdminClient.delete(
					`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/dashboards/testdelete`
				)
			);

			await page.reload();

			await expect(page.getByText(`${tenant}_trainstation_test2`)).toBeVisible();
			await expect(page.getByText(`${tenant}_trainstation_testdelete`)).not.toBeVisible();
		});
	});

	test('dashboards can be tagged', async ({ page }) => {
		await page.goto(`${SUPERSET}dashboard/list`);

		const dashboardEditButton = page
			.getByRole('row', { name: `${tenant}_trainstation_test1` })
			.getByRole('button', { name: 'edit-alt' });
		await dashboardEditButton.hover();
		await docsScreenshot('superset-dashboard-edit-button', dashboardEditButton);

		await dashboardEditButton.click();

		await page
			.getByRole('link', { name: `${tenant}_trainstation_test1` })
			.evaluate((el) => (el.textContent = 'Beispieldashboard'));
		await page
			.getByRole('row', { name: 'knuffingen' })
			.evaluateAll((rows) => rows.forEach((row) => row.remove()));

		await page.locator('.ant-select-selection-overflow').click();
		const exampleTag = page.getByLabel('Dashboardeigenschaften').getByText('Infrastruktur').last();
		await exampleTag.click();
		await page
			.getByRole('textbox', { name: 'Name' })
			.evaluate((el) => ((el as HTMLInputElement).value = 'Beispieldashboard'));
		await page
			.getByRole('textbox', { name: 'URL Titelform' })
			.evaluate((el) => ((el as HTMLInputElement).value = 'knuffingen_trainstation_example'));
		await docsScreenshot('superset-dashboard-tag', exampleTag);
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByText('Infrastruktur').first()).toBeVisible();

		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/permissions/admin`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['dashboard:admin', 'dashboard:view']
				}
			);

			await page.goto(UGH);
			await page.getByRole('link', { name: 'Dashboards', exact: true }).click();
			await expect(page.getByText('Infrastruktur')).toBeVisible();

			await realmAdminClient.delete(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/trainstation/permissions/admin`
			);
		});
	});

	test('version info is hidden in menu', async ({ page }) => {
		await page.goto(`${SUPERSET}dashboard/list`);
		await page.getByText('Einstellungen').hover();

		await expect(page.getByRole('link', { name: 'Abmelden' })).toBeVisible();
		await expect(page.getByText('Über')).not.toBeVisible();
		await expect(page.getByText('Version: ')).not.toBeVisible();
	});

	test('authenticated users get more menu entries', async ({ page }) => {
		await page.goto(`${SUPERSET}dashboard/list`);
		await expect(page.getByRole('button', { name: 'Charts' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Datasets' })).toBeVisible();
		await expect(async () => {
			await page.getByRole('menuitem', { name: 'triangle-down SQL' }).locator('svg').hover();
			await expect(page.getByRole('link', { name: 'SQL Lab' })).toBeVisible({ timeout: 6_000 });
		}).toPass({ intervals: [0], timeout: 30_000 });
	});

	test('uses sub as username', async ({ page }) => {
		await page.goto(`${SUPERSET}users/userinfo`);
		await expect(page.getByText(grog.id)).toBeVisible();
	});

	test('copy link button is removed from SQL Lab', async ({ page }) => {
		await page.goto(`${SUPERSET}sqllab`);
		await expect(page.getByRole('button', { name: 'Ausführen' })).toBeVisible();
		await expect(page.getByText('Link kopieren')).not.toBeVisible();
	});

	test('unused DB schema controls are removed from SQL Lab', async ({ page }) => {
		await page.goto(`${SUPERSET}sqllab`);
		await expect(page.getByRole('button', { name: 'Ausführen' })).toBeVisible();
		await expect(page.getByText('schema')).not.toBeVisible();
	});

	test('only allowed bucket databases are visible', async ({ page }) => {
		await page.goto(`${SUPERSET}sqllab`);
		await page.getByText('clickhousedb').click();
		await expect(page.getByText(`${tenant}.trainstation`, { exact: true })).toBeVisible();
		await expect(page.getByText(`${tenant}.busstation`, { exact: true })).not.toBeVisible();
	});

	test('bucket databases can be used to query bucket files', async ({ browser, page }) => {
		const project = 'brokenuser';
		await new Upload({
			client: await bucketDatahubAdminClient(browser),
			params: {
				Bucket: `${tenant}.${project}`,
				Key: `some/key`,
				Body: `a;b;c\n4671849324;5;6`
			}
		}).done();

		const check = async () => {
			await page.goto(
				`${SUPERSET}sqllab?dbname=${tenant}.${project}&sql=${encodeURIComponent(`
				SELECT a FROM s3("${tenant}.${project}", filename='some/key') WHERE b = 5`)}&autorun=true`
			);
			await expect(page.getByText('4671849324')).toBeVisible();
		};
		await check();

		await test.step('_repair will fix missing Superset DBs, ClickHouse DB users, ClickHouse named collections', async () => {
			const dbId = JSON.parse(
				(
					await (
						await supersetClient()
					).get<string>(
						`${SUPERSET}api/v1/database/?q=(filters:!((col:database_name,opr:eq,value:${tenant}.${project})))`
					)
				).data
			).ids[0];
			await (await supersetClient()).delete(`${SUPERSET}api/v1/database/${dbId}`);
			await runQuery(`DROP USER "${tenant}.${project}"`);
			await runQuery(`DROP NAMED COLLECTION "${tenant}.${project}"`);

			await (await getAuthenticatedAutoprovisioningClient()).post<string>(`${RESOURCE_API}_repair`);
			await check();
		});
	});

	test('publish query button only visible for clickhouse', async ({ page }) => {
		await page.goto(UGH);
		await page.goto(`${UGH}settings/dashboardgroups/${tenant}/trainstation/geojson/new`);
		const supersetIframe = page.locator('iframe[title="Superset SQL Lab"]').contentFrame();

		await expect(supersetIframe.getByText('Veröffentlichen', { exact: true })).toBeVisible();

		await supersetIframe
			.owner()
			.evaluate(
				(i: HTMLIFrameElement, src: string) => (i.src = src),
				`${SUPERSET}sqllab?dbname=${tenant}.trainstation&sql=newsql`
			);
		await expect(supersetIframe.getByText('newsql', { exact: true })).toBeVisible();
		await expect(supersetIframe.getByText('Veröffentlichen', { exact: true })).not.toBeVisible();
	});

	test('save query button is hidden', async ({ page }) => {
		await page.goto(`${SUPERSET}sqllab?dbname=clickhouse&sql=foo`);
		await expect(page.getByRole('button', { name: 'Ausführen' })).toBeVisible();
		await expect(page.getByText('Speichern')).not.toBeVisible();
	});

	test('while databases can be listed, connection details cannot', async ({ page }) => {
		const bucketDB = (
			await fetchInBrowser(page, `${SUPERSET}api/v1/database/`, 'json')
		).result.filter((db) => db.database_name != 'clickhouse')[0];
		expect(bucketDB.database_name).toBe(`${tenant}.trainstation`);
		expect(
			await fetchInBrowser(page, `${SUPERSET}api/v1/database/${bucketDB.id}/connection`, 'status')
		).toBe(403);
	});

	test('prepared . datasets', async ({ browser, page }) => {
		const datasetName = 'tmpds';
		const path = datasetName;
		const fullDatasetName = `${tenant}.trainstation.tmpds`;

		await new Upload({
			client: await bucketDatahubAdminClient(browser),
			params: {
				Bucket: `${tenant}.trainstation`,
				Key: path,
				Body: `firstcolumnincsv,b,c\n4671849324,5,6`
			}
		}).done();
		const createDataset = async () =>
			await withSetupClient(async (realmAdminClient) => {
				await realmAdminClient.put(
					`${RESOURCE_API}tenants/${tenant}/projects/trainstation/datasets/${datasetName}`,
					{
						path,
						format: 'CSV'
					}
				);
			});
		await createDataset();

		const base_model_id = JSON.parse(
			(
				await (
					await supersetClient()
				).get<string>(
					`${SUPERSET}api/v1/dataset/?q=(filters:!((col:table_name,opr:eq,value:${fullDatasetName})))`
				)
			).data
		).ids[0];
		// create a dataset under the temporary name again,
		// this can otherwise only be done through a transaction that fails
		// after Superset already confirmed the dataset to be working
		await (
			await supersetClient()
		).post(
			`${SUPERSET}api/v1/dataset/duplicate`,
			JSON.stringify({ base_model_id, table_name: `.${fullDatasetName}` })
		);

		await test.step('are not visible', async () => {
			await page.goto(`${SUPERSET}tablemodelview/list/`);
			await expect(page.getByRole('link', { name: fullDatasetName, exact: true })).toBeVisible();
			await expect(page.getByRole('link', { name: `.${fullDatasetName}` })).not.toBeVisible();
		});

		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.delete(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/datasets/${datasetName}`
			);
		});
		await test.step('are cleaned up automatically', createDataset);
	});

	test('charts can be created from datasets and used in dashboards', async ({ browser, page }) => {
		const path = `datasetfi/le`;
		let newChartUrl: string;

		await new Upload({
			client: await bucketDatahubAdminClient(browser),
			params: {
				Bucket: `${tenant}.trainstation`,
				Key: path,
				Body: `firstcolumnincsv;b;c\n4671849324;5;6`
			}
		}).done();
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/datasets/dsfile`,
				{
					path,
					format: 'CSV'
				}
			);
		});

		await test.step('chart can be created', async () => {
			await page.goto(`${SUPERSET}chart/add`);

			await docsScreenshot('chart-add', page);

			await page.getByRole('combobox', { name: 'Datensatz' }).click();
			await page.getByText(`${tenant}.trainstation.dsfile`).click();
			await page.getByRole('button', { name: 'Tabelle Tabelle' }).click();
			await page.getByRole('button', { name: 'Neues Diagramm erstellen' }).click();

			newChartUrl = page.url();

			await page
				.getByText('firstcolumnincsv', { exact: true })
				.dragTo(page.getByText('Spalten hierhin ziehen oder klicken'));
			await page.getByRole('button', { name: 'Diagramm erstellen' }).click();
			await expect(page.getByText('4671849324')).toBeVisible();
		});

		await test.step('column value completions work', async () => {
			await page.getByText('ziehen und ablegen').click();
			await page.getByRole('combobox', { name: 'Betreff auswählen' }).click();
			await page.getByLabel('Einfach').getByText('firstcolumnincsv').click();
			await expect(page.getByText('1 Option(en)')).toBeVisible();
			await page.getByRole('button', { name: 'Schließen' }).click();
			await expect(page.getByText('1 Option(en)')).not.toBeVisible();
		});

		await test.step('chart can be used in dashboard', async () => {
			await page.getByRole('button', { name: 'Speichern' }).click();
			await page.getByRole('textbox', { name: 'Name' }).fill(`s3-${testPostfix}`);
			await page
				.getByLabel('Diagramm speichern')
				.getByRole('button', { name: 'Speichern' })
				.click();
			await page.goto(`${SUPERSET}superset/dashboard/${tenant}_s3station_tests3/`);
			await page.getByRole('button', { name: 'Dashboard bearbeiten' }).nth(1).click();
			await page
				.getByText(`s3-${testPostfix}`)
				.first()
				.dragTo(page.locator('.grid-content > .dragdroppable'));
			await expect(page.getByText('4671849324')).toBeVisible();
			await page.getByRole('button', { name: 'Speichern' }).click();
			await addColumnFilter(page, 'firstcolumnincsv');
		});

		await test.step('data is visible anonymously', async () => {
			await page.getByRole('button', { name: 'Intern' }).click();
			await expect(page.getByRole('button', { name: 'Veröffentlicht' })).toBeVisible();
			await inSeparateBrowser(browser, async (aPage) => {
				await aPage.goto(`${SUPERSET}superset/dashboard/${tenant}_s3station_tests3/`);
				await expect(aPage.getByText('4671849324')).toBeVisible();
				await expect(aPage.locator('.ant-select-selector').getByText('1 option')).toBeVisible();
			});
		});

		await test.step('dataset access is denied outside of correct dashboard', async () => {
			await inSeparateBrowser(browser, async (page) => {
				const requestFromBrowser = page.waitForRequest((r) =>
					r.url().startsWith(`${SUPERSET}api/v1/chart/data`)
				);
				await page.goto(`${SUPERSET}superset/dashboard/${tenant}_s3station_tests3/`);
				const request = (await requestFromBrowser).postDataJSON();
				expect(
					(await axios.post<any>(`${SUPERSET}api/v1/chart/data`, request)).data.result[0].rowcount
				).toBe(1);

				// without a valid dashboard access to the dataset is denied
				request.form_data.dashboardId = -123;
				expect(
					(
						await axios.post<any>(`${SUPERSET}api/v1/chart/data`, request, {
							validateStatus: (_) => true
						})
					).status
				).toBe(403);
			});
		});

		await test.step('dataset can be refreshed', async () => {
			await new Upload({
				client: await bucketDatahubAdminClient(browser),
				params: {
					Bucket: `${tenant}.trainstation`,
					Key: path,
					Body: `firstmodifiedcolumnincsv;b;c\n318469765241;2025-05-06T00:02:00;6`
				}
			}).done();
			await withSetupClient(async (realmAdminClient) => {
				await realmAdminClient.post(
					`${RESOURCE_API}tenants/${tenant}/projects/trainstation/datasets/dsfile/refresh`
				);
			});
			await page.goto(newChartUrl);
			await expect(page.getByText('firstmodifiedcolumnincsv')).toBeVisible();
		});

		await test.step('temporal columns are recognized by refresh', async () => {
			await page
				.getByText('b', { exact: true })
				.dragTo(page.getByText('ziehen oder klicken').first());
			await expect(page.getByText('Zeitgranularität')).toBeVisible();
		});

		await test.step('data is not visible on dashboard, even when signed in and with personal access', async () => {
			await withSetupClient((realmAdminClient) =>
				realmAdminClient.delete(
					`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/s3read`
				)
			);
			await expect(async () => {
				await page.goto(`${SUPERSET}superset/dashboard/${tenant}_s3station_tests3/`);
				await expect(page.getByText('Database access denied')).toBeVisible({ timeout: 2_000 });
			}).toPass();
		});

		await test.step('datasets are recreated by _repair', async () => {
			const datasetId = JSON.parse(
				(
					await (
						await supersetClient()
					).get<string>(
						`${SUPERSET}api/v1/dataset/?q=(filters:!((col:table_name,opr:eq,value:${tenant}.trainstation.dsfile)))`
					)
				).data
			).ids[0];
			await (await supersetClient()).delete(`${SUPERSET}api/v1/dataset/${datasetId}`);

			await (await getAuthenticatedAutoprovisioningClient()).post<string>(`${RESOURCE_API}_repair`);

			await page.goto(`${SUPERSET}chart/add`);
			await page.getByRole('combobox', { name: 'Datensatz' }).click();
			await expect(page.getByText(`${tenant}.trainstation.dsfile`)).toBeVisible();
		});

		await test.step('dataset can be deleted', async () => {
			await withSetupClient(async (realmAdminClient) => {
				await realmAdminClient.delete(
					`${RESOURCE_API}tenants/${tenant}/projects/trainstation/datasets/dsfile`
				);
			});
		});
	});

	test('welcome page does not show "created" (unknown in platform)', async ({ page }) => {
		await page.goto(`${SUPERSET}superset/welcome/`);
		await page.getByRole('button', { name: 'Kürzlich' }).click();
		await expect(page.getByText('Angesehen')).toBeVisible();
		await expect(page.getByText('Bearbeitet')).toBeVisible();
		await expect(page.getByText('Erstellt')).not.toBeVisible();
	});

	test('welcome page does not show "my" dashboards (unknown in platform)', async ({ page }) => {
		await page.goto(`${SUPERSET}superset/welcome/`);
		const dashboardBar = page.getByText(/Favoriten.*Dashboard/);

		await expect(dashboardBar.getByText('Favoriten')).toBeVisible();
		await expect(dashboardBar.getByText('Meine')).not.toBeVisible();
		await expect(dashboardBar.getByText('Alle', { exact: true })).toBeVisible();
	});

	test('dashboard thumbnails are available', ({ page }) => checkThumbnail(page, 'test2'));

	test('chart thumbnails are available', async ({ page }) => {
		await page.goto(`${SUPERSET}chart/add`);

		await page.getByRole('combobox', { name: 'Datensatz' }).click();
		await page.getByText('sensor_messages', { exact: true }).click();
		await page.getByRole('button', { name: 'Tabelle Tabelle' }).click();
		await page.getByRole('button', { name: 'Neues Diagramm erstellen' }).click();
		await page
			.getByText('project', { exact: true })
			.dragTo(page.getByText('ziehen oder klicken').first());
		await page.getByRole('button', { name: /Diagramm (erstellen|aktualisieren)/ }).click();
		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.getByRole('textbox', { name: 'Name' }).click();
		await page.getByRole('textbox', { name: 'Name' }).fill(`${tenant}-thumbtest`);
		await page.getByLabel('Diagramm speichern').getByRole('button', { name: 'Speichern' }).click();
		await page.getByRole('link', { name: 'Superset' }).click();
		await page.getByText('Meine').click();
		await page.getByText(`${tenant}-thumbtest`).click();
		const slice = page.url().split('=')[1];

		await expect(() =>
			expect(
				fetchInBrowser(page, `${SUPERSET}api/v1/chart/${slice}/thumbnail/dummydigest`, 'status')
			).resolves.toBe(200)
		).toPass();
	});

	test('alerts and reports work', async ({ page }) => {
		try {
			await test.step('dashboard reports can be created from menu', async () => {
				await page.goto(`${SUPERSET}superset/dashboard/${tenant}_trainstation_test1`);
				await page.getByRole('button', { name: 'Auslöser von Menüaktionen' }).click();
				await docsScreenshot('superset-report-quick', page.getByText('E-Mail-Bericht verwalten'));
				await page.getByLabel('Dashboard Titel').evaluate((el) => {
					el.textContent = 'knuffingen_trainstation_test';
				});
				await expect(async () => {
					await page.getByText('E-Mail-Bericht verwalten').hover();
					await page.getByText('E-Mail-Bericht einrichten').click({ timeout: 6_000 });
				}).toPass({ intervals: [0] });
				await docsScreenshot(
					'create-simple-report-dashboard',
					page.getByText('Planen eines neuen E-Mail-Berichts'),
					{ crop: false, highlight: false }
				);
				await page
					.getByRole('textbox', { name: 'Wöchentlicher Bericht' })
					.fill(`${testPostfix}-dashboard`);
				await page.getByText('Woche').click();
				await page.getByText('Minute', { exact: true }).click();
				await page.getByRole('button', { name: 'Hinzufügen' }).click();
			});

			const reportChart = async (style: string) => {
				await dummyChartSaveScreen(page);
				await page.getByRole('textbox', { name: 'Name' }).fill(`${testPostfix}-${style}`);
				await page
					.getByLabel('Diagramm speichern')
					.getByRole('button', { name: 'Speichern' })
					.click();
				await page.getByRole('button', { name: 'Auslöser von Menüaktionen' }).click();
				await expect(async () => {
					await page.getByText('E-Mail-Bericht verwalten').hover();
					await page.getByText('E-Mail-Bericht einrichten').click({ timeout: 6_000 });
				}).toPass({ intervals: [0] });
				await page.getByText('Formatierte CSV-Datei in E-Mail angehängt').scrollIntoViewIfNeeded();
				const diagramTitelElement = page.getByLabel('Diagrammtitel');
				await diagramTitelElement.evaluate((el) => {
					const input = el as HTMLInputElement;
					input.value = 'knuffingen_trainstation-csv';
					input.dispatchEvent(new Event('input', { bubbles: true })); // trigger React/Vue updates if needed
				});
				await docsScreenshot(
					'create-simple-report-diagram',
					page.getByText('Planen eines neuen E-Mail-Berichts'),
					{ crop: false, highlight: false }
				);
				await page.getByLabel('Planen').getByText(style).click();
				await page
					.getByRole('textbox', { name: 'Wöchentlicher Bericht' })
					.fill(`${testPostfix}-${style}`);
				await page.getByText('Woche').click();
				await page.getByText('Minute', { exact: true }).click();
				await page.getByRole('button', { name: 'Hinzufügen' }).click();
			};
			await test.step('text chart reports can be created from menu', async () =>
				await reportChart('text'));
			await test.step('csv chart reports can be created from menu', async () =>
				await reportChart('csv'));

			await test.step('alerts can be created', async () => {
				await page.getByText('Einstellungen', { exact: true }).click();
				await docsScreenshot(
					'superset-report-menu',
					page.getByRole('link', { name: 'Alerts & Reports' })
				);
				await page.getByRole('link', { name: 'Alerts & Reports' }).click();
				await page
					.getByRole('main')
					.getByRole('navigation')
					.getByRole('button', { name: '+ Alarm' })
					.click();
				await docsScreenshot(
					'superset-alert-config',
					page.getByRole('textbox', { name: 'Name des Alarms' }),
					{ crop: false }
				);
				await page.getByRole('textbox', { name: 'Name des Alarms' }).fill(`${testPostfix}-alert`);
				await page.getByText('Alarmierungsbedingung').click();
				await page.getByRole('combobox', { name: 'Datenbank' }).click();
				await page.getByText('clickhouse').click();
				await page.locator('.ace_content').click();
				await page.getByRole('textbox', { name: 'Cursor at row' }).fill('SELECT 1');
				await page.getByRole('combobox', { name: 'Bedingung' }).click();
				await page.getByText('Nicht NULL').click();
				await page.getByText('Inhalt des Alarms').click();
				await page.getByRole('combobox', { name: 'Dashboard' }).click();
				await page.getByText(`knuffingen-${testPostfix}_trainstation_test1`).click();
				await page.getByText('Als PNG senden').click();
				await page.getByText('Als PDF versenden').click();
				await page.getByLabel('Alarm hinzufügen').getByText('Zeitplan', { exact: true }).click();
				await page.getByText('Tag', { exact: true }).click();
				await page.getByText('Minute', { exact: true }).click();
				await page.getByText('Benachrichtigungsmethode', { exact: true }).click();
				await page.locator('textarea[name="To"]').fill(`${testPostfix}@example.com`);
				await page.getByRole('button', { name: 'Hinzufügen', exact: true }).click();
			});

			await test.step('advanced reports can be created and edited', async () => {
				const REPORT_NAME: string = `${testPostfix}-report`;

				await page.getByText('Einstellungen', { exact: true }).click();
				await page.getByRole('link', { name: 'Alerts & Reports' }).click();
				await page.getByRole('link', { name: 'Berichte' }).click();

				await page
					.getByRole('main')
					.getByRole('navigation')
					.getByRole('button', { name: '+ Bericht' })
					.click();

				const reportLocator = page.getByText(new RegExp(`^${testPostfix}-`));

				await reportLocator.evaluateAll((elements) => {
					elements.forEach((el, i) => {
						el.textContent = `example-report-${i + 1}`;
					});
				});

				await docsScreenshot(
					'create-advanced-report-diagram',
					page.getByRole('textbox', { name: 'Name des Berichts' }),
					{ crop: false }
				);

				await page.getByRole('textbox', { name: 'Name des Berichts' }).fill(REPORT_NAME);
				await page.getByRole('dialog', { name: 'Bericht hinzufügen' }).getByRole('switch').click();

				await page.getByRole('tab', { name: 'Inhalt des Berichts' }).click();
				await page.getByRole('combobox', { name: 'Dashboard' }).click();
				await page.getByText(`knuffingen-${testPostfix}_trainstation_test1`).click();

				await page.getByRole('tab', { name: 'Benachrichtigungsmethode' }).click();
				await page.locator('textarea[name="To"]').fill(`${testPostfix}@example.com`);
				await page.getByRole('button', { name: 'Hinzufügen', exact: true }).click();

				const REPORTS_SEARCH = page.getByRole('textbox', { name: 'Geben Sie einen Wert ein' });
				await REPORTS_SEARCH.fill(REPORT_NAME);
				await REPORTS_SEARCH.press('Enter');
				await expect(page.getByText('von 1')).toBeVisible();

				await expect(page.getByRole('button', { name: 'edit' })).toBeVisible();
				await page.waitForSelector('span.actions', { state: 'attached' });

				await page.$eval('span.actions', (el) => {
					const s = (el as HTMLElement).style;
					s.setProperty('opacity', '1', 'important');
					s.setProperty('visibility', 'visible', 'important');
				});
				await page.waitForTimeout(200); // allow repaint
				await docsScreenshot('edit-symbol-report', page.getByRole('button', { name: 'edit' }), {
					highlight: true
				});
			});

			await test.step('proper emails are sent', async () => {
				const mailhogClient = getMailhogClient();
				const waitForEmailWith = async (s: string) =>
					await expect(async () => {
						expect(
							JSON.parse(
								(
									await mailhogClient.get<string>(
										`${MAILHOG}api/v2/search?kind=containing&query=${encodeURIComponent(s)}`
									)
								).data
							).total
						).toBeGreaterThan(0);
					}).toPass();

				await waitForEmailWith(`${tenant}_trainstation_test1.pdf`);
				await waitForEmailWith(`${testPostfix}-csv.csv`);
				await waitForEmailWith('image/png');
				await waitForEmailWith('time');
				await waitForEmailWith('Ansehen im Urban Stack');
				await waitForEmailWith(`${SUPERSET}explore/`);
			});
		} finally {
			await cleanUpReports();
		}
	});
});

async function cleanUpReports() {
	const { ids } = JSON.parse(
		(await (await supersetClient()).get<string>(`${SUPERSET}api/v1/report/`)).data
	);
	await (await supersetClient()).delete(`${SUPERSET}api/v1/report/?q=!(${ids.join(',')})`);
}

test('users not enumerable', async () => {
	expect(
		(await axios.get<any>(`${SUPERSET}api/v1/dashboard/related/owners`)).data.result.length
	).toBe(0);
});

test('dashboard creation redirects to govhub', async ({ page }) => {
	await supersetSignIn(page);

	const govhubRequest = page.waitForRequest(`${UGH}dashboards`);
	await page.goto(`${SUPERSET}dashboard/new`);
	await govhubRequest;
});

test('menu shown outside iframe', async ({ page }) => {
	await page.goto(`${SUPERSET}dashboard/list`);
	await expect(page.getByRole('link', { name: 'Anmelden' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Dashboards' })).toBeVisible();
});

test('tracking pixel not present', async ({ page }) => {
	await page.goto(`${SUPERSET}dashboard/list`);
	expect(await page.locator('img[src*="scarf.sh"]').count()).toBe(0);
});

test('screenshots', async ({ page }) => {
	const testPostfix = getRandomString(6);
	const tenant = TENANT_MGR.with(testPostfix);
	await withSetupClient(async (realmAdminClient) => {
		await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
		await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/project/trainstation`);

		await new Upload({
			client: bucketAdminClient(),
			params: {
				Bucket: `${tenant}.trainstation`,
				Key: `test.csv`,
				Body: `a,b,c\n1,2,3`
			}
		}).done();
		await realmAdminClient.put(
			`${RESOURCE_API}tenants/${tenant}/project/trainstation/dataset/testcsv`,
			{
				format: 'CSV',
				path: 'test.csv'
			}
		);
	});
	const grog = await createKeycloakUser(grogStrongjaw(), [`${tenant}/admin`]);
	await supersetSignIn(page, grog);
	await page.goto(`${SUPERSET}tablemodelview/list/`);
	await expect(page.getByRole('link', { name: tenant })).toBeVisible();
	await fixupTenantName(page, testPostfix);
	await docsScreenshot('superset-dataset-list', page);
	await page.getByRole('link', { name: `knuffingen.trainstation` }).click();
	await page.getByRole('button', { name: 'more-vert' }).click();
	await fixupTenantName(page, testPostfix);
	await docsScreenshot(
		'superset-dataset-to-sqllab',
		page.getByRole('link', { name: 'In SQL Lab anzeigen' }),
		{ crop: false }
	);
});

test('has legal links', async ({ page }) => {
	await page.goto(`${SUPERSET}dashboard/list`);
	await hasLegalLinks(page);
});
