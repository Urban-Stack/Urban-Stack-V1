import test from 'playwright/test';
import { withSetupClient } from './helper/keycloak';
import { RESOURCE_API } from './helper/urls';

test(
	'delete test tenants',
	{
		tag: '@delete-tenants'
	},
	async () => {
		// delete all test tenants
		const tenants = await withSetupClient((realmAdminClient) =>
			realmAdminClient.get<string[]>(`${RESOURCE_API}tenants`)
		);
		for (const tenant of tenants.data) {
			if (tenant.startsWith('knuffingen-')) {
				await withSetupClient((realmAdminClient) =>
					realmAdminClient.delete(`${RESOURCE_API}tenants/${tenant}`)
				);
			}
		}
	}
);
