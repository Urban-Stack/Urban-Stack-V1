'use client';

import DeleteBadge from '@/app/settings/_common/DeleteBadge';
import SettingsTable from '@/app/settings/_common/SettingsTable';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import { GroupTableTestIds as TestIds } from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/testIds';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { IcLinkSlash, UdpToast } from 'udp-ui/components';
import { deleteProjectPermission } from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/actions';

interface SharedGroupTableProps {
  tenant: string;
  project: string;
  groups: VizGroup[];
}

const SharedGroupTable = ({
  tenant,
  project,
  groups,
}: SharedGroupTableProps) => (
  <SettingsTable data-testid={TestIds.self}>
    <TableHead>
      <TableRow>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Mandant</TableHeadCell>
        <TableHeadCell className='w-0' />
      </TableRow>
    </TableHead>
    <TableBody className='divide-y text-gray-900'>
      {groups.map((group) => (
        <SharedGroupTableItem
          key={`${group.tenant}_${group.name}`}
          tenant={tenant}
          project={project}
          group={group}
        />
      ))}
    </TableBody>
  </SettingsTable>
);

interface SharedGroupTableItemProps {
  tenant: string;
  project: string;
  group: VizGroup;
}

const SharedGroupTableItem = ({
  tenant,
  project,
  group,
}: SharedGroupTableItemProps) => (
  <TableRow data-testid={TestIds.row} className='group'>
    <TableCell>{group.name}</TableCell>
    <TableCell>{group.tenant}</TableCell>
    <TableCell className='flex gap-2.5'>
      <HoverActionsContainer tenant={tenant} project={project} group={group} />
    </TableCell>
  </TableRow>
);

const HoverActionsContainer = ({
  tenant,
  project,
  group,
}: SharedGroupTableItemProps) => (
  <div className='group-hover:opacity-100 lg:opacity-0'>
    <InternalDeleteBadge tenant={tenant} project={project} group={group} />
  </div>
);

export const InternalDeleteBadge = ({
  tenant,
  project,
  group,
}: SharedGroupTableItemProps) => (
  <DeleteBadge
    tooltipText='Berechtigung entfernen'
    title='Berechtigung entfernen'
    description={`Berechtigung für "${group.name} (${group.tenant})" entfernen?`}
    onSubmit={() => deleteProjectPermission(tenant, project, group)}
    onResolved={UdpToast('Berechtigung erfolgreich entfernt', 'success')}
    onRejected={UdpToast('Berechtigung konnte nicht entfernt werden', 'error')}
    errorsFromState={(state) => state.errors?.general}
  >
    <IcLinkSlash className='size-4' />
  </DeleteBadge>
);

export default SharedGroupTable;
