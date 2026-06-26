import test, { expect } from 'playwright/test';
import { createResources, withSetupClient } from './helper/keycloak';
import {
	getAuthenticatedAutoprovisioningClient,
	getRandomString,
	RandomTenantManager
} from './helper/util';
import { Upload } from '@aws-sdk/lib-storage';
import { RESOURCE_API, STORAGE, UGH } from './helper/urls';
import axios from 'axios';
import { bucketAdminClient, bucketDatahubAdminClient } from './helper/bucket';
import { GetBucketPolicyCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

const TENANT_MGR = new RandomTenantManager();

test(
	'upload and download',
	{
		tag: '@browserless'
	},
	async ({ browser }) => {
		const tenant = TENANT_MGR.get();
		await createResources([`tenants/${tenant}/projects/p`]);
		const Bucket = `${tenant}.p`;

		const s3 = await bucketDatahubAdminClient(browser);

		const nonpublicPrefix = 'nonpublic';
		const publicPrefix = '_public';
		const nestedPublicPrefix = `${nonpublicPrefix}/${publicPrefix}`;
		for (const prefix of [nonpublicPrefix, publicPrefix, nestedPublicPrefix]) {
			await new Upload({
				client: s3,

				params: {
					Bucket,
					Key: `${prefix}/file.ext`,
					Body: `${prefix}foobar`
				}
			}).done();

			const downloaded = await (
				await s3.getObject({
					Bucket,
					Key: `${prefix}/file.ext`
				})
			).Body.transformToString();

			expect(downloaded).toBe(`${prefix}foobar`);
		}

		expect((await axios.get<string>(`${STORAGE}${Bucket}/${publicPrefix}/file.ext`)).data).toBe(
			'_publicfoobar'
		);
		expect(
			(
				await axios.get<string>(`${STORAGE}${Bucket}/${nonpublicPrefix}/file.ext`, {
					validateStatus: (_) => true
				})
			).status
		).toBe(403);
		expect(
			(
				await axios.get<string>(`${STORAGE}${Bucket}/${nestedPublicPrefix}/file.ext`, {
					validateStatus: (_) => true
				})
			).status
		).toBe(403);

		// ensure projects can be deleted even if they contain objects
		await withSetupClient((realmAdminClient) =>
			realmAdminClient.delete(`${RESOURCE_API}tenants/${tenant}/projects/p`)
		);
		// non-empty buckets are kept
		expect((await axios.get<string>(`${STORAGE}${Bucket}/${publicPrefix}/file.ext`)).data).toBe(
			'_publicfoobar'
		);
		// project re-creation does not fail
		await withSetupClient((realmAdminClient) =>
			realmAdminClient.put(`${RESOURCE_API}tenants/${tenant}/projects/p`)
		);
	}
);

test(
	'bucket creation not allowed',
	{
		tag: '@browserless'
	},
	async ({ browser }) =>
		await expect(
			(await bucketDatahubAdminClient(browser)).createBucket({ Bucket: getRandomString(16) })
		).rejects.toMatchObject({ name: 'AccessDenied' })
);

test(
	'bucket enumeration not allowed',
	{
		tag: '@browserless'
	},
	async ({ browser }) =>
		await expect((await bucketDatahubAdminClient(browser)).listBuckets()).rejects.toMatchObject({
			name: 'AccessDenied'
		})
);

test(
	'_repair request fixes bucket policies',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		await createResources([`tenants/${tenant}/projects/p`]);
		const Bucket = `${tenant}.p`;

		const s3 = bucketAdminClient();

		await s3.send(
			new PutBucketPolicyCommand({
				Bucket,
				Policy: JSON.stringify({ Version: '2012-10-17', Statement: [] })
			})
		);

		expect(
			(
				await (
					await getAuthenticatedAutoprovisioningClient()
				).post<string>(`${RESOURCE_API}_repair`)
			).status
		).toBe(204);

		expect((await s3.send(new GetBucketPolicyCommand({ Bucket }))).Policy).toContain(
			'PrincipalTag'
		);
	}
);

test(
	'--x-s3 buckets are skipped',
	{
		tag: '@browserless'
	},
	async () => {
		// does not 500
		await createResources([`tenants/${TENANT_MGR.get()}/projects/a--x-s3`]);
	}
);

test(
	'CORS is enabled for govhub',
	{
		tag: '@browserless'
	},
	async () => {
		const origin = UGH.replace(/\/$/, '');
		expect(
			(await axios.get(STORAGE, { headers: { origin } })).headers['access-control-allow-origin']
		).toBe(origin);
	}
);
