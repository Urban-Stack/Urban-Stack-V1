import { z } from 'zod';
import { UserGroupScopes } from '@/app/_lib/resource-api/graphql/usergroups';

export const Scope = z.enum([
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
  'viz-group:view',
] as const);
export type Scope = z.infer<typeof Scope>;

export const groupScopeSet: (scopes: UserGroupScopes) => Set<Scope> = (
  scopes,
) =>
  new Set<Scope>(
    (scopes.data?.group?.scopes.granted as unknown as Scope[] | undefined) ??
      [],
  );
