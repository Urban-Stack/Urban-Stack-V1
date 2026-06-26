/* c8 ignore start */

import { CodegenConfig } from '@graphql-codegen/cli';

const GRAPHQL_URI = `https://login${process.env['TARGET_URL_SUFFIX']}/realms/udh/data-hub/graphql`;

const config: CodegenConfig = {
  schema: GRAPHQL_URI,
  documents: 'app/**/*.{ts,tsx}',
  generates: {
    './app/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'graphql',
      },
    },
    './app/__generated__/types.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
    './schema.json': {
      plugins: ['introspection'],
    },
  },
  hooks: {
    afterAllFileWrite: `prettier --write`,
  },
};

export default config;
