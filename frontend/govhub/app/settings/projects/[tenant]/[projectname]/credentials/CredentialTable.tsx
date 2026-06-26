'use client';

import SettingsTable from '@/app/settings/_common/SettingsTable';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import { CredentialTestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';
import RotateBadge from '@/app/settings/projects/[tenant]/[projectname]/credentials/RotateBadge';
import DeleteBadge from '@/app/settings/_common/DeleteBadge';
import { SensorCredential } from '@/app/_lib/resource-api/project/credentials';
import React from 'react';
import { IcTrash, UdpToast } from 'udp-ui/components';
import { deleteCredential } from '@/app/settings/projects/[tenant]/[projectname]/credentials/actions';

const CredentialTable = ({
  tenant,
  project,
  credentials,
}: {
  tenant: string;
  project: string;
  credentials: SensorCredential[];
}) => (
  <SettingsTable data-testid={CredentialTestIds.table}>
    <TableHead>
      <TableRow>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Benutzername</TableHeadCell>
        <TableHeadCell />
      </TableRow>
    </TableHead>
    <TableBody className={'divide-y text-gray-900'}>
      {credentials.map((c) => (
        <CredentialTableItem
          key={`${c.name}_${c.username}`}
          tenant={tenant}
          project={project}
          credential={c}
        />
      ))}
    </TableBody>
  </SettingsTable>
);

interface CredentialTableItemProps {
  tenant: string;
  project: string;
  credential: SensorCredential;
}

const CredentialTableItem = ({
  tenant,
  project,
  credential,
}: CredentialTableItemProps) => (
  <TableRow data-testid={CredentialTestIds.tableItem} className='group'>
    <TableCell>{credential.name}</TableCell>
    <TableCell>{credential.username}</TableCell>
    <TableCell className='w-0'>
      <HoverActionsContainer
        tenant={tenant}
        project={project}
        credential={credential}
      />
    </TableCell>
  </TableRow>
);

const HoverActionsContainer = ({
  tenant,
  project,
  credential,
}: CredentialTableItemProps) => (
  <div className='flex gap-2.5 group-hover:visible lg:invisible'>
    <RotateBadge tenant={tenant} project={project} credential={credential} />
    <InternalDeleteBadge
      tenant={tenant}
      project={project}
      credential={credential}
    />
  </div>
);

export const InternalDeleteBadge = ({
  tenant,
  project,
  credential,
}: CredentialTableItemProps) => (
  <DeleteBadge
    tooltipText='Credentials löschen'
    title='Sensor Credentials löschen'
    description={`Sensor Credentials "${credential.name}" löschen?`}
    onSubmit={() => deleteCredential(tenant, project, credential.name)}
    onResolved={UdpToast('Credentials erfolgreich gelöscht', 'success')}
    onRejected={UdpToast('Credentials konnten nicht gelöscht werden', 'error')}
    errorsFromState={(state) => state.errors?.general}
  >
    <IcTrash className='size-4' />
  </DeleteBadge>
);

export default CredentialTable;
