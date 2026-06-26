import test, { expect } from 'playwright/test';
import {
	ADMIN_USER,
	createKeycloakUser,
	createTestUser,
	signIn,
	withSetupClient
} from './helper/keycloak';
import { RandomTenantManager } from './helper/util';
import { API, RESOURCE_API, SUPERSET } from './helper/urls';
import axios, { AxiosBasicCredentials } from 'axios';
import { runQueryJson } from './helper/clickhouse';
import { grogStrongjaw } from './helper/test-user';

const TENANT_MGR = new RandomTenantManager();

test.describe('with setup', () => {
	let tenant: string;

	test.beforeAll(async () => {
		tenant = TENANT_MGR.get();
		const creds = await withSetupClient(async (realmAdminClient) => {
			// create tenant & project
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
			// post metadata
			await realmAdminClient.post(
				`${API}api/v1/metadata/${tenant}/trainstation`,
				'sensor_id,external_reference\nsensor0,42\nsensor3000,9000\n',
				{
					headers: {
						'Content-Type': 'text/csv'
					}
				}
			);
			return (
				await realmAdminClient.put<AxiosBasicCredentials>(
					`${RESOURCE_API}tenants/${tenant}/projects/trainstation/sensor-credentials/c`
				)
			).data;
		});

		// post data
		for (const [sensorId, temperatures] of [
			['sensor0', [0, 1]],
			['sensor1', [2, 3]]
		]) {
			for (const temperature of temperatures) {
				await axios.post(
					`${API}api/v2/sensor/message/direct`,
					JSON.stringify({
						time: Math.floor(Date.now() / 1000),
						sensor_id: sensorId,
						temperature_outside: temperature
					}),
					{
						headers: {
							'Content-Type': 'application/json'
						},
						auth: creds
					}
				);
			}
		}
	});

	test(
		'works in clickhouse',
		{
			tag: '@browserless'
		},
		async () => {
			await expect(async () => {
				const result = await runQueryJson<{
					project: string;
					sensor_id: string;
					temperature_outside: number;
					external_reference: string | null;
					custom1: string | null;
				}>(
					`SELECT project,
									sensor_id,
									temperature_outside,
									external_reference,
									custom1
					 from sensor_messages_with_meta
					 WHERE project = '${tenant}.trainstation'`
				);

				expect(result.data).toEqual([
					{
						project: `${tenant}.trainstation`,
						sensor_id: 'sensor0',
						temperature_outside: 0,
						external_reference: '42',
						custom1: null
					},
					{
						project: `${tenant}.trainstation`,
						sensor_id: 'sensor0',
						temperature_outside: 1,
						external_reference: '42',
						custom1: null
					},
					{
						project: `${tenant}.trainstation`,
						sensor_id: 'sensor1',
						temperature_outside: 2,
						external_reference: null,
						custom1: null
					},
					{
						project: `${tenant}.trainstation`,
						sensor_id: 'sensor1',
						temperature_outside: 3,
						external_reference: null,
						custom1: null
					}
				]);
			}).toPass({ intervals: [2_000] });
		}
	);

	test('works in superset', async ({ page }) => {
		const grog = await createKeycloakUser(grogStrongjaw(), [`${tenant}/read`]);
		await page.goto(`${SUPERSET}chart/add`);
		await signIn(page, grog);
		await page.getByRole('combobox', { name: 'Datensatz' }).click();
		await page.getByText('sensor_messages_with_meta').click();
		await page.getByRole('button', { name: 'Tabelle Tabelle' }).click();
		await page.getByRole('button', { name: 'Neues Diagramm erstellen' }).click();
		for (const column of ['sensor_id', 'temperature_outside', 'external_reference']) {
			await page.getByRole('textbox', { name: 'Metriken & Spalten durchsuchen' }).fill(column);
			await page.getByText(column).dragTo(page.getByRole('button', { name: 'Dimensionen' }));
		}
		await expect(async () => {
			await page.getByRole('button', { name: /Diagramm (erstellen|aktualisieren)/ }).click();
			await expect(page.getByLabel('external_reference').getByText('42')).toHaveCount(2, {
				timeout: 10_000
			});
		}).toPass({ intervals: [2_000] });
	});

	test(
		'can download',
		{
			tag: '@browserless'
		},
		async () => {
			await withSetupClient(async (realmAdminClient) => {
				const result = await realmAdminClient.get(
					`${API}api/v1/metadata/${tenant}/trainstation/download.csv`
				);
				expect(result.data).toEqual(
					'sensor_id,external_reference,location_description,location_name,sensor_type,custom1,custom2,custom3,custom4,custom5\r\nsensor0,42,,,,,,,,\r\nsensor3000,9000,,,,,,,,\r\n'
				);
			});
		}
	);

	test(
		'get count',
		{
			tag: '@browserless'
		},
		async () => {
			await withSetupClient(async (realmAdminClient) => {
				const result = await realmAdminClient.get(`${API}api/v1/metadata/${tenant}/trainstation`);
				expect(result.data).toEqual({ count: 2 });
			});
		}
	);
});

test(
	'needs sensor-meta-write permission',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
		});
		const grog = await createTestUser(grogStrongjaw(), [tenant]);
		const tryUpload = async () => {
			return await axios.post(
				`${API}api/v1/metadata/${tenant}/trainstation`,
				'sensor_id,external_reference\nsensor0,42\nsensor3000,9000\n',
				{
					headers: {
						'Content-Type': 'text/csv',
						Authorization: `Bearer ${await grog.token()}`
					}
				}
			);
		};
		await expect(tryUpload()).rejects.toThrow('Request failed with status code 404');
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
		});
		await expect(tryUpload()).rejects.toThrow('Request failed with status code 404');
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/readonly`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['project:view', 'project:sensor-metadata-read']
				}
			);
		});
		// permission denied when you can only see the project
		await expect(tryUpload()).rejects.toThrow('Request failed with status code 403');
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/write`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['project:sensor-metadata-write']
				}
			);
		});
		await expect(tryUpload()).resolves.toHaveProperty('status', 200);
	}
);

test(
	'format checks',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
		});
		const tryUpload = (data: string) =>
			withSetupClient((client) =>
				client.post(`${API}api/v1/metadata/${tenant}/trainstation`, data, {
					headers: {
						'Content-Type': 'text/csv'
					}
				})
			);

		await test.step('accepts different delimiters', async () => {
			await expect(
				tryUpload('sensor_id,external_reference\nsensor0,42\nsensor3000,9000\n')
			).resolves.toHaveProperty('status', 200);
			await expect(
				tryUpload('sensor_id,external_reference\r\nsensor0,42\r\nsensor3000,9000\r\n')
			).resolves.toHaveProperty('status', 200);
			await expect(
				tryUpload('sensor_id,external_reference\r\nsensor0,42\r\nsensor3000,9000')
			).resolves.toHaveProperty('status', 200);
			await expect(
				tryUpload('sensor_id;external_reference\nsensor0;42\nsensor3000;9000\n')
			).resolves.toHaveProperty('status', 200);
			await expect(
				tryUpload('sensor_id\texternal_reference\nsensor0\t42\nsensor3000\t9000\n')
			).resolves.toHaveProperty('status', 200);
			await expect(
				tryUpload('sensor_id+external_reference\nsensor0+42\nsensor3000+9000\n')
			).rejects.toHaveProperty('response.data', { error: 'unrecognized CSV format' });
		});

		await test.step('sensor_id is required', async () => {
			await expect(
				tryUpload('external_reference,custom1\nsensor0,42\nsensor3000,9000\n')
			).rejects.toHaveProperty('response.data', { error: 'sensor_id column is required' });
			// doesn't have to the the first column
			await expect(
				tryUpload('external_reference,sensor_id\nsensor0,42\nsensor3000,9000\n')
			).resolves.toHaveProperty('status', 200);
		});

		await test.step('forbids additional columns', async () => {
			await expect(
				tryUpload(
					'sensor_id,external_reference,anothercolumn\nsensor0,42,23\nsensor3000,9000,18000\n'
				)
			).rejects.toHaveProperty('response.data', {
				error: 'unknown columns',
				columns: ['anothercolumn']
			});
			await expect(
				tryUpload('sensor_id,External_reference\nsensor0,42\nsensor3000,9000\n')
			).rejects.toHaveProperty('response.data', {
				error: 'unknown columns',
				columns: ['External_reference']
			});
			await expect(
				tryUpload('sensor_id,externâl_reference\nsensor0,42\nsensor3000,9000\n')
			).rejects.toHaveProperty('response.data', {
				error: 'unknown columns',
				columns: ['externâl_reference']
			});
		});

		await test.step('forbids duplicate sensor_ids', async () => {
			await expect(
				tryUpload('external_reference,sensor_id\n1234,sensor0\n12345,sensor0\n123456,sensor0\n')
			).rejects.toHaveProperty('response.data', {
				error: 'duplicate sensor_id',
				sensor_id: 'sensor0'
			});
			await expect(
				tryUpload('sensor_id,external_reference\nsensor0,42\nsensor1,42\nsensor1,42\nsensor2,42\n')
			).rejects.toHaveProperty('response.data', {
				error: 'duplicate sensor_id',
				sensor_id: 'sensor1'
			});
		});
	}
);

test(
	'overwrite and delete',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
			await realmAdminClient.post(
				`${API}api/v1/metadata/${tenant}/trainstation`,
				'sensor_id,external_reference\nsensor0,42\nsensor3000,9000\n',
				{
					headers: {
						'Content-Type': 'text/csv'
					}
				}
			);
			// overwrite replaces everything for that project
			await realmAdminClient.post(
				`${API}api/v1/metadata/${tenant}/trainstation`,
				'sensor_id,external_reference\nsensor4,44\nsensor3000,9002\n',
				{
					headers: {
						'Content-Type': 'text/csv'
					}
				}
			);
			await expect(async () => {
				const result = await runQueryJson<{
					sensor_id: string;
					external_reference: string | null;
				}>(
					`SELECT sensor_id, external_reference,
					 from sensor_meta
					 WHERE project = '${tenant}.trainstation'
					 ORDER BY sensor_id`
				);

				expect(result.data).toEqual([
					{
						sensor_id: 'sensor3000',
						external_reference: '9002'
					},
					{
						sensor_id: 'sensor4',
						external_reference: '44'
					}
				]);
			}).toPass({ intervals: [2_000] });
			await realmAdminClient.delete(`${API}api/v1/metadata/${tenant}/trainstation`);
			await expect(async () => {
				const result = await runQueryJson<{
					sensor_id: string;
					external_reference: string | null;
				}>(
					`SELECT sensor_id, external_reference,
					 from sensor_meta
					 WHERE project = '${tenant}.trainstation'
					 ORDER BY sensor_id`
				);

				expect(result.data).toEqual([]);
			}).toPass({ intervals: [2_000] });
		});
	}
);

test(
	'presign token minting needs sensor-meta-write permission',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
		});
		const grog = await createTestUser(grogStrongjaw(), [tenant]);
		const tryMint = async () => {
			return await axios.post(
				`${API}api/v1/metadata/${tenant}/trainstation/presign/upload-token`,
				{ contentType: 'text/csv' },
				{
					headers: {
						Authorization: `Bearer ${await grog.token()}`
					}
				}
			);
		};
		await expect(tryMint()).rejects.toThrow('Request failed with status code 404');
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
		});
		await expect(tryMint()).rejects.toThrow('Request failed with status code 404');
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/readonly`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['project:view', 'project:sensor-metadata-read']
				}
			);
		});
		await expect(tryMint()).rejects.toThrow('Request failed with status code 403');
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/write`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['project:sensor-metadata-write']
				}
			);
		});
		await expect(tryMint()).resolves.toHaveProperty('status', 200);
	}
);

test(
	'can fetch presigned upload token',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		const now_sec = Math.floor(Date.now() / 1000);
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
			const response = await realmAdminClient.post<{
				uploadUrl: string;
				expiresAt: number;
			}>(`${API}api/v1/metadata/${tenant}/trainstation/presign/upload-token`);
			expect(response.status).toBe(200);
			expect(Number.isInteger(response.data.expiresAt)).toBe(true);
			expect(typeof response.data.uploadUrl).toBe('string');
			expect(response.data.expiresAt).toBeGreaterThan(now_sec + 20);
			expect(response.data.expiresAt).toBeLessThan(now_sec + 40);
			const parsed = new URL(response.data.uploadUrl);
			expect(parsed.pathname).toBe(`/api/v1/metadata/${tenant}/trainstation/presign-upload`);
			expect(parsed.searchParams.get('token')).not.toBeNull();
		});
	}
);

test(
	'can upload metadata through presigned URL',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		let uploadUrl: string;
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
			const response = await realmAdminClient.post(
				`${API}api/v1/metadata/${tenant}/trainstation/presign/upload-token`,
				{
					contentType: 'text/csv'
				}
			);
			uploadUrl = response.data.uploadUrl;
		});

		const csvBody = 'sensor_id,external_reference\nsensor-via-presign,9001\n';
		const uploadResponse = await axios.put(uploadUrl, csvBody, {
			headers: {
				'Content-Type': 'text/csv'
			}
		});
		expect(uploadResponse.status).toBe(200);
		expect(uploadResponse.data).toEqual({});

		await withSetupClient(async (realmAdminClient) => {
			const download = await realmAdminClient.get(
				`${API}api/v1/metadata/${tenant}/trainstation/download.csv`
			);
			expect(download.data).toContain('sensor-via-presign,9001');
		});
	}
);

test(
	'can download metadata through presigned URL',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		const downloadUrl: string = await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
			await realmAdminClient.post(
				`${API}api/v1/metadata/${tenant}/trainstation`,
				'sensor_id,external_reference\nsensor0,42\nsensor3000,9000\n',
				{
					headers: {
						'Content-Type': 'text/csv'
					}
				}
			);
			const response = await realmAdminClient.post(
				`${API}api/v1/metadata/${tenant}/trainstation/presign/download-token`,
				{
					contentType: 'text/csv'
				}
			);
			return response.data.downloadUrl;
		});

		const uploadResponse = await axios.get(downloadUrl);
		expect(uploadResponse.status).toBe(200);
		expect(uploadResponse.data).toContain('sensor3000,9000');
	}
);

test(
	'presign download token needs sensor-meta-read permission',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
		});
		const grog = await createTestUser(grogStrongjaw(), [tenant]);
		const tryGetToken = async () => {
			return await axios.post(
				`${API}api/v1/metadata/${tenant}/trainstation/presign/download-token`,
				{ contentType: 'text/csv' },
				{
					headers: {
						Authorization: `Bearer ${await grog.token()}`
					}
				}
			);
		};
		await expect(tryGetToken()).rejects.toThrow('Request failed with status code 404');
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
		});
		await expect(tryGetToken()).rejects.toThrow('Request failed with status code 404');
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/writeonly`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['project:view', 'project:sensor-metadata-write']
				}
			);
		});
		await expect(tryGetToken()).rejects.toThrow('Request failed with status code 403');
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(
				`${RESOURCE_API}tenants/${tenant}/projects/trainstation/permissions/write`,
				{
					principals: [{ type: 'tenant', tenant }],
					scopes: ['project:sensor-metadata-read']
				}
			);
		});
		await expect(tryGetToken()).resolves.toHaveProperty('status', 200);
	}
);

test(
	'presigned download tokens have fixed purpose',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/busstation`);
			await realmAdminClient.post(
				`${API}api/v1/metadata/${tenant}/trainstation`,
				'sensor_id,external_reference\nsensor0,42\nsensor3000,9000\n',
				{
					headers: {
						'Content-Type': 'text/csv'
					}
				}
			);
		});
		const uploadUrl = new URL(
			(
				await axios.post(
					`${API}api/v1/metadata/${tenant}/trainstation/presign/download-token`,
					{},
					{
						headers: {
							Authorization: `Bearer ${await ADMIN_USER.token()}`
						}
					}
				)
			).data.downloadUrl as string
		);

		expect(uploadUrl.pathname).toEqual(`/api/v1/metadata/${tenant}/trainstation/presign-download`);
		uploadUrl.pathname = `/api/v1/metadata/${tenant}/busstation/presign-download`;
		await expect(axios.get(uploadUrl.toString())).rejects.toThrow(
			'Request failed with status code 403'
		);

		uploadUrl.pathname = `/api/v1/metadata/${tenant}/busstation/presign-upload`;
		const csvBody = 'sensor_id,external_reference\nsensor-via-presign,9001\n';
		await expect(
			axios.put(uploadUrl.toString(), csvBody, {
				headers: {
					'Content-Type': 'text/csv'
				}
			})
		).rejects.toThrow('Request failed with status code 403');
	}
);

test(
	'presigned upload tokens have fixed purpose',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/trainstation`);
			await realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/busstation`);
		});
		const uploadUrl = new URL(
			(
				await axios.post(
					`${API}api/v1/metadata/${tenant}/trainstation/presign/upload-token`,
					{},
					{
						headers: {
							Authorization: `Bearer ${await ADMIN_USER.token()}`
						}
					}
				)
			).data.uploadUrl as string
		);

		expect(uploadUrl.pathname).toEqual(`/api/v1/metadata/${tenant}/trainstation/presign-upload`);
		uploadUrl.pathname = `/api/v1/metadata/${tenant}/busstation/presign-upload`;
		const csvBody = 'sensor_id,external_reference\nsensor-via-presign,9001\n';
		await expect(
			axios.put(uploadUrl.toString(), csvBody, {
				headers: {
					'Content-Type': 'text/csv'
				}
			})
		).rejects.toThrow('Request failed with status code 403');

		uploadUrl.pathname = `/api/v1/metadata/${tenant}/busstation/presign-download`;
		await expect(axios.get(uploadUrl.toString())).rejects.toThrow(
			'Request failed with status code 403'
		);
	}
);
