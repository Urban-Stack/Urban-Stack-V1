import SettingsTable from '@/app/settings/_common/SettingsTable';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import { Dashboard } from '@/app/_lib/resource-api/viz-groups/dashboards';
import { DashboardsTestIds } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/dashboards/testIds';
import { capitalize } from 'udp-ui/string';

const DashboardTable = ({ dashboards }: { dashboards: Dashboard[] }) => (
  <SettingsTable data-testid={DashboardsTestIds.table}>
    <TableHead>
      <TableRow>
        <TableHeadCell>Name</TableHeadCell>
      </TableRow>
    </TableHead>
    <TableBody className={'divide-y text-gray-900'}>
      {dashboards.map((d) => (
        <ListItem key={d.slug} dashboard={d} />
      ))}
    </TableBody>
  </SettingsTable>
);

const ListItem = ({ dashboard }: { dashboard: Dashboard }) => (
  <TableRow data-testid={DashboardsTestIds.tableItem}>
    <TableCell>{capitalize(dashboard.name)}</TableCell>
  </TableRow>
);

export default DashboardTable;
