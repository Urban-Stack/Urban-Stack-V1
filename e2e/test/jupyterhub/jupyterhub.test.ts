import { test, expect, Page } from '@playwright/test';
import { JUPYTERHUB } from '../helper/urls';
import {
	createKeycloakUser,
	createRandomTestUser,
	createResources,
	DATA_HUB_ADMIN_PASSWORD,
	signIn,
	signInWith
} from '../helper/keycloak';
import * as path from 'node:path';
import { grogStrongjaw } from '../helper/test-user';
import { getRandomString, hasLegalLinks, RandomTenantManager } from '../helper/util';
import { docsScreenshot } from '../helper/screenshot';
import { checkedGraphqlRequest, graphql } from '../helper/graphql';

const TENANT_MGR = new RandomTenantManager();

export async function uploadJupyterNotebook(page: Page, filename: string) {
	const fileChooserPromise = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Upload Files' }).click();
	const fileChooser = await fileChooserPromise;
	await fileChooser.setFiles(path.join(__dirname, `example_notebooks/${filename}`));
}

export async function waitForStartingJupyterServer(page: Page) {
	await expect(page.getByText('Your server is starting up.')).toBeVisible();
	await expect(page.getByText('Your server is starting up.')).toBeHidden({ timeout: 30000 });
}

test('login/logout', async ({ page }) => {
	const grog = await createKeycloakUser(grogStrongjaw());

	await page.goto(JUPYTERHUB);
	await signIn(page, grog);
	await waitForStartingJupyterServer(page);

	await page.getByRole('menuitem', { name: 'File' }).click();
	await page.getByRole('menuitem', { name: 'Log Out' }).click();
	await page.getByRole('button', { name: 'Abmelden' }).click();

	await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible();
});

test('run notebook (fetch public API)', async ({ page }) => {
	// setup new test user
	const grog = await createKeycloakUser(grogStrongjaw());

	await page.goto(JUPYTERHUB);
	await signIn(page, grog);
	await waitForStartingJupyterServer(page);

	await uploadJupyterNotebook(page, 'public-api-example.ipynb');
	// make sure there is no lost+found directory by default
	await expect(page.getByText('lost+found')).not.toBeVisible();

	// select and run notebook
	await page.getByLabel('File Browser Section').getByText('public-api-example.ipynb').dblclick();
	await expect(page.getByText('# Beispiel Jupyter-Notebook:')).toBeVisible();
	await expect(async () => {
		await page.getByRole('menuitem', { name: 'Run' }).click();
		await page.getByRole('menuitem', { name: 'Run All Cells', exact: true }).click();
		await expect(page.getByText('Es konnten Daten geladen werden Datenvorschau:')).toBeVisible({
			timeout: 10000
		});
	}).toPass({ intervals: [0] });
});

test('run notebook (use platform library)', async ({ context, page }) => {
	await test.step('Hub has legal links', async () => {
		// we need a name that is different from tenants that are publicly visible
		const tenant = TENANT_MGR.with(`jupy-${getRandomString(6)}`);
		await createResources([`tenants/${tenant}/projects/p`]);

		const grog = await createKeycloakUser(grogStrongjaw(), [tenant, `${tenant}/admin`]);

		await page.goto(`${JUPYTERHUB}hub/home`);
		await signIn(page, grog);
		await hasLegalLinks(page);
	});

	await test.step('test notebook functionality', async () => {
		await page.goto(JUPYTERHUB);
		await waitForStartingJupyterServer(page);

		await uploadJupyterNotebook(page, 'library.ipynb');

		await page.getByLabel('File Browser Section').getByText('library.ipynb').dblclick();
		await expect(page.getByText('Python 3 (ipykernel) | Idle')).toBeVisible();
		await page.getByRole('menuitem', { name: 'Run' }).click();
		await page.getByRole('menuitem', { name: 'Run All Cells', exact: true }).click();
		const kcPagePromise = context.waitForEvent('page');
		await page.getByText('device?user_code=').click();
		const kcPage = await kcPagePromise;

		await expect(kcPage.getByText('Zugriff erlauben')).toBeVisible();
		await expect(
			kcPage.getByText('Erlauben Sie nur Zugriff, wenn sie den Code selbst ausführen')
		).toBeVisible();
		await expect(kcPage.getByText('Plattformressourcen')).toBeVisible();

		await kcPage.getByRole('button', { name: 'Ja' }).click();

		await expect(kcPage.getByText('mit Ihrem Programmcode weiterarbeiten')).toBeVisible();

		await kcPage.close();

		await expect(page.getByText('Bucket test succeeded')).toBeVisible({
			timeout: 20000
		});
	});

	await test.step('take autocompletion screenshot', async () => {
		const cell0 = page.getByText(/\[.]:/).first();
		await cell0.click();
		for (let i = 0; i < 6; i++) await cell0.press('D');
		await page.getByRole('textbox').fill('auth.');
		await page.keyboard.press('Tab');
		const completedItem = page.getByText('http');
		await expect(completedItem).toBeVisible();
		await docsScreenshot('jupyterhub-autocomplete', completedItem, { highlight: false });
	});

	await test.step('ensure Jupyter news is disabled', () =>
		expect(page.getByText('Jupyter news')).not.toBeVisible());

	await test.step('ensure Visual Python is available', () =>
		expect(page.getByRole('tab', { name: 'Visual Python' })).toBeVisible());
	await test.step('Lab has legal links', async () => {
		await page.getByText('Impressum + Datenschutz').click();
		await expect(page.getByText('Impressum', { exact: true })).toBeVisible();
		await expect(page.getByText('Datenschutz', { exact: true })).toBeVisible();
	});
});

test('run notebook with personal credential', async ({ page }) => {
	const tenant = TENANT_MGR.get();
	await createResources([`tenants/${tenant}/projects/p`]);

	const grog = await createRandomTestUser([tenant, `${tenant}/admin`]);

	const {
		data: { personalCredential }
	}: { data: { personalCredential: { username: string; password: string } } } =
		await checkedGraphqlRequest(
			graphql`
				query {
					personalCredential {
						username
						password
					}
				}
			`,
			{},
			grog
		);

	await page.goto(`${JUPYTERHUB}hub/home`);
	await signInWith(page, grog.username, DATA_HUB_ADMIN_PASSWORD);
	await page.goto(JUPYTERHUB);
	await waitForStartingJupyterServer(page);

	await uploadJupyterNotebook(page, 'library.ipynb');

	await page.getByLabel('File Browser Section').getByText('library.ipynb').dblclick();
	await expect(page.getByText('Python 3 (ipykernel) | Idle')).toBeVisible();
	await page.getByRole('button', { name: 'Insert a cell above (A)' }).click();
	await page.getByLabel('Code Cell Content').first().click();
	await page
		.getByLabel('Code Cell Content')
		.first()
		.getByRole('textbox')
		.fill(
			`%env PERSONAL_CREDENTIAL_USERNAME=${personalCredential.username}\n%env PERSONAL_CREDENTIAL_PASSWORD=${personalCredential.password}\n`
		);
	await page.getByRole('menuitem', { name: 'Run' }).click();
	await page.getByRole('menuitem', { name: 'Run All Cells', exact: true }).click();

	// since the personal credential is given, no user interaction is necessary

	await expect(page.getByText('Bucket test succeeded')).toBeVisible({
		timeout: 20000
	});
});

test('screenshot jupyterhub scheduler', async ({ page }) => {
	const grog = await createKeycloakUser(grogStrongjaw());
	await page.goto(JUPYTERHUB);
	await signIn(page, grog);
	await waitForStartingJupyterServer(page);
	await docsScreenshot(
		'jupyterhub-scheduler-notebook-card',
		page.getByTitle('Python 3 (ipykernel)').first(),
		{
			highlightRadius: 10
		}
	);

	await page.locator('.jp-LauncherCard-icon').first().click();
	await docsScreenshot(
		'jupyterhub-scheduler-notebook-untitled',
		page.getByRole('listitem', { name: 'Name: Untitled.ipynb' }),
		{
			highlight: false,
			zoom: 1.3
		}
	);

	await uploadJupyterNotebook(page, 'random-print.ipynb');
	await page.getByLabel('File Browser Section').getByText('random-print.ipynb').dblclick();
	await expect(page.getByText('import random')).toBeVisible();
	await docsScreenshot(
		'jupyterhub-scheduler-notebook-run-button',
		page.getByRole('button', { name: 'Run this cell and advance' }),
		{ crop: false, highlightRadius: 10 }
	);

	await docsScreenshot(
		'jupyterhub-scheduler-create-notebook-job',
		page.getByRole('button', { name: 'Create a notebook job' }),
		{ crop: false, highlightRadius: 10 }
	);

	await page.getByRole('button', { name: 'Create a notebook job' }).click();
	await expect(page.getByText('Loading …')).not.toBeVisible({ timeout: 10_000 });

	await page.getByRole('button', { name: 'Add new parameter' }).click();
	await page.getByRole('textbox', { name: 'Name', exact: true }).fill('teststr');
	await page.getByRole('textbox', { name: 'Value' }).fill('"test123"');
	await page.getByRole('textbox', { name: 'Value' }).blur();
	await page.getByRole('button', { name: 'Add new parameter' }).click();
	await page.locator('input[name="parameter-1-name"]').fill('testint');
	await page.locator('input[name="parameter-1-value"]').fill('123');
	await page.locator('input[name="parameter-1-value"]').blur();
	await page.getByRole('button', { name: 'Add new parameter' }).click();
	await page.locator('input[name="parameter-2-name"]').fill('testbool');
	await page.locator('input[name="parameter-2-value"]').fill('True');
	await page.locator('input[name="parameter-2-value"]').blur();
	await page.getByRole('button', { name: 'Add new parameter' }).click();
	await page.locator('input[name="parameter-3-name"]').fill('%env PERSONAL_CREDENTIAL_USERNAME');
	await page
		.locator('input[name="parameter-3-value"]')
		.fill('user-12345678-1234-4321-1234-123456789abc');
	await page.locator('input[name="parameter-3-value"]').blur();
	await page.getByRole('button', { name: 'Add new parameter' }).click();
	await page.locator('input[name="parameter-4-name"]').fill('%env PERSONAL_CREDENTIAL_PASSWORD');
	await page.locator('input[name="parameter-4-value"]').fill('HierKommtDasPasswortHin');
	await page.locator('input[name="parameter-4-value"]').blur();
	await docsScreenshot(
		'jupyterhub-scheduler-job-parameters',
		page.getByLabel('Notebook Jobs').locator('div').filter({ hasText: 'Parameters' }).nth(3),
		{ highlight: false, zoom: 2 }
	);

	await page.getByRole('button', { name: 'Additional options' }).click();
	await expect(page.locator('#jp-create-job-create-panel-content')).toBeVisible();
	await page.getByRole('textbox', { name: 'Idempotency token' }).fill('123456789');
	await page.getByRole('button', { name: 'Add new tag' }).click();
	await page.getByRole('textbox', { name: 'Tag' }).fill('metadata');
	await page.getByRole('button', { name: 'Add new tag' }).click();
	await page.getByRole('textbox', { name: 'Tag 2' }).fill('sensors');

	await docsScreenshot(
		'jupyterhub-scheduler-job-additional-options',
		page.locator('#jp-create-job-create-panel-content'),
		{
			highlight: false,
			zoom: 1.7
		}
	);

	await docsScreenshot(
		'jupyterhub-scheduler-job-run-now',
		page.getByText('ScheduleRun nowRun on a'),
		{
			highlight: false,
			zoom: 2
		}
	);

	await page.getByRole('radio', { name: 'Run on a schedule' }).check();
	await docsScreenshot(
		'jupyterhub-scheduler-job-run-schedule',
		page.getByText('ScheduleRun nowRun on a'),
		{
			highlight: false,
			zoom: 1.7
		}
	);

	await page.getByRole('button', { name: 'Interval Weekday' }).click();
	await docsScreenshot(
		'jupyterhub-scheduler-job-run-schedule-schedules',
		page.getByText('ScheduleRun nowRun on a'),
		{
			highlight: false,
			zoom: 1.7
		}
	);

	await page.getByRole('option', { name: 'Custom schedule' }).click();
	await docsScreenshot(
		'jupyterhub-scheduler-job-run-schedule-custom',
		page.getByRole('textbox', { name: 'cron expression' }),
		{
			highlight: false,
			zoom: 2
		}
	);

	const datetime = new Date();
	const minutes = (datetime.getMinutes() + 1) % 60;
	await page.getByRole('button', { name: 'Interval Custom schedule' }).click();
	await page.getByRole('option', { name: 'Hour' }).click();
	await page.getByRole('textbox', { name: 'Minutes past the hour' }).fill(`${minutes}`);
	await page.getByRole('button', { name: 'Create' }).click();
	await docsScreenshot(
		'jupyterhub-scheduler-jobs',
		page.getByText('Notebook JobsNotebook Job DefinitionsYour job definition "random-print" has'),
		{
			highlight: false
		}
	);
	await new Promise((resolve) => setTimeout(resolve, 72000)); // wait a bit more than a minute to ensure the job has run
	await page.getByText('random-print', { exact: true }).click();
	await docsScreenshot(
		'jupyterhub-scheduler-job-overview-1',
		page.getByText('Reload Job DefinitionRun'),
		{
			highlight: false,
			zoom: 1.3
		}
	);
	await docsScreenshot('jupyterhub-scheduler-job-overview-2', page.getByText('Tags'), {
		highlight: false,
		zoom: 1.3
	});

	await docsScreenshot(
		'jupyterhub-scheduler-job-download-1',
		page.getByRole('button', { name: 'download' }),
		{ crop: false, highlightRadius: 10 }
	);
	await page.getByRole('button', { name: 'download' }).click();
	await expect(page.getByRole('link', { name: 'Notebook' })).toBeVisible();
	await docsScreenshot(
		'jupyterhub-scheduler-job-download-2',
		page.getByRole('link', { name: 'HTML' }),
		{ crop: false, highlightRadius: 10 }
	);
	await page.getByRole('link', { name: 'HTML' }).click();
	await expect(
		page
			.getByRole('region', { name: 'notebook content' })
			.locator('iframe')
			.contentFrame()
			.locator('body')
	).toBeVisible({ timeout: 10_000 });
	await docsScreenshot(
		'jupyterhub-scheduler-job-result',
		page.locator('iframe').contentFrame().locator('html'),
		{
			highlight: false,
			zoom: 1.1
		}
	);
	await docsScreenshot(
		'jupyterhub-scheduler-job-result-folder',
		page.getByRole('listitem', { name: 'Name: jobs' }),
		{}
	);
});
