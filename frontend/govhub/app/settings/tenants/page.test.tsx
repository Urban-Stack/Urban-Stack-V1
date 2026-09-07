import { render } from '@testing-library/react';
import TenantSettingsPage from '@/app/settings/tenants/page';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { FuncMock } from '@/app/_test/utils';
import { TenantSettings } from '@/app/_lib/resource-api/graphql/attributes';
import TenantSettingsContent from '@/app/settings/tenants/TenantSettingsContent';
import { query } from '@/app/_lib/resource-api/client';
import { queryHasTenantScope } from '@/app/_lib/resource-api/graphql/tenant';
import { notFound } from 'next/navigation';

const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;
const mockQuery = query as jest.Mock;

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

jest.mock('@/app/settings/tenants/TenantSettingsContent', () =>
  jest.fn(() => <div>Mocked TenantSettingsContent</div>),
);

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  queryHasTenantScope: jest.fn(),
}));

const notFoundMock = notFound as jest.MockedFunction<() => never>;
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

const queryHasTenantScopeMock = queryHasTenantScope as unknown as jest.Mock;

const mockTenantSettings = {
  data: {
    tenant: {
      tenantDisplayName: 'Test Tenant',
    },
  },
};

beforeEach(() => {
  requireTenantMock.mockResolvedValueOnce('tenant-1');
  mockQuery.mockResolvedValue(mockTenantSettings as TenantSettings);
  queryHasTenantScopeMock.mockResolvedValue(true);
});

describe('TenantSettingsPage', () => {
  it('renders TenantSettingsContent with queried tenantSettings', async () => {
    render(await TenantSettingsPage());

    expect(TenantSettingsContent).toHaveBeenCalledWith(
      { tenantSettings: mockTenantSettings, disabled: false },
      undefined,
    );
  });

  it('redirects away from page if permissions for the current tenant are not sufficient', async () => {
    queryHasTenantScopeMock.mockResolvedValueOnce(false);

    render(await TenantSettingsPage());

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
