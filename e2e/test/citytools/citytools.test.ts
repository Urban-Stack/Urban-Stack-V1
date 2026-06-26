import test, { expect } from 'playwright/test';
import { inSeparateBrowser, RandomTenantManager } from '../helper/util';
import { checkedGraphqlRequest, graphql, makeGraphqlRequest } from '../helper/graphql';
import { API, CITYTOOLS } from '../helper/urls';
import { bucketDatahubAdminClient } from '../helper/bucket';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import {
	aquireTokenViaDeviceCode,
	DATA_HUB_ADMIN_PASSWORD,
	DATA_HUB_ADMIN_USERNAME
} from '../helper/keycloak';
import axios from 'axios';

const TENANT_MGR = new RandomTenantManager();

test(
	'resource-api',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await expect(
			checkedGraphqlRequest(
				graphql`
					mutation ($tenant: String!) {
						createTenant(tenant: $tenant) {
							createCitytool(citytool: "masterportal", path: "test") {
								stars
								path
							}
						}
					}
				`,
				{ tenant }
			)
		).resolves.toEqual({
			errors: [],
			data: {
				createTenant: {
					createCitytool: {
						path: 'test'
					}
				}
			},
			dataPresent: true
		});

		await expect(
			checkedGraphqlRequest(
				graphql`
					query gettools {
						citytoolInfo(citytool: "masterportal") {
							citytool
							info {
								description
								name
							}
							installs {
								count
							}
						}
					}
				`,
				{}
			)
		).resolves.toEqual({
			errors: [],
			data: {
				citytoolInfo: {
					citytool: 'masterportal',
					info: {
						description: 'Das Masterportal',
						name: 'Masterportal'
					},
					installs: {
						count: expect.any(Number)
					}
				}
			},
			dataPresent: true
		});

		await checkedGraphqlRequest(
			graphql`
				mutation ($tenant: String!) {
					tenant(tenant: $tenant) {
						citytool(citytool: "masterportal") {
							updatePath(path: "test2")
						}
					}
				}
			`,
			{ tenant }
		);

		await expect(
			makeGraphqlRequest(
				graphql`
					mutation ($tenant: String!) {
						tenant(tenant: $tenant) {
							createCitytool(citytool: "internal-test-tool", path: "test2") {
								stars
								path
							}
						}
					}
				`,
				{ tenant }
			)
		).resolves.toEqual({
			errors: [
				{
					message: 'Exception while fetching data (/tenant/createCitytool) : conflict',
					path: ['tenant', 'createCitytool'],
					exception: {
						message: 'conflict',
						suppressed: []
					},
					locations: [
						{
							line: 4,
							column: 8
						}
					],
					errorType: 'DataFetchingException'
				}
			],
			dataPresent: true
		});

		await expect(
			checkedGraphqlRequest(
				graphql`
					mutation ($tenant: String!) {
						tenant(tenant: $tenant) {
							citytool(citytool: "masterportal") {
								updateStars(stars: 3)
								installs {
									averageStars
									count
								}
							}
						}
					}
				`,
				{ tenant }
			)
		).resolves.toEqual({
			errors: [],
			data: {
				tenant: {
					citytool: {
						updateStars: 3,
						installs: {
							averageStars: expect.any(Number),
							count: expect.any(Number)
						}
					}
				}
			},
			dataPresent: true
		});
	}
);

test(
	'resource-api citizenhub',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await checkedGraphqlRequest(
			graphql`
				mutation ($tenant: String!) {
					createTenant(tenant: $tenant) {
						m: createCitytool(citytool: "masterportal", path: "masterportal") {
							citytool
						}
						i: createCitytool(citytool: "internal-test-tool", path: "internal-test-tool") {
							citytool
						}
					}
				}
			`,
			{ tenant }
		);
		// citizenhub users can only see citytools meant for them
		await expect(
			checkedGraphqlRequest(
				graphql`
					query ($tenant: String!) {
						publicCitytools(tenant: $tenant) {
							displayName
							path
							indexPath
							pictureUri
							categories
						}
					}
				`,
				{ tenant },
				null
			)
		).resolves.toEqual({
			data: {
				publicCitytools: [
					{
						displayName: 'Masterportal',
						path: 'masterportal',
						indexPath: '/Basic/index.html',
						pictureUri:
							'https://www.masterportal.org/fileadmin/content/newsbeitraege/news_masterportal.jpg',
						categories: ['CITIZEN_SERVICES', 'GEO_INFORMATION']
					}
				]
			},
			dataPresent: true,
			errors: []
		});
	}
);

test('citytool override', async ({ browser }) => {
	const tenant = TENANT_MGR.get();
	const result = await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!) {
				createTenant(tenant: $tenant) {
					createCitytool(citytool: "masterportal", path: "masterportal") {
						citytool
						info {
							indexPath
							categories
						}
					}
				}
			}
		`,
		{ tenant }
	);
	const indexPath = result.data.createTenant.createCitytool.info.indexPath;
	expect(result.data.createTenant.createCitytool.info.categories).toEqual([
		'CITIZEN_SERVICES',
		'GEO_INFORMATION'
	]);
	const s3client = await bucketDatahubAdminClient(browser);
	await s3client.putObject({
		Bucket: `ct.${tenant}.masterportal`,
		Key: 'Basic/config.json',
		ContentType: 'application/json',
		ContentEncoding: 'utf-8',
		Body: await readFile(path.join(__dirname, 'masterportal-config.json'))
	});
	await s3client.putObject({
		Bucket: `ct.${tenant}.masterportal`,
		Key: 'Basic/resources/services.json',
		ContentType: 'application/json',
		ContentEncoding: 'utf-8',
		Body: await readFile(path.join(__dirname, 'masterportal-services.json'))
	});
	const masterportalUrl = `${CITYTOOLS}${tenant}/masterportal${indexPath}`;
	await inSeparateBrowser(browser, async (page) => {
		// the ingress controller might take a second to sync the config
		await expect(async () => {
			await page.goto(masterportalUrl);
			await expect(page.getByRole('link', { name: 'Masterportal Basic' })).toBeVisible({
				timeout: 5_000
			});
		}).toPass({ intervals: [0], timeout: 20_000 });
		await expect(page.title()).resolves.toEqual('Basic - Portal');
	});

	await s3client.putObject({
		Bucket: `ct.${tenant}.masterportal`,
		Key: 'Basic/index.html',
		ContentType: 'text/html',
		ContentEncoding: 'utf-8',
		Body: await readFile(path.join(__dirname, 'masterportal-index.html'))
	});
	await s3client.putObject({
		Bucket: `ct.${tenant}.masterportal`,
		Key: 'Basic/resources/newsFeedPortalAlerts.json',
		ContentType: 'application/json',
		ContentEncoding: 'utf-8',
		Body: await readFile(path.join(__dirname, 'masterportal-alerts.json'))
	});
	await inSeparateBrowser(browser, async (page) => {
		await page.goto(masterportalUrl);
		await expect(page.title()).resolves.toEqual('Masterportal von Knuffingen');
		await expect(
			page.getByText('Ich habe die volle Kontrolle über das Masterportal!')
		).toBeVisible();
	});
});

test('presign zip upload', async ({ browser }) => {
	const tenant = TENANT_MGR.get();
	const result = await checkedGraphqlRequest(
		graphql`
			mutation ($tenant: String!) {
				createTenant(tenant: $tenant) {
					createCitytool(citytool: "masterportal", path: "masterportal") {
						citytool
						info {
							indexPath
						}
					}
				}
			}
		`,
		{ tenant }
	);
	const indexPath = result.data.createTenant.createCitytool.info.indexPath;
	const masterportalUrl = `${CITYTOOLS}${tenant}/masterportal${indexPath}`;
	const token = await inSeparateBrowser(browser, (page) =>
		aquireTokenViaDeviceCode(
			page,
			DATA_HUB_ADMIN_USERNAME,
			DATA_HUB_ADMIN_PASSWORD,
			['buckets'],
			'id_token'
		)
	);
	const response = await axios.post<{ uploadUrl: string }>(
		`${API}api/v1/zipupload/presign/ct.${tenant}.masterportal`,
		{},
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	await axios.put(
		response.data.uploadUrl,
		await readFile(path.join(__dirname, 'masterportal.zip'))
	);
	await inSeparateBrowser(browser, async (page) => {
		await page.goto(masterportalUrl);
		await expect(page.title()).resolves.toEqual('Masterportal von Knuffingen');
		await expect(
			page.getByText('Ich habe die volle Kontrolle über das Masterportal!')
		).toBeVisible();
	});
});

test('/ redirects to urbanstack.de', async ({ page }) => {
	const redirected = page.waitForRequest(`https://urbanstack.de`);
	await page.goto(CITYTOOLS);
	await redirected;
});
