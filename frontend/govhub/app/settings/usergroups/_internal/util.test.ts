import {
  mkUserGroupHref,
  scopeString,
} from '@/app/settings/usergroups/_internal/util';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';

describe('scopeString', () => {
  it('returns admin if admin scope is present', async () => {
    const actual = scopeString({
      granted: ['group:admin'],
    } as UserGroup['scopes']);

    expect(actual).toEqual('Admin');
  });

  it('returns viewer if admin scope is not present', async () => {
    const actual = scopeString({
      granted: ['group:view'],
    } as UserGroup['scopes']);

    expect(actual).toEqual('Betrachter');
  });
});

describe('mkUserGroupHref', () => {
  it('creates correct link', () => {
    const actual = mkUserGroupHref('test-tenant', 'test-group');

    expect(actual).toEqual('/settings/usergroups/test-tenant/test-group');
  });
});
