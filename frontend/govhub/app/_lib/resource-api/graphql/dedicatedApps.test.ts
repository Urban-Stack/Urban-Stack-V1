import { mutate, query } from '@/app/_lib/resource-api/client';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { FuncMock } from '@/app/_test/utils';
import {
  internal,
  queryDedicatedApps,
  queryContainerInfos,
  mutateInstallDedicatedApp,
  mutateUninstallDedicatedApp,
} from '@/app/_lib/resource-api/graphql/dedicatedApps';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

const TENANT = 'tenant1';
const DEDICATED_APP = 'rei3';

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

describe('queryDedicatedApps', () => {
  it('should call the client with the correct query', async () => {
    await queryDedicatedApps();

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.ALL_AND_INSTALLED_DEDICATEDAPPS,
      variables: {
        tenant: TENANT,
      },
    });
  });
});

describe('queryContainerInfos', () => {
  it('should call the client with the correct query', async () => {
    const name = 'dedicatedApp1';

    await queryContainerInfos(TENANT, name, 10000);

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.GET_CONTAINER_INFOS,
      variables: {
        tenant: TENANT,
        name,
        lines: 10000,
      },
      fetchPolicy: 'network-only',
    });
  });
});

describe('mutateInstallDedicatedApp', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateInstallDedicatedApp(DEDICATED_APP);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.INSTALL_DEDICATEDAPP,
      variables: {
        tenant: TENANT,
        name: DEDICATED_APP,
      },
    });
  });
});

describe('mutateUninstallDedicatedApp', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateUninstallDedicatedApp(DEDICATED_APP);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.UNINSTALL_DEDICATEDAPP,
      variables: {
        tenant: TENANT,
        name: DEDICATED_APP,
      },
    });
  });
});
