import { queryAllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
import { toUserGroups } from '@/app/_lib/resource-api/usergroups/usergroups';
import React from 'react';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';
import UserGroupTable from '@/app/settings/usergroups/_internal/UserGroupTable';

type UserGroupListProps = {
  keycloakBaseUrl: string;
  tenant: string;
  isTenantAdmin?: boolean;
  isGroupAdminInAnyTenant?: boolean;
};

const UserGroupList = async ({
  keycloakBaseUrl,
  tenant,
  isTenantAdmin = false,
  isGroupAdminInAnyTenant = false,
}: UserGroupListProps) => {
  const result = await queryAllUserGroups();
  const userGroups = toUserGroups(result);

  const fallbacks: FallbackContext[] = [
    {
      predicate: () => !!result.error,
      title: 'Benutzergruppen konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => userGroups.length < 1,
      title: 'Noch keine Benutzergruppen vorhanden',
      description: isTenantAdmin
        ? 'Sie können hier eine neue Benutzergruppe erstellen.'
        : 'Benutzergruppen, auf die Sie Zugriff haben, werden hier angezeigt.',
    },
  ];
  return (
    <SettingsFallbackWrapper fallbacks={fallbacks}>
      <div className='size-full'>
        <UserGroupTable
          userGroups={userGroups}
          keycloakBaseUrl={keycloakBaseUrl}
          tenant={tenant}
          isTenantAdmin={isTenantAdmin}
          isGroupAdminInAnyTenant={isGroupAdminInAnyTenant}
        />
      </div>
    </SettingsFallbackWrapper>
  );
};

export default UserGroupList;
