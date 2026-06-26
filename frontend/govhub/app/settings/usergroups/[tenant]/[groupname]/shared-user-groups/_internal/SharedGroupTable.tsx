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
import { ShareGroupTableTestIds as TestIds } from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/testIds';
import { SharedGroup } from '@/app/_lib/resource-api/util/shared-groups';
import React from 'react';
import { IcLinkSlash, UdpToast } from 'udp-ui/components';
import {
  deleteUserGroupPermission,
  updateUserGroupPermission,
} from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/actions';
import {
  FORM_UPDATE_NAMES,
  LABEL_BY_PERMISSION,
  LABEL_TO_PERMISSION,
  ShareGroupWithGroupState as PermissionState,
} from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/form';

interface SharedGroupTableProps {
  tenant: string;
  groupName: string;
  sharedGroups: SharedGroup[];
}

const SharedGroupTable = ({
  tenant,
  groupName,
  sharedGroups,
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
      {sharedGroups.map((sharedGroup) => (
        <SharedGroupTableItem
          key={`${sharedGroup.tenant}_${sharedGroup.name}`}
          tenant={tenant}
          groupName={groupName}
          sharedGroup={sharedGroup}
        />
      ))}
    </TableBody>
  </SettingsTable>
);

interface SharedGroupTableItemProps {
  tenant: string;
  groupName: string;
  sharedGroup: SharedGroup;
}

const SharedGroupTableItem = ({
  tenant,
  groupName,
  sharedGroup,
}: SharedGroupTableItemProps) => (
  <TableRow data-testid={TestIds.row} className='group'>
    <TableCell>{sharedGroup.name}</TableCell>
    <TableCell>{sharedGroup.tenant}</TableCell>
    <TableCell className='flex gap-2.5'>
      <InternalPermissionBadge
        tenant={tenant}
        groupName={groupName}
        sharedGroup={sharedGroup}
      />
      {sharedGroup.unknownPermissions && <PermissionNote />}
    </TableCell>
    <TableCell>
      <HoverActionsContainer
        tenant={tenant}
        groupName={groupName}
        sharedGroup={sharedGroup}
      />
    </TableCell>
  </TableRow>
);

export const InternalPermissionBadge = ({
  tenant,
  groupName,
  sharedGroup,
}: SharedGroupTableItemProps) => (
  <PermissionBadge
    description={`Berechtigung für ${sharedGroup.name} (${sharedGroup.tenant}) ändern`}
    radioButtonGroupName={FORM_UPDATE_NAMES.permission}
    labelToPermission={LABEL_TO_PERMISSION}
    labelChecked={LABEL_BY_PERMISSION[sharedGroup.permissionName]}
    errorsFromState={(state: PermissionState) => state.errors?.general}
    permErrorsFromState={(state: PermissionState) => state.errors?.permission}
    onSubmit={updateUserGroupPermission.bind(
      null,
      tenant,
      groupName,
      sharedGroup,
    )}
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
  groupName,
  sharedGroup,
}: SharedGroupTableItemProps) => (
  <div className='group-hover:opacity-100 lg:opacity-0'>
    <InternalDeleteBadge
      tenant={tenant}
      groupName={groupName}
      sharedGroup={sharedGroup}
    />
  </div>
);

export const InternalDeleteBadge = ({
  tenant,
  groupName,
  sharedGroup,
}: SharedGroupTableItemProps) => (
  <DeleteBadge
    tooltipText='Berechtigung entfernen'
    title='Berechtigung entfernen'
    description={`Berechtigung für "${sharedGroup.name} (${sharedGroup.tenant})" entfernen?`}
    onSubmit={() => deleteUserGroupPermission(tenant, groupName, sharedGroup)}
    onResolved={UdpToast('Berechtigung erfolgreich entfernt', 'success')}
    onRejected={UdpToast('Berechtigung konnte nicht entfernt werden', 'error')}
    errorsFromState={(state) => state.errors?.general}
  >
    <IcLinkSlash className='size-4' />
  </DeleteBadge>
);

export default SharedGroupTable;
