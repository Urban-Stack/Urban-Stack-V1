// this file contains screenshot creation code for features that don't have a suitable existing test (yet)

import test, { expect } from 'playwright/test';
import { UGH } from './helper/urls';
import { DATA_HUB_ADMIN_PASSWORD, DATA_HUB_ADMIN_USERNAME, signInWith } from './helper/keycloak';
import { getRandomString } from './helper/util';
import { docsScreenshot } from './helper/screenshot';

async function substituteByText(page, oldText, newText) {
	await page.waitForSelector(`text=${oldText}`);
	const elements = await page.getByText(oldText).elementHandles();
	if (elements.length === 0) {
		console.warn(`No elements found with text: '${oldText}'`);
		return;
	}
	for (const e of elements) {
		await e.evaluate((el, newText) => (el.textContent = newText), newText);
	}
}
test('screenshot MQTT subscription', async ({ page }) => {
	const project = `Hochwasser`;
	const project_rand = project + `-${getRandomString(6)}`;
	const dashboard = `Abteilung-1`;
	const dashboard_rand = dashboard + `-${getRandomString(6)}`;
	await page.goto(UGH);
	await signInWith(page, DATA_HUB_ADMIN_USERNAME, DATA_HUB_ADMIN_PASSWORD);
	await page.getByRole('link', { name: 'Einstellungen' }).click();
	await page.getByRole('link', { name: 'Projekte' }).click();
	await page.getByRole('button', { name: 'Neues Projekt' }).click();
	await page.getByRole('textbox', { name: 'Unbenanntes Projekt' }).fill(project_rand.toLowerCase());
	await page.getByRole('button', { name: 'Projekt erstellen' }).click();
	await page.getByRole('cell', { name: project_rand }).click();
	await page.getByRole('link', { name: 'Subscriptions' }).click();
	await page.waitForLoadState('load');

	await substituteByText(page, project_rand, project);
	await docsScreenshot(
		'create-new-mqtt-subscription',
		page.getByRole('button', { name: 'Neue Subscription' }),
		{ crop: false }
	);

	await page.getByRole('button', { name: 'Neue Subscription' }).click();
	await page.getByRole('textbox', { name: 'Name der Subscription' }).click();
	await page.getByRole('textbox', { name: 'Name der Subscription' }).fill('pegelstand');
	await page.getByRole('textbox', { name: 'URI' }).click();
	await page.getByRole('textbox', { name: 'URI' }).fill('mqtts://eu1.cloud.thethings.network:8883');
	await page.getByRole('textbox', { name: 'Topic' }).click();
	await page
		.getByRole('textbox', { name: 'Topic' })
		.fill('/v3/my-application@my-tenant/devices/eui-ad304r5z21823fih/up');
	await page.getByRole('textbox', { name: 'Username' }).click();
	await page.getByRole('textbox', { name: 'Username' }).fill('myuser');
	await page.getByRole('textbox', { name: 'Username' }).press('Tab');
	await page.getByRole('textbox', { name: 'Passwort' }).fill('mypassword');

	await docsScreenshot('ugh-mqtt-subscription', page.getByRole('button', { name: 'Speichern' }), {
		crop: false
	});

	await page.getByRole('link', { name: 'Freigabe Benutzergruppen' }).click();
	await page.waitForLoadState('load');

	await docsScreenshot(
		'share-project-data-usergroups',
		page.getByRole('button', { name: 'Freigeben' }),
		{
			crop: false
		}
	);
	await page.getByRole('link', { name: 'Freigabe Dashboardgruppen' }).click();
	await page.waitForLoadState('load');
	await docsScreenshot(
		'share-project-data-dashboardgroups',
		page.getByRole('button', { name: 'Freigeben' }),
		{
			crop: false
		}
	);
	await page.getByRole('link', { name: 'Dashboardgruppen', exact: true }).click();
	await page.getByRole('button', { name: 'Neue Dashboardgruppe' }).click();
	await page
		.getByRole('textbox', { name: 'Unbenannte Dashboardgruppe' })
		.fill(dashboard_rand.toLowerCase());
	await page.getByRole('button', { name: 'Dashboardgruppe erstellen' }).click();
	await page.getByRole('cell', { name: dashboard_rand }).click();
	await page.getByRole('link', { name: 'Freigabe Benutzergruppen' }).click();
	await page.waitForLoadState('load');
	await page.getByRole('button', { name: 'Freigeben' }).click();
	await substituteByText(page, dashboard_rand, dashboard);
	await docsScreenshot(
		'give-usergroup-permission-to-dashboardgroup',
		page.getByRole('button', { name: 'Freigeben' }),
		{
			crop: false
		}
	);
	await page.getByRole('button', { name: 'Abbrechen' }).click();
	await page.getByTestId('app-sidebar').getByLabel('Dashboards').click();
	await substituteByText(page, 'guetersloh_sccon_unwetter', 'park_dashboard');
	await docsScreenshot(
		'dashboards-overview',
		page.getByRole('button', { name: 'Dashboard erstellen' }),
		{
			crop: false
		}
	);
});

test('screenshot sensor credential', async ({ page }) => {
	const project = `lichtsensor-${getRandomString(6)}`;

	await page.goto(UGH);
	await signInWith(page, DATA_HUB_ADMIN_USERNAME, DATA_HUB_ADMIN_PASSWORD);
	await page.getByRole('link', { name: 'Einstellungen' }).click();
	await page.getByRole('link', { name: 'Projekte' }).click();
	await page.getByRole('button', { name: 'Neues Projekt' }).click();
	await page.getByRole('textbox', { name: 'Unbenanntes Projekt' }).fill(project);
	await page.getByRole('button', { name: 'Projekt erstellen' }).click();
	await page.getByRole('cell', { name: project }).click();
	await page.getByRole('link', { name: 'Credentials' }).click();
	await page.waitForLoadState('load');
	await page.getByRole('button', { name: 'Neue Credentials' }).click();
	await page.getByRole('textbox', { name: 'Name der Sensor Credentials' }).click();
	await page.getByRole('textbox', { name: 'Name der Sensor Credentials' }).fill('lichtsensor');
	await page.getByRole('button', { name: 'Credentials erstellen' }).click();

	await expect(page.getByRole('heading', { name: 'Ihre neuen Sensor Credentials' })).toBeVisible();

	await page
		.getByLabel('Benutzername')
		.evaluate((el) => ((el as HTMLInputElement).value = '6d9a2518-91e3-442b-a86a-73acb9cc7d4d'));
	await page
		.getByLabel('Passwort')
		.evaluate((el) => ((el as HTMLInputElement).value = 'sETotKuvHRnqTcO89URKOoTEQXqBy4lA'));

	await docsScreenshot('ugh-sensor-credentials', page);
});
