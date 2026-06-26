'use client';

import React from 'react';
import { IcCheckCircle, IcLinkSlash, UdpButton } from 'udp-ui/components';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { unshareUserGroup } from '@/app/settings/usergroups/actions';
import { PublicUserGroupTestIds } from '@/app/settings/usergroups/[tenant]/[groupname]/public/testIds';

export const PublicGroupInfo = ({ group }: { group: UserGroup }) => (
  <div
    data-testid={PublicUserGroupTestIds.info}
    className='group flex flex-col text-wrap text-primary-700 rounded-2xl p-4 bg-primary-100'
  >
    <div className='flex flex-row gap-2'>
      <IcCheckCircle className='size-5 shrink-0 mt-1' />
      <h3 className='text-lg font-bold'>Benutzergruppe erfolgreich geteilt</h3>
    </div>
    <div className='flex flex-col gap-3'>
      <p>Diese Benutzergruppe ist jetzt für alle Mandanten sichtbar.</p>
      <UdpButton
        className='w-fit'
        icon={IcLinkSlash}
        onClick={() => {
          void unshareUserGroup(group);
        }}
      >
        Teilen aufheben
      </UdpButton>
    </div>
  </div>
);
