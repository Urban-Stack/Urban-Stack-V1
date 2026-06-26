import test, { expect, Page } from 'playwright/test';
import { grogStrongjaw, TestUser } from '../helper/test-user';
import { RESOURCE_API, UGH } from '../helper/urls';
import { createKeycloakUser, signIn, withSetupClient } from '../helper/keycloak';
import { getRandomString, RandomTenantManager } from '../helper/util';
import { createAndLoginRandomTestUser } from '../helper/ugh';
import { Upload } from '@aws-sdk/lib-storage';
import { bucketAdminClient } from '../helper/bucket';
import { docsScreenshot, fixupTenantName, fixupUghAvatarImage } from '../helper/screenshot';

const TENANT_MGR = new RandomTenantManager();

const signInWithUser = async (page: Page, user: TestUser) => {
	await page.goto(UGH);
	await signIn(page, user);
	await expect(page.getByTestId('app-sidebar')).toBeVisible();
};

test('File manager page can be accessed', async ({ page }) => {
	const tenant = 'guetersloh';
	const grog = await createKeycloakUser(grogStrongjaw(), [tenant, `guetersloh/admin`]);
	await signInWithUser(page, grog);

	// create a new project
	const project = `e2e-filemanager-${getRandomString(6)}`;
	await page.getByRole('link', { name: 'Einstellungen' }).click();
	await page.getByRole('link', { name: 'Projekte' }).click();
	await page.getByRole('button', { name: 'Neues Projekt' }).click();
	await page.getByRole('textbox', { name: 'Unbenanntes Projekt' }).fill(project);
	await page.getByRole('button', { name: 'Projekt erstellen' }).click();

	// go to file manager
	await page.getByRole('link', { name: 'Datei-Manager', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Datei-Manager' })).toBeVisible();

	// select created project and assert no files are present
	await page.getByRole('combobox').selectOption(`${tenant}.${project}`);
	await expect(page.getByText('Noch keine Dateien vorhanden.')).toBeVisible();
});

test('screenshots', async ({ browser }) => {
	const postfix = getRandomString(6);
	const tenant = TENANT_MGR.with(postfix);
	const tenantDisplayName = `Knuffingen ${postfix}`;
	await withSetupClient(async (client) => {
		await client.put(`${RESOURCE_API}tenants/${tenant}`);
		await client.put(`${RESOURCE_API}tenants/${tenant}/attributes/tenant-name`, tenantDisplayName);
		await client.put(`${RESOURCE_API}tenants/${tenant}/project/trainstation`);
	});
	await new Upload({
		client: bucketAdminClient(),
		params: {
			Bucket: `${tenant}.trainstation`,
			Key: `Fahrplan.csv`,
			Body: `a,b,c\n${'4,5,6'.repeat(2000)}`
		}
	}).done();
	await new Upload({
		client: bucketAdminClient(),
		params: {
			Bucket: `${tenant}.trainstation`,
			Key: `Haltestellen.json`,
			Body: JSON.stringify(
				new Array(1000).fill(0).map((_) => ({
					asdf: 4321,
					test: 'test'
				}))
			)
		}
	}).done();
	const adminUserPage = await createAndLoginRandomTestUser(browser, [`${tenant}/admin`]);
	const readUserPage = await createAndLoginRandomTestUser(browser, [`${tenant}/read`]);

	await adminUserPage
		.getByTestId('app-sidebar_main')
		.getByRole('link', { name: 'Datei-Manager' })
		.click();

	const row = adminUserPage.getByRole('row', { name: 'Haltestellen.json' });
	await row.getByRole('button', { name: 'Nicht verknüpft' }).click();
	await docsScreenshot(
		'ugh-file-manager-create-dataset',
		adminUserPage.getByRole('button', { name: 'Verknüpfung erstellen' })
	);
	await adminUserPage.getByRole('button', { name: 'Verknüpfung erstellen' }).click();
	await expect(adminUserPage.getByText('Dataset wurde erfolgreich')).toBeVisible();
	await expect(adminUserPage.getByText('Dataset wurde erfolgreich')).not.toBeVisible();

	await readUserPage
		.getByTestId('app-sidebar_main')
		.getByRole('link', { name: 'Datei-Manager' })
		.click();
	await fixupTenantName(adminUserPage, postfix);
	await fixupTenantName(readUserPage, postfix);
	await adminUserPage.getByRole('heading', { name: 'Datei-Manager' }).hover();
	await fixupUghAvatarImage(adminUserPage, 'a');
	await readUserPage.getByRole('heading', { name: 'Datei-Manager' }).hover();
	await fixupUghAvatarImage(readUserPage, 'u');
	await docsScreenshot('ugh-file-manager-write-overview', adminUserPage);
	await docsScreenshot('ugh-file-manager-read-overview', readUserPage);

	const deleteButton = row.getByTestId('object-table-delete-badge').getByRole('button');
	await row.scrollIntoViewIfNeeded();
	// hack because hovering is flaky otherwise, since it uses visibility: hidden and not opacity: 0
	await row.evaluate((rowElem) => {
		const invisButtons = rowElem.lastElementChild.firstElementChild.children;
		for (let i = 0; i < invisButtons.length; i++) {
			invisButtons.item(i).classList.remove('lg:invisible');
		}
	});
	await fixupTenantName(adminUserPage, postfix);
	await docsScreenshot('ugh-file-manager-delete', deleteButton, {
		crop: false,
		highlightRadius: 15,
		scroll: false
	});
	const replaceFileButton = adminUserPage
		.getByTestId('object-table-replace-badge')
		.getByRole('button');
	await docsScreenshot('ugh-file-manager-replace-button', replaceFileButton, {
		highlightRadius: 15,
		scroll: false
	});
	await replaceFileButton.click();
	await docsScreenshot('ugh-file-manager-replace-view', adminUserPage);
});
