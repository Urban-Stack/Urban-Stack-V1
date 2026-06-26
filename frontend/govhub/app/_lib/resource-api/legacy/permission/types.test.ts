import {
  mkGroupPrincipal,
  mkPermission,
  mkTenantPrincipal,
  Principal,
} from '@/app/_lib/resource-api/legacy/permission/types';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

test('mkTenantPrincipal', () => {
  const tenant = 'tenant';
  const result = mkTenantPrincipal(tenant);
  expect(result).toEqual({ tenant, _tag: 'tenant' });
});

test('mkGroupPrincipal', () => {
  const tenant = 'tenant';
  const group = 'group';
  const result = mkGroupPrincipal(tenant, group);
  expect(result).toEqual({ tenant, group, _tag: 'group' });
});

test('mkPermission', () => {
  const name = 'name';
  const scopes: Scope[] = ['tenant:view'];
  const principals: Principal[] = [mkTenantPrincipal('tenant')];
  const result = mkPermission(name, scopes, principals);
  expect(result).toEqual({ name, scopes, principals, _tag: 'permission' });
});
