import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { render } from '@testing-library/react';
import VizGroupsTable from '@/app/settings/dashboardgroups/VizGroupsTable';
import { VizGroupTestIds } from '@/app/settings/dashboardgroups/testIds';
import { Scope } from '@/app/_lib/resource-api/permission/scope';
import { redirect, useSearchParams } from 'next/navigation';
import userEvent from '@testing-library/user-event';

const VIZ_GROUPS: VizGroup[] = [
  { name: 'vizGroup1', tenant: 'tenant1', _tag: 'VizGroup' },
  { name: 'vizGroup2', tenant: 'tenant1', _tag: 'VizGroup' },
  { name: 'vizGroup1', tenant: 'tenant3', _tag: 'VizGroup' },
  { name: 'vizGroup3', tenant: 'tenant3', _tag: 'VizGroup' },
];

const ADMIN_SCOPE_MAP: Map<string, Map<string, Scope[]>> = new Map([
  [
    'tenant1',
    new Map<string, Scope[]>([
      ['vizGroup1', ['viz-group:admin']],
      ['vizGroup2', ['viz-group:admin']],
    ]),
  ],
  ['tenant3', new Map<string, Scope[]>([['vizGroup3', ['viz-group:admin']]])],
]);

const READ_SCOPE_MAP: Map<string, Map<string, Scope[]>> = new Map([
  [
    'tenant1',
    new Map<string, Scope[]>([
      ['vizGroup1', ['viz-group:read']],
      ['vizGroup2', ['viz-group:read']],
    ]),
  ],
  ['tenant3', new Map<string, Scope[]>([['vizGroup3', ['viz-group:read']]])],
]);

const MIXED_SCOPE_MAP: Map<string, Map<string, Scope[]>> = new Map([
  [
    'tenant1',
    new Map<string, Scope[]>([
      ['vizGroup1', ['viz-group:admin']],
      ['vizGroup2', ['viz-group:read']],
    ]),
  ],
  [
    'tenant3',
    new Map<string, Scope[]>([
      ['vizGroup1', ['viz-group:read']],
      ['vizGroup3', ['viz-group:read']],
    ]),
  ],
]);

const redirectMock = redirect as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useSearchParams: jest.fn(),
}));

const useSearchParamsMock = useSearchParams as jest.Mock;

beforeEach(() => {
  useSearchParamsMock.mockReset().mockReturnValue(new URLSearchParams());
});

it('renders list overview as expected', async () => {
  const { container } = render(
    <VizGroupsTable vizGroups={VIZ_GROUPS} scopeMap={ADMIN_SCOPE_MAP} />,
  );

  expect(container).toMatchSnapshot();
});

it('contains exactly as many entries as vizGroups given', async () => {
  const component = render(
    <VizGroupsTable vizGroups={VIZ_GROUPS} scopeMap={ADMIN_SCOPE_MAP} />,
  );

  const items = component.queryAllByTestId(VizGroupTestIds.tableItem);
  expect(items).toHaveLength(VIZ_GROUPS.length);
});

describe('disabling works as expected', () => {
  beforeAll(() => {
    redirectMock.mockReset();
  });

  it('fires redirect when clicking on a table row and not disabled', async () => {
    const component = render(
      <VizGroupsTable vizGroups={VIZ_GROUPS} scopeMap={ADMIN_SCOPE_MAP} />,
    );

    const user = userEvent.setup();

    const tableRow = component.getAllByRole('row')[1];

    await user.click(tableRow);

    expect(redirectMock).toHaveBeenCalledTimes(1);
  });

  it('fires redirect when pressing enter on a table row and not disabled', async () => {
    const component = render(
      <VizGroupsTable vizGroups={VIZ_GROUPS} scopeMap={ADMIN_SCOPE_MAP} />,
    );

    const user = userEvent.setup();

    const tableRow = component.getAllByRole('row')[1];
    tableRow.focus();
    await user.keyboard('{Enter}');

    expect(redirectMock).toHaveBeenCalledTimes(1);
  });

  it('does not fire redirect when clicking on a table row and disabled', async () => {
    const component = render(
      <VizGroupsTable vizGroups={VIZ_GROUPS} scopeMap={READ_SCOPE_MAP} />,
    );

    const user = userEvent.setup();

    const tableRow = component.getAllByRole('row')[1];

    await user.click(tableRow);

    expect(redirectMock).toHaveBeenCalledTimes(0);
  });

  it('does fire/not fire for the same vizGroup, but different tenant', async () => {
    const component = render(
      <VizGroupsTable vizGroups={VIZ_GROUPS} scopeMap={MIXED_SCOPE_MAP} />,
    );

    const user = userEvent.setup();

    const adminRow = component.getByRole('row', {
      name: (n) => n.includes('tenant1') && n.includes('vizGroup1'),
    });

    await user.click(adminRow);
    expect(redirectMock).toHaveBeenCalledTimes(1);
    redirectMock.mockClear();

    const readRow = component.getByRole('row', {
      name: (n) => n.includes('tenant3') && n.includes('vizGroup1'),
    });

    await user.click(readRow);
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe('viz-group search', () => {
  it('Filters viz-groups by names matching the search parameter', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('?search=Group1'));
    const component = render(
      <VizGroupsTable vizGroups={VIZ_GROUPS} scopeMap={MIXED_SCOPE_MAP} />,
    );

    const items = component.queryAllByTestId(VizGroupTestIds.tableItem);
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('vizGroup1');
    expect(items[1]).toHaveTextContent('vizGroup1');
  });

  it('Filters viz-groups by tenant matching the search parameter', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('?search=tenant3'));
    const component = render(
      <VizGroupsTable vizGroups={VIZ_GROUPS} scopeMap={MIXED_SCOPE_MAP} />,
    );

    const items = component.queryAllByTestId(VizGroupTestIds.tableItem);
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('tenant3');
    expect(items[1]).toHaveTextContent('tenant3');
  });

  it('Lists no viz-groups when none match the search parameter', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams('?search=qweqfibuds'),
    );
    const component = render(
      <VizGroupsTable vizGroups={VIZ_GROUPS} scopeMap={MIXED_SCOPE_MAP} />,
    );

    const items = component.queryAllByTestId(VizGroupTestIds.tableItem);
    expect(items).toHaveLength(0);
  });
});
