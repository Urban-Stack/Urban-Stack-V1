import test, { expect } from 'playwright/test';
import { checkSQL, runQuery } from './helper/clickhouse';
import { createResources, withSetupClient } from './helper/keycloak';
import { RESOURCE_API } from './helper/urls';
import { RandomTenantManager } from './helper/util';
import { bucketAdminClient } from './helper/bucket';
import { Upload } from '@aws-sdk/lib-storage';

const TENANT_MGR = new RandomTenantManager();

test('a NAMED COLLECTION is created and deleted per project', { tag: '@browserless' }, async () => {
	const tenant = TENANT_MGR.get();
	await createResources([`tenants/${tenant}/projects/pdelete`]);
	const check = () =>
		checkSQL(`SELECT 1 FROM system.named_collections WHERE name = '${tenant}.pdelete'`);
	await check();

	await withSetupClient(async (realmAdminClient) => {
		await realmAdminClient.delete(`${RESOURCE_API}tenants/${tenant}/projects/pdelete`);
	});
	await expect(check).not.toPass();
});

test('a USER is created with S3 permissions per project', { tag: '@browserless' }, async () => {
	const tenant = TENANT_MGR.get();
	await createResources([`tenants/${tenant}/projects/test`]);

	await new Upload({
		client: bucketAdminClient(),
		params: {
			Bucket: `${tenant}.test`,
			Key: `some/key`,
			Body: `a;b;c\n4;5;6`
		}
	}).done();

	await runQuery(`ALTER USER "${tenant}.test" IDENTIFIED BY 'testpw'`);
	await checkSQL(
		`SELECT 1 FROM s3("${tenant}.test", filename='some/key') WHERE b = 5`,
		`${tenant}.test`,
		'testpw'
	);
});
