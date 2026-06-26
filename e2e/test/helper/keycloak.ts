import { Page } from 'playwright';
import { KEYCLOAK, RESOURCE_API } from './urls';
import { expect } from 'playwright/test';
import { TestUser, TestUserCreation } from './test-user';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { getRandomString } from './util';

export const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD;
export const DATA_HUB_ADMIN_USERNAME = `data-hub-admin@example.com`;
export const DATA_HUB_ADMIN_PASSWORD = process.env.DATA_HUB_ADMIN_PASSWORD;

export class User {
	constructor(
		public username: string,
		public id: string | null = null
	) {}

	async token(): Promise<string> {
		const result = await axios.postForm<{ access_token: string }>(
			`${KEYCLOAK}realms/udh/protocol/openid-connect/token`,
			{
				grant_type: 'password',
				password: DATA_HUB_ADMIN_PASSWORD,
				username: this.username
			},
			{
				auth: {
					username: 'automated-tests-client',
					password: DATA_HUB_ADMIN_PASSWORD
				}
			}
		);
		return result.data.access_token;
	}
}

/** groups are in the form `tenant/group`
 * */
export async function createTestUser(user: TestUserCreation, groups: string[]) {
	const adminHeader = { Authorization: `Bearer ${await ADMIN_USER.token()}` };
	const email = user.email;
	const response = await axios.post(
		`${KEYCLOAK}admin/realms/udh/users`,
		{
			email: email,
			firstName: user.firstName ?? 'Test',
			lastName: user.lastName ?? 'User',
			groups: groups,
			enabled: true,
			attributes: { showName: 'true' }
		},
		{
			maxRedirects: 0,
			headers: adminHeader
		}
	);
	const userId = (response.headers['location'] as string).split('/').at(-1);
	await axios.put(
		`${KEYCLOAK}admin/realms/udh/users/${userId}/reset-password`,
		{
			temporary: false,
			type: 'password',
			value: user.password
		},
		{ headers: adminHeader }
	);
	return new User(email, userId);
}

export async function createRandomTestUser(
	groups: string[],
	password = DATA_HUB_ADMIN_PASSWORD
): Promise<User> {
	const email = `${getRandomString(6)}@example.com`;
	return createTestUser(
		{
			email,
			password
		},
		groups
	);
}

export const ADMIN_USER = new User(DATA_HUB_ADMIN_USERNAME);

export interface Tenant {
	name: string;
	groups: string[];
}

export async function createKeycloakUser(
	user: TestUserCreation,
	groups: string[] = ['guetersloh']
): Promise<TestUser> {
	const created = await createTestUser(user, groups);
	return {
		...user,
		id: created.id
	};
}

export async function createKeycloakUserInKeycloakUI(
	page: Page,
	user: TestUserCreation,
	joinTenants: Tenant[] = [{ name: 'guetersloh', groups: [] }],
	realmAdmin: boolean = false
): Promise<TestUser> {
	const { email, password, firstName = 'Test', lastName = 'User' } = user;

	await signInAdminKeycloak(page);
	await page.goto(`${KEYCLOAK}admin/master/console/`);
	await page.getByTestId('realmSelector').click();
	await page.getByRole('menuitem', { name: 'udh' }).click();
	await page.getByRole('link', { name: 'Users' }).click();
	await page.getByTestId('add-user').click();

	await page.getByTestId('email').click();
	await page.getByTestId('email').fill(email);
	await page.getByTestId('firstName').fill(firstName);
	await page.getByTestId('lastName').fill(lastName);

	// set email to be verified
	await page.locator('label').filter({ hasText: 'OnOff' }).locator('span').first().click();

	if (joinTenants.length > 0) {
		await page.getByTestId('join-groups-button').click();
		for (const tenant of joinTenants) {
			await page.getByPlaceholder('Search group').fill(tenant.name);
			await page.getByRole('button', { name: 'Search' }).click();
			await page.getByTestId(`${tenant.name}-check`).check({ force: true });
			await page.getByTestId(tenant.name).getByLabel('Select').click();
			for (const project of tenant.groups) {
				await page.getByTestId(`${project}-check`).check();
			}
			await page.getByRole('button', { name: 'Groups' }).click();
		}
		await page.getByTestId('join-button').click();
	}

	await page.getByTestId('user-creation-save').click();
	await page.getByTestId('global-alerts').getByRole('button').click();

	const id = await page.getByLabel('User ID').inputValue();

	await page.getByTestId('credentials').click();
	await page.getByTestId('no-credentials-empty-action').click();
	await page.getByTestId('passwordField').fill(password);
	await page.getByTestId('passwordConfirmationField').fill(password);
	// set password to not be temporary
	await page.getByLabel(`Set password for ${email}`).getByText('On', { exact: true }).click();
	await page.getByTestId('confirm').click();
	await page.getByTestId('confirm').click();
	await page.getByTestId('global-alerts').getByRole('button').click();

	if (realmAdmin) {
		await page.getByTestId('role-mapping-tab').click();
		await page.getByTestId('assignRole').click();
		await page.getByRole('button', { name: 'Filter by realm roles' }).click();
		await page.getByTestId('roles').click();
		await page.getByPlaceholder('Search by role name').fill('manage-realm');
		await page.getByTestId('rolesinput').getByRole('button', { name: 'Search' }).click();
		// there should only be one search result
		await page.getByRole('checkbox', { name: 'Select row' }).check();
		await page.getByTestId('assign').click();
		await page.getByTestId('global-alerts').getByRole('button').click();
	}

	return {
		...user,
		id
	};
}

export async function addUserToTenantGroup(page: Page, tenant: string, userId: string) {
	const adminHeader = { Authorization: `Bearer ${await ADMIN_USER.token()}` };
	const response = await axios.get<{ id: string; name: string }[]>(
		`${KEYCLOAK}admin/realms/udh/groups`,
		{
			headers: adminHeader,
			params: { search: tenant, exact: 'true' }
		}
	);
	const tenantGroupId = response.data.find((g) => g.name == tenant)?.id;
	expect(tenantGroupId).not.toBeNull();
	await axios.put<{ id: string; name: string }[]>(
		`${KEYCLOAK}admin/realms/udh/users/${userId}/groups/${tenantGroupId}`,
		{},
		{
			headers: adminHeader
		}
	);
}

export async function signIn(page: Page, user: TestUserCreation): Promise<void> {
	return await signInWith(page, user.email, user.password);
}

export async function signInWith(page: Page, username: string, password: string): Promise<void> {
	await page.locator('#username').fill(username);
	await page.locator('#password').fill(password);
	await page.locator('#kc-login').click();
}

export async function signInAdminKeycloak(page: Page): Promise<void> {
	await page.goto(`${KEYCLOAK}admin/master/console/`);
	await signInWith(page, 'admin', KEYCLOAK_ADMIN_PASSWORD);
	await expect(page.getByRole('heading', { name: 'master realm' })).toBeVisible();
}

export async function aquireTokenViaDeviceCode(
	page: Page,
	username: string,
	password: string,
	scope: string[],
	type: 'access_token' | 'id_token' = 'access_token'
): Promise<string> {
	const authInfo = (
		await axios.post<{
			interval: number;
			device_code: string;
			verification_uri_complete: string;
		}>(
			`${KEYCLOAK}realms/udh/protocol/openid-connect/auth/device`,
			{
				client_id: 'usercode',
				scope: ['openid'].concat(scope).join(' ')
			},
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}
		)
	).data;
	await page.goto(authInfo.verification_uri_complete);
	await signInWith(page, username, password);
	await page.getByRole('button', { name: /Yes|Ja/ }).click();

	for (;;) {
		const authResult = await axios.post<{ error: string; access_token: string; id_token: string }>(
			`${KEYCLOAK}realms/udh/protocol/openid-connect/token`,
			{
				client_id: 'usercode',
				device_code: authInfo.device_code,
				grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
			},
			{
				validateStatus: (_) => true,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}
		);
		if (authResult.status === 200) {
			// console.log(authResult.data);
			return authResult.data[type];
		} else {
			if (authResult.data.error === 'slow_down') {
				authInfo.interval += 5;
			} else if (authResult.data.error !== 'authorization_pending') {
				throw new Error(`login failed: ${JSON.stringify(authResult.data)}`);
			}
		}
		await page.waitForTimeout(authInfo.interval * 1000);
	}
}

export const createAdminClient: () => Promise<AxiosInstance> = async () => {
	return axios.create({
		headers: { Authorization: `Bearer ${await ADMIN_USER.token()}` }
	});
};

export async function getUserAttributes(userId: string): Promise<Record<string, string>> {
	const adminHeader = {
		Authorization: `Bearer ${await ADMIN_USER.token()}`,
		Accepts: 'application/json'
	};
	const result = await axios.get<Record<string, string>>(
		`${KEYCLOAK}admin/realms/udh/users/${userId}/unmanagedAttributes`,
		{ headers: adminHeader }
	);
	return result.data;
}

export async function updateUserAttributes(
	userId: string,
	attributes: Record<string, string | null>
): Promise<Record<string, string>> {
	const adminHeader = {
		Authorization: `Bearer ${await ADMIN_USER.token()}`,
		Accepts: 'application/json'
	};
	const result = await axios.put<Record<string, string>>(
		`${KEYCLOAK}realms/udh/data-hub/_update_user_attributes/${userId}`,
		attributes,
		{ headers: adminHeader }
	);
	return result.data;
}

export async function signOut(page: Page) {
	await page.goto(`${KEYCLOAK}realms/udh/account`);
	await page.getByTestId('options-toggle').click();
	await page.getByText(/Sign out|Abmelden/).click();
	await expect(page.getByRole('button', { name: /Sign in|Anmelden/ })).toBeVisible();
}

let setupClient: AxiosInstance;

export async function withSetupClient<T>(f: (client: AxiosInstance) => Promise<T>) {
	if (!setupClient) {
		setupClient = await createAdminClient();
		return await f(setupClient);
	}

	try {
		return await f(setupClient);
	} catch (e) {
		if (e instanceof AxiosError && e.status === 401) {
			setupClient = await createAdminClient();
			return await f(setupClient);
		} else throw e;
	}
}

export async function createResources(paths: string[]) {
	const created = new Set();

	for (const path of paths) {
		const elements = path.split('/');
		let url = RESOURCE_API.replace(/\/$/, '');
		while (elements.length > 0) {
			url += `/${elements.shift()}/${elements.shift()}`;
			const create = async () => await setupClient.put(url);

			if (!created.has(url)) {
				await withSetupClient(create);
				created.add(url);
			}
		}
	}
}
