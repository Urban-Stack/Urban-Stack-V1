import { describe, it, expect, beforeAll, vi } from 'vitest';
import { clearEnvVars, setEnvVars } from '../test-utils';
import { _internal } from './env';

const { _getEnv, _memoize } = _internal;

const generateEnv = (envNames: readonly string[]) => {
  const env = {} as Record<string, string>;

  envNames.forEach((key) => {
    env[key] = `VALUE_${key}`;
  });

  return env;
};

const ExamplePublicEnvVar = [
  'AUTH_URL',
  'AUTH_KEYCLOAK_ID',
  'AUTH_KEYCLOAK_ISSUER',
  'KEYCLOAK_URI',
  'DISCOURSE_URI',
  'SUPERSET_URI',
  'GRAPHQL_URI',
  'JUPYTERHUB_URI',
  'CKAN_URI',
] as const;

const ExamplePrivateEnvVar = ['AUTH_KEYCLOAK_SECRET'] as const;

describe.each([[ExamplePublicEnvVar], [ExamplePrivateEnvVar]])(
  '_getEnv',
  (envVars) => {
    describe('Env vars are present', () => {
      const env = generateEnv(envVars);

      beforeAll(() => {
        setEnvVars(env);
      });

      it.each(envVars)('yields %s env var', (envVarName) => {
        const env = generateEnv(envVars);
        const envVar = _getEnv(envVars)(envVarName);
        expect(envVar).toBe(env[envVarName]);
      });
    });

    describe('Env Vars are missing', () => {
      beforeAll(() => {
        clearEnvVars();
      });

      it.each(envVars)('throws when getting %s', (envVarName) => {
        expect(() => _getEnv(envVars)(envVarName)).toThrow();
      });
    });
  },
);

describe('_memoize', () => {
  it('memoizes a function', () => {
    const f = vi.fn().mockReturnValue('result');
    const memoized = _memoize(f);

    expect(memoized('arg1', 'arg2')).toBe('result');
    expect(memoized('arg1', 'arg2')).toBe('result');
    expect(f).toHaveBeenCalledTimes(1);
  });
});
