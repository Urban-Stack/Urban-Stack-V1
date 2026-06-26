/* c8 ignore start */
import { getEnv } from 'udp-ui/env';

const PublicEnvVar = [
  'AUTH_KEYCLOAK_ID',
  'AUTH_KEYCLOAK_ISSUER',
  'AUTH_URL',
  'GRAPHQL_URI',
  'SUPERSET_URI',
  'CITYTOOLS_URI',
  'CKAN_URI',
  'KEYCLOAK_URI',
] as const;

const PrivateEnvVar = ['AUTH_KEYCLOAK_SECRET'] as const;

export const getPublicEnv = getEnv(PublicEnvVar);

export const getPrivateEnv = getEnv(PrivateEnvVar);
