import { queryAllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
import {
  toUserGroups,
  UserGroup,
} from '@/app/_lib/resource-api/usergroups/usergroups';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';
import React from 'react';
import UserGroupShareButton from '@/app/settings/usergroups/[tenant]/[groupname]/public/UserGroupShareButton';
import { notFound } from 'next/navigation';
import { PublicGroupInfo } from '@/app/settings/usergroups/[tenant]/[groupname]/public/PublicGroupInfo';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata({
  pageName: 'Teilen',
});

const UserGroupPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; groupname: string }>;
}) => {
  const { tenant, groupname } = await params;

  const allGroups = await queryAllUserGroups();
  const userGroups = toUserGroups(allGroups);
  const selectedGroup = userGroups.find(
    (group) => group.name == groupname && group.tenant == tenant,
  );
  if (!selectedGroup) return notFound();

  return (
    <div className='h-full flex flex-col'>
      {!selectedGroup.isShared && (
        <div className='flex justify-end mb-6'>
          <UserGroupShareButton group={selectedGroup} />
        </div>
      )}
      <SharedGroupBox tenant={tenant} userGroup={selectedGroup} />
    </div>
  );
};

export default UserGroupPage;

type BodyProps = {
  tenant: string;
  userGroup: UserGroup;
};

const SharedGroupBox = ({ tenant, userGroup }: BodyProps) => {
  const fallbacks: FallbackContext[] = [
    {
      predicate: () => !userGroup.isShared,
      title: `Benutzergruppe ist nur für den Mandanten "${tenant}" sichtbar`,
      description:
        'Sie können diese Benutzergruppe hier für alle Mandanten sichtbar machen.',
    },
  ];

  return (
    <div className={'flex flex-col flex-grow justify-center'}>
      <SettingsFallbackWrapper fallbacks={fallbacks}>
        <div className='size-full'>
          <PublicGroupInfo group={userGroup} />
        </div>
      </SettingsFallbackWrapper>
    </div>
  );
};
