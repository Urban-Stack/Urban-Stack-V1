jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: {},
    signIn: jest.fn(),
    signOut: jest.fn(),
    auth: {},
  })),
}));

jest.mock('next-auth/providers/keycloak', () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: 'keycloak', name: 'Keycloak' })),
}));

jest.mock('@auth/core', () => ({ __esModule: true }));
jest.mock('@auth/core/providers/keycloak', () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: 'keycloak', name: 'Keycloak' })),
}));

import {
  mutateInstallDedicatedApp,
  mutateUninstallDedicatedApp,
} from '@/app/_lib/resource-api/graphql/dedicatedApps';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
import { FORM_NAMES } from '@/app/citytools/_internal/dedicatedapps/form';
import { manageInstallation } from './actions';
import { revalidatePath } from 'next/cache';

jest.mock('@/app/_lib/resource-api/graphql/dedicatedApps', () => ({
  mutateInstallDedicatedApp: jest.fn(),
  mutateUninstallDedicatedApp: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const DEDICATED_APP = 'rei3';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('manageInstallation', () => {
  const mkFormData: (name: string, mode: string) => FormData = (name, mode) => {
    const formData = new FormData();
    formData.append(FORM_NAMES.name, name);
    formData.append(FORM_NAMES.mode, mode);
    return formData;
  };

  it('throws when the form is invalid (this means we have made a mistake in our interface)', async () => {
    const formData = new FormData();
    formData.append(FORM_NAMES.name, DEDICATED_APP);
    formData.append(FORM_NAMES.mode, 'invalid');

    await expect(manageInstallation({}, formData)).rejects.toThrow();
  });

  it("correctly installs dedicated-app if mode is 'install'", async () => {
    (mutateInstallDedicatedApp as jest.Mock).mockResolvedValue({
      error: undefined,
      data: {
        tenant: {
          createDedicatedApp: {
            dedicatedApp: DEDICATED_APP,
            tenant: 'guetersloh',
            url: 'https://dedicated.example.com',
          },
        },
      },
    });

    const state = await manageInstallation(
      {},
      mkFormData(DEDICATED_APP, 'install'),
    );

    expect(mutateInstallDedicatedApp).toHaveBeenCalledWith(DEDICATED_APP);
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({ data: {} });
  });

  it("correctly uninstalls dedicated-app if mode is 'uninstall'", async () => {
    (mutateUninstallDedicatedApp as jest.Mock).mockResolvedValue({
      error: undefined,
      data: {
        tenant: {
          deleteDedicatedApp: DEDICATED_APP,
        },
      },
    });

    const formData = mkFormData(DEDICATED_APP, 'uninstall');
    const state = await manageInstallation({}, formData);

    expect(mutateUninstallDedicatedApp).toHaveBeenCalledWith(DEDICATED_APP);
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({ data: {} });
  });

  it.each([
    {
      mode: 'install',
      mockFn: mutateInstallDedicatedApp as jest.Mock,
      error: 'Install error',
    },
    {
      mode: 'uninstall',
      mockFn: mutateUninstallDedicatedApp as jest.Mock,
      error: 'Uninstall error',
    },
  ])(
    'returns error state if $mode mutation returns errors',
    async ({ mode, mockFn, error }) => {
      mockFn.mockResolvedValue({
        error: mkCombinedGraphQLError(error),
        data: undefined,
      });
      const formData = mkFormData(DEDICATED_APP, mode);

      const state = await manageInstallation({}, formData);

      expect(state).toEqual({ errors: { general: [error] } });
    },
  );
});
