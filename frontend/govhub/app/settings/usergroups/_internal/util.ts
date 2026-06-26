import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';

export const scopeString = (scopes: UserGroup['scopes']) =>
  scopes?.granted?.includes('group:admin') ? 'Admin' : 'Betrachter';

export const mkUserGroupHref: (tenant: string, groupName: string) => string = (
  tenant,
  groupName,
) => `/settings/usergroups/${tenant}/${groupName}`;
