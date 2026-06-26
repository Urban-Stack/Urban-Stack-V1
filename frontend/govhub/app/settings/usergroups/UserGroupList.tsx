import { queryAllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
import { toUserGroups } from '@/app/_lib/resource-api/usergroups/usergroups';
import React from 'react';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';
import UserGroupTable from '@/app/settings/usergroups/_internal/UserGroupTable';
import { AllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';

type UserGroupListProps = {
  keycloakBaseUrl: string;
  tenant: string;
  isTenantAdmin?: boolean;
  scopes: AllTenantAndProjectScopes;
};

const UserGroupList = async ({
  keycloakBaseUrl,
  scopes,
  tenant,
  isTenantAdmin = false,
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
          scopes={scopes}
          tenant={tenant}
          isTenantAdmin={isTenantAdmin}
        />
      </div>
    </SettingsFallbackWrapper>
  );
};

export default UserGroupList;
