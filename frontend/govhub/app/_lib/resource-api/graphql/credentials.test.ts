import {
  internal,
  mutateCreateSensorCredential,
  mutateDeleteSensorCredential,
  mutateRotateSensorCredential,
  queryAllCredentials,
} from '@/app/_lib/resource-api/graphql/credentials';
import { mutate, query } from '@/app/_lib/resource-api/client';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;

beforeEach(() => {
  mockQuery.mockReset();
  mockMutate.mockReset();
});

const TENANT = 'tenant1';
const PROJECT = 'project1';

describe('fetchAllCredentials', () => {
  it('should call the client with the correct query', async () => {
    await queryAllCredentials(TENANT, PROJECT);

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.ALL_CREDENTIALS,
      variables: {
        tenant: TENANT,
        project: PROJECT,
      },
    });
  });
});

describe('mutateCreateSensorCredential', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateCreateSensorCredential(TENANT, PROJECT, 'credential-name');

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.CREATE_SENSOR_CREDENTIAL,
      variables: {
        tenant: TENANT,
        project: PROJECT,
        sensorCredential: 'credential-name',
      },
    });
  });
});

describe('mutateRotateSensorCredential', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateRotateSensorCredential(TENANT, PROJECT, 'credential-name');

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.ROTATE_SENSOR_CREDENTIAL,
      variables: {
        tenant: TENANT,
        project: PROJECT,
        sensorCredential: 'credential-name',
      },
    });
  });
});

describe('deleteSensorCredential', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateDeleteSensorCredential(TENANT, PROJECT, 'credential-name');

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.DELETE_SENSOR_CREDENTIAL,
      variables: {
        tenant: TENANT,
        project: PROJECT,
        sensorCredential: 'credential-name',
      },
    });
  });
});
