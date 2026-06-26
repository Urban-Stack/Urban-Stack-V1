import test, { expect } from 'playwright/test';
import { getRandomString, RandomTenantManager } from './helper/util';
import { API, RESOURCE_API } from './helper/urls';
import axios, { AxiosInstance } from 'axios';
import { createResources, withSetupClient } from './helper/keycloak';
import { runQuery } from './helper/clickhouse';

const TENANT_MGR = new RandomTenantManager();

test('pubquery 404', { tag: '@browserless' }, async () => {
	expect(
		(
			await axios.get<string>(`${API}api/v2/query/${getRandomString(9)}/v/q/geojson`, {
				validateStatus: (_) => true
			})
		).status
	).toBe(404);
});

test.describe('configured queries', () => {
	const tenant = TENANT_MGR.get();

	test.beforeAll(async () => {
		await createResources([
			`tenants/${tenant}/viz-groups/v`,
			`tenants/${tenant}/projects/p1`,
			`tenants/${tenant}/projects/p2`
		]);
		await withSetupClient((realmAdminClient) =>
			realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/p1/permissions/trainread`, {
				principals: [{ type: 'vizGroup', tenant: `${tenant}`, vizGroup: `v` }],
				scopes: ['project:clickhouse-read']
			})
		);
	});

	function testQuery(
		name: string,
		sql: string,
		expected: any,
		extraSetup: (arg0: AxiosInstance) => any = null
	) {
		test(name, { tag: '@browserless' }, async () => {
			await withSetupClient(async (realmAdminClient) => {
				if (extraSetup) await extraSetup(realmAdminClient);
				await realmAdminClient.put(
					`${RESOURCE_API}tenants/${tenant}/viz-groups/v/published-queries/${name}`,
					{ sql }
				);
			});

			if (typeof expected === 'number')
				expect(
					(
						await axios.get<any>(`${API}api/v2/query/${tenant}/v/${name}/geojson`, {
							validateStatus: () => true
						})
					).status
				).toBe(expected);
			else if (typeof expected === 'function')
				await expected(
					(await axios.get<any>(`${API}api/v2/query/${tenant}/v/${name}/geojson`)).data
				);
			else
				expect(
					(await axios.get<any>(`${API}api/v2/query/${tenant}/v/${name}/geojson`)).data
				).toEqual(expected);
		});
	}

	testQuery('ok', `SELECT wkt((1.,2.)) AS geometry, 'abc' AS str, 123 AS num`, {
		type: 'FeatureCollection',
		features: [
			{
				geometry: {
					coordinates: [1, 2],
					type: 'Point'
				},
				properties: {
					num: 123,
					str: 'abc'
				},
				type: 'Feature'
			}
		]
	});

	test('caching', { tag: '@browserless' }, async () => {
		await withSetupClient((realmAdminClient) =>
			realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/v/published-queries/caching`,
				{ sql: `SELECT wkt((1.,2.)) AS geometry` }
			)
		);

		expect((await axios.get<any>(`${API}api/v2/query/${tenant}/v/caching/geojson`)).status).toBe(
			200
		);

		await withSetupClient((realmAdminClient) =>
			realmAdminClient.delete(
				`${RESOURCE_API}tenants/${tenant}/viz-groups/v/published-queries/caching`
			)
		);

		expect((await axios.get<any>(`${API}api/v2/query/${tenant}/v/caching/geojson`)).status).toBe(
			200
		);
	});

	testQuery('no-geometry', `SELECT 42`, 502);

	testQuery('not-sql', `NOT SQL!!!`, 502);

	testQuery('broken-wkt', `SELECT 'foobar' AS geometry`, 502);

	testQuery(
		'big-number',
		`SELECT wkt((1.,2.)) AS geometry, 57896044618658097711785492504343953926634992332820282019728792003956564819967000 as big`,
		(geojson) => expect(geojson.features[0].properties.big).toBeCloseTo(5.78960446186581e79)
	);

	testQuery(
		'ignore-odd-types',
		`SELECT wkt((1.,2.)) AS geometry, arrayZip(['k'], ['v']) as map`,
		(geojson) => expect(geojson.features[0].properties).toStrictEqual({})
	);

	testQuery(
		'settings',
		`SELECT wkt((1.,2.)) AS geometry,
		        getSetting('SQL_projects') AS projects,
				getSetting('readonly') AS readonly`,
		(geojson) =>
			expect(geojson.features[0].properties).toStrictEqual({
				projects: `${tenant}.p1`,
				readonly: 1
			})
	);

	testQuery(
		'rls',
		`SELECT wkt((1.,2.)) AS geometry,
		        project
		 FROM sensor_messages`,
		(geojson) => expect(geojson.features.length).toBe(1),
		() => runQuery(`INSERT INTO sensor_messages(project) VALUES ('${tenant}.p1'), ('${tenant}.p2')`)
	);

	testQuery(
		'insert-impossible',
		`INSERT INTO sensor_messages(project) VALUES ('${tenant}.p1')`,
		502
	);

	testQuery(
		'long-query',
		`SELECT wkt((1.,2.)) AS geometry, '${getRandomString(1500)}' as long`,
		(geojson) => expect(geojson.features[0].properties.long).toHaveLength(1500)
	);

	test('too-long-query', { tag: '@browserless' }, async () => {
		await withSetupClient(async (realmAdminClient) =>
			expect(
				(
					await realmAdminClient.put(
						`${RESOURCE_API}tenants/${tenant}/viz-groups/v/published-queries/toolong`,
						{ sql: `SELECT wkt((1.,2.)) AS geometry, '${getRandomString(3000)}' as long` },
						{ validateStatus: (_) => true }
					)
				).status
			).toBe(400)
		);
	});
});

test('no tenant:view necessary for project permissions', { tag: '@browserless' }, async () => {
	const tenant1 = TENANT_MGR.get();
	const tenant2 = TENANT_MGR.get();
	const tenant3 = TENANT_MGR.get();
	await createResources([
		`tenant/${tenant1}/project/p1`,
		`tenant/${tenant2}/project/p2`,
		`tenant/${tenant2}/project/p3`,
		`tenant/${tenant2}/project/p4`,
		`tenant/${tenant3}/project/p5`,
		`tenant/${tenant1}/viz-group/v`
	]);
	await withSetupClient(async (realmAdminClient) => {
		await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant1}/projects/p1/permissions/read`, {
			principals: [{ type: 'vizGroup', tenant: `${tenant1}`, vizGroup: `v` }],
			scopes: ['project:clickhouse-read']
		});
		await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant2}/projects/p2/permissions/read`, {
			principals: [{ type: 'vizGroup', tenant: `${tenant1}`, vizGroup: `v` }],
			scopes: ['project:clickhouse-read']
		});
		await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant2}/projects/p3/permissions/read`, {
			principals: [{ type: 'vizGroup', tenant: `${tenant1}`, vizGroup: `v` }],
			scopes: ['project:admin']
		});
		await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant3}/permissions/read`, {
			principals: [{ type: 'vizGroup', tenant: `${tenant1}`, vizGroup: `v` }],
			scopes: ['project:clickhouse-read', 'project:view', 'tenant:view']
		});
		await realmAdminClient.put(
			`${RESOURCE_API}tenants/${tenant1}/viz-groups/v/published-queries/q`,
			{
				sql: `SELECT wkt((1.,2.)) AS geometry,
					getSetting('SQL_projects') AS projects`
			}
		);
	});
	const geojson = (await axios.get<any>(`${API}api/v2/query/${tenant1}/v/q/geojson`)).data;
	expect(geojson.features[0].properties.projects.split(' ').sort()).toEqual(
		[`${tenant1}.p1`, `${tenant2}.p2`, `${tenant2}.p3`, `${tenant3}.p5`].sort()
	);
});
