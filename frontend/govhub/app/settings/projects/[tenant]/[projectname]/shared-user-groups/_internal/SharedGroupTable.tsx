'use client';

import PermissionBadge from '@/app/settings/_common/PermissionBadge';
import DeleteBadge from '@/app/settings/_common/DeleteBadge';
import SettingsTable from '@/app/settings/_common/SettingsTable';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import { GroupPermissionTableTestIds as TestIds } from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/testIds';
import { SharedGroup } from '@/app/_lib/resource-api/util/shared-groups';
import React from 'react';
import { IcLinkSlash, UdpToast } from 'udp-ui/components';
import {
  deleteProjectPermission,
  updateProjectPermission,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/actions';
import {
  FORM_UPDATE_NAMES,
  LABEL_BY_PERMISSION,
  LABEL_TO_PERMISSION,
  ShareProjectWithGroupState as PermissionState,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/form';

interface SharedGroupTableProps {
  tenant: string;
  project: string;
  groups: SharedGroup[];
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
        <TableHeadCell>Berechtigungen</TableHeadCell>
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
  group: SharedGroup;
}

const SharedGroupTableItem = ({
  tenant,
  project,
  group,
}: SharedGroupTableItemProps) => (
  <TableRow data-testid={TestIds.row} className='group'>
    <TableCell>{group.name}</TableCell>
    <TableCell>{group.tenant}</TableCell>
    <TableCell className='flex gap-2.5' data-testid={TestIds.permission}>
      <InternalPermissionBadge
        tenant={tenant}
        project={project}
        group={group}
      />
      {group.unknownPermissions && <PermissionNote />}
    </TableCell>
    <TableCell>
      <HoverActionsContainer tenant={tenant} project={project} group={group} />
    </TableCell>
  </TableRow>
);

export const InternalPermissionBadge = ({
  tenant,
  project,
  group,
}: SharedGroupTableItemProps) => (
  <PermissionBadge
    description={`Berechtigung für "${group.name} (${group.tenant})" ändern`}
    radioButtonGroupName={FORM_UPDATE_NAMES.permission}
    labelToPermission={LABEL_TO_PERMISSION}
    labelChecked={LABEL_BY_PERMISSION[group.permissionName]}
    errorsFromState={(state: PermissionState) => state.errors?.general}
    permErrorsFromState={(state: PermissionState) => state.errors?.permission}
    onSubmit={updateProjectPermission.bind(null, tenant, project, group)}
  />
);

const PermissionNote = () => (
  <p
    className='text-xs font-light self-center'
    data-testid={TestIds.permissionNote}
  >
    (Es existieren zusätzliche, nicht unterstütze Freigaben)
  </p>
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
