import {
  mkDashboardResource,
  mkTenantResource,
  mkVizGroupResource,
} from '@/app/_lib/resource-api/legacy/resources';

test('mkTenantResource', async () => {
  const name = 'name';
  const result = mkTenantResource(name);
  expect(result).toEqual({
    _tag: 'tenant',
    name,
  });
});

test('mkVizGroupResource', async () => {
  const tenant = 'tenant';
  const name = 'name';
  const result = mkVizGroupResource(tenant, name);
  expect(result).toEqual({
    _tag: 'viz-group',
    tenant,
    name,
  });
});

test('mkDashboardResource', async () => {
  const tenant = 'tenant';
  const vizGroup = 'vizGroup';
  const name = 'name';
  const result = mkDashboardResource(tenant, vizGroup, name);
  expect(result).toEqual({
    _tag: 'dashboard',
    tenant,
    vizGroup,
    name,
  });
});
