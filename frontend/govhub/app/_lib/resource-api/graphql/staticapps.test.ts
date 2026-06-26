import { mutate, query } from '@/app/_lib/resource-api/client';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { FuncMock } from '@/app/_test/utils';
import {
  internal,
  mutateInstallStaticApp,
  mutateUninstallStaticApp,
  queryStaticApps,
} from './staticapps';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

const TENANT = 'tenant1';

const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;
const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;

beforeEach(() => {
  mockQuery.mockReset();
  mockMutate.mockReset();
});

beforeAll(() => {
  requireTenantMock.mockResolvedValue(TENANT);
});

describe('queryStaticApps', () => {
  it('should call the client with the correct query', async () => {
    await queryStaticApps();

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.ALL_AND_INSTALLED_STATICAPP,
      variables: {
        tenant: TENANT,
      },
    });
  });
});

describe('mutateInstallStaticApp', () => {
  it('should call the client with the correct mutation', async () => {
    const name = 'staticapp1';

    await mutateInstallStaticApp(name);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.INSTALL_STATICAPP,
      variables: {
        tenant: TENANT,
        name,
        path: name,
      },
    });
  });
});

describe('mutateUnInstallStaticApp', () => {
  it('should call the client with the correct mutation', async () => {
    const name = 'staticapp1';

    await mutateUninstallStaticApp(name);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.UNINSTALL_STATICAPP,
      variables: {
        tenant: TENANT,
        name,
      },
    });
  });
});
