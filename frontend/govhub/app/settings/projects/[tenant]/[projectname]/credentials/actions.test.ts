import { FuncMock } from '@/app/_test/utils';
import { revalidatePath } from 'next/cache';
import { FORM_NAMES } from './form';
import {
  createCredential,
  deleteCredential,
  rotateCredential,
} from '@/app/settings/projects/[tenant]/[projectname]/credentials/actions';
import {
  mutateCreateSensorCredential,
  mutateDeleteSensorCredential,
  mutateRotateSensorCredential,
} from '@/app/_lib/resource-api/graphql/credentials';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const mutateCreateSensorCredentialMock =
  mutateCreateSensorCredential as unknown as FuncMock<
    typeof mutateCreateSensorCredential
  >;
const mutateRotateSensorCredentialMock =
  mutateRotateSensorCredential as unknown as FuncMock<
    typeof mutateRotateSensorCredential
  >;
const mutateDeleteSensorCredentialMock =
  mutateDeleteSensorCredential as unknown as FuncMock<
    typeof mutateDeleteSensorCredential
  >;

const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

jest.mock('@/app/_lib/resource-api/graphql/credentials', () => ({
  mutateCreateSensorCredential: jest.fn(),
  mutateRotateSensorCredential: jest.fn(),
  mutateDeleteSensorCredential: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const TENANT = 'tenant-1';
const PROJECT = 'project-1';

beforeEach(() => {
  mutateCreateSensorCredentialMock.mockReset();
  mutateRotateSensorCredentialMock.mockReset();
  mutateDeleteSensorCredentialMock.mockReset();
  revalidatePathMock.mockReset();
});

describe('createCredential', () => {
  const mkFormData: (name: string) => FormData = (name) => {
    const formData: FormData = new FormData();
    formData.append(FORM_NAMES.credentialName, name);
    return formData;
  };

  it('returns parsing errors for invalid form data', async () => {
    const formData = mkFormData('aB');

    const state = await createCredential(TENANT, PROJECT, {}, formData);

    expect(state.errors).toEqual({
      name: [
        'Credential-Name muss mindestens 3 Zeichen beinhalten',
        'Credential-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
      ],
    });
  });

  it('returns general errors if credential creation fails', async () => {
    const formData = mkFormData('valid-name');
    mutateCreateSensorCredentialMock.mockResolvedValueOnce({
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    });

    const state = await createCredential(TENANT, PROJECT, {}, formData);

    expect(state.errors).toEqual({
      general: ['error1', 'error2'],
    });
  });

  describe('successful credential creation', () => {
    const USERNAME = 'username-1';
    const PASSWORD = '123';

    beforeEach(() => {
      mutateCreateSensorCredentialMock.mockResolvedValueOnce({
        data: {
          tenant: {
            project: {
              createSensorCredential: {
                username: USERNAME,
                password: PASSWORD,
              },
            },
          },
        },
      });
    });

    it('invalidates path', async () => {
      const formData = mkFormData('valid-name');

      await createCredential(TENANT, PROJECT, {}, formData);

      expect(revalidatePathMock).toHaveBeenCalledWith(
        `/settings/projects/${TENANT}/${PROJECT}/credentials`,
      );
    });

    it('returns credential data', async () => {
      const formData = mkFormData('valid-name');

      const state = await createCredential(TENANT, PROJECT, {}, formData);

      expect(state.data).toEqual({
        username: USERNAME,
        password: PASSWORD,
      });
    });
  });
});

describe('rotateCredential', () => {
  it('invalidates path and returns data on success', async () => {
    const CREDENTIAL_NAME = 'credential-name';
    const expectedData = {
      username: 'new-username',
      password: 'new-password',
    };

    mutateRotateSensorCredentialMock.mockResolvedValue({
      data: {
        tenant: {
          project: {
            rotateSensorCredential: expectedData,
          },
        },
      },
    });

    const state = await rotateCredential(TENANT, PROJECT, CREDENTIAL_NAME);

    expect(mutateRotateSensorCredentialMock).toHaveBeenCalledWith(
      TENANT,
      PROJECT,
      CREDENTIAL_NAME,
    );

    expect(state.data).toEqual(expectedData);
  });

  it('returns errors if the rotation fails', async () => {
    const CREDENTIAL_NAME = 'credential-name';
    mutateRotateSensorCredentialMock.mockResolvedValue({
      error: mkCombinedGraphQLError('errorA', 'errorB'),
      data: undefined,
    });

    const state = await rotateCredential(TENANT, PROJECT, CREDENTIAL_NAME);

    expect(mutateRotateSensorCredentialMock).toHaveBeenCalledWith(
      TENANT,
      PROJECT,
      CREDENTIAL_NAME,
    );

    expect(state.errors).toEqual({ general: ['errorA', 'errorB'] });
  });
});

describe('deleteCredential', () => {
  it('invalidates path and returns data on success', async () => {
    const CREDENTIAL_NAME = 'credential-name';

    mutateDeleteSensorCredentialMock.mockResolvedValue({
      data: {
        tenant: {
          project: {
            deleteSensorCredential: CREDENTIAL_NAME,
          },
        },
      },
    });

    const state = await deleteCredential(TENANT, PROJECT, CREDENTIAL_NAME);

    expect(mutateDeleteSensorCredentialMock).toHaveBeenCalledWith(
      TENANT,
      PROJECT,
      CREDENTIAL_NAME,
    );

    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/projects/${TENANT}/${PROJECT}/credentials`,
    );

    expect(state.data).toEqual({});
  });

  it('returns errors if the deletion fails', async () => {
    const CREDENTIAL_NAME = 'credential-name';
    mutateDeleteSensorCredentialMock.mockResolvedValue({
      error: mkCombinedGraphQLError('errorA', 'errorB'),
      data: undefined,
    });

    const state = await deleteCredential(TENANT, PROJECT, CREDENTIAL_NAME);

    expect(mutateDeleteSensorCredentialMock).toHaveBeenCalledWith(
      TENANT,
      PROJECT,
      CREDENTIAL_NAME,
    );

    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/projects/${TENANT}/${PROJECT}/credentials`,
    );

    expect(state.errors).toEqual({ general: ['errorA', 'errorB'] });
  });
});
