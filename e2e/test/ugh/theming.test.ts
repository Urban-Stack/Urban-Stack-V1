import { expect, Page, test } from 'playwright/test';
import { RESOURCE_API, UGH } from '../helper/urls';
import {
	addUserToTenantGroup,
	createKeycloakUser,
	createResources,
	signIn,
	withSetupClient
} from '../helper/keycloak';
import { grogStrongjaw } from '../helper/test-user';
import { AxiosInstance } from 'axios';
import { RandomTenantManager } from '../helper/util';

const TENANT_MGR = new RandomTenantManager();

const testTheme: Map<string, string> = new Map([
	['color-primary', 'cc0a53'],
	['uch-color-primary', 'cc0a53']
]);

const testThemeStyle =
	'--color-primary-50: 337, 91%, 97%; --color-primary-100: 337, 91%, 92%; --color-primary-200: 337, 91%, 82%; --color-primary-300: 337, 91%, 72%; --color-primary-400: 337, 91%, 62%; --color-primary-500: 337, 91%, 52%; --color-primary-600: 337, 91%, 42%; --color-primary-700: 337, 91%, 32%; --color-primary-800: 337, 91%, 22%; --color-primary-900: 337, 91%, 12%; --color-primary-950: 337, 91%, 7%;';

const defaultThemeStyle =
	'--color-primary-50: 231, 53%, 99%; --color-primary-100: 231, 53%, 94%; --color-primary-200: 231, 53%, 84%; --color-primary-300: 231, 53%, 74%; --color-primary-400: 231, 53%, 64%; --color-primary-500: 231, 53%, 54%; --color-primary-600: 231, 53%, 44%; --color-primary-700: 231, 53%, 34%; --color-primary-800: 231, 53%, 24%; --color-primary-900: 231, 53%, 14%; --color-primary-950: 231, 53%, 9%;';

const getDynamicTheme = async (page: Page): Promise<string> => {
	const styleString = await page.waitForFunction(() => {
		const html = document.querySelector('html');
		return html.getAttribute('style');
	});

	return await styleString.jsonValue();
};

const setTheme = async (client: AxiosInstance, theme: Map<string, string>, testTenant: string) => {
	for (const [attributeName, value] of theme.entries()) {
		await client.put(
			`${RESOURCE_API}tenants/${testTenant}/attributes/${attributeName}`,
			`${value}`
		);
	}
};

const expectThemeToContainColors = async (page: Page, themeStyle: string) => {
	const theme = await getDynamicTheme(page);

	expect(theme).toContain(themeStyle);
};

test('Gütersloh Theme exists by default', async ({ page }) => {
	// Create user
	const grog = await createKeycloakUser(grogStrongjaw());

	await page.goto(UGH);
	await signIn(page, grog);

	// Expect default theme for new user after page loaded
	await page.waitForLoadState('load');
	await expectThemeToContainColors(page, defaultThemeStyle);
});

test('Add theme for freshly created tenant', async ({ page }) => {
	const testTenant = TENANT_MGR.get();

	// Create user & sign out
	const grog = await createKeycloakUser(grogStrongjaw(), []);

	// Create Tenant & set theme
	await createResources([`tenants/${testTenant}`]);
	await withSetupClient((adminClient) => setTheme(adminClient, testTheme, testTenant));

	// Add grog to the new tenant group
	await addUserToTenantGroup(page, testTenant, grog.id);

	// Expect new theme after page loaded
	await page.goto(UGH);
	await signIn(page, grog);
	await page.waitForLoadState('load');
	await expectThemeToContainColors(page, testThemeStyle);
});
