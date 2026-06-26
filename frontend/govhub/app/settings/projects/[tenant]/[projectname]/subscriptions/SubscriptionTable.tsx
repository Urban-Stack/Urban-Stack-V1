'use client';

import SettingsTable from '@/app/settings/_common/SettingsTable';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tooltip,
} from 'flowbite-react';
import { SensorSubscription } from '@/app/_lib/resource-api/project/subscriptions';
import { SubscriptionTestIds } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/testIds';
import DeleteBadge from '@/app/settings/_common/DeleteBadge';
import React from 'react';
import EditBadge from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/EditBadge';
import { IcTrash, UdpToast } from 'udp-ui/components';
import { deleteSubscription } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/actions';
import { SubscriptionState } from '@/app/__generated__/types';
import { UdpBadge } from 'udp-ui/components';
import { subscriptionStateTranslations } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/util';

const SubscriptionTable = ({
  tenant,
  project,
  subscriptions,
}: {
  tenant: string;
  project: string;
  subscriptions: SensorSubscription[];
}) => (
  <SettingsTable data-testid={SubscriptionTestIds.table}>
    <TableHead>
      <TableRow>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>URI</TableHeadCell>
        <TableHeadCell>Status</TableHeadCell>
        <TableHeadCell>Letzte Nachricht</TableHeadCell>
        <TableHeadCell />
      </TableRow>
    </TableHead>
    <TableBody className={'divide-y text-gray-900'}>
      {subscriptions.map((s) => (
        <SubscriptionTableItem
          key={`${s.name}_${s.config.uri}`}
          tenant={tenant}
          project={project}
          subscription={s}
        />
      ))}
    </TableBody>
  </SettingsTable>
);

interface SubscriptionTableItemProps {
  tenant: string;
  project: string;
  subscription: SensorSubscription;
}

interface SubscriptionConnectionProps {
  name: string;
  error?: string;
  lastMessageTimestamp?: string;
  state: SubscriptionState;
}

const SubscriptionTableItem = ({
  tenant,
  project,
  subscription,
}: SubscriptionTableItemProps) => (
  <TableRow data-testid={SubscriptionTestIds.tableItem} className='group'>
    <TableCell>{subscription.name}</TableCell>
    <TableCell>{subscription.config.uri}</TableCell>
    <TableCell>
      <ConnectionStateContainer
        name={subscription.name}
        error={subscription.connection.error}
        lastMessageTimestamp={subscription.connection.lastMessageTimestamp}
        state={subscription.connection.state}
      />
    </TableCell>
    <TableCell>
      {subscription.connection.lastMessageTimestamp
        ? new Date(subscription.connection.lastMessageTimestamp).toLocaleString(
            'de-DE',
            { timeZone: 'Europe/Berlin' },
          )
        : '—'}
    </TableCell>
    <TableCell className='w-0'>
      <HoverActionsContainer
        tenant={tenant}
        project={project}
        subscription={subscription}
      />
    </TableCell>
  </TableRow>
);

const ConnectionStateContainer = ({
  error,
  state,
}: SubscriptionConnectionProps) => {
  const badge = (
    <UdpBadge className='w-fit' color={error ? 'danger' : 'primary'}>
      {subscriptionStateTranslations[state]}
    </UdpBadge>
  );

  return error ? (
    <div data-testid={SubscriptionTestIds.statusBadge}>
      <Tooltip content={error} className='text-nowrap'>
        {badge}
      </Tooltip>
    </div>
  ) : (
    <div data-testid={SubscriptionTestIds.statusBadge}>{badge}</div>
  );
};

const HoverActionsContainer = ({
  tenant,
  project,
  subscription,
}: SubscriptionTableItemProps) => (
  <div className='flex gap-2.5 group-hover:opacity-100 lg:opacity-0'>
    <EditBadge tenant={tenant} project={project} subscription={subscription} />
    <InternalDeleteBadge
      tenant={tenant}
      project={project}
      subscription={subscription}
    />
  </div>
);

export const InternalDeleteBadge = ({
  tenant,
  project,
  subscription,
}: SubscriptionTableItemProps) => (
  <DeleteBadge
    tooltipText='Subscription löschen'
    title='Sensor Subscription löschen'
    description={`Sensor Subscription "${subscription.name}" löschen?`}
    onSubmit={() => deleteSubscription(tenant, project, subscription.name)}
    onResolved={UdpToast('Subscription erfolgreich gelöscht', 'success')}
    onRejected={UdpToast('Subscription konnte nicht gelöscht werden', 'error')}
    errorsFromState={(state) => state.errors?.general}
  >
    <IcTrash className='size-4' />
  </DeleteBadge>
);

export default SubscriptionTable;
