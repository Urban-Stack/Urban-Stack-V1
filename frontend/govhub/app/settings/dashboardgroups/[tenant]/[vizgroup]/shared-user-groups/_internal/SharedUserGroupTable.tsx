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
import { UserGroupPermissionTableTestIds as TestIds } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/testIds';
import { SharedGroup } from '@/app/_lib/resource-api/util/shared-groups';
import React from 'react';
import { IcLinkSlash, UdpToast } from 'udp-ui/components';
import {
  FORM_UPDATE_NAMES,
  LABEL_BY_PERMISSION,
  LABEL_TO_PERMISSION,
  ShareVizGroupWithUserGroupState as PermissionState,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/form';
import {
  deleteVizGroupPermission,
  updateVizGroupPermission,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/actions';

interface SharedGroupTableProps {
  tenant: string;
  vizGroup: string;
  userGroups: SharedGroup[];
}

const SharedUserGroupTable = ({
  tenant,
  vizGroup,
  userGroups,
}: SharedGroupTableProps) => (
  <SettingsTable data-testid={TestIds.self}>
    <TableHead>
      <TableRow>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Tenant</TableHeadCell>
        <TableHeadCell>Berechtigungen</TableHeadCell>
        <TableHeadCell className='w-0' />
      </TableRow>
    </TableHead>
    <TableBody className='divide-y text-gray-900'>
      {userGroups.map((userGroup) => (
        <SharedUserGroupTableItem
          key={`${userGroup.tenant}_${userGroup.name}`}
          tenant={tenant}
          vizGroup={vizGroup}
          userGroup={userGroup}
        />
      ))}
    </TableBody>
  </SettingsTable>
);

interface SharedUserGroupTableItemProps {
  tenant: string;
  vizGroup: string;
  userGroup: SharedGroup;
}

const SharedUserGroupTableItem = ({
  tenant,
  vizGroup,
  userGroup,
}: SharedUserGroupTableItemProps) => (
  <TableRow data-testid={TestIds.row} className='group'>
    <TableCell>{userGroup.name}</TableCell>
    <TableCell>{userGroup.tenant}</TableCell>
    <TableCell className='flex gap-2.5' data-testid={TestIds.permission}>
      <InternalPermissionBadge
        tenant={tenant}
        vizGroup={vizGroup}
        userGroup={userGroup}
      />
      {userGroup.unknownPermissions && <PermissionNote />}
    </TableCell>
    <TableCell>
      <HoverActionsContainer
        tenant={tenant}
        vizGroup={vizGroup}
        userGroup={userGroup}
      />
    </TableCell>
  </TableRow>
);

export const InternalPermissionBadge = ({
  tenant,
  vizGroup,
  userGroup,
}: SharedUserGroupTableItemProps) => (
  <PermissionBadge
    description={`Berechtigung für "${userGroup.name} (${userGroup.tenant})" ändern`}
    radioButtonGroupName={FORM_UPDATE_NAMES.permission}
    labelToPermission={LABEL_TO_PERMISSION}
    labelChecked={LABEL_BY_PERMISSION[userGroup.permissionName]}
    errorsFromState={(state: PermissionState) => state.errors?.general}
    permErrorsFromState={(state: PermissionState) => state.errors?.permission}
    onSubmit={updateVizGroupPermission.bind(null, tenant, vizGroup, userGroup)}
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
  vizGroup,
  userGroup,
}: SharedUserGroupTableItemProps) => (
  <div className='group-hover:opacity-100 lg:opacity-0'>
    <InternalDeleteBadge
      tenant={tenant}
      vizGroup={vizGroup}
      userGroup={userGroup}
    />
  </div>
);

export const InternalDeleteBadge = ({
  tenant,
  vizGroup,
  userGroup,
}: SharedUserGroupTableItemProps & {
  setPopoverOpen?: (open: boolean) => void;
}) => (
  <DeleteBadge
    tooltipText='Berechtigung entfernen'
    title='Berechtigung entfernen'
    description={`Berechtigung für "${userGroup.name} (${userGroup.tenant})" entfernen?`}
    onSubmit={() => deleteVizGroupPermission(tenant, vizGroup, userGroup)}
    onResolved={UdpToast('Berechtigung erfolgreich entfernt', 'success')}
    onRejected={UdpToast('Berechtigung konnte nicht entfernt werden', 'error')}
    errorsFromState={(state) => state.errors?.general}
  >
    <IcLinkSlash className='size-4' />
  </DeleteBadge>
);

export default SharedUserGroupTable;
