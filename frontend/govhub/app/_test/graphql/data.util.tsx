import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { SensorSubscription } from '@/app/_lib/resource-api/project/subscriptions';
import { SubscriptionState } from '@/app/__generated__/types';

export const TEST_SUBSCRIPTIONS: SensorSubscription[] = [
  {
    name: 'sub1',
    config: {
      username: 'user1',
      uri: 'uri1',
      topic: 'topic1',
      format: 'direct',
    },
    connection: {
      state: SubscriptionState.Connected,
      lastMessageTimestamp: '2025-10-30T14:52:12.123456789Z',
    },
    _tag: 'SensorSubscription',
  },
  {
    name: 'sub2',
    config: {
      username: 'user1',
      uri: 'uri2',
      topic: 'topic2',
      format: 'lorawan',
    },
    connection: {
      state: SubscriptionState.Connecting,
    },
    _tag: 'SensorSubscription',
  },
  {
    name: 'sub3',
    config: {
      username: 'user1',
      uri: 'uri3',
      topic: 'topic3',
      format: 'zenner',
    },
    connection: {
      state: SubscriptionState.Error,
      lastMessageTimestamp: '2025-10-29T11:30:12.123456789Z',
      error: 'Invalid URL',
    },
    _tag: 'SensorSubscription',
  },
];

export const TEST_USER_GROUPS: readonly UserGroup[] = [
  {
    name: 'test-group-1',
    tenant: 'test-tenant-1',
    keycloakGroupPath: 'test/keycloak/group/path/1',
    scopes: {
      granted: ['group:admin'],
    },
    isShared: false,
    isMember: false,
    _tag: 'UserGroup',
  },
  {
    name: 'test-group-2',
    tenant: 'test-tenant-1',
    keycloakGroupPath: 'test/keycloak/group/path/2',
    scopes: {
      granted: ['group:view'],
    },
    isShared: false,
    isMember: false,
    _tag: 'UserGroup',
  },
  {
    name: 'test-group-3',
    tenant: 'test-tenant-2',
    keycloakGroupPath: 'test/keycloak/group/path/3',
    scopes: {
      granted: ['group:admin', 'group:view'],
    },
    isShared: false,
    isMember: false,
    _tag: 'UserGroup',
  },
  {
    name: 'test-group-4',
    tenant: 'test-tenant-3',
    keycloakGroupPath: 'test/keycloak/group/path/4',
    scopes: {
      granted: [],
    },
    isShared: false,
    isMember: false,
    _tag: 'UserGroup',
  },
];

export const TEST_USER_GROUPS_SHARED: readonly UserGroup[] =
  TEST_USER_GROUPS.map((group) => ({
    ...group,
    isShared: true,
  }));

export const TEST_VIZ_GROUPS: readonly VizGroup[] = [
  {
    name: 'test-group-1',
    tenant: 'test-tenant-1',
    _tag: 'VizGroup',
  },
  {
    name: 'test-group-2',
    tenant: 'test-tenant-1',
    _tag: 'VizGroup',
  },
  {
    name: 'test-group-3',
    tenant: 'test-tenant-2',
    _tag: 'VizGroup',
  },
  {
    name: 'test-group-4',
    tenant: 'test-tenant-3',
    _tag: 'VizGroup',
  },
];
