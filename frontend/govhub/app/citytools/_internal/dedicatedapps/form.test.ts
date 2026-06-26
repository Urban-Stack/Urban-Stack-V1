import { ZodError } from 'zod';
import { InstallDedicatedAppForm, mkState } from './form';
import {
  DedicatedAppInstallation,
  InstallDedicatedApp,
  UnInstallDedicatedApp,
} from '@/app/_lib/resource-api/graphql/dedicatedApps';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

describe('InstallDedicatedAppForm Schema', () => {
  const valid = {
    name: 'rei3',
    mode: 'install' as const,
  };

  it('passes with valid data', () => {
    expect(() => InstallDedicatedAppForm.parse(valid)).not.toThrow();
  });

  describe('name field', () => {
    it('fails when name is missing', () => {
      const { name: _, ...rest } = valid;
      expect(() => InstallDedicatedAppForm.parse(rest)).toThrow(ZodError);
    });

    it('fails when name is not a string', () => {
      expect(() =>
        InstallDedicatedAppForm.parse({ ...valid, name: 42 }),
      ).toThrow(ZodError);
    });
  });

  describe('mode field', () => {
    it('allows "install"', () => {
      expect(() =>
        InstallDedicatedAppForm.parse({ ...valid, mode: 'install' }),
      ).not.toThrow();
    });

    it('allows "uninstall"', () => {
      expect(() =>
        InstallDedicatedAppForm.parse({ ...valid, mode: 'uninstall' }),
      ).not.toThrow();
    });

    it.each(['update', undefined])('fails for any other value', (mode) => {
      expect(() => InstallDedicatedAppForm.parse({ ...valid, mode })).toThrow(
        ZodError,
      );
    });
  });
});

describe('mkState', () => {
  it('maps GraphQL error into state', () => {
    const result: InstallDedicatedApp = {
      error: new CombinedGraphQLErrors({
        errors: [{ message: 'Boom' }, { message: 'Kaboom' }],
      }),
      data: undefined,
    };

    const state = mkState(result);

    expect(state.errors?.general).toEqual(['Boom\nKaboom']);
  });

  it('returns a generic error when data is undefined and no error', () => {
    const result: InstallDedicatedApp = {
      error: undefined,
      data: undefined,
    };

    const state = mkState(result);

    expect(state.errors?.general).toEqual([
      'Ein unbekannter Fehler ist aufgetreten.',
    ]);
  });

  it('returns empty data object on install success', () => {
    const result: InstallDedicatedApp = {
      error: undefined,
      data: {
        tenant: {
          createDedicatedApp: {
            dedicatedApp: 'rei3',
            tenant: 'guetersloh',
            url: 'https://dedicated.example.com',
          },
        },
      },
    };

    const state = mkState(result);

    expect(state.errors).toBeUndefined();
    expect(state.data).toEqual({});
  });

  it('returns empty data object on uninstall success', () => {
    const result: UnInstallDedicatedApp = {
      error: undefined,
      data: {
        tenant: {
          deleteDedicatedApp: 'rei3',
        },
      },
    };

    const state = mkState(result);

    expect(state.errors).toBeUndefined();
    expect(state.data).toEqual({});
  });

  it('returns a generic error if no error information', () => {
    const result: UnInstallDedicatedApp = {
      error: undefined,
      data: undefined,
    };

    const state = mkState(result);

    expect(state.errors?.general).toEqual([
      'Ein unbekannter Fehler ist aufgetreten.',
    ]);
  });

  it('returns a generic error if tenant does not have createDedicatedApp or deleteDedicatedApp', () => {
    const result = {
      error: undefined,
      data: {
        tenant: {
          somethingElse: {},
        },
      },
    };

    const state = mkState(result as unknown as DedicatedAppInstallation);

    expect(state.errors?.general).toEqual([
      'Ein unbekannter Fehler ist aufgetreten.',
    ]);
  });
});
