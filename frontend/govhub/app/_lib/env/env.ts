/* c8 ignore start */
import { getEnv } from 'udp-ui/env';

const PublicEnvVar = [
  'AIDEMO_URI',
  'AUTH_KEYCLOAK_ID',
  'AUTH_KEYCLOAK_ISSUER',
  'AUTH_URL',
  'CITYTOOLS_URI',
  'CKAN_URI',
  'DISCOURSE_URI',
  'DOCS_URI',
  'GRAPHQL_URI',
  'HELPDESK_URI',
  'JUPYTERHUB_URI',
  'KEYCLOAK_URI',
  'PUBQUERY_URI',
  'SENSOR_METADATA_URI',
  'SUPERSET_URI',
  'STORAGE_URI',
  'CITIZENHUB_URI',
] as const;

const PrivateEnvVar = ['AUTH_KEYCLOAK_SECRET'] as const;

/**
 * Retrieves public environment variables.
 * Must be used in server-side code and passed to client components via props.
 * @param name - The name of the environment variable to retrieve.
 * @throws - Throws an error if any required environment variables are missing.
 */
export const getPublicEnv = getEnv(PublicEnvVar);
/**
 * Retrieves private environment variables.
 * This must be used in server-only code and SHOULD NOT be passed to client components via props.
 * @param name - The name of the environment variable to retrieve.
 * @throws - Throws an error if any required environment variables are missing.
 */
export const getPrivateEnv = getEnv(PrivateEnvVar);
