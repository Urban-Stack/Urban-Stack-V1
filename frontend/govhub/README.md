# Urban Government Hub Frontend

## Starting dev server

Run the development server:

```shell
pnpm dev
```

## Running Tests

You find multiple npm scripts in the `package.json` file to run tests.

### Snapshot Tests

In addition to unit tests components are covered with https://jestjs.io/docs/snapshot-testing[snapshot tests].

In case you want to update the snapshots run:

```shell
pnpm test:update-snapshot
```

Only run this command after all other tests are passing, and you are sure that the changes are correct.
The `*.snap` files will be updated. Check them for correct changes and commit them.

## Architecture

### Public Env Vars in Client Components

If we need environment variables in the client, we _cannot_ use the [NUXT_PUBLIC prefix](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser), because those env vars need to be available at build time.

Instead, we use `app/_lib/env` to retrieve public env vars in a server component. We can then pass them to the client via props.
