import { expect, Page, test } from 'playwright/test';
import { KEYCLOAK, RESOURCE_API, SUPERSET, UGH } from '../helper/urls';
import { createKeycloakUser, signIn, withSetupClient } from '../helper/keycloak';
import { grogStrongjaw, scanlanShorthalt, TestUser } from '../helper/test-user';
import {
	discourseProfilePictureUrl,
	docsScreenshot,
	fixupTenantName,
	fixupUghAvatarImage
} from '../helper/screenshot';
import { getRandomString, inSeparateBrowser, RandomTenantManager } from '../helper/util';
import {
	createAndLoginRandomTestUser,
	createDashboard,
	createDashboardGroup,
	SUPERSET_IFRAME_LOCATOR,
	visitDashboardPage
} from '../helper/ugh';
import path from 'path';
import { Frame } from 'playwright';

const TEST_TENANT = 'guetersloh';

const TENANT_MGR = new RandomTenantManager();

const createAdminUser = (tenant: string) =>
	createKeycloakUser(grogStrongjaw(), [tenant, `${tenant}/admin`]);

const signInWithUser = async (page: Page, user: TestUser) => {
	await page.goto(UGH);
	await signIn(page, user);
	await expect(page.getByTestId('app-sidebar')).toBeVisible();
};

const visitSettingsPage = async (page: Page) => {
	await page.getByTestId('app-sidebar-toggle').click();
	const sidebar = page.getByTestId('app-sidebar');
	await sidebar.getByText('Einstellungen').click();
};

const visitSettingsSubPage = async (page: Page, label: string) => {
	const settingsSidebar = page.getByTestId('settings-sidebar');
	await settingsSidebar.getByText(label).click();
};

const createUserGroup = async (page: Page) => {
	const groupName = `group-${Math.floor(Date.now() / 1000)}`;
	await visitSettingsSubPage(page, 'Benutzergruppen');
	await expect(page.getByRole('heading', { name: 'Benutzergruppen' })).toBeVisible();
	await page.getByRole('button', { name: 'Neue Benutzergruppe' }).click();
	await page.getByRole('textbox', { name: 'Unbenannte Benutzergruppe' }).fill(groupName);
	await page.getByRole('button', { name: 'Gruppe erstellen' }).click();
	await expect(page.getByRole('row', { name: groupName })).toBeVisible();
	return groupName;
};

const deleteUserGroup = async (page: Page, groupName: string) => {
	await visitSettingsSubPage(page, 'Benutzergruppen');
	await expect(page.getByRole('heading', { name: 'Benutzergruppen' })).toBeVisible();
	await page.getByRole('cell', { name: groupName }).click();
	await page.getByRole('link', { name: 'Danger Zone' }).click();
	await page.waitForLoadState('load');
	await page.getByRole('textbox').fill(groupName);
	await page.getByRole('button', { name: 'Löschen' }).click();
	await expect(page.getByRole('heading', { name: 'Benutzergruppen' })).toBeVisible();
	await expect(page.getByRole('row', { name: groupName })).not.toBeAttached();
};

test.describe('Projects', () => {
	const createProject: (page: Page) => Promise<string> = async (page) => {
		const projectName = `project-${getRandomString(6)}`;
		await page.getByRole('button', { name: 'Neues Projekt' }).click();
		const modal = page.getByRole('dialog');
		const nameInput = modal.getByPlaceholder('Unbenanntes Projekt');
		await nameInput.fill(projectName);
		const confirmButton = modal.getByRole('button', { name: 'Projekt erstellen' });
		await confirmButton.click();
		return projectName;
	};

	const createSubscription: (user: TestUser, page: Page) => Promise<string> = async (
		user,
		page
	) => {
		const subscriptionName = `subscription-${getRandomString(6)}`;
		await page.getByRole('button', { name: 'Neue Subscription' }).click();
		await page.waitForLoadState('load');
		await page.getByRole('textbox', { name: 'Name der Subscription' }).fill(subscriptionName);
		await page.getByRole('textbox', { name: 'URI' }).fill('wss://mqtt.test.data:443');
		await page.getByRole('textbox', { name: 'Topic' }).fill('sensor/message');
		await page.getByRole('textbox', { name: 'Username' }).fill(user.email);
		await page.getByRole('textbox', { name: 'Passwort' }).fill(user.password);
		await page.getByRole('button', { name: 'Speichern' }).click();
		return subscriptionName;
	};

	test('Create project', async ({ page }) => {
		const userGrog = await createAdminUser(TEST_TENANT);
		await signInWithUser(page, userGrog);
		await visitSettingsPage(page);

		// create project
		await visitSettingsSubPage(page, 'Projekte');
		const project = await createProject(page);

		// expect new project is listed
		const projectsTable = page.getByTestId('project-list-table');
		await expect(projectsTable).toContainText(project);
		await expect(projectsTable).toContainText(TEST_TENANT);
	});

	test('Project admin can create a new Subscription', async ({ page }) => {
		// Login and navigate to settings
		const grog = await createAdminUser(TEST_TENANT);
		await signInWithUser(page, grog);
		await visitSettingsPage(page);

		// create project
		await visitSettingsSubPage(page, 'Projekte');
		const project = await createProject(page);

		// navigate to Subscriptions subpage
		await page.getByRole('cell', { name: project }).click();
		await page.getByRole('link', { name: 'Subscriptions' }).click();
		const newSubscriptionButton = page.getByRole('button', { name: 'Neue Subscription' });
		await expect(newSubscriptionButton).toBeVisible();
		await expect(newSubscriptionButton).toBeEnabled();

		// create a new Subscription
		const subscriptionName = await createSubscription(grog, page);

		// expect success toast and new subscription in the overview
		await expect(page.getByText('Subscription erfolgreich')).toBeVisible();
		await expect(page.getByRole('cell', { name: subscriptionName })).toBeVisible();
	});

	test('Project observer cannot go into Project details', async ({ browser, page }) => {
		// Admin: Login and navigate to settings
		const adminGrog = await createAdminUser(TEST_TENANT);
		await signInWithUser(page, adminGrog);
		await visitSettingsPage(page);

		// Admin: creates new user group
		const userGroupName = await createUserGroup(page);

		// Admin: creates project
		await visitSettingsSubPage(page, 'Projekte');
		const project = await createProject(page);

		// Admin: adds the new user group to project as observers
		await page.getByRole('cell', { name: project }).click();
		await page.getByRole('link', { name: 'Freigabe Benutzergruppen' }).click();
		await page.waitForLoadState('load');
		await page.getByRole('button', { name: 'Freigeben' }).click();
		const optionToSelect = await page.locator('option', { hasText: userGroupName }).textContent();
		await page.getByRole('combobox').selectOption(optionToSelect);
		await page.getByText('Betrachter').click();
		await page.getByRole('button', { name: 'Freigeben' }).click();
		await expect(page.getByText('Berechtigung erfolgreich')).toBeVisible();

		// Observer: Login and navigate to settings
		const observerScanlan = await createKeycloakUser(scanlanShorthalt(), [
			TEST_TENANT,
			`${TEST_TENANT}/${userGroupName}`
		]);
		const pageB = await browser.newPage();
		await signInWithUser(pageB, observerScanlan);
		await visitSettingsPage(pageB);

		// Observer: sees project
		await visitSettingsSubPage(pageB, 'Projekte');
		const projectEntry = pageB.getByRole('cell', { name: project });
		await expect(projectEntry).toBeVisible();

		// Observer: click on project must never navigate to details
		const failOnNavigation = (frame: Frame) => {
			if (frame === pageB.mainFrame()) {
				throw new Error('Observer should not reach project details');
			}
		};
		pageB.on('framenavigated', failOnNavigation);
		const url = pageB.url();

		await projectEntry.click();

		// Observer: still sees the project overview page
		await expect(pageB.getByRole('heading', { name: 'Projekte' })).toBeVisible();
		expect(pageB.url()).toBe(url);

		// Admin: deletes user group
		await deleteUserGroup(page, userGroupName);

		// Listen until the end for any navigation event
		pageB.off('framenavigated', failOnNavigation);
	});

	test('Sensor Metadata', async ({ page }) => {
		// Login and navigate to settings
		const grog = await createAdminUser(TEST_TENANT);
		await signInWithUser(page, grog);
		await visitSettingsPage(page);

		// create project
		await visitSettingsSubPage(page, 'Projekte');
		const project = await createProject(page);

		const fixupProjectName = () =>
			page
				.getByText(/Project-[A-Z][a-z]{5}/)
				.evaluateAll((elements) => elements.forEach((e) => (e.textContent = 'Project')));

		// navigate to Sensor Metadata subpage
		await page.getByRole('cell', { name: project }).click();
		await page.getByRole('link', { name: 'Sensor-Meta-Daten' }).click();
		await fixupProjectName();
		const uploadButton = page.getByRole('button', { name: 'Meta-Daten hochladen' });
		await docsScreenshot('meta-data-upload-button', uploadButton);
		await page.waitForLoadState('load');
		await expect(uploadButton).toBeVisible();
		await expect(uploadButton).toBeEnabled();

		// upload CSV file
		await uploadButton.click();
		const fileInput = page.getByTestId('object-upload-file-input');
		const csvFilePath = path.resolve(__dirname, '../fixtures', 'sensormeta.csv');
		await fileInput.setInputFiles(csvFilePath);
		await docsScreenshot('meta-data-upload-menu', page);
		const metaDataUploadButton = page.getByRole('button', { name: 'Datei hochladen' });
		await docsScreenshot('meta-data-file-upload-button', metaDataUploadButton);
		await metaDataUploadButton.click();

		// expect success toast
		await expect(page.getByText('Datei erfolgreich hochgeladen')).toBeVisible();

		// download CSV file
		await docsScreenshot('meta-data-overview', page);
		const downloadButton = page.getByTestId('metadata-card_download-button');
		await expect(downloadButton).toBeVisible();
		await expect(downloadButton).toBeEnabled();
		await docsScreenshot('meta-data-download-button', downloadButton);
		const deleteButton = page.getByTestId('metadata-card_delete-button');
		await docsScreenshot('meta-data-delete-button', deleteButton);

		const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);

		const filename = download.suggestedFilename();
		expect(filename.endsWith('.csv')).toBeTruthy();

		// get downloaded file content
		const stream = await download.createReadStream();
		let downloadedFileContent = '';
		for await (const chunk of stream) {
			downloadedFileContent += chunk.toString('utf-8');
		}

		expect(downloadedFileContent.length).toBeGreaterThan(0);

		// replace uploaded file
		const replaceButton = page.getByRole('button', { name: 'Meta-Daten austauschen' });
		await expect(replaceButton).toBeVisible();
		await expect(replaceButton).toBeEnabled();
		await replaceButton.hover();
		await docsScreenshot('meta-data-replace-button', replaceButton);
		await replaceButton.click();
		const csvFilePath2 = path.resolve(__dirname, '../fixtures', 'sensormeta2.csv');
		await page.getByTestId('object-upload-file-input').setInputFiles(csvFilePath2);
		await docsScreenshot('meta-data-replace-submit-page', page);
		const submitButton = page.getByRole('button', { name: 'Datei ersetzen' });
		await expect(submitButton).toBeEnabled();
		await docsScreenshot('meta-data-replace-submit-button', submitButton);
		await submitButton.click();

		// expect success toast
		await expect(page.getByText('Datei erfolgreich hochgeladen')).toBeVisible();

		// delete uploaded file
		await page.getByTestId('metadata-card_delete-button').click();
		await page.getByRole('button', { name: 'Meta-Daten löschen' }).click();
	});
});

test('User management', async ({ page, context }) => {
	const userGrog = await createAdminUser(TEST_TENANT);
	await signInWithUser(page, userGrog);
	await visitSettingsPage(page);

	await docsScreenshot(
		'govhub-useradmin',
		page.getByTestId('settings-sidebar').getByText('Benutzerverwaltung')
	);

	// click on 'Benutzerverwaltung' and wait for new tab
	const [newPage] = await Promise.all([
		context.waitForEvent('page'),
		visitSettingsSubPage(page, 'Benutzerverwaltung')
	]);
	await newPage.waitForLoadState('load');

	// expect redirect to correct Keycloak subpage
	await expect(newPage).toHaveURL(KEYCLOAK + 'admin/udh/console/#/udh/users/add-user');
	await expect(newPage.getByRole('heading', { name: 'Benutzer erstellen' })).toBeVisible();

	await newPage.getByText('Grog Strongjaw').evaluate((e) => (e.textContent = 'Max Mustermann'));
	await docsScreenshot('keycloak-user-create', newPage);

	await newPage.close();
});

test.fixme('Tenant settings', async ({ page }) => {
	const userGrog = await createAdminUser(TEST_TENANT);
	await signInWithUser(page, userGrog);
	await visitSettingsPage(page);
	await visitSettingsSubPage(page, 'Mandanteneinstellungen');

	const saveBtn = page.getByRole('button', { name: 'Speichern' });
	// Assert that the name text is prefilled
	const nameInput = page.getByTestId('tenant-name-input');
	await expect(nameInput).toHaveValue('Gütersloh');

	// Assert that a valid name input is saved
	await nameInput.clear();
	await nameInput.fill('Gütersloh');
	await saveBtn.click();
	await expect(nameInput).toHaveValue('Gütersloh');

	// Assert that the logo input is saved
	const imageUrl =
		'https://www.guetersloh.de/de-wAssets/img/stadtansichten-und-akteure/weblication/wThumbnails/Adenauerplatz_046-070a0a52-6e4e3d30@2000w.jpg';
	const logoInputComponent = page.getByTestId('tenant-logo-input');
	const logoInput = logoInputComponent.locator('input');
	await logoInput.clear();
	await logoInput.fill(imageUrl);
	await saveBtn.click();
	await expect(logoInput).toHaveValue(imageUrl);

	// Assert that the image input is saved
	const imageInputComponent = page.getByTestId('tenant-image-input');
	const imageInput = imageInputComponent.locator('input');
	await imageInput.clear();
	await imageInput.fill(imageUrl);
	await saveBtn.click();
	await expect(imageInput).toHaveValue(imageUrl);

	// Assert that the citizen hub image input is saved
	const citImageUrl =
		'https://www.guetersloh.de/de-wAssets/img/aktuelles/bilder-pm-2019/Luftbild.png';
	const citImageInputComponent = page.getByTestId('citizen-hub-image-input');
	const citImageInput = citImageInputComponent.locator('input');
	await citImageInput.clear();
	await citImageInput.fill(citImageUrl);
	await saveBtn.click();
	await expect(citImageInput).toHaveValue(citImageUrl);

	// Assert that the primary color input is saved
	const colorInputComponent = page.getByTestId('color-primary-input');
	const colorInput = colorInputComponent.locator('input');
	await colorInput.clear();
	await colorInput.fill('293785');
	await saveBtn.click();
	await expect(colorInput).toHaveValue('293785');

	// Assert that the primary color input is saved
	const uchColorInputComponent = page.getByTestId('uch-color-primary-input');
	const uchColorInput = uchColorInputComponent.locator('input');
	await uchColorInput.clear();
	await uchColorInput.fill('293785');
	await saveBtn.click();
	await expect(uchColorInput).toHaveValue('293785');

	// Assert that the coordinate input is saved
	const coordsInput = page.getByTestId('tenant-coords-input');
	await coordsInput.clear();
	await coordsInput.fill('13:37');
	await saveBtn.click();
	await expect(coordsInput).toHaveValue('13:37');
});

test('screenshots', async ({ browser }) => {
	const postfix = getRandomString(6);
	const tenantName = TENANT_MGR.with(postfix);
	const tenantDisplayName = `Knuffingen ${postfix}`;
	await withSetupClient(async (client) => {
		await client.put(`${RESOURCE_API}tenants/${tenantName}`);
		await client.put(
			`${RESOURCE_API}tenants/${tenantName}/attributes/tenant-name`,
			tenantDisplayName
		);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/groups/abteilung-umwelt`);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/groups/abteilung-verkehr`);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/groups/abteilung-statistik`);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/projects/bodenfeuchte`);
		await client.put(
			`${RESOURCE_API}tenants/${tenantName}/projects/bodenfeuchte/permissions/admin`,
			{
				scopes: ['project:admin'],
				principals: [
					{
						type: 'group',
						tenant: tenantName,
						group: 'abteilung-umwelt'
					}
				]
			}
		);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/projects/feinstaub`);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/projects/feinstaub/permissions/read`, {
			scopes: ['project:read'],
			principals: [
				{
					type: 'group',
					tenant: tenantName,
					group: 'abteilung-umwelt'
				}
			]
		});
		await client.put(`${RESOURCE_API}tenants/${tenantName}/projects/feinstaub/permissions/admin`, {
			scopes: ['project:admin'],
			principals: [
				{
					type: 'group',
					tenant: tenantName,
					group: 'abteilung-verkehr'
				}
			]
		});
		await client.put(`${RESOURCE_API}tenants/${tenantName}/projects/bevoelkerungsdaten`);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/viz-group/verkehrsfluss`);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/viz-group/umweltbelastungen`);
		await client.put(
			`${RESOURCE_API}tenants/${tenantName}/viz-group/umweltbelastungen/permissions/admin`,
			{
				scopes: ['viz-group:admin'],
				principals: [
					{
						type: 'group',
						tenant: tenantName,
						group: 'abteilung-umwelt'
					}
				]
			}
		);
		await client.put(
			`${RESOURCE_API}tenants/${tenantName}/projects/feinstaub/permissions/viz-group-read`,
			{
				scopes: ['project:read'],
				principals: [
					{
						type: 'vizGroup',
						tenant: tenantName,
						vizGroup: 'umweltbelastungen'
					}
				]
			}
		);
		await client.put(`${RESOURCE_API}tenants/${tenantName}/viz-group/bevoelkerungsstatistik`);
		await client.put(
			`${RESOURCE_API}tenants/${tenantName}/viz-group/bevoelkerungsstatistik/permissions/read`,
			{
				scopes: ['viz-group:read'],
				principals: [
					{
						type: 'group',
						tenant: tenantName,
						group: 'abteilung-umwelt'
					}
				]
			}
		);
		await client.put(
			`${RESOURCE_API}tenants/${tenantName}/viz-group/bevoelkerungsstatistik/permissions/admin`,
			{
				scopes: ['viz-group:admin'],
				principals: [
					{
						type: 'group',
						tenant: tenantName,
						group: 'abteilung-statistik'
					}
				]
			}
		);
	});
	const fixupTenantName = async (page: Page) => {
		await page
			.getByText(tenantName)
			.evaluateAll((elements) => elements.forEach((el) => (el.textContent = 'knuffingen')));
		await page
			.getByText(tenantDisplayName)
			.evaluateAll((elements) => elements.forEach((el) => (el.textContent = 'Knuffingen')));
	};
	const normalUserPage = await createAndLoginRandomTestUser(browser, [
		`${tenantName}/abteilung-umwelt`
	]);
	await fixupUghAvatarImage(normalUserPage, 'u');
	await normalUserPage.getByRole('link', { name: 'Einstellungen' }).click();
	await normalUserPage.getByRole('link', { name: 'Projekte' }).click();
	await expect(normalUserPage.getByRole('heading', { name: 'Projekte' })).toBeVisible();
	await fixupTenantName(normalUserPage);
	await docsScreenshot('ugh-settings-projects-normal', normalUserPage);
	await normalUserPage.getByRole('link', { name: 'Dashboardgruppen' }).click();
	await expect(normalUserPage.getByRole('heading', { name: 'Dashboardgruppen' })).toBeVisible();
	await fixupTenantName(normalUserPage);
	await docsScreenshot('ugh-settings-viz-groups-normal', normalUserPage);
	await normalUserPage.close();

	const adminUserPage = await createAndLoginRandomTestUser(browser, [`${tenantName}/admin`]);
	await adminUserPage.getByRole('link', { name: 'Einstellungen' }).click();
	await adminUserPage.getByRole('link', { name: 'Mandanteneinstellungen' }).click();
	await adminUserPage.getByTestId('tenant-name-input').fill('Knuffingen');
	// unfocus the tenant name
	await adminUserPage.getByRole('heading', { name: 'Mandanteneinstellungen' }).click();
	await fixupTenantName(adminUserPage);
	await fixupUghAvatarImage(adminUserPage, 'a');
	await docsScreenshot('ugh-settings-tenant', adminUserPage);
	await adminUserPage.getByRole('link', { name: 'Projekte' }).click();
	await expect(adminUserPage.getByRole('heading', { name: 'Projekte' })).toBeVisible();
	await fixupTenantName(adminUserPage);
	await fixupUghAvatarImage(adminUserPage, 'a');
	await docsScreenshot('ugh-settings-projects-admin', adminUserPage);
	await adminUserPage.getByRole('button', { name: 'Neues Projekt' }).click();
	await docsScreenshot(
		'ugh-settings-create-project',
		adminUserPage.getByRole('button', { name: 'Projekt erstellen' }),
		{ crop: false }
	);
	await adminUserPage.getByRole('button', { name: 'Abbrechen' }).click();
	await adminUserPage.getByText('feinstaub').click();
	await expect(adminUserPage.getByRole('heading', { name: 'Feinstaub' })).toBeVisible();
	await fixupUghAvatarImage(adminUserPage, 'a');
	const commonShareScreenshots = async (component: string) => {
		await fixupTenantName(adminUserPage);
		await docsScreenshot(
			`ugh-settings-${component}-user-groups`,
			adminUserPage.getByRole('button', { name: 'Freigeben' }),
			{ crop: false }
		);
		const unlinkButton = adminUserPage.getByTestId('settings-delete-badge').first();
		await unlinkButton.hover();
		await fixupTenantName(adminUserPage);
		await docsScreenshot(`ugh-settings-${component}-remove-share`, unlinkButton, {
			crop: false,
			highlightRadius: 20
		});
		await adminUserPage.getByRole('button', { name: 'Mitarbeiter' }).hover();
		await docsScreenshot(
			`ugh-settings-${component}-change-permission`,
			adminUserPage.getByRole('button', { name: 'Mitarbeiter' }),
			{ crop: false }
		);
	};
	await commonShareScreenshots('project');
	await adminUserPage
		.getByTestId('settings-tabs-tab-bar')
		.getByText('Freigabe Dashboardgruppen')
		.click();
	// wait for navigation to finish
	await expect(adminUserPage.getByText('umweltbelastungen')).toBeVisible();
	await fixupTenantName(adminUserPage);
	await fixupUghAvatarImage(adminUserPage, 'a');
	await docsScreenshot(
		'ugh-settings-project-viz-groups',
		adminUserPage.getByRole('button', { name: 'Freigeben' }),
		{ crop: false }
	);
	const unlinkButton = adminUserPage.getByTestId('settings-delete-badge').first();
	await unlinkButton.hover();
	await fixupTenantName(adminUserPage);
	await docsScreenshot(`ugh-settings-project-remove-share-to-viz-group`, unlinkButton, {
		crop: false,
		highlightRadius: 20
	});
	await adminUserPage
		.getByTestId('settings-sidebar')
		.getByRole('link', { name: 'Dashboardgruppen' })
		.click();
	await expect(adminUserPage.getByRole('heading', { name: 'Dashboardgruppen' })).toBeVisible();
	await fixupTenantName(adminUserPage);
	await fixupUghAvatarImage(adminUserPage, 'a');
	await docsScreenshot('ugh-settings-viz-groups-admin', adminUserPage);
	await adminUserPage.getByRole('button', { name: 'Neue Dashboardgruppe' }).click();
	await docsScreenshot(
		'ugh-settings-create-viz-group',
		adminUserPage.getByRole('button', { name: 'Dashboardgruppe erstellen' }),
		{ crop: false }
	);
	await adminUserPage.getByRole('button', { name: 'Abbrechen' }).click();
	await adminUserPage.getByText('bevoelkerungsstatistik').click();
	await expect(
		adminUserPage.getByRole('heading', { name: 'Bevoelkerungsstatistik' })
	).toBeVisible();
	await commonShareScreenshots('viz-group');
	await adminUserPage
		.getByTestId('settings-sidebar')
		.getByRole('link', { name: 'Benutzergruppen' })
		.click();
	await expect(adminUserPage.getByRole('heading', { name: 'Benutzergruppen' })).toBeVisible();
	await fixupTenantName(adminUserPage);
	await fixupUghAvatarImage(adminUserPage, 'a');
	await docsScreenshot('ugh-settings-groups-admin', adminUserPage);
	await adminUserPage.getByRole('button', { name: 'Neue Benutzergruppe' }).click();
	await docsScreenshot(
		'ugh-settings-create-group',
		adminUserPage.getByRole('button', { name: 'Gruppe erstellen' }),
		{ crop: false }
	);
	await adminUserPage.getByRole('button', { name: 'Abbrechen' }).click();
	await adminUserPage.getByRole('cell', { name: 'abteilung-umwelt' }).click();
	await expect(adminUserPage.getByRole('heading', { name: 'Abteilung-Umwelt' })).toBeVisible();
	await fixupTenantName(adminUserPage);
	await fixupUghAvatarImage(adminUserPage, 'a');
	await adminUserPage.getByRole('link', { name: 'Teilen' }).click();
	await adminUserPage.waitForLoadState('load');
	await adminUserPage.getByTestId('user-group-public-share-button').click();
	await docsScreenshot(
		'ugh-settings-share-group-public',
		adminUserPage.getByTestId('user-group-public-share-button'),
		{ crop: false }
	);
	await adminUserPage.getByRole('button', { name: 'Abbrechen' }).click();
	await adminUserPage.getByRole('link', { name: 'Zurück zur Übersicht' }).click();
	await fixupTenantName(adminUserPage);
	await fixupUghAvatarImage(adminUserPage, 'a');
	const toKeycloakLink = adminUserPage
		.getByRole('row', { name: 'abteilung-umwelt' })
		.getByRole('link');
	await toKeycloakLink.hover();
	await docsScreenshot('ugh-settings-group-to-keycloak', toKeycloakLink, {
		crop: false,
		highlightRadius: 20
	});
	const [keycloakGroupPage] = await Promise.all([
		adminUserPage.context().waitForEvent('page'),
		toKeycloakLink.click()
	]);
	const membersTab = keycloakGroupPage.getByTestId('members');
	await expect(membersTab).toBeVisible();
	await fixupTenantName(keycloakGroupPage);
	await docsScreenshot('keycloak-group-admin-to-members', membersTab, { crop: false });
	await membersTab.click();

	const fixupUsers = async () => {
		await expect(keycloakGroupPage.getByText(/scanlan-[a-z]+@example\.com/).first()).toBeVisible();
		await keycloakGroupPage
			.getByText(/scanlan-[a-z]+@example\.com/)
			.evaluateAll((elements) =>
				elements.forEach((el) => (el.textContent = 'scanlan@example.com'))
			);
	};

	await fixupUsers();
	await keycloakGroupPage.getByRole('button', { name: 'Kebab toggle' }).click();
	await docsScreenshot(
		'keycloak-group-admin-remove-user',
		keycloakGroupPage.getByRole('menuitem', { name: 'Verlassen' }),
		{ crop: false }
	);
	const addMembersButton = keycloakGroupPage.getByTestId('addMember');
	await docsScreenshot('keycloak-group-admin-add-members', addMembersButton);
	await addMembersButton.click();
	await fixupUsers();
	await docsScreenshot(
		'keycloak-group-admin-confirm-members',
		keycloakGroupPage.getByTestId('add'),
		{ crop: false }
	);
	await keycloakGroupPage.close();
	await adminUserPage.close();
});

test('profile settings', async ({ browser }) => {
	const page = await createAndLoginRandomTestUser(browser, ['guetersloh']);
	await page.goto(`${UGH}settings/profile`);
	const [kcPage] = await Promise.all([
		page.waitForEvent('popup'),
		page.getByRole('link', { name: 'Kontoeinstellungen' }).click()
	]);

	await kcPage
		.locator('#username')
		.evaluate((e) => ((e as HTMLInputElement).value = 'scanlan@example.com'));
	await kcPage
		.locator('#email')
		.evaluate((e) => ((e as HTMLInputElement).value = 'scanlan@example.com'));
	await docsScreenshot('keycloak-profile-page', kcPage);
	await kcPage.getByRole('button', { name: 'Kontosicherheit' }).click();
	await kcPage.getByRole('link', { name: 'Anmeldung' }).click();
	await docsScreenshot(
		'keycloak-profile-update-password',
		kcPage.getByRole('button', { name: 'Aktualisieren' }),
		{ crop: false }
	);
	await docsScreenshot(
		'keycloak-profile-add-2fa',
		kcPage.getByRole('button', { name: 'Authenticator-Anwendung einrichten' }),
		{ crop: false }
	);
	await kcPage.close();

	const [discoursePage] = await Promise.all([
		page.waitForEvent('popup'),
		page.getByRole('link', { name: 'Profilbild' }).click()
	]);
	const editAvatar = discoursePage.locator('#edit-avatar');
	const fixUsername = () =>
		discoursePage.getByText(/scanlan-[a-z]{6}/).evaluateAll((elements) =>
			elements.forEach((e) => {
				e.textContent = e.textContent.replace(/scanlan-[a-z]{6}/, 'scanlan');
			})
		);
	const fixAvatar = () =>
		discoursePage
			.locator('img.avatar')
			.evaluateAll(
				(elements, imgUrl) => elements.forEach((e) => ((e as HTMLImageElement).src = imgUrl)),
				discourseProfilePictureUrl('s')
			);
	await expect(editAvatar).toBeVisible();
	await fixUsername();
	await fixAvatar();
	await docsScreenshot('discourse-update-profile-picture', editAvatar, { crop: false });
	await editAvatar.click();
	await fixUsername();
	await fixAvatar();
	await docsScreenshot('discourse-update-profile-picture-choices', discoursePage);
	await discoursePage.close();
	await page.close();
});

test.describe('VizGroups', () => {
	test('GeoJson', async ({ page }) => {
		const postfix = getRandomString(6);
		const tenantName = TENANT_MGR.with(postfix);
		const tenantDisplayName = `Knuffingen ${postfix}`;
		await withSetupClient(async (client) => {
			await client.put(`${RESOURCE_API}tenants/${tenantName}`);
			await client.put(
				`${RESOURCE_API}tenants/${tenantName}/attributes/tenant-name`,
				tenantDisplayName
			);
		});
		const grog = await createKeycloakUser(grogStrongjaw(), [`${tenantName}/admin`]);

		// Navigate to VizGroups
		await signInWithUser(page, grog);
		await page.getByRole('link', { name: 'Einstellungen' }).click();
		await page.getByRole('link', { name: 'Dashboardgruppen' }).click();

		// Create a new VizGroup
		await page.getByRole('button', { name: 'Neue Dashboardgruppe' }).click();
		const vizGroup = 'umwelt';
		await page.getByRole('textbox', { name: 'Unbenannte Dashboardgruppe' }).fill(vizGroup);
		await page.getByRole('button', { name: 'Dashboardgruppe erstellen' }).click();
		await page.getByRole('cell', { name: vizGroup }).click();

		// Create new Query
		const query = `beispiel`;
		const sql = `SELECT wkt((1.,2.)) AS geometry, 'abc' AS str, 123 AS num`;
		await page.getByRole('link', { name: 'GeoJSON' }).click();
		await page.getByRole('button', { name: 'Neue Query erstellen' }).click();
		await page.getByRole('textbox', { name: 'Name der Query' }).fill(query);
		await expect(page.getByRole('textbox', { name: 'SQL Query' })).toHaveValue('');
		const supersetIframe = page.locator('iframe[title="Superset SQL Lab"]').contentFrame();
		const sqlLabEditor = supersetIframe.getByRole('textbox', { name: 'Cursor at row' });
		await sqlLabEditor.clear();
		await sqlLabEditor.fill(sql);
		await supersetIframe.getByRole('button', { name: 'Veröffentlichen' }).click();
		await expect(page.getByRole('textbox', { name: 'SQL Query' })).toHaveValue(sql);
		await page.getByRole('button', { name: 'Speichern' }).click();

		await expect(page.getByRole('row', { name: query })).toContainText(sql);
		await expect(page.getByText('Query erfolgreich erstellt.')).not.toBeVisible();
		const editQueryBadge = page.getByTestId('query-edit-badge');
		await editQueryBadge.hover();
		await fixupTenantName(page, postfix);
		await fixupUghAvatarImage(page, 'g');
		await docsScreenshot('ugh-geojson-list-edit', editQueryBadge, {
			crop: false,
			highlightRadius: 15
		});
		const showResultBadge = page.getByTestId('query-result-badge');

		await showResultBadge.hover();
		await docsScreenshot('ugh-geojson-list-show-result', showResultBadge, {
			highlightRadius: 15,
			cropZoom: 1.5
		});

		// Edit Query
		const updatedSql = 'SELECT * FROM sensor_messages;';
		await editQueryBadge.click();
		await expect(page.getByRole('textbox', { name: 'Name der Query' })).toHaveValue(query);
		await expect(page.getByRole('textbox', { name: 'SQL Query' })).toHaveValue(sql);
		const sqlLabEditor2 = supersetIframe.getByRole('textbox', { name: 'Cursor at row' });
		await sqlLabEditor2.clear();
		await sqlLabEditor2.fill(updatedSql);
		await supersetIframe.getByRole('button', { name: 'Veröffentlichen' }).click();
		await expect(page.getByRole('textbox', { name: 'SQL Query' })).toHaveValue(updatedSql);
		await page.getByRole('button', { name: 'Speichern' }).click();

		await expect(page.getByRole('row', { name: query })).toContainText(updatedSql);

		// Delete Query
		await page.getByTestId('settings-delete-badge').getByRole('button').click();
		await page.getByRole('button', { name: 'Entfernen' }).click();

		await expect(page.getByRole('row', { name: query })).not.toBeAttached();
	});

	test('Cross Tenant dashboards', async ({ browser, page }) => {
		let tenantA: string;
		let tenantB: string;
		let grog: TestUser;
		let scanlan: TestUser;

		// Create TenantA
		await inSeparateBrowser(browser, async () => {
			const postfix = 'b' + getRandomString(5);
			tenantA = TENANT_MGR.with(postfix);
			await withSetupClient(async (client) => {
				await client.put(`${RESOURCE_API}tenants/${tenantA}`);
			});
			grog = await createKeycloakUser(grogStrongjaw(), [`${tenantA}/admin`]);
		});

		// Create UserA for TenantA
		await signInWithUser(page, grog);
		await page.waitForResponse(`${SUPERSET}api/v1/dashboard/_info?q=(keys:!(permissions))`); // allow hidden iframe to log in to Superset

		// UserA: Creates a new group
		await visitSettingsPage(page);
		await visitSettingsSubPage(page, 'Benutzergruppen');
		const group = await createUserGroup(page);

		// UserA: Creates a new dashboard group
		await visitSettingsSubPage(page, 'Dashboardgruppen');
		const vizGroup = await createDashboardGroup(page);

		// UserA: Creates a new dashboard for `vizGroup`
		await visitDashboardPage(page);
		const dashboard = await createDashboard(page, vizGroup);
		const iframe = page.frameLocator(SUPERSET_IFRAME_LOCATOR);

		expect(await iframe.getByLabel('Dashboard Titel').inputValue()).toContain(
			dashboard.slice(0, 15)
		);
		await page.getByRole('link', { name: 'Zurück zur Übersicht' }).click();

		const filterButton = page.getByRole('button', { name: 'Dashboard-Gruppen' });
		await expect(filterButton).toBeVisible();

		await filterButton.click();
		const checkbox = page.getByRole('checkbox', { name: vizGroup });
		await expect(checkbox).toBeVisible();

		// Create user for TenantB who is member of `group`
		await inSeparateBrowser(browser, async () => {
			const postfix = 'a' + getRandomString(5);
			tenantB = TENANT_MGR.with(postfix);
			await withSetupClient(async (client) => {
				await client.put(`${RESOURCE_API}tenants/${tenantB}`);
			});
			scanlan = await createKeycloakUser(scanlanShorthalt(), [
				`${tenantB}/admin`,
				`${tenantA}/${group}`
			]);
		});

		const pageB = await browser.newPage();
		await signInWithUser(pageB, scanlan);
		await pageB.waitForResponse(`${SUPERSET}api/v1/dashboard/_info?q=(keys:!(permissions))`); // allow hidden iframe to log in to Superset

		// UserB: Sees no dashboards yet
		await visitDashboardPage(pageB);
		let filterButtonB = pageB.getByRole('button', { name: 'Dashboard-Gruppen' });

		await expect(filterButtonB).not.toBeVisible();
		await expect(filterButtonB).not.toBeAttached();

		// UserA: Shares `vizGroup` with `group` as Observer
		await visitSettingsPage(page);
		await visitSettingsSubPage(page, 'Dashboardgruppen');
		await page.getByRole('cell', { name: vizGroup }).click();
		await page.getByRole('button', { name: 'Freigeben' }).click();

		const modal = page.getByRole('dialog');
		const select = modal.getByRole('combobox');

		const optionToSelect = await page.locator('option', { hasText: group }).textContent();
		await select.selectOption(optionToSelect);
		await modal.getByText('Betrachter').click();
		await modal.getByRole('button', { name: 'Freigeben' }).click();
		await expect(page.getByRole('cell', { name: group })).toBeVisible();

		// UserB: Sees dashboard of `vizGroup` but can't create new dashboards
		await pageB.reload();
		await pageB.waitForLoadState('load');

		filterButtonB = pageB.getByRole('button', { name: 'Dashboard-Gruppen' });
		await expect(filterButtonB).toBeVisible();

		await filterButtonB.click();
		await expect(pageB.getByRole('checkbox', { name: vizGroup })).toBeVisible();

		// UserA: Shares `vizGroup` with `group` as Admin
		await page.getByRole('button', { name: 'Betrachter' }).click();
		const changePermModal = page.getByRole('dialog');
		await changePermModal.getByText('Mitarbeiter').click();
		await changePermModal.getByRole('button', { name: 'Speichern' }).click();

		// UserB: Can create new dashboards for `vizGroup`
		await pageB.reload();
		await pageB.waitForLoadState('load');

		const dashboardB = await createDashboard(pageB, vizGroup);

		const iframeB = pageB.frameLocator(SUPERSET_IFRAME_LOCATOR);
		expect(await iframeB.getByLabel('Dashboard Titel').inputValue()).toContain(
			dashboardB.slice(0, 15)
		);
	});
});

test('User Groups', async ({ browser, page }) => {
	let tenantA: string;
	let grog: TestUser;
	let scanlan: TestUser;
	await Promise.all([
		inSeparateBrowser(browser, async () => {
			const postfix = getRandomString(6);
			tenantA = TENANT_MGR.with(postfix);
			await withSetupClient(async (client) => {
				await client.put(`${RESOURCE_API}tenants/${tenantA}`);
			});
			grog = await createKeycloakUser(grogStrongjaw(), [`${tenantA}/admin`]);
		}),
		inSeparateBrowser(browser, async () => {
			const postfix = getRandomString(6);
			const tenantNameB = TENANT_MGR.with(postfix);
			await withSetupClient(async (client) => {
				await client.put(`${RESOURCE_API}tenants/${tenantNameB}`);
			});
			scanlan = await createKeycloakUser(scanlanShorthalt(), [`${tenantNameB}/admin`]);
		})
	]);

	await signInWithUser(page, grog);
	const pageB = await browser.newPage();
	await signInWithUser(pageB, scanlan);

	// A: create new user group
	await page.getByRole('link', { name: 'Einstellungen' }).click();
	const groupName = await createUserGroup(page);

	// B: expect other tenants cannot see unshared user group
	await pageB.getByRole('link', { name: 'Einstellungen' }).click();
	await pageB.getByRole('link', { name: 'Benutzergruppen' }).click();
	await expect(pageB.getByRole('heading', { name: 'Benutzergruppen' })).toBeVisible();
	await expect(pageB.getByRole('row', { name: groupName })).not.toBeAttached();

	// A: link user group to other user group
	await page.getByRole('cell', { name: groupName }).click();
	await page.getByRole('link', { name: 'Freigabe Benutzergruppen' }).click();
	await page.waitForLoadState('load');
	await page.getByRole('button', { name: 'Freigeben' }).click();
	const shareDialog = page.getByRole('dialog');
	await shareDialog.getByRole('combobox').selectOption({ label: `read (${tenantA})` });
	await shareDialog.getByText('Mitarbeiter').click();
	await shareDialog.getByRole('button', { name: 'Freigeben' }).click();
	await expect(page.getByRole('row', { name: 'read' })).toBeVisible();

	// A: change permission of shared user group
	await page.getByRole('button', { name: 'Mitarbeiter' }).click();
	const updatePermDialog = page.getByRole('dialog');
	await updatePermDialog.getByText('Betrachter').click();
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.getByRole('button', { name: 'Betrachter' })).toBeVisible();

	// A: unlink user group
	await page.getByTestId('settings-delete-badge').click();
	await page.getByRole('button', { name: 'Entfernen' }).click();
	await page.waitForLoadState('load');
	await expect(page.getByRole('row', { name: 'read' })).not.toBeAttached();

	// A: share user group with all tenants
	await page.getByRole('link', { name: 'Teilen' }).click();
	await page.waitForLoadState('load');
	await page.getByTestId('user-group-public-share-button').click();
	await page.getByRole('dialog').getByRole('button', { name: 'Teilen' }).click();
	await expect(page.getByText('Benutzergruppe erfolgreich geteilt')).toBeVisible();

	// B: expect other tenants can see shared user group
	await pageB.reload();
	await expect(pageB.getByRole('heading', { name: 'Benutzergruppen' })).toBeVisible();
	await expect(pageB.getByRole('row', { name: groupName })).toBeVisible();

	// A: unshare user group (all tenants)
	await page.getByRole('button', { name: 'Teilen aufheben' }).click();
	await expect(
		page.getByText(`Benutzergruppe ist nur für den Mandanten "${tenantA}" sichtbar`)
	).toBeVisible();

	// B: expect other tenants can no longer see user group
	await pageB.reload();
	await expect(pageB.getByRole('heading', { name: 'Benutzergruppen' })).toBeVisible();
	await expect(pageB.getByRole('row', { name: groupName })).not.toBeAttached();

	// A: delete user group
	await deleteUserGroup(page, groupName);
});
