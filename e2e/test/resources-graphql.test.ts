import test, { expect } from 'playwright/test';
import { API, MAILHOG, RESOURCE_API } from './helper/urls';
import { getRandomString, RandomTenantManager } from './helper/util';
import { checkedGraphqlRequest, graphql, makeGraphqlRequest } from './helper/graphql';
import {
	createRandomTestUser,
	DATA_HUB_ADMIN_PASSWORD,
	DATA_HUB_ADMIN_USERNAME,
	signInWith,
	withSetupClient
} from './helper/keycloak';
import { docsScreenshot } from './helper/screenshot';
import { getMailhogClient } from './helper/mail';
import axios, { AxiosBasicCredentials } from 'axios';
import { bucketAdminClient } from './helper/bucket';

const TENANT_MGR = new RandomTenantManager();

test('graphiql', async ({ page }) => {
	await page.goto(`${RESOURCE_API}graphiql`);
	await signInWith(page, DATA_HUB_ADMIN_USERNAME, DATA_HUB_ADMIN_PASSWORD);
	await page.getByLabel('Show Documentation Explorer').click();
	await page.getByRole('link', { name: 'Query', exact: true }).click();
	await page.getByRole('link', { name: 'Attribute', exact: true }).click();
	await expect(page.getByRole('link', { name: 'value' })).toBeVisible();
	await page.locator('.CodeMirror-scroll').first().click();
	const queryEditor = page.getByRole('region', { name: 'Query Editor' }).getByRole('textbox');
	await queryEditor.fill(`{
		tenant(tenant:"guetersloh"){
		  attributes {
			key
		  }
		}
	  }`);
	await page.getByRole('button', { name: 'Execute query' }).click();
	await expect(page.getByText('"tenant-image"')).toBeVisible();

	await page.getByText('"guetersloh"').dblclick();
	await queryEditor.press('Backspace');
	await expect(page.getByText('uetersloh')).not.toBeVisible();
	await queryEditor.fill('meinmandant');
	for (const key of [
		'ArrowRight',
		'Enter',
		'ControlOrMeta+ArrowLeft',
		'ControlOrMeta+ArrowLeft',
		'ControlOrMeta+ArrowLeft',
		'ControlOrMeta+ArrowLeft',
		'Enter'
	])
		await queryEditor.press(key);
	await page.getByRole('region', { name: 'Variables' }).click();
	await docsScreenshot('graphiql', page);
});

test(
	'create all',
	{
		tag: '@browserless'
	},
	async () => {
		const tenantName = TENANT_MGR.get();
		await expect(
			makeGraphqlRequest(
				graphql`
					mutation create($tenant: String!) {
						createTenant(tenant: $tenant) {
							patchAttributes(attributes: [{ key: "test-attr", value: "test-value" }]) {
								key
								value
							}
							# this group is supposed to exist
							group(group: "admin") {
								patchAttributes(attributes: [{ key: "important", value: "true" }]) {
									key
									value
								}
							}
							group1: createGroup(group: "testgroup") {
								group
							}
							group2: createGroup(group: "another-testgroup") {
								group
							}
							createProject(project: "trainstation") {
								createSensorCredential(sensorCredential: "cred") {
									username
									password
								}
								createSensorSubscription(
									sensorSubscription: "sub"
									config: {
										format: "direct"
										password: "p"
										username: "u"
										topic: "test"
										uri: "nothing"
									}
								) {
									createPermission(
										permission: {
											name: "test"
											scopes: "sensor-subscription:view"
											tenantPrincipals: [{ tenant: $tenant }]
										}
									)
								}
							}
							createVizGroup(vizGroup: "sccon") {
								createDashboardWithTitle(title: "Hallo Welt") {
									dashboard
									slug
								}
								createPublishedQuery(
									publishedQuery: "sqlworld"
									config: { sql: "SELECT * FROM sensor_messages" }
								) {
									config {
										sql
									}
								}
							}
						}
					}
				`,
				{
					tenant: tenantName
				}
			)
		).resolves.toEqual({
			errors: [],
			data: {
				createTenant: {
					patchAttributes: [
						{
							key: 'test-attr',
							value: 'test-value'
						}
					],
					group: {
						patchAttributes: [
							{
								key: 'important',
								value: 'true'
							}
						]
					},
					group1: {
						group: 'testgroup'
					},
					group2: {
						group: 'another-testgroup'
					},
					createProject: {
						createSensorCredential: {
							username: expect.any(String),
							password: expect.any(String)
						},
						createSensorSubscription: {
							createPermission: 'test'
						}
					},
					createVizGroup: {
						createDashboardWithTitle: {
							dashboard: 'hallowelt',
							slug: `${tenantName}_sccon_hallowelt`
						},
						createPublishedQuery: {
							config: { sql: 'SELECT * FROM sensor_messages' }
						}
					}
				}
			},
			dataPresent: true
		});

		await expect(
			makeGraphqlRequest(
				graphql`
					fragment FullPermissions on Permission {
						name
						scopes
						tenantPrincipals {
							tenant
						}
						groupPrincipals {
							tenant
							group
						}
						projectPrincipals {
							tenant
							project
						}
						vizGroupPrincipals {
							tenant
							vizGroup
						}
						userPrincipals {
							userId
						}
						allowAllAuthenticatedUsers
					}

					query everything($tenant: String!) {
						tenant(tenant: $tenant) {
							scopes {
								all
								granted
							}
							tenant
							permissions {
								...FullPermissions
							}
							attributes {
								key
								value
							}
							vizGroups {
								vizGroup
								scopes {
									all
									granted
								}
								permissions {
									...FullPermissions
								}
								dashboards {
									dashboard
									scopes {
										all
										granted
									}
									permissions {
										...FullPermissions
									}
								}
								publishedQueries {
									publishedQuery
									scopes {
										all
										granted
									}
									permissions {
										...FullPermissions
									}
								}
							}
							projects {
								project
								scopes {
									all
									granted
								}
								permissions {
									...FullPermissions
								}
								sensorCredentials {
									sensorCredential
									username
								}
								sensorSubscriptions {
									config {
										uri
										topic
										format
										username
									}
								}
							}
							groups {
								group
								scopes {
									all
									granted
								}
								permissions {
									...FullPermissions
								}
							}
						}
					}
				`,
				{
					tenant: tenantName
				}
			)
		).resolves.toEqual({
			errors: [],
			data: {
				tenant: {
					scopes: {
						all: [
							'citytool:admin',
							'citytool:read',
							'citytool:view',
							'dashboard:admin',
							'dashboard:read',
							'dashboard:view',
							'dataset:admin',
							'dataset:read',
							'dataset:refresh',
							'dataset:view',
							'dedicated-app:admin',
							'dedicated-app:read',
							'dedicated-app:view',
							'group:admin',
							'group:read',
							'group:view',
							'project:admin',
							'project:bucket-read',
							'project:bucket-write',
							'project:clickhouse-read',
							'project:read',
							'project:sensor-metadata-read',
							'project:sensor-metadata-write',
							'project:view',
							'published-query:admin',
							'published-query:read',
							'published-query:view',
							'sensor-credential:admin',
							'sensor-credential:read',
							'sensor-credential:rotate',
							'sensor-credential:view',
							'sensor-subscription:admin',
							'sensor-subscription:read',
							'sensor-subscription:view',
							'shared-app:admin',
							'shared-app:read',
							'shared-app:view',
							'tenant:admin',
							'tenant:ckan-admin',
							'tenant:ckan-editor',
							'tenant:ckan-member',
							'tenant:discourse-member',
							'tenant:discourse-moderator',
							'tenant:read',
							'tenant:view',
							'viz-group:admin',
							'viz-group:read',
							'viz-group:view'
						],
						granted: [
							'citytool:admin',
							'citytool:read',
							'citytool:view',
							'dashboard:admin',
							'dashboard:read',
							'dashboard:view',
							'dataset:admin',
							'dataset:read',
							'dataset:refresh',
							'dataset:view',
							'dedicated-app:admin',
							'dedicated-app:read',
							'dedicated-app:view',
							'group:admin',
							'group:read',
							'group:view',
							'project:admin',
							'project:bucket-read',
							'project:bucket-write',
							'project:clickhouse-read',
							'project:read',
							'project:sensor-metadata-read',
							'project:sensor-metadata-write',
							'project:view',
							'published-query:admin',
							'published-query:read',
							'published-query:view',
							'sensor-credential:admin',
							'sensor-credential:read',
							'sensor-credential:rotate',
							'sensor-credential:view',
							'sensor-subscription:admin',
							'sensor-subscription:read',
							'sensor-subscription:view',
							'shared-app:admin',
							'shared-app:read',
							'shared-app:view',
							'tenant:admin',
							'tenant:ckan-admin',
							'tenant:ckan-editor',
							'tenant:ckan-member',
							'tenant:discourse-member',
							'tenant:discourse-moderator',
							'tenant:read',
							'tenant:view',
							'viz-group:admin',
							'viz-group:read',
							'viz-group:view'
						]
					},
					tenant: tenantName,
					permissions: [
						{
							name: 'admin',
							scopes: ['tenant:admin'],
							tenantPrincipals: [],
							groupPrincipals: [
								{
									tenant: tenantName,
									group: 'admin'
								}
							],
							projectPrincipals: [],
							vizGroupPrincipals: [],
							userPrincipals: [],
							allowAllAuthenticatedUsers: false
						},
						{
							name: 'ckan-editor',
							scopes: ['tenant:ckan-editor'],
							tenantPrincipals: [],
							groupPrincipals: [
								{
									tenant: tenantName,
									group: 'ckan-editor'
								}
							],
							projectPrincipals: [],
							vizGroupPrincipals: [],
							userPrincipals: [],
							allowAllAuthenticatedUsers: false
						},
						{
							name: 'members',
							scopes: [
								'citytool:view',
								'dedicated-app:view',
								'tenant:ckan-member',
								'tenant:discourse-member',
								'tenant:view'
							],
							tenantPrincipals: [
								{
									tenant: tenantName
								}
							],
							groupPrincipals: [],
							projectPrincipals: [],
							vizGroupPrincipals: [],
							userPrincipals: [],
							allowAllAuthenticatedUsers: false
						},
						{
							name: 'public',
							scopes: ['tenant:view'],
							tenantPrincipals: [],
							groupPrincipals: [],
							projectPrincipals: [],
							vizGroupPrincipals: [],
							userPrincipals: [],
							allowAllAuthenticatedUsers: true
						},
						{
							name: 'read',
							scopes: ['tenant:read'],
							tenantPrincipals: [],
							groupPrincipals: [
								{
									tenant: tenantName,
									group: 'read'
								}
							],
							projectPrincipals: [],
							vizGroupPrincipals: [],
							userPrincipals: [],
							allowAllAuthenticatedUsers: false
						}
					],
					attributes: [
						{
							key: 'test-attr',
							value: 'test-value'
						}
					],
					vizGroups: [
						{
							vizGroup: 'sccon',
							scopes: {
								all: [
									'dashboard:admin',
									'dashboard:read',
									'dashboard:view',
									'published-query:admin',
									'published-query:read',
									'published-query:view',
									'viz-group:admin',
									'viz-group:read',
									'viz-group:view'
								],
								granted: [
									'dashboard:admin',
									'dashboard:read',
									'dashboard:view',
									'published-query:admin',
									'published-query:read',
									'published-query:view',
									'viz-group:admin',
									'viz-group:read',
									'viz-group:view'
								]
							},
							permissions: [],
							dashboards: [
								{
									dashboard: 'hallowelt',
									scopes: {
										all: ['dashboard:admin', 'dashboard:read', 'dashboard:view'],
										granted: ['dashboard:admin', 'dashboard:read', 'dashboard:view']
									},
									permissions: []
								}
							],
							publishedQueries: [
								{
									publishedQuery: 'sqlworld',
									scopes: {
										all: ['published-query:admin', 'published-query:read', 'published-query:view'],
										granted: [
											'published-query:admin',
											'published-query:read',
											'published-query:view'
										]
									},
									permissions: []
								}
							]
						}
					],
					projects: [
						{
							project: 'trainstation',
							scopes: {
								all: [
									'dataset:admin',
									'dataset:read',
									'dataset:refresh',
									'dataset:view',
									'project:admin',
									'project:bucket-read',
									'project:bucket-write',
									'project:clickhouse-read',
									'project:read',
									'project:sensor-metadata-read',
									'project:sensor-metadata-write',
									'project:view',
									'sensor-credential:admin',
									'sensor-credential:read',
									'sensor-credential:rotate',
									'sensor-credential:view',
									'sensor-subscription:admin',
									'sensor-subscription:read',
									'sensor-subscription:view'
								],
								granted: [
									'dataset:admin',
									'dataset:read',
									'dataset:refresh',
									'dataset:view',
									'project:admin',
									'project:bucket-read',
									'project:bucket-write',
									'project:clickhouse-read',
									'project:read',
									'project:sensor-metadata-read',
									'project:sensor-metadata-write',
									'project:view',
									'sensor-credential:admin',
									'sensor-credential:read',
									'sensor-credential:rotate',
									'sensor-credential:view',
									'sensor-subscription:admin',
									'sensor-subscription:read',
									'sensor-subscription:view'
								]
							},
							permissions: [],
							sensorCredentials: [
								{
									sensorCredential: 'cred',
									username: expect.any(String)
								}
							],
							sensorSubscriptions: [
								{
									config: {
										uri: 'nothing',
										topic: 'test',
										format: 'direct',
										username: 'u'
									}
								}
							]
						}
					],
					groups: [
						{
							group: 'admin',
							scopes: {
								all: ['group:admin', 'group:read', 'group:view'],
								granted: ['group:admin', 'group:read', 'group:view']
							},
							permissions: []
						},
						{
							group: 'another-testgroup',
							scopes: {
								all: ['group:admin', 'group:read', 'group:view'],
								granted: ['group:admin', 'group:read', 'group:view']
							},
							permissions: []
						},
						{
							group: 'ckan-editor',
							scopes: {
								all: ['group:admin', 'group:read', 'group:view'],
								granted: ['group:admin', 'group:read', 'group:view']
							},
							permissions: []
						},
						{
							group: 'read',
							scopes: {
								all: ['group:admin', 'group:read', 'group:view'],
								granted: ['group:admin', 'group:read', 'group:view']
							},
							permissions: []
						},
						{
							group: 'testgroup',
							scopes: {
								all: ['group:admin', 'group:read', 'group:view'],
								granted: ['group:admin', 'group:read', 'group:view']
							},
							permissions: []
						}
					]
				}
			},
			dataPresent: true
		});
	}
);

test(
	'conflict',
	{
		tag: '@browserless'
	},
	async () => {
		const tenantName = TENANT_MGR.get();
		const createTenantMutation = graphql`
			mutation createTenant($tenant: String!) {
				createTenant(tenant: $tenant) {
					tenant
				}
			}
		`;
		await expect(
			makeGraphqlRequest(createTenantMutation, {
				tenant: tenantName
			})
		).resolves.toEqual({
			errors: [],
			data: {
				createTenant: {
					tenant: tenantName
				}
			},
			dataPresent: true
		});
		await expect(
			makeGraphqlRequest(createTenantMutation, {
				tenant: tenantName
			})
		).resolves.toEqual({
			dataPresent: true,
			errors: [
				{
					errorType: 'DataFetchingException',
					exception: {
						message: 'conflict',
						suppressed: []
					},
					locations: [
						{
							column: 5,
							line: 3
						}
					],
					message: 'Exception while fetching data (/createTenant) : conflict',
					path: ['createTenant']
				}
			]
		});
	}
);

test(
	'permissions are applied',
	{
		tag: '@browserless'
	},
	async () => {
		const testTenant = TENANT_MGR.get();
		await expect(
			makeGraphqlRequest(
				graphql`
					mutation createTenantWithPermissions($tenant: String!) {
						createTenant(tenant: $tenant) {
							createGroup(group: "test") {
								group
							}
							createVizGroup(vizGroup: "can-see") {
								dash1: createDashboardWithTitle(title: "Dashboard 1") {
									dashboard
								}
								dash2: createDashboardWithTitle(title: "Dashboard 2") {
									dashboard
								}
								createPermission(
									permission: {
										name: "test"
										scopes: ["viz-group:view", "dashboard:view"]
										groupPrincipals: { tenant: $tenant, group: "test" }
									}
								)
							}
							hidden: createVizGroup(vizGroup: "cannot-see") {
								dash1: createDashboardWithTitle(title: "Secret Dashboard 1") {
									dashboard
								}
								dash2: createDashboardWithTitle(title: "Secret Dashboard 2") {
									dashboard
								}
							}
						}
					}
				`,
				{
					tenant: testTenant
				}
			)
		).resolves.toEqual({
			errors: [],
			data: {
				createTenant: {
					createGroup: {
						group: 'test'
					},
					createVizGroup: {
						dash1: {
							dashboard: 'dashboard1'
						},
						dash2: {
							dashboard: 'dashboard2'
						},
						createPermission: 'test'
					},
					hidden: {
						dash1: {
							dashboard: 'secretdashboard1'
						},
						dash2: {
							dashboard: 'secretdashboard2'
						}
					}
				}
			},
			dataPresent: true
		});
		const testUser = await createRandomTestUser([`${testTenant}/test`]);
		await expect(
			makeGraphqlRequest(
				graphql`
					query dashboards($tenant: String!) {
						tenant(tenant: $tenant) {
							vizGroups {
								dashboards {
									slug
								}
							}
						}
					}
				`,
				{ tenant: testTenant },
				testUser
			)
		).resolves.toEqual({
			errors: [],
			data: {
				tenant: {
					vizGroups: [
						{
							dashboards: [
								{
									slug: `${testTenant}_can-see_dashboard1`
								},
								{
									slug: `${testTenant}_can-see_dashboard2`
								}
							]
						}
					]
				}
			},
			dataPresent: true
		});
	}
);

test(
	'permission roundtrip',
	{
		tag: '@browserless'
	},
	async () => {
		const mainTenant = TENANT_MGR.get();
		const secondaryTenant = TENANT_MGR.get();
		const testUser = await createRandomTestUser([]);
		await expect(
			makeGraphqlRequest(
				graphql`
					mutation createAllPermissions(
						$mainTenant: String!
						$secondaryTenant: String!
						$testUser: String!
					) {
						secondaryTenant: createTenant(tenant: $secondaryTenant) {
							tenant
						}
						mainTenant: createTenant(tenant: $mainTenant) {
							createProject(project: "trainstation") {
								project
							}
							createPermission(
								permission: {
									name: "view-testuser"
									scopes: ["tenant:view"]
									userPrincipals: [{ userId: $testUser }]
								}
							)
							createVizGroup(vizGroup: "test") {
								vizGroup
								createPermission(
									permission: {
										name: "permission"
										scopes: "viz-group:admin"
										groupPrincipals: [{ tenant: $secondaryTenant, group: "admin" }]
										projectPrincipals: [{ tenant: $mainTenant, project: "trainstation" }]
										tenantPrincipals: [{ tenant: $mainTenant }]
										userPrincipals: [{ userId: $testUser }]
										vizGroupPrincipals: [{ tenant: $mainTenant, vizGroup: "test" }]
									}
								)
							}
						}
					}
				`,
				{
					mainTenant,
					secondaryTenant,
					testUser: testUser.id
				}
			)
		).resolves.toEqual({
			errors: [],
			data: {
				secondaryTenant: {
					tenant: secondaryTenant
				},
				mainTenant: {
					createProject: {
						project: 'trainstation'
					},
					createPermission: 'view-testuser',
					createVizGroup: {
						vizGroup: 'test',
						createPermission: 'permission'
					}
				}
			},
			dataPresent: true
		});
		await expect(
			makeGraphqlRequest(
				graphql`
					fragment AllPermissions on Permission {
						name
						scopes
						userPrincipals {
							userId
						}
						tenantPrincipals {
							tenant
						}
						groupPrincipals {
							tenant
							group
						}
						projectPrincipals {
							tenant
							project
						}
						vizGroupPrincipals {
							tenant
							vizGroup
						}
					}

					query getPermissions($tenant: String!) {
						tenant(tenant: $tenant) {
							permissions {
								...AllPermissions
							}
						}
						vizGroup(tenant: $tenant, vizGroup: "test") {
							permissions {
								...AllPermissions
							}
						}
					}
				`,
				{
					tenant: mainTenant
				},
				testUser
			)
		).resolves.toEqual({
			errors: [],
			data: {
				// no permission to view tenant permissions
				tenant: {},
				vizGroup: {
					permissions: [
						{
							name: 'permission',
							scopes: ['viz-group:admin'],
							userPrincipals: [
								{
									userId: testUser.id
								}
							],
							tenantPrincipals: [
								{
									tenant: mainTenant
								}
							],
							groupPrincipals: [
								{
									tenant: secondaryTenant,
									group: 'admin'
								}
							],
							projectPrincipals: [
								{
									tenant: mainTenant,
									project: 'trainstation'
								}
							],
							vizGroupPrincipals: [
								{
									tenant: mainTenant,
									vizGroup: 'test'
								}
							]
						}
					]
				}
			},
			dataPresent: true
		});
	}
);

test(
	'rollback',
	{
		tag: '@browserless'
	},
	async () => {
		const tenantName = TENANT_MGR.get();
		await expect(
			makeGraphqlRequest(
				graphql`
					mutation createConflict($tenant: String!) {
						createTenant(tenant: $tenant) {
							proj1: createProject(project: "trainstation") {
								project
							}
							proj2: createProject(project: "trainstation") {
								project
							}
						}
					}
				`,
				{
					tenant: tenantName
				}
			)
		).resolves.toEqual({
			errors: [
				{
					message: 'Exception while fetching data (/createTenant/proj2) : conflict',
					path: ['createTenant', 'proj2'],
					exception: {
						message: 'conflict',
						suppressed: []
					},
					locations: [
						{
							line: 7,
							column: 8
						}
					],
					errorType: 'DataFetchingException'
				}
			],
			dataPresent: true
		});
		await expect(
			makeGraphqlRequest(
				graphql`
					query getTenant($tenant: String!) {
						tenant(tenant: $tenant) {
							tenant
						}
					}
				`,
				{
					tenant: tenantName
				}
			)
		).resolves.toEqual({
			errors: [],
			data: {},
			dataPresent: true
		});
	}
);

test(
	'isMember',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await checkedGraphqlRequest(
			graphql`
				mutation ($tenant: String!) {
					createTenant(tenant: $tenant) {
						g1: createGroup(group: "group1") {
							group
						}
						g2: createGroup(group: "group2") {
							group
						}
					}
				}
			`,
			{ tenant }
		);
		const testUser = await createRandomTestUser([`${tenant}/admin`, `${tenant}/group2`]);
		await expect(
			makeGraphqlRequest(
				graphql`
					query ($tenant: String!) {
						tenant(tenant: $tenant) {
							groups {
								group
								isMember
							}
						}
					}
				`,
				{
					tenant
				},
				testUser
			)
		).resolves.toEqual({
			errors: [],
			data: {
				tenant: {
					groups: [
						{
							group: 'admin',
							isMember: true
						},
						{
							group: 'ckan-editor',
							isMember: false
						},
						{
							group: 'group1',
							isMember: false
						},
						{
							group: 'group2',
							isMember: true
						},
						{
							group: 'read',
							isMember: false
						}
					]
				}
			},
			dataPresent: true
		});
	}
);

test(
	'keycloakGroupMemberships',
	{
		tag: '@browserless'
	},
	async () => {
		const firstTenant = TENANT_MGR.get();
		const secondTenant = TENANT_MGR.get();
		await expect(
			makeGraphqlRequest(
				graphql`
					mutation createTenants($firstTenant: String!, $secondTenant: String!) {
						tenant1: createTenant(tenant: $firstTenant) {
							tenant
						}
						tenant2: createTenant(tenant: $secondTenant) {
							tenant
						}
					}
				`,
				{ firstTenant, secondTenant }
			)
		).resolves.toEqual({
			data: {
				tenant1: {
					tenant: firstTenant
				},
				tenant2: {
					tenant: secondTenant
				}
			},
			dataPresent: true,
			errors: []
		});
		const testUser = await createRandomTestUser([`${secondTenant}/admin`, firstTenant]);
		await expect(
			makeGraphqlRequest(
				graphql`
					query keycloakGroupMemberships {
						keycloakGroupMemberships {
							__typename
							... on Tenant {
								tenant
								attributes {
									key
									value
								}
								groups {
									group
								}
							}
							... on Group {
								tenant
								group
								attributes {
									key
									value
								}
							}
						}
					}
				`,
				{},
				testUser
			)
		).resolves.toEqual({
			errors: [],
			data: {
				keycloakGroupMemberships: [
					{
						__typename: 'Group',
						tenant: secondTenant,
						group: 'admin',
						attributes: []
					},
					{
						__typename: 'Tenant',
						tenant: firstTenant,
						attributes: [],
						groups: []
					}
				]
			},
			dataPresent: true
		});
	}
);

test(
	'unauthorized',
	{
		tag: '@browserless'
	},
	async () => {
		await expect(
			makeGraphqlRequest(
				graphql`
					query {
						tenants {
							tenant
						}
					}
				`,
				{},
				null
			)
		).resolves.toEqual({
			errors: [
				{
					message: 'Exception while fetching data (/tenants) : unauthorized',
					path: ['tenants'],
					exception: {
						message: 'unauthorized',
						suppressed: []
					},
					locations: [
						{
							line: 3,
							column: 7
						}
					],
					errorType: 'DataFetchingException'
				}
			],
			dataPresent: true
		});
	}
);

test(
	'valid names are checked',
	{
		tag: '@browserless'
	},
	async () => {
		await expect(
			makeGraphqlRequest(
				graphql`
					mutation {
						createTenant(tenant: "Invalid") {
							tenant
						}
					}
				`,
				{}
			)
		).resolves.toEqual({
			errors: [
				{
					message: 'Exception while fetching data (/createTenant) : bad request',
					path: ['createTenant'],
					exception: {
						message: 'bad request',
						suppressed: []
					},
					locations: [
						{
							line: 3,
							column: 7
						}
					],
					errorType: 'DataFetchingException'
				}
			],
			dataPresent: true
		});
		await expect(
			makeGraphqlRequest(
				graphql`
					mutation {
						deleteTenant(tenant: "Invalid")
					}
				`,
				{}
			)
		).resolves.toEqual({
			errors: [
				{
					message: 'Exception while fetching data (/deleteTenant) : bad request',
					path: ['deleteTenant'],
					exception: {
						message: 'bad request',
						suppressed: []
					},
					locations: [
						{
							line: 3,
							column: 7
						}
					],
					errorType: 'DataFetchingException'
				}
			],
			dataPresent: true
		});
	}
);

test('collaboration', { tag: '@browserless' }, async () => {
	const sharingTenant = TENANT_MGR.get();
	const collaboratingTenant = TENANT_MGR.get();

	await checkedGraphqlRequest(
		graphql`
			mutation create($sharingTenant: String!, $collaboratingTenant: String!) {
				sharing: createTenant(tenant: $sharingTenant) {
					createVizGroup(vizGroup: "trainstation") {
						vizGroup
					}
				}
				collaborating: createTenant(tenant: $collaboratingTenant) {
					createGroup(group: "train-enthusiasts") {
						group
						createPermission(
							permission: {
								name: "public"
								scopes: ["group:view"]
								allowAllAuthenticatedUsers: true
							}
						)
					}
				}
			}
		`,
		{ sharingTenant, collaboratingTenant }
	);
	const sharingUser = await createRandomTestUser([`${sharingTenant}/admin`]);
	const collaboratingUser = await createRandomTestUser([
		`${collaboratingTenant}/train-enthusiasts`
	]);

	// collaborating user can only see the other tenant, not the viz-group
	const allVizGroups = graphql`
		query vizGroups {
			tenants {
				tenant
				vizGroups {
					vizGroup
				}
			}
		}
	`;

	await expect(checkedGraphqlRequest(allVizGroups, {}, collaboratingUser)).resolves.toEqual({
		errors: [],
		data: {
			tenants: expect.arrayContaining([
				{
					tenant: collaboratingTenant,
					vizGroups: []
				}
			])
		},
		dataPresent: true
	});

	// sharing user can share the viz group with the group in the other tenant
	await checkedGraphqlRequest(
		graphql`
			mutation share($sharingTenant: String!, $collaboratingTenant: String!) {
				tenant(tenant: $sharingTenant) {
					vizGroup(vizGroup: "trainstation") {
						createPermission(
							permission: {
								name: "share"
								scopes: ["viz-group:view", "dashboard:view"]
								groupPrincipals: [{ tenant: $collaboratingTenant, group: "train-enthusiasts" }]
							}
						)
					}
				}
			}
		`,
		{ sharingTenant, collaboratingTenant },
		sharingUser
	);

	// now the collaborating user can see the viz-group
	await expect(checkedGraphqlRequest(allVizGroups, {}, collaboratingUser)).resolves.toEqual({
		errors: [],
		data: {
			tenants: expect.arrayContaining([
				{
					tenant: sharingTenant,
					vizGroups: [
						{
							vizGroup: 'trainstation'
						}
					]
				},
				{
					tenant: collaboratingTenant,
					vizGroups: []
				}
			])
		},
		dataPresent: true
	});
});

test('name validation', { tag: '@browserless' }, async () => {
	await expect(
		makeGraphqlRequest(
			graphql`
				mutation invalidTenant {
					createTenant(tenant: "invAlid") {
						tenant
					}
				}
			`,
			{}
		)
	).resolves.toEqual({
		errors: [
			{
				message: 'Exception while fetching data (/createTenant) : bad request',
				path: ['createTenant'],
				exception: {
					message: 'bad request',
					suppressed: []
				},
				locations: [
					{
						line: 3,
						column: 6
					}
				],
				errorType: 'DataFetchingException'
			}
		],
		dataPresent: true
	});
	const tenant = TENANT_MGR.get();
	await checkedGraphqlRequest(
		graphql`
			mutation createTenant($tenant: String!) {
				createTenant(tenant: $tenant) {
					tenant
				}
			}
		`,
		{
			tenant
		}
	);

	await expect(
		makeGraphqlRequest(
			graphql`
				mutation createInvalidPermission($tenant: String!) {
					tenant(tenant: $tenant) {
						createPermission(
							permission: {
								scopes: ["tenant:view"]
								name: "Invalid"
								tenantPrincipals: { tenant: $tenant }
							}
						)
					}
				}
			`,
			{ tenant }
		)
	).resolves.toEqual({
		errors: [
			{
				message: 'Exception while fetching data (/tenant/createPermission) : bad request',
				path: ['tenant', 'createPermission'],
				exception: {
					message: 'bad request',
					suppressed: []
				},
				locations: [
					{
						line: 4,
						column: 7
					}
				],
				errorType: 'DataFetchingException'
			}
		],
		dataPresent: true
	});
	await expect(
		makeGraphqlRequest(
			graphql`
				mutation patchInvalidAttribute($tenant: String!) {
					tenant(tenant: $tenant) {
						patchAttributes(attributes: [{ key: "Invalid", value: "valid" }]) {
							key
						}
					}
				}
			`,
			{ tenant }
		)
	).resolves.toEqual({
		errors: [
			{
				message: 'Exception while fetching data (/tenant/patchAttributes) : bad request',
				path: ['tenant', 'patchAttributes'],
				exception: {
					message: 'bad request',
					suppressed: []
				},
				locations: [
					{
						line: 4,
						column: 7
					}
				],
				errorType: 'DataFetchingException'
			}
		],
		dataPresent: true
	});
});

test('createUser permission checks', { tag: '@browserless' }, async () => {
	await expect(
		makeGraphqlRequest(
			graphql`
				mutation createUser($email: String!) {
					createUser(
						user: {
							email: $email
							firstName: "First"
							lastName: "Last"
							groups: [{ tenant: "guetersloh", group: "read" }]
							tenants: [{ tenant: "doesntexist" }]
						}
					) {
						userId
					}
				}
			`,
			{ email: `${getRandomString(6)}@test.de` }
		)
	).resolves.toEqual({
		errors: [
			{
				message: 'Exception while fetching data (/createUser) : not found',
				path: ['createUser'],
				exception: {
					message: 'not found',
					suppressed: []
				},
				locations: [
					{
						line: 3,
						column: 6
					}
				],
				errorType: 'DataFetchingException'
			}
		],
		dataPresent: true
	});
	const readonlyUser = await createRandomTestUser([`guetersloh/read`]);
	await expect(
		makeGraphqlRequest(
			graphql`
				mutation createUser($email: String!) {
					createUser(
						user: {
							email: $email
							firstName: "First"
							lastName: "Last"
							groups: [{ tenant: "guetersloh", group: "read" }]
							tenants: []
						}
					) {
						userId
					}
				}
			`,
			{ email: `${getRandomString(6)}@test.de` },
			readonlyUser
		)
	).resolves.toEqual({
		errors: [
			{
				message: 'Exception while fetching data (/createUser) : not found',
				path: ['createUser'],
				exception: {
					message: 'not found',
					suppressed: []
				},
				locations: [
					{
						line: 3,
						column: 6
					}
				],
				errorType: 'DataFetchingException'
			}
		],
		dataPresent: true
	});
	const email = `${getRandomString(6)}@test.de`;
	const createRequest = () =>
		makeGraphqlRequest(
			graphql`
				mutation createUser($email: String!) {
					createUser(
						user: {
							email: $email
							firstName: "First"
							lastName: "Last"
							groups: [{ tenant: "guetersloh", group: "read" }]
							tenants: []
						}
					) {
						userId
					}
				}
			`,
			{ email }
		);
	await expect(createRequest()).resolves.toEqual({
		errors: [],
		data: {
			createUser: {
				userId: expect.any(String)
			}
		},
		dataPresent: true
	});
	await expect(createRequest()).resolves.toEqual({
		errors: [
			{
				message: 'Exception while fetching data (/createUser) : unknown error',
				path: ['createUser'],
				exception: {
					message: 'unknown error',
					suppressed: []
				},
				locations: [
					{
						line: 3,
						column: 6
					}
				],
				errorType: 'DataFetchingException'
			}
		],
		dataPresent: true
	});
});

test('helpdesk sends email', async () => {
	const title = `Test ${getRandomString(6)}`;
	await expect(
		makeGraphqlRequest(
			graphql`
				mutation ($title: String!, $description: String!) {
					helpdesk(title: $title, description: $description)
				}
			`,
			{
				title,
				description: 'Dies ist eine tolle Testnachricht'
			}
		)
	).resolves.toEqual({
		errors: [],
		data: {
			helpdesk: true
		},
		dataPresent: true
	});
	const mailhogClient = getMailhogClient();
	await expect(async () => {
		expect(
			JSON.parse(
				(
					await mailhogClient.get<string>(
						`${MAILHOG}api/v2/search?kind=containing&query=${encodeURIComponent(title)}`
					)
				).data
			).total
		).toEqual(1);
	}).toPass();
});

test('clickhouse query over graphql', { tag: '@browserless' }, async () => {
	const tenant = TENANT_MGR.get();
	await test.step('setup', async () => {
		await withSetupClient(async (client) => {
			await client.put(`${RESOURCE_API}tenants/${tenant}`);
			await client.put(`${RESOURCE_API}tenants/${tenant}/projects/allowed`);
			await client.put(`${RESOURCE_API}tenants/${tenant}/projects/allowed/permission/p`, {
				scopes: ['project:clickhouse-read', 'project:bucket-read'],
				principals: [
					{
						type: 'tenant',
						tenant: tenant
					}
				]
			});
			await client.put(`${RESOURCE_API}tenants/${tenant}/projects/forbidden`);
			const allowedCreds = (
				await client.put<AxiosBasicCredentials>(
					`${RESOURCE_API}tenants/${tenant}/projects/allowed/sensor-credentials/c`
				)
			).data;
			const forbiddenCreds = (
				await client.put<AxiosBasicCredentials>(
					`${RESOURCE_API}tenants/${tenant}/projects/forbidden/sensor-credentials/c`
				)
			).data;

			// post data
			for (const creds of [forbiddenCreds, allowedCreds]) {
				await axios.post(
					`${API}api/v2/sensor/message/direct`,
					JSON.stringify({
						time: Math.floor(Date.now() / 1000),
						sensor_id: 'test123',
						temperature_outside: 20
					}),
					{
						headers: {
							'Content-Type': 'application/json'
						},
						auth: creds
					}
				);
			}

			// upload file
			const s3client = bucketAdminClient();
			for (const project of ['allowed', 'forbidden']) {
				await s3client.putObject({
					Bucket: `${tenant}.${project}`,
					Key: 'test.csv',
					Body: 'a;b;c\n1;2;3\n4;5;6'
				});
			}
		});
	});

	const user = await createRandomTestUser([tenant]);

	await test.step('sensor_messages RLS', async () => {
		await expect(() =>
			expect(
				checkedGraphqlRequest(
					graphql`
						query {
							clickhouseQuery(query: "SELECT DISTINCT project FROM sensor_messages")
						}
					`,
					{},
					user
				)
			).resolves.toEqual({
				errors: [],
				data: {
					clickhouseQuery: {
						meta: [{ name: 'project', type: 'String' }],
						data: [{ project: `${tenant}.allowed` }],
						rows: 1
					}
				},
				dataPresent: true
			})
		).toPass({ intervals: [2_000], timeout: 10_000 });
	});

	await test.step('sensor_messages readonly', async () => {
		const response = await checkedGraphqlRequest(
			graphql`
				query {
					clickhouseQuery(query: "SELECT * FROM sensor_messages SETTINGS SQL_projects='everything'")
				}
			`,
			{},
			user
		);
		expect(response).toEqual({
			errors: [],
			data: {
				clickhouseQuery: {
					meta: [],
					data: [],
					rows: 0,
					exception: expect.any(String)
				}
			},
			dataPresent: true
		});
		expect(response.data.clickhouseQuery.exception).toContain(
			"Cannot modify 'SQL_projects' setting in readonly mode."
		);
	});

	// test existing project
	await test.step('read bucket file', async () => {
		const response = await checkedGraphqlRequest(
			graphql`
				query ($tenant: String!, $query: String!) {
					clickhouseQuery(query: $query, project: { tenant: $tenant, project: "allowed" })
				}
			`,
			{
				tenant,
				query: `SELECT AVG(a), MAX(b), MIN(c) FROM s3(\`${tenant}.allowed\`,filename='test.csv',format='CSV')`
			},
			user
		);
		expect(response).toEqual({
			errors: [],
			data: {
				clickhouseQuery: {
					meta: [
						{ name: 'AVG(a)', type: 'Nullable(Float64)' },
						{ name: 'MAX(b)', type: 'Nullable(Int64)' },
						{ name: 'MIN(c)', type: 'Nullable(Int64)' }
					],
					data: [{ 'AVG(a)': 2.5, 'MAX(b)': 5, 'MIN(c)': 3 }],
					rows: 1
				}
			},
			dataPresent: true
		});
	});
	// test forbidden project
	await test.step('read forbidden bucket file', async () => {
		const response = await checkedGraphqlRequest(
			graphql`
				query ($tenant: String!, $query: String!) {
					clickhouseQuery(query: $query, project: { tenant: $tenant, project: "forbidden" })
				}
			`,
			{
				tenant,
				query: `SELECT 1`
			},
			user
		);
		expect(response).toEqual({
			errors: [],
			data: {},
			dataPresent: true
		});
	});
	// test nonexisting project
	await test.step('read non-existent bucket file', async () => {
		const response = await checkedGraphqlRequest(
			graphql`
				query ($tenant: String!, $query: String!) {
					clickhouseQuery(query: $query, project: { tenant: $tenant, project: "doesntexist" })
				}
			`,
			{
				tenant,
				query: `SELECT 1`
			},
			user
		);
		expect(response).toEqual({
			errors: [],
			data: {},
			dataPresent: true
		});
	});
});
