import { expect, test } from 'playwright/test';
import { withSetupClient } from './helper/keycloak';
import { RESOURCE_API } from './helper/urls';

test('auto-provisioning', async () => {
	const tenants = await withSetupClient((realmAdminClient) =>
		realmAdminClient.get<string[]>(`${RESOURCE_API}tenants`)
	);
	expect(tenants.data).toContain('guetersloh');
	expect(tenants.data).toContain('detmold');

	const gtAttributes = await withSetupClient((realmAdminClient) =>
		realmAdminClient.get(`${RESOURCE_API}tenants/guetersloh/attributes`)
	);
	expect(gtAttributes.data).toMatchObject({ 'tenant-name': 'Gütersloh' });
	const dtAttributes = await withSetupClient((realmAdminClient) =>
		realmAdminClient.get(`${RESOURCE_API}tenants/detmold/attributes`)
	);
	expect(dtAttributes.data).toMatchObject({ 'tenant-name': 'Detmold' });
});
