import { ZodError } from 'zod';
import { InstallStaticAppForm, mkState } from './form'; // adjust the path if needed
import {
  StaticAppInstallation,
  InstallStaticApp,
  UnInstallStaticApp,
} from '@/app/_lib/resource-api/graphql/staticapps';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('InstallCityToolForm Schema', () => {
  const valid = {
    name: 'masterportal',
    mode: 'install' as const,
  };

  it('passes with valid data', () => {
    expect(() => InstallStaticAppForm.parse(valid)).not.toThrow();
  });

  describe('name field', () => {
    it('fails when name is missing', () => {
      const { name: _, ...rest } = valid;
      expect(() => InstallStaticAppForm.parse(rest)).toThrow(ZodError);
    });

    it('fails when name is not a string', () => {
      expect(() => InstallStaticAppForm.parse({ ...valid, name: 42 })).toThrow(
        ZodError,
      );
    });
  });

  describe('mode field', () => {
    it('allows "install"', () => {
      expect(() =>
        InstallStaticAppForm.parse({ ...valid, mode: 'install' }),
      ).not.toThrow();
    });

    it('allows "uninstall"', () => {
      expect(() =>
        InstallStaticAppForm.parse({ ...valid, mode: 'uninstall' }),
      ).not.toThrow();
    });

    it.each(['update', undefined])('fails for any other value', (mode) => {
      expect(() => InstallStaticAppForm.parse({ ...valid, mode })).toThrow(
        ZodError,
      );
    });
  });
});

describe('mkState', () => {
  it('maps GraphQL errors into state', () => {
    const result: InstallStaticApp = {
      error: mkCombinedGraphQLError('Boom', 'Kaboom'),
      data: undefined,
    };

    const state = mkState(result);

    expect(state.errors?.general).toEqual(['Boom', 'Kaboom']);
  });

  it('returns a generic error when data is undefined and no GraphQL errors', () => {
    const result: InstallStaticApp = {
      error: undefined,
      data: undefined,
    };

    const state = mkState(result);

    expect(state.errors?.general).toEqual([
      'Ein unbekannter Fehler ist aufgetreten.',
    ]);
  });

  it('returns empty data object on install success', () => {
    const result: InstallStaticApp = {
      error: undefined,
      data: {
        tenant: {
          createCitytool: {
            citytool: 'masterportal',
            path: '/ct/masterportal',
          },
        },
      },
    };

    const state = mkState(result);

    expect(state.errors).toBeUndefined();
    expect(state.data).toEqual({});
  });

  it('returns empty data object on uninstall success', () => {
    const result: UnInstallStaticApp = {
      error: undefined,
      data: {
        tenant: {
          deleteCitytool: 'masterportal',
        },
      },
    };

    const state = mkState(result);

    expect(state.errors).toBeUndefined();
    expect(state.data).toEqual({});
  });

  it('returns a generic error if no error information', () => {
    const result: UnInstallStaticApp = {
      error: undefined,
      data: undefined,
    };

    const state = mkState(result);

    expect(state.errors?.general).toEqual([
      'Ein unbekannter Fehler ist aufgetreten.',
    ]);
  });

  it('returns a generic error if tenant does not have createCitytool or deleteCitytool', () => {
    const result = {
      error: undefined,
      data: {
        tenant: {
          somethingElse: {},
        },
      },
    };

    const state = mkState(result as unknown as StaticAppInstallation);

    expect(state.errors?.general).toEqual([
      'Ein unbekannter Fehler ist aufgetreten.',
    ]);
  });
});
