import axios, { Axios } from 'axios';
import { Browser, Page } from 'playwright';
import test, { expect, Locator } from 'playwright/test';
import { KEYCLOAK } from './urls';
import { deleteTenant } from './graphql';

export const { AUTOPROVISIONING_CLIENT_SECRET } = process.env;

export function getRandomString(len: number): string {
	return String.fromCharCode(
		...Array(len)
			.fill(0)
			.map(() => 97 + Math.floor(Math.random() * 26))
	);
}

export async function inSeparateBrowser(browser: Browser, f: (p: Page) => any) {
	const p = await browser.newPage();
	let close = true;
	try {
		return await f(p);
	} catch (e) {
		if (process.env.CI != '1') close = false;
		throw e;
	} finally {
		if (close) await p.close();
	}
}

export function clickUntilGone(element: Locator) {
	return expect(async () => {
		await element.click();
		await expect(element).not.toBeVisible();
	}).toPass();
}

function tenantNameWith(postfix: string): string {
	return `knuffingen-${postfix}`;
}

function randomTenantName(): string {
	return tenantNameWith(getRandomString(6));
}

export function fetchInBrowser(page: Page, url: string, resultType: 'json' | 'status') {
	return page.evaluate(
		async ([x, resultType]) => {
			const response = await window.fetch(x);
			switch (resultType) {
				case 'json':
					return response.json();
				case 'status':
					return response.status;
			}
		},
		[url, resultType]
	);
}

export async function getAuthenticatedAutoprovisioningClient() {
	return new Axios({
		headers: {
			Authorization: `Bearer ${
				(
					await axios.post<{ access_token: string }>(
						`${KEYCLOAK}realms/udh/protocol/openid-connect/token`,
						{
							grant_type: 'client_credentials',
							client_id: 'auto-provisioning',
							client_secret: AUTOPROVISIONING_CLIENT_SECRET
						},
						{
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded'
							}
						}
					)
				).data.access_token
			}`
		}
	});
}

export class RandomTenantManager {
	tenants: string[] = [];

	constructor() {
		test.afterAll(async () => {
			await this.teardown();
		});
	}

	get(): string {
		const name = randomTenantName();
		this.tenants.push(name);
		return name;
	}

	with(postfix: string): string {
		const name = tenantNameWith(postfix);
		this.tenants.push(name);
		return name;
	}

	async teardown() {
		for (const tenant of this.tenants) {
			await deleteTenant(tenant);
		}
	}
}

export async function hasLegalLinks(page: Page) {
	const impressum = page.getByRole('link', { name: 'Impressum', exact: true });
	await expect(impressum).toBeVisible();
	await expect(impressum).toHaveAttribute('href', 'https://urbanstack.de/impressum');

	const datenschutz = page.getByRole('link', { name: 'Datenschutz', exact: true });
	await expect(datenschutz).toBeVisible();
	await expect(datenschutz).toHaveAttribute('href', 'https://urbanstack.de/datenschutz');
}
