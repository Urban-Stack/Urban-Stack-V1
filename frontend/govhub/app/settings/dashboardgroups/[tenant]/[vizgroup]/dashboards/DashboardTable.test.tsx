import { render } from '@testing-library/react';
import DashboardTable from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/dashboards/DashboardTable';
import { DashboardsTestIds } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/dashboards/testIds';
import { Dashboard } from '@/app/_lib/resource-api/viz-groups/dashboards';

const DASHBOARDS: Dashboard[] = [
  {
    name: 'dashboard1',
    slug: 'dashboard1_tenant1',
    vizGroup: 'group1',
    tenant: 'tenant1',
    _tag: 'Dashboard',
  },
  {
    name: 'dashboard2',
    slug: 'dashboard2_tenant1',
    vizGroup: 'group1',
    tenant: 'tenant1',
    _tag: 'Dashboard',
  },
  {
    name: 'dashboard3',
    slug: 'dashboard3_tenant1',
    vizGroup: 'group1',
    tenant: 'tenant1',
    _tag: 'Dashboard',
  },
];

describe('DashboardTable', () => {
  describe('snapshot', () => {
    it('renders table as expected', () => {
      const { container } = render(<DashboardTable dashboards={DASHBOARDS} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('content', () => {
    it('contains all given dashboard rows', () => {
      const { queryAllByTestId } = render(
        <DashboardTable dashboards={DASHBOARDS} />,
      );

      const rows = queryAllByTestId(DashboardsTestIds.tableItem);
      expect(rows).toHaveLength(DASHBOARDS.length);
    });
  });
});
