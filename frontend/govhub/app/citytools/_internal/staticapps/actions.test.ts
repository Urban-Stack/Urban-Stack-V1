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
  mutateInstallStaticApp,
  mutateUninstallStaticApp,
} from '@/app/_lib/resource-api/graphql/staticapps';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
import { FORM_NAMES } from '@/app/citytools/_internal/staticapps/form';
import { manageInstallation } from './actions';
import { revalidatePath } from 'next/cache';

jest.mock('@/app/_lib/resource-api/graphql/staticapps', () => ({
  mutateInstallStaticApp: jest.fn(),
  mutateUninstallStaticApp: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const CITYTOOL = 'hamster-shop';

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
    formData.append(FORM_NAMES.name, CITYTOOL);
    formData.append(FORM_NAMES.mode, 'invalid');

    await expect(manageInstallation({}, formData)).rejects.toThrow();
  });

  it("correctly installs static-app if mode is 'install'", async () => {
    (mutateInstallStaticApp as jest.Mock).mockResolvedValue({
      error: undefined,
      data: {
        tenant: {
          createCitytool: { name: CITYTOOL },
        },
      },
    });

    const state = await manageInstallation({}, mkFormData(CITYTOOL, 'install'));

    expect(mutateInstallStaticApp).toHaveBeenCalledWith(CITYTOOL);
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({ data: {} });
  });

  it("correctly uninstalls static-app if mode is 'uninstall'", async () => {
    (mutateUninstallStaticApp as jest.Mock).mockResolvedValue({
      error: undefined,
      data: {
        tenant: {
          deleteCitytool: { name: CITYTOOL },
        },
      },
    });

    const formData = mkFormData(CITYTOOL, 'uninstall');
    const state = await manageInstallation({}, formData);

    expect(mutateUninstallStaticApp).toHaveBeenCalledWith(CITYTOOL);
    expect(revalidatePath).toHaveBeenCalledWith('/citytools');
    expect(state).toEqual({ data: {} });
  });

  it.each([
    {
      mode: 'install',
      mockFn: mutateInstallStaticApp as jest.Mock,
      error: 'Install error',
    },
    {
      mode: 'uninstall',
      mockFn: mutateUninstallStaticApp as jest.Mock,
      error: 'Uninstall error',
    },
  ])(
    'returns error state if $mode mutation returns errors',
    async ({ mode, mockFn, error }) => {
      mockFn.mockResolvedValue({
        error: mkCombinedGraphQLError(error),
        data: undefined,
      });
      const formData = mkFormData(CITYTOOL, mode);

      const state = await manageInstallation({}, formData);

      expect(state).toEqual({ errors: { general: [error] } });
    },
  );
});
