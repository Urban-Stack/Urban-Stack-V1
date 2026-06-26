import { render } from '@testing-library/react';
import SettingsLayout from '@/app/settings/layout';
import { FuncMock } from '@/app/_test/utils';
import { usePathname } from 'next/navigation';
import React from 'react';
import { getPublicEnv } from '@/app/_lib/env';
import SettingsSidebar from '@/app/settings/SettingsSidebar';
import {
  AllTenantAndProjectScopes,
  GetAllTenantAndProjectScopes,
} from '@/app/_lib/resource-api/graphql/tenant';
import { requireTenant } from '@/app/_lib/resource-api/legacy';

const TEST_KEYCLOAK_URL = 'https://keycloak.example.com';

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

const usePathnameMock: FuncMock<typeof usePathname> =
  usePathname as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const getScopesMock: FuncMock<typeof GetAllTenantAndProjectScopes> =
  GetAllTenantAndProjectScopes as unknown as jest.Mock;

jest.mock('../_lib/resource-api/graphql/tenant', () => ({
  GetAllTenantAndProjectScopes: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));
const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;

beforeEach(() => {
  getPublicEnvMock.mockReset();
  usePathnameMock.mockReset();
  getScopesMock.mockReset();
  requireTenantMock.mockReset();

  getScopesMock.mockResolvedValue({
    data: {
      tenants: [
        {
          tenant: 'test-tenant',
          scopes: {
            all: [],
            granted: ['tenant:admin'],
          },
          projects: [],
          groups: [
            {
              group: 'test-group',
              scopes: {
                all: [],
                granted: ['group:admin'],
              },
            },
          ],
        },
      ],
    },
  } as unknown as AllTenantAndProjectScopes);

  requireTenantMock.mockResolvedValue('test-tenant');
});

jest.mock('@/app/settings/SettingsSidebar', () =>
  jest.fn(({ className }: { className: string }) => (
    <div data-testid='sidebar' className={className}>
      Sidebar
    </div>
  )),
);

jest.mock('udp-ui/components', () => ({
  UdpButton: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

describe('Snapshot', () => {
  const renderLayout = (pathname: string) => {
    usePathnameMock.mockReturnValue(pathname);
    return render(<SettingsLayout>{<div>Content</div>}</SettingsLayout>);
  };

  it('matches snapshot for settings main page', () => {
    const { container } = renderLayout('/settings');

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for settings subpage', () => {
    const { container } = renderLayout('/settings/another-page');

    expect(container).toMatchSnapshot();
  });
});

describe('props', () => {
  it('correct Keycloak URL is passed to the sidebar', async () => {
    getPublicEnvMock.mockImplementation(() => TEST_KEYCLOAK_URL);

    render(await SettingsLayout({}));

    expect(SettingsSidebar).toHaveBeenCalledWith(
      {
        className: expect.anything(),
        keycloakBaseUrl: TEST_KEYCLOAK_URL,
        lockUserManagementLink: false,
        lockTenantSettings: false,
      },
      undefined,
    );
  });
});
