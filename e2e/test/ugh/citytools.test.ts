import test, { expect, Locator, Page } from 'playwright/test';
import { createKeycloakUser, signIn } from '../helper/keycloak';
import { grogStrongjaw, scanlanShorthalt, TestUser } from '../helper/test-user';
import { UCH, UGH } from '../helper/urls';
import { getRandomString } from '../helper/util';
import { signOutFromUgh } from '../helper/ugh';
import { docsScreenshot } from '../helper/screenshot';
import path from 'path';

const timeout = 1500;
const CITY_TOOL_PICTURE =
	'https://www.masterportal.org/fileadmin/content/newsbeitraege/news_masterportal.jpg';
const SELECT_CATEGORIES = ['Apps & Tools', 'Office', 'Geoinformation'];
const NOT_SELECTED_CATEGORY = 'Fachverfahren';

const signInWithUser = async (page: Page, user: TestUser) => {
	await page.goto(UGH);
	await signIn(page, user);
	await expect(page.getByTestId('app-sidebar')).toBeVisible();
};

const ensureUninstalled = async (page: Page, citytool: string) => {
	const card = page.getByTestId('udp-citytool-card').filter({ hasText: citytool });
	await expect(card).toBeVisible();
	const isInstalled = await card.getByTestId('udp-citytool-card-remove').isVisible();
	if (isInstalled) {
		await card.getByTestId('udp-citytool-card-remove').click();
	}
	await expect(card.getByTestId('udp-citytool-card-install-button')).toBeVisible();
};

const ensureInstalled = async (page: Page, citytool: string) => {
	const card = page.getByTestId('udp-citytool-card').filter({ hasText: citytool });
	await expect(card).toBeVisible();
	const isInstalled = await card.getByTestId('udp-citytool-card-install-button').isVisible();
	if (isInstalled) {
		await card.getByTestId('udp-citytool-card-install-button').click();
	}
	await expect(card.getByTestId('udp-citytool-card-remove')).toBeVisible();
	return card;
};

const ensureLeadsToCitytool = async (page: Page, link: Locator, toBeVisible: string) => {
	const newPagePromise = page.context().waitForEvent('page');
	await link.getByTestId('udp-citytool-card-title').click();
	const newPage = await newPagePromise;
	await expect(async () => {
		await newPage.reload();
		await expect(newPage.locator(toBeVisible)).toBeVisible({ timeout: 5_000 });
	}).toPass({ intervals: [2_000] });
	await newPage.close();
};

const waitForUrlChange = async (page: Page, button: Locator) => {
	const prevUrl = page.url();
	await Promise.all([page.waitForURL((url) => url.toString() !== prevUrl), button.click()]);
};

const filterByCategory = async (page: Page, categories: string[]) => {
	const catButton = page.getByRole('button', { name: 'Kategorie' });
	await catButton.click();
	const catMenu = page.getByRole('menu', { name: 'Kategorie' });
	for (const cat of categories) {
		await catMenu.getByLabel(cat).check();
	}
	await waitForUrlChange(page, catMenu.getByRole('button', { name: 'Anwenden' }));
	await catButton.click();
};

test.describe('Citytools', () => {
	test('Create, edit & delete shared app', async ({ page: ugh }) => {
		test.slow();
		const grog = await createKeycloakUser(grogStrongjaw(), ['guetersloh', `guetersloh/admin`]);
		await signInWithUser(ugh, grog);

		await ugh.getByRole('link', { name: 'City Tools', exact: true }).click();
		const displayName = `Hamster Tracker (${getRandomString(6)})`;

		// expect shared app not present
		const cards = ugh.getByTestId('udp-citytool-card');
		const sharedCard = cards.filter({ hasText: displayName });
		await expect(sharedCard).toHaveCount(0);

		// create new shared app
		await ugh.getByRole('button', { name: 'Neues City Tool erstellen' }).click();
		await ugh.getByRole('textbox', { name: 'Name*' }).fill(displayName);
		await ugh.getByRole('textbox', { name: 'Beschreibung*' }).fill('App to track your hamsters.');
		await ugh.getByRole('textbox', { name: 'Kontakt*' }).fill(grog.email);
		await ugh.getByRole('textbox', { name: 'City Tool Bild' }).fill(CITY_TOOL_PICTURE);
		const categories = ugh.getByRole('group', { name: 'Kategorien' });
		for (const category of SELECT_CATEGORIES) {
			await categories.getByLabel(category).check();
		}
		await ugh.getByRole('textbox', { name: 'Image Registry*' }).fill('ghcr.io');
		await ugh
			.getByRole('textbox', { name: 'Image Repository*' })
			.fill('ol-teuto/external-citytool-container');
		await ugh
			.getByRole('textbox', { name: 'Image Digest*' })
			.fill('sha256:fe40cf592b6460c7892846df4e6989cd7dc0106830e1467bce458940d2403275');
		await ugh.getByRole('button', { name: 'Speichern' }).click();

		// expect successful creation
		await expect(ugh.getByText('City Tool erfolgreich erstellt')).toBeVisible();
		const cardBefore = ugh.getByTestId('udp-citytool-card').filter({ hasText: displayName });
		await expect(
			cardBefore.getByRole('link', {
				name: displayName,
				exact: true
			})
		).toBeVisible();
		await expect(cardBefore).not.toContainText('edited');

		// expect more details modal
		const detailsButton = cardBefore.getByRole('button', { name: 'Details anzeigen' });
		const dialog = ugh.getByRole('dialog');

		await expect(dialog).not.toBeAttached();
		await detailsButton.click();
		await expect(dialog).toBeVisible();

		await ugh.waitForFunction(
			() => {
				const img = document.querySelector<HTMLImageElement>('img[alt="City Tool picture"]');
				return img?.complete && img.naturalWidth > 0;
			},
			null,
			{ timeout: 30000 }
		);
		await expect(dialog).toContainText('App to track your hamsters.');
		await dialog.getByRole('button', { name: 'Close' }).click();

		// Filter by category
		const allCardsCount = await cards.count();

		await filterByCategory(ugh, [NOT_SELECTED_CATEGORY]);
		await expect(sharedCard).not.toBeVisible();
		const oneFilterCount = await cards.count();
		expect(allCardsCount).toBeGreaterThan(oneFilterCount);

		await filterByCategory(ugh, SELECT_CATEGORIES.slice(0, 1));
		await expect(sharedCard).toBeVisible();
		const moreFilterCount = await cards.count();
		expect(moreFilterCount).toBeLessThan(allCardsCount);
		expect(moreFilterCount).toBeGreaterThan(oneFilterCount);

		const catButton = ugh.getByRole('button', { name: 'Kategorie' });
		await catButton.click();
		await waitForUrlChange(ugh, ugh.getByRole('button', { name: 'Auswahl aufheben' }));
		const noFilterCount = await cards.count();
		expect(allCardsCount).toEqual(noFilterCount);

		// edit shared app
		await cardBefore.getByTestId('udp-citytool-card-edit').click();
		await ugh.getByRole('textbox', { name: 'Beschreibung*' }).fill('edited');
		await ugh.getByText('City Tool Bild entfernen').click();
		await ugh.getByRole('button', { name: 'Speichern' }).click();

		await expect(ugh.getByText('City Tool erfolgreich gespeicher')).toBeVisible();

		// no picture in details
		await expect(dialog).not.toBeAttached();
		await detailsButton.click();
		await expect(dialog).toBeVisible();

		await expect(dialog.getByRole('img')).not.toBeAttached();
		await expect(dialog).toContainText('edited');
		await dialog.getByRole('button', { name: 'Close' }).click();

		// expect container logs to be accessible
		const cardAfter = ugh.getByTestId('udp-citytool-card').filter({ hasText: displayName });
		await cardAfter.getByTestId('udp-citytool-card-state-badge').click();
		const modal = ugh.getByRole('dialog', { name: 'Container Logs' });
		await expect(modal.getByText('Log-Ausgabe:')).toBeVisible();
		const logOutput = modal.getByTestId('container-log-modal-log-output');
		await expect(logOutput).toBeVisible();
		const internalError = logOutput.getByText('internal_error');
		await expect(internalError).toHaveCount(0);
		await expect(
			internalError.waitFor({
				state: 'visible',
				timeout
			})
		).rejects.toThrow();

		// expect app to be visible in other tenant
		const scanlan = await createKeycloakUser(scanlanShorthalt(), ['detmold', `detmold/admin`]);
		await signOutFromUgh(ugh);
		await signInWithUser(ugh, scanlan);
		await ugh.getByRole('link', { name: 'City Tools', exact: true }).click();
		await expect(
			ugh.getByRole('link', {
				name: displayName,
				exact: true
			})
		).toBeVisible();

		// delete app
		await signOutFromUgh(ugh);
		await signInWithUser(ugh, grog);
		await ugh.getByRole('link', { name: 'City Tools', exact: true }).click();
		const cardToDelete = ugh.getByTestId('udp-citytool-card').filter({ hasText: displayName });
		await cardToDelete.getByTestId('udp-citytool-card-remove').click();
		await ugh.getByRole('button', { name: 'App löschen' }).click();

		await expect(ugh.getByText('Shared app wurde entfernt.')).toBeVisible();
		await expect(
			ugh.getByTestId('udp-citytool-card').filter({ hasText: displayName })
		).not.toBeAttached();
	});

	test('Installs and uninstalls citytool', async ({ browser, page: ugh }) => {
		const grog = await createKeycloakUser(grogStrongjaw(), ['guetersloh', `guetersloh/admin`]);
		await signInWithUser(ugh, grog);

		// ensure citytool Masterportal is uninstalled
		await ugh.getByRole('link', { name: 'City Tools', exact: true }).click();
		await ensureUninstalled(ugh, 'Masterportal');

		const uch = await browser.newPage();

		// check citytool Masterportal is not visible on UCH
		await uch.goto(UCH);
		await expect(uch.getByTestId('app-sidebar')).toBeVisible();
		await uch.getByTestId('app-sidebar').getByLabel('City Tools').click();
		const uchMasterportal = uch
			.getByTestId('udp-citytool-card')
			.filter({ hasText: 'Masterportal' });
		await expect(uchMasterportal).not.toBeAttached();

		// install citytool Masterportal
		const ughMasterportal = await ensureInstalled(ugh, 'Masterportal');

		// hide all shared apps, there is not really a good way to separate them
		await ugh
			.getByTestId('udp-citytool-card')
			.filter({ hasText: '(' })
			.evaluateAll((elements) => elements.forEach((e) => (e.style.display = 'none')));

		await docsScreenshot('ugh-citytool-masterportal', ughMasterportal, { highlight: false });
		const uploadButton = ugh.getByTestId('udp-citytool-card-upload');
		await docsScreenshot('ugh-citytool-upload-button', uploadButton, { cropZoom: 6 });
		await uploadButton.click();

		const masterportalFilePath = path.resolve(__dirname, '../citytools', 'masterportal.zip');
		await ugh.getByTestId('object-upload-file-input').setInputFiles(masterportalFilePath);
		await docsScreenshot(
			'ugh-citytool-masterportal-upload-confirm',
			ugh.getByText('Datei hochladen')
		);
		await ugh.getByText('Abbrechen').click();

		// Check that card on UGH leads to correct citytool
		await ensureLeadsToCitytool(ugh, ughMasterportal, '#masterportal-root');

		// check citytool Masterportal is visible on UCH
		await uch.reload({ timeout: 10_000 });
		await expect(uchMasterportal).toBeVisible();

		// check that card on UCH leads to correct citytool
		await ensureLeadsToCitytool(uch, uchMasterportal, '#masterportal-root');

		// uninstall citytool Masterportal
		await ensureUninstalled(ugh, 'Masterportal');

		// check citytool Masterportal is not visible on UCH
		await uch.reload({ timeout: 10_000 });
		await expect(uchMasterportal).not.toBeAttached();
	});

	test('Installs and uninstalls Dedicated App', async ({ page: ugh }) => {
		const grog = await createKeycloakUser(grogStrongjaw(), ['guetersloh', `guetersloh/admin`]);
		await signInWithUser(ugh, grog);
		await ugh.getByRole('link', { name: 'City Tools', exact: true }).click();

		// ensure Rei3 is uninstalled before test
		await ensureUninstalled(ugh, 'Rei3');

		// install Rei3
		const rei3Card = await ensureInstalled(ugh, 'Rei3');

		// expect container logs to be accessible
		await rei3Card.getByTestId('udp-citytool-card-state-badge').click();
		const modal = ugh.getByRole('dialog', { name: 'Container Logs' });
		await expect(modal.getByText('Log-Ausgabe:')).toBeVisible();
		const logOutput = modal.getByTestId('container-log-modal-log-output');
		await expect(logOutput).toBeVisible();
		const internalError = logOutput.getByText('internal_error');
		await expect(internalError).toHaveCount(0);
		await expect(
			internalError.waitFor({
				state: 'visible',
				timeout
			})
		).rejects.toThrow();

		// close modal
		await modal.getByRole('button', { name: 'Schließen' }).click();

		// uninstall Rei3 to restore clean state
		await ensureUninstalled(ugh, 'Rei3');
	});
});

test.describe('Permissions', () => {
	test(`Read-only user should not see admin UI elements`, async ({ page }) => {
		const scanlanAdmin = await createKeycloakUser(scanlanShorthalt(), [
			'guetersloh',
			'guetersloh/admin'
		]);
		const grogRead = await createKeycloakUser(grogStrongjaw(), ['guetersloh', `guetersloh/read`]);

		// create shared app
		await signInWithUser(page, scanlanAdmin);
		const displayName = `Permission App (${getRandomString(6)})`;
		await page.getByRole('link', { name: 'City Tools', exact: true }).click();
		await page.getByRole('button', { name: 'Neues City Tool erstellen' }).click();
		await page.getByRole('textbox', { name: 'Name*' }).fill(displayName);
		await page
			.getByRole('textbox', { name: 'Beschreibung*' })
			.fill('App to validate correct permissions');
		await page.getByRole('textbox', { name: 'Kontakt*' }).fill(scanlanAdmin.email);
		await page.getByRole('textbox', { name: 'Image Registry*' }).fill('ghcr.io');
		await page
			.getByRole('textbox', { name: 'Image Repository*' })
			.fill('ol-teuto/external-citytool-container');
		await page
			.getByRole('textbox', { name: 'Image Digest*' })
			.fill('sha256:fe40cf592b6460c7892846df4e6989cd7dc0106830e1467bce458940d2403275');
		await page.getByRole('button', { name: 'Speichern' }).click();
		// reset static apps
		await ensureInstalled(page, 'Masterportal');
		await ensureInstalled(page, 'Rei3');

		await signOutFromUgh(page);

		// signin with read user
		await signInWithUser(page, grogRead);
		await page.getByRole('link', { name: 'City Tools', exact: true }).click();

		// expect create button is hidden
		const createBtn = page.getByRole('button', { name: /Neues City Tool erstellen/ });
		await expect(createBtn).toHaveCount(0);
		await expect(
			createBtn.waitFor({
				state: 'visible',
				timeout
			})
		).rejects.toThrow();

		// expect delete button to be hidden
		const deleteSharedAppBtn = page
			.getByTestId('udp-citytool-card')
			.filter({ hasText: displayName })
			.getByTestId('udp-citytool-card-remove-button');
		await expect(deleteSharedAppBtn).toHaveCount(0);
		await expect(
			deleteSharedAppBtn.waitFor({
				state: 'visible',
				timeout
			})
		).rejects.toThrow();

		const deleteCityToolBtn = page
			.getByTestId('udp-citytool-card')
			.filter({ hasText: 'Masterportal' })
			.getByTestId('udp-citytool-card-remove-button');
		await expect(deleteCityToolBtn).toHaveCount(0);
		await expect(
			deleteCityToolBtn.waitFor({
				state: 'visible',
				timeout
			})
		).rejects.toThrow();

		// expect edit button to be hidden
		const editBtn = page
			.getByTestId('udp-citytool-card')
			.filter({ hasText: displayName })
			.getByTestId('udp-citytool-card-edit-button');
		await expect(editBtn).toHaveCount(0);
		await expect(
			editBtn.waitFor({
				state: 'visible',
				timeout
			})
		).rejects.toThrow();

		// expect status button to be disabled
		const statusBadge = page
			.getByTestId('udp-citytool-card')
			.filter({ hasText: displayName })
			.getByTestId('udp-citytool-card-state-badge');
		await expect(statusBadge).toBeVisible();
		await expect(statusBadge).not.toHaveRole('button', { timeout });

		// expect Rei3 remove button to be hidden
		const rei3RemoveBtn = page
			.getByTestId('udp-citytool-card')
			.filter({ hasText: 'Rei3' })
			.getByTestId('udp-citytool-card-remove');
		await expect(rei3RemoveBtn).toHaveCount(0);
		await expect(
			rei3RemoveBtn.waitFor({
				state: 'visible',
				timeout
			})
		).rejects.toThrow();

		// expect Rei3 status badge to not be a button
		const rei3StatusBadge = page
			.getByTestId('udp-citytool-card')
			.filter({ hasText: 'Rei3' })
			.getByTestId('udp-citytool-card-state-badge');
		await expect(rei3StatusBadge).toBeVisible();
		await expect(rei3StatusBadge).not.toHaveRole('button', { timeout });

		// cleanup: restore Rei3 to uninstalled state
		await signOutFromUgh(page);
		await signInWithUser(page, scanlanAdmin);
		await page.getByRole('link', { name: 'City Tools', exact: true }).click();
		await ensureUninstalled(page, 'Rei3');
	});
});
