import { query } from '@/app/_lib/resource-api/client';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { render } from '@testing-library/react';
import VizGroupsList from './VizGroupsList';
import VizGroupsTable, {
  VizGroupTableProps,
} from '@/app/settings/dashboardgroups/VizGroupsTable';
import { FuncMock } from '@/app/_test/utils';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { VizGroupTestIds } from '@/app/settings/dashboardgroups/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { ALL_VIZ_GROUPS } from '@/app/_lib/resource-api/graphql/vizGroups';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

const mockQuery = query as jest.Mock;
const MockVizGroupsTable = VizGroupsTable as FuncMock<typeof VizGroupsTable>;

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  ALL_VIZ_GROUPS: 'allVizGroups',
}));
jest.mock('@/app/settings/dashboardgroups/VizGroupsTable', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const VIZ_GROUPS: VizGroup[] = [
  { name: 'vizGroup1', tenant: 'tenant1', _tag: 'VizGroup' },
  { name: 'vizGroup2', tenant: 'tenant1', _tag: 'VizGroup' },
  { name: 'vizGroup3', tenant: 'tenant3', _tag: 'VizGroup' },
];

const SCOPE_MAP: Map<string, Map<string, Scope[]>> = new Map([
  [
    'tenant1',
    new Map<string, Scope[]>([
      ['vizGroup1', ['viz-group:admin']],
      ['vizGroup2', ['viz-group:admin']],
    ]),
  ],
  ['tenant3', new Map<string, Scope[]>([['vizGroup3', ['viz-group:admin']]])],
]);

beforeEach(() => {
  mockQuery.mockReset();
  MockVizGroupsTable.mockReset().mockImplementation(
    ({ vizGroups }: VizGroupTableProps) =>
      vizGroups && (
        <ul>
          {vizGroups.map((v) => (
            <li key={`${v.tenant}_${v.name}`}>
              {v.name} - {v.tenant}
            </li>
          ))}
        </ul>
      ),
  );
});

const mockVizGroupsResult = (
  vizGroups: VizGroup[],
  error?: CombinedGraphQLErrors,
) => {
  mockQuery.mockImplementation(({ query }) =>
    query == ALL_VIZ_GROUPS
      ? {
          data: {
            tenants: vizGroups.map(({ name, tenant }) => ({
              vizGroups: [{ tenant, vizGroup: name }],
            })),
          },
          error,
        }
      : null,
  );
};

it('renders list overview as expected', async () => {
  mockVizGroupsResult(VIZ_GROUPS);

  const { container } = render(
    await VizGroupsList({ scopeMap: SCOPE_MAP, canCreateVizGroup: true }),
  );

  expect(container).toMatchSnapshot();
});

it('calls table with correct viz group entries', async () => {
  mockVizGroupsResult(VIZ_GROUPS);

  render(await VizGroupsList({ scopeMap: SCOPE_MAP, canCreateVizGroup: true }));

  expect(MockVizGroupsTable).toHaveBeenCalledWith(
    { vizGroups: VIZ_GROUPS, scopeMap: SCOPE_MAP },
    undefined,
  );
});

it('shows "no viz groups" fallback if no viz groups retrieved', async () => {
  mockVizGroupsResult([]);

  const component = render(
    await VizGroupsList({ scopeMap: SCOPE_MAP, canCreateVizGroup: true }),
  );

  const table = component.queryByTestId(VizGroupTestIds.table);
  const fallback = component.getByTestId(SettingsTestIds.fallback);

  expect(table).not.toBeInTheDocument();
  expect(fallback).toBeVisible();
  expect(fallback).toHaveTextContent('Noch keine Dashboardgruppen vorhanden');
});

it('shows "fetch error" fallback if error occurs when retrieving viz groups', async () => {
  mockVizGroupsResult(
    [],
    new CombinedGraphQLErrors({ errors: [{ message: '' }] }),
  );

  const component = render(
    await VizGroupsList({ scopeMap: SCOPE_MAP, canCreateVizGroup: true }),
  );

  const table = component.queryByTestId(VizGroupTestIds.table);
  const fallback = component.getByTestId(SettingsTestIds.fallback);

  expect(table).not.toBeInTheDocument();
  expect(fallback).toBeVisible();
  expect(fallback).toHaveTextContent(
    'Dashboardgruppen konnten nicht geladen werden',
  );
});
