import { mutate, query } from '@/app/_lib/resource-api/client';
import {
  internal,
  mutateCreateSharedApp,
  mutateDeleteSharedApp,
  mutateUpdateSharedApp,
  queryGetContainerInfos,
  queryGetPublicSharedApps,
  queryGetSharedApp,
  queryGetSharedAppsByTenant,
  SharedAppConfig,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import { DeepPartial } from 'ts-essentials';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';
import { CitytoolCategory } from '@/app/__generated__/types';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));

const TENANT = 'tenant1';

const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;

beforeEach(() => {
  mockQuery.mockReset();
  mockMutate.mockReset();
});

describe('queryGetSharedApp', () => {
  it('should call the client with the correct query', async () => {
    const name = 'sharedApp1';

    await queryGetSharedApp(TENANT, name);

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.GET_SHARED_APP,
      variables: {
        tenant: TENANT,
        name,
      },
    });
  });
});

describe('queryGetSharedAppsByTenant', () => {
  it('should call the client with the correct query', async () => {
    await queryGetSharedAppsByTenant(TENANT);

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.GET_SHARED_APPS_BY_TENANT,
      variables: {
        tenant: TENANT,
      },
    });
  });
});

describe('queryGetPublicSharedApps', () => {
  it('should call the client with the correct query', async () => {
    await queryGetPublicSharedApps();

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.GET_PUBLIC_SHARED_APPS,
    });
  });
});

describe('queryGetContainerInfos', () => {
  it('should call the client with the correct query', async () => {
    const name = 'sharedApp1';

    await queryGetContainerInfos(TENANT, name, 10000);

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.GET_CONTAINER_INFOS,
      variables: {
        tenant: TENANT,
        name,
        lines: 10000,
      },
    });
  });
});

describe('mutateCreatedSharedApp', () => {
  it('should call the client with the correct mutation', async () => {
    const name = 'sharedApp1';
    const config = {
      displayName: 'Shared App',
      description: 'A shared app',
      pictureUri: 'https://path/to/image.png',
      categories: CITYTOOL_CATEGORY_ORDER.slice(0, 2),
      adminContact: 'admin@contact.de',
      image: {
        digest: 'sha256:1234567890abcdef',
        repository: 'repo/shared-app',
        registry: 'registry.example.com',
        username: 'user',
        password: 'pass',
      },
    };

    await mutateCreateSharedApp(TENANT, name, config);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.CREATE_SHARED_APP,
      variables: {
        tenant: TENANT,
        name,
        config: {
          displayName: config.displayName,
          description: config.description,
          pictureUri: config.pictureUri,
          categories: config.categories,
          adminContact: config.adminContact,
          imageDigest: config.image.digest,
          imageRepository: config.image.repository,
          imageRegistry: config.image.registry,
          registryUsername: config.image.username,
          registryPassword: config.image.password,
        },
      },
    });
  });
});

describe('mutateUpdateSharedApp', () => {
  it('should call the client with the correct mutation', async () => {
    const name = 'sharedApp1';
    const config: Omit<DeepPartial<SharedAppConfig>, 'categories'> & {
      categories?: CitytoolCategory[];
    } = {
      displayName: 'New Name',
      image: {
        repository: 'repo/shared-app',
      },
    };

    await mutateUpdateSharedApp(TENANT, name, config);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.UPDATE_SHARED_APP,
      variables: {
        tenant: TENANT,
        name,
        config: {
          displayName: config.displayName,
          description: undefined,
          pictureUri: undefined,
          categories: undefined,
          adminContact: undefined,
          imageDigest: undefined,
          imageRepository: config.image?.repository,
          imageRegistry: undefined,
          registryUsername: undefined,
          registryPassword: undefined,
        },
      },
    });
  });
});

describe('mutateDeleteSharedApp', () => {
  it('should call the client with the correct mutation', async () => {
    const name = 'sharedApp1';

    await mutateDeleteSharedApp(TENANT, name);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.DELETE_SHARED_APP,
      variables: {
        tenant: TENANT,
        name,
      },
    });
  });
});
