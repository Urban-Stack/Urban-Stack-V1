import { expect, test } from 'playwright/test';
import { CITIZENHUB, CKAN, DOCS, JUPYTERHUB, RESOURCE_API, UGH } from '../helper/urls';
import { createKeycloakUser, signIn, withSetupClient } from '../helper/keycloak';
import { grogStrongjaw, scanlanShorthalt, TestUser } from '../helper/test-user';
import { signInDiscourse } from '../helper/discourse';
import { inSeparateBrowser, RandomTenantManager } from '../helper/util';
import { docsScreenshot } from '../helper/screenshot';

const TENANT_MGR = new RandomTenantManager();

const ckanOrgSidebarUrl = `${CKAN}user/sso?state=organization.read:guetersloh`;
const ckanOrgUrl = `${CKAN}organization/guetersloh`;
const citizenhubUrl = `${CITIZENHUB}guetersloh`;

const trimTrailingSlash = (url: string) => (url.endsWith('/') ? url.slice(0, -1) : url);

const sidebarMenuEntries: string[][] = [
	['Startseite', '/'],
	['Dashboards', '/dashboards'],
	['Community', '/community'],
	['chat', '/chat?path=%2Fchat%2Fdirect-messages'],
	['City Tools'],
	['Datei-Manager', '/filemanager'],
	['Jupyterhub', trimTrailingSlash(JUPYTERHUB)],
	['CKAN', ckanOrgSidebarUrl],
	['AI Demo', '/aidemo'],
	['CitizenHub', citizenhubUrl],
	['Helpdesk', '/helpdesk'],
	['Dokumentation', trimTrailingSlash(DOCS)],
	['Einstellungen', '/settings/profile']
];

const userMenuEntries: string[][] = [['Einstellungen', '/settings/profile'], ['Abmelden']];

test.describe('base layout', () => {
	let scanlan: TestUser;

	test.beforeAll('Setup - Create Community user', async ({ browser }) => {
		await inSeparateBrowser(browser, async (page) => {
			// Create Keycloak user
			scanlan = await createKeycloakUser(scanlanShorthalt());

			// Create Discourse user for Scanlan
			await signInDiscourse(page, scanlan);
		});
	});

	test('Correctly show Base Layout', async ({ page }) => {
		// visit home page
		await page.goto(UGH);
		await signIn(page, scanlan);

		// expect sidebar collapsed
		const sidebar = page.getByTestId('app-sidebar');
		const sidebarEntries = sidebar.getByRole('listitem');

		for (const [name, url] of sidebarMenuEntries) {
			if (url) {
				const entry = sidebarEntries.getByRole('link', { name });
				await expect(entry).toHaveAttribute('href', url);
				await expect(entry.getByText(name)).not.toBeVisible();
			}
		}

		// expand sidebar
		await page.getByTestId('app-sidebar-toggle').click();
		await docsScreenshot('govhub-jupyterhub', page.getByRole('link', { name: 'JupyterHub' }));
		await docsScreenshot('govhub-ckan', page.getByRole('link', { name: 'CKAN' }));
		await docsScreenshot('govhub-discourse', page.getByRole('link', { name: 'Community' }));
		await docsScreenshot('govhub-chat', page.getByRole('link', { name: 'Chat' }));
		await docsScreenshot(
			'govhub-dashboards',
			page.getByTestId('app-sidebar_main').getByRole('link', { name: 'Dashboards' })
		);
		await docsScreenshot(
			'govhub-file-manager',
			page.getByTestId('app-sidebar_main').getByRole('link', { name: 'Datei-Manager' })
		);
		await expect(sidebarEntries).toHaveCount(sidebarMenuEntries.length);

		for (const [name, url] of sidebarMenuEntries) {
			if (url) {
				const entry = sidebarEntries.getByRole('link', { name });
				await expect(entry).toHaveAttribute('href', url);
				await expect(entry.getByText(name)).toBeVisible();
			}
		}

		// expect avatar in navbar
		await page.waitForFunction(
			() => {
				const img = document.querySelector<HTMLImageElement>('img[data-testid="udp-avatar_image"]');
				return img?.complete && img.naturalWidth > 0;
			},
			null,
			{ timeout: 30000 }
		);

		// open user menu
		const navbar = page.getByTestId('app-navbar');
		await navbar.getByTestId('udp-avatar').click();
		const userMenuDropdown = navbar.getByTestId('flowbite-dropdown');

		await expect(userMenuDropdown).toContainText(scanlan.email);

		await expect(userMenuDropdown.getByRole('link')).toHaveCount(userMenuEntries.length);

		for (const [name, url] of userMenuEntries) {
			const entry = userMenuDropdown.getByRole('link', { name });
			if (url) {
				await expect(entry).toHaveAttribute('href', url);
			}
			await expect(entry.getByText(name)).toBeVisible();
		}
	});

	test('Navigates to Jupyterhub page', async ({ context, page }) => {
		// visit home page
		await page.goto(UGH);
		await signIn(page, scanlan);

		const sidebar = page.getByTestId('app-sidebar');
		const sidebarEntries = sidebar.getByRole('listitem');
		await expect(sidebarEntries).toHaveCount(sidebarMenuEntries.length);

		// visit jupyterhub page
		const pagePromise = context.waitForEvent('page');
		const jupyterhub_entry = sidebarEntries.getByRole('link', { name: 'Jupyterhub' });

		await jupyterhub_entry.click();
		const newPage = await pagePromise;
		await newPage.waitForLoadState();

		expect(newPage.url().startsWith(JUPYTERHUB)).toBeTruthy();

		await newPage.close();
	});

	test('Navigates to CKAN page', async ({ context, page }) => {
		// visit home page
		await page.goto(UGH);
		await signIn(page, scanlan);

		const sidebar = page.getByTestId('app-sidebar');
		const sidebarEntries = sidebar.getByRole('listitem');
		await expect(sidebarEntries).toHaveCount(sidebarMenuEntries.length);

		// visit ckan page
		const pagePromise = context.waitForEvent('page');
		const ckan_entry = sidebarEntries.getByRole('link', { name: 'CKAN' });
		await ckan_entry.click();
		const newPage = await pagePromise;
		await newPage.waitForLoadState();

		expect(newPage.url()).toEqual(ckanOrgUrl);
	});

	test('Navigates to Citizenhub page', async ({ browser, context, page }) => {
		let tenant: string;
		let grog: TestUser;
		await inSeparateBrowser(browser, async () => {
			tenant = TENANT_MGR.get();
			await withSetupClient(async (client) => {
				await client.put(`${RESOURCE_API}tenants/${tenant}`);
			});
			grog = await createKeycloakUser(grogStrongjaw(), [tenant]);
		});
		// visit home page
		await page.goto(UGH);
		await signIn(page, grog);

		const sidebar = page.getByTestId('app-sidebar');
		const sidebarEntries = sidebar.getByRole('listitem');
		await expect(sidebarEntries).toHaveCount(sidebarMenuEntries.length);

		// visit citizenhub page
		const pagePromise = context.waitForEvent('page');
		const uch_entry = sidebarEntries.getByRole('link', { name: 'CitizenHub' });
		await uch_entry.click();
		const newPage = await pagePromise;
		await newPage.waitForLoadState();

		expect(newPage.url()).toEqual(`${CITIZENHUB}${tenant}`);
	});
});
