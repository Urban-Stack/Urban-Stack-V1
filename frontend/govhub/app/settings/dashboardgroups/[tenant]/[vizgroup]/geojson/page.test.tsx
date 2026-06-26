import { render } from '@testing-library/react';
import GeoJsonPage from './page';
import {
  PublishedQueries,
  queryPublishedQueries,
} from '@/app/_lib/resource-api/graphql/vizGroups';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import QueryTable from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/QueryTable';
import { toPublishedQueries } from '@/app/_lib/resource-api/viz-groups/publishedQueries';
import { NEW_STRING } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/form';
import { getPublicEnv } from '@/app/_lib/env';
import { FuncMock } from '@/app/_test/utils';

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  queryPublishedQueries: jest.fn(),
}));

jest.mock(
  '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/QueryTable',
  () => ({
    __esModule: true,
    default: jest.fn(() => (
      <div data-testid='geojson-query-table'>QueryTable</div>
    )),
  }),
);

const mockQueryPublishedQueries = queryPublishedQueries as jest.Mock;

const TENANT = 'tenant1';
const VIZGROUP = 'group1';

const publishedQueriesResult = {
  data: {
    vizGroup: {
      publishedQueries: [
        {
          publishedQuery: 'query1',
          vizGroup: 'group1',
          tenant: 'tenant1',
          config: { sql: 'SELECT * FROM foo' },
        },
        {
          publishedQuery: 'query2',
          vizGroup: 'group1',
          tenant: 'tenant1',
          config: { sql: 'SELECT * FROM bar' },
        },
      ],
    },
  },
} as unknown as PublishedQueries;

beforeAll(() => {
  getPublicEnvMock.mockReturnValue('https://example.com/');
});

beforeEach(() => {
  jest.clearAllMocks();
});

const getParams = () => Promise.resolve({ tenant: TENANT, vizgroup: VIZGROUP });

describe('fallback', () => {
  it('displays the QueryTable when queries exist', async () => {
    mockQueryPublishedQueries.mockResolvedValue(publishedQueriesResult);

    const component = render(await GeoJsonPage({ params: getParams() }));

    expect(component.getByTestId('geojson-query-table')).toBeVisible();
    expect(
      component.queryByTestId(SettingsTestIds.fallback),
    ).not.toBeInTheDocument();
  });

  it('shows "no queries" fallback if no queries exist', async () => {
    mockQueryPublishedQueries.mockResolvedValue({ data: {}, error: undefined });

    const component = render(await GeoJsonPage({ params: getParams() }));
    const fallback = component.getByTestId(SettingsTestIds.fallback);

    expect(
      component.queryByTestId('geojson-query-table'),
    ).not.toBeInTheDocument();
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(
      'Noch keine erstellten Queries vorhanden',
    );
    expect(fallback).toHaveTextContent(
      'Sie können auf dieser Seite neue Queries erstellen.',
    );
  });

  it('shows "error" fallback if query returns an error', async () => {
    mockQueryPublishedQueries.mockResolvedValue({
      data: {},
      error: new CombinedGraphQLErrors({ errors: [{ message: '' }] }),
    });

    const component = render(await GeoJsonPage({ params: getParams() }));
    const fallback = component.getByTestId(SettingsTestIds.fallback);

    expect(
      component.queryByTestId('geojson-query-table'),
    ).not.toBeInTheDocument();
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(
      'Erstellte Queries konnten nicht geladen werden',
    );
    expect(fallback).toHaveTextContent(
      'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    );
  });
});

describe('content', () => {
  it('calls QueryTable with correct queries', async () => {
    mockQueryPublishedQueries.mockResolvedValue(publishedQueriesResult);

    render(await GeoJsonPage({ params: getParams() }));

    expect(QueryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: TENANT,
        vizGroup: VIZGROUP,
        queries: toPublishedQueries(publishedQueriesResult),
      }),
      undefined,
    );
  });

  it('new query button links to correct page', async () => {
    mockQueryPublishedQueries.mockResolvedValue(publishedQueriesResult);

    const { getByRole } = render(await GeoJsonPage({ params: getParams() }));

    const button = getByRole('button', { name: /Neue Query erstellen/ });
    expect(button).toBeVisible();
    expect(button).toHaveAttribute(
      'href',
      `/settings/dashboardgroups/${TENANT}/${VIZGROUP}/geojson/${NEW_STRING}`,
    );
  });
});
