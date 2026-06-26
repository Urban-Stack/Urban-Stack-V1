import { render, within } from '@testing-library/react';
import { query } from '@/app/_lib/resource-api/client';
import DashboardList from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/dashboards/DashboardList';
import { DashboardsTestIds } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/dashboards/testIds';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Dashboard } from '@/app/_lib/resource-api/viz-groups/dashboards';
import { SettingsTestIds } from '@/app/settings/_common/testIds';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  VIZGROUP_DASHBOARDS: 'VIZGROUP_DASHBOARDS',
}));

const mockQuery = query as jest.Mock;

const TENANT = 'tenant1';
const VIZGROUP = 'group1';

const DASHBOARDS: Dashboard[] = [
  {
    name: 'dashboard1',
    slug: 'dashboard1_tenant1',
    vizGroup: VIZGROUP,
    tenant: TENANT,
    _tag: 'Dashboard',
  },
  {
    name: 'dashboard2',
    slug: 'dashboard2_tenant1',
    vizGroup: VIZGROUP,
    tenant: TENANT,
    _tag: 'Dashboard',
  },
  {
    name: 'dashboard3',
    slug: 'dashboard3_tenant1',
    vizGroup: VIZGROUP,
    tenant: TENANT,
    _tag: 'Dashboard',
  },
];

const _mockQuery = (dashboards: Dashboard[], error?: CombinedGraphQLErrors) => {
  mockQuery.mockResolvedValue({
    data: {
      vizGroup: {
        tenant: TENANT,
        vizGroup: VIZGROUP,
        dashboards: dashboards.map((d) => ({ ...d, dashboard: d.name })),
      },
    },
    error,
  });
};

beforeEach(() => {
  mockQuery.mockReset();
});

describe('snapshot', () => {
  it('renders the dashboards list as expected', async () => {
    _mockQuery(DASHBOARDS);
    const { container } = render(
      await DashboardList({ tenant: TENANT, vizGroup: VIZGROUP }),
    );
    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('displays a table when dashboards exist', async () => {
    _mockQuery(DASHBOARDS);

    const component = render(
      await DashboardList({ tenant: TENANT, vizGroup: VIZGROUP }),
    );

    const table = component.getByTestId(DashboardsTestIds.table);
    const rows = within(table).getAllByTestId(DashboardsTestIds.tableItem);
    const fallback = component.queryByTestId(DashboardsTestIds.fallback);

    expect(table).toBeVisible();
    expect(fallback).not.toBeInTheDocument();
    expect(rows).toHaveLength(DASHBOARDS.length);
  });

  it('shows "no dashboards" fallback if no dashboards exist for viz group', async () => {
    _mockQuery([]);

    const component = render(
      await DashboardList({ tenant: TENANT, vizGroup: VIZGROUP }),
    );

    const table = component.queryByTestId(DashboardsTestIds.table);
    const fallback = component.getByTestId(SettingsTestIds.fallback);
    expect(table).not.toBeInTheDocument();
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent('Noch keine Dashboards vorhanden');
    expect(fallback).toHaveTextContent(
      'Es befinden sich noch keine Dashboards in dieser Dashboardgruppe.',
    );
  });

  it('shows "unknown error" fallback if query returns an error', async () => {
    _mockQuery([], new CombinedGraphQLErrors({ errors: [{ message: '' }] }));

    const component = render(
      await DashboardList({ tenant: TENANT, vizGroup: VIZGROUP }),
    );

    const table = component.queryByTestId(DashboardsTestIds.table);
    const fallback = component.getByTestId(SettingsTestIds.fallback);
    expect(table).not.toBeInTheDocument();
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(
      'Dashboards konnten nicht geladen werden',
    );
    expect(fallback).toHaveTextContent(
      'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    );
  });
});
