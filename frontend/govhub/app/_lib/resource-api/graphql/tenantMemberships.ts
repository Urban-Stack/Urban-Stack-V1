import { graphql } from '@/app/__generated__';
import { query } from '@/app/_lib/resource-api/client';

const FETCH_GROUP_MEMBERSHIPS = graphql(`
  query TenantMemberships {
    keycloakGroupMemberships {
      tenant
    }
  }
`);

export const fetchTenantMemberships: () => Promise<string[]> = async () => {
  const groupMemberships = await query({
    query: FETCH_GROUP_MEMBERSHIPS,
  });

  const tenants = (groupMemberships.data?.keycloakGroupMemberships ?? []).map(
    (g) => g.tenant,
  );
  return [...new Set(tenants)].sort();
};
