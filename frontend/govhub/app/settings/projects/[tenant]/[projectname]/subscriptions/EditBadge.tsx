import React from 'react';
import { Tooltip } from 'flowbite-react';
import { IcEdit, UdpBadge } from 'udp-ui/components';
import { SensorSubscription } from '@/app/_lib/resource-api/project/subscriptions';
import Link from 'next/link';
import { mkHref } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/util';

const EditBadge = ({
  tenant,
  project,
  subscription,
}: {
  tenant: string;
  project: string;
  subscription: SensorSubscription;
}) => (
  <Tooltip content='Subscription bearbeiten' className='text-nowrap'>
    <UdpBadge
      square
      linkAs={Link}
      href={mkHref(tenant, project, subscription.name)}
    >
      <IcEdit className='size-4' />
    </UdpBadge>
  </Tooltip>
);

export default EditBadge;
