import {
  mkUserGroupHref,
  scopeString,
} from '@/app/settings/usergroups/_internal/util';

describe('scopeString', () => {
  it('returns admin if admin scope is present', async () => {
    const actual = scopeString({
      granted: ['group:admin'],
    });

    expect(actual).toEqual('Admin');
  });

  it('returns viewer if admin scope is not present', async () => {
    const actual = scopeString({
      granted: ['group:view'],
    });

    expect(actual).toEqual('Betrachter');
  });
});

describe('mkUserGroupHref', () => {
  it('creates correct link', () => {
    const actual = mkUserGroupHref('test-tenant', 'test-group');

    expect(actual).toEqual('/settings/usergroups/test-tenant/test-group');
  });
});
