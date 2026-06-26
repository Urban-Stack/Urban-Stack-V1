import React from 'react';
import { render } from '@testing-library/react';
import EditPublishedQueryPage from './page';
import { NEW_STRING } from './_internal/form';
import { getPublishedQuery } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/action';
import { FuncMock } from '@/app/_test/utils';
import EditForm from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/EditForm';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock('./_internal/EditForm', () => ({
  __esModule: true,
  default: jest.fn(() => <div>EditFormMock</div>),
}));

jest.mock('./_internal/action', () => ({
  getPublishedQuery: jest.fn(),
}));

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(() => 'https://superset.example'),
}));

const getPublishedQueryMock = getPublishedQuery as unknown as FuncMock<
  typeof getPublishedQuery
>;
const getPublicEnvMock = require('@/app/_lib/env').getPublicEnv;

const TENANT = 'tenant1';
const VIZGROUP = 'vizgroup1';
const SUPERSET_URI = 'https://superset.example';

describe('EditPublishedQueryPage', () => {
  beforeEach(() => {
    getPublicEnvMock.mockClear();
  });

  it('calls EditForm with correct props for new query', async () => {
    const params = Promise.resolve({
      tenant: TENANT,
      vizgroup: VIZGROUP,
      name: NEW_STRING,
    });

    render(await EditPublishedQueryPage({ params }));

    expect(EditForm).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: TENANT,
        vizgroup: VIZGROUP,
        queryName: NEW_STRING,
        initialState: {},
        supersetUri: SUPERSET_URI,
      }),
      undefined,
    );
    expect(getPublicEnvMock).toHaveBeenCalledWith('SUPERSET_URI');
  });

  it('calls EditForm with existing query', async () => {
    const EXISTING_NAME = 'existing-query';
    const queryState = {
      data: { name: EXISTING_NAME, sql: 'SELECT * FROM geo' },
    };
    getPublishedQueryMock.mockResolvedValueOnce(queryState);

    const params = Promise.resolve({
      tenant: TENANT,
      vizgroup: VIZGROUP,
      name: EXISTING_NAME,
    });

    render(await EditPublishedQueryPage({ params }));

    expect(EditForm).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: TENANT,
        vizgroup: VIZGROUP,
        queryName: EXISTING_NAME,
        initialState: queryState,
        supersetUri: SUPERSET_URI,
      }),
      undefined,
    );
    expect(getPublicEnvMock).toHaveBeenCalledWith('SUPERSET_URI');
  });
});
