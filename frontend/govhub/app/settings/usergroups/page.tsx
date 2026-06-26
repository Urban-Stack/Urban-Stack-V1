import { mkMetadata } from '@/app/meta';
import UserGroupList from '@/app/settings/usergroups/UserGroupList';
import CreateUserGroupButton from '@/app/settings/usergroups/_create/CreateUserGroupButton';
import { getPublicEnv } from '@/app/_lib/env';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { GetAllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';
import { isTenantAdmin } from '@/app/_lib/resource-api/permission/scope';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';
import React from 'react';
import { SEARCH_PARAMS } from '@/app/settings/usergroups/common';

export const generateMetadata = mkMetadata({ pageName: 'Benutzergruppen' });

const UserGroupsSettingsPage = async () => {
  const keycloakBaseUrl = getPublicEnv('KEYCLOAK_URI');
  const tenant = await requireTenant();
  const scopes = await GetAllTenantAndProjectScopes();
  const canDeleteOrCreateGroup = isTenantAdmin(scopes, tenant);

  return (
    <div className={'h-full flex flex-col'}>
      <div className='flex flex-wrap gap-4 mb-6'>
        <h2 className='grow-[999] self-end text-2xl font-bold text-gray-900'>
          Benutzergruppen
        </h2>
        {canDeleteOrCreateGroup && (
          <div className='grow'>
            <CreateUserGroupButton />
          </div>
        )}
      </div>
      <AppSearchBar
        placeholder='Benutzergruppen durchsuchen'
        paramKey={SEARCH_PARAMS.search}
        className='mb-4'
      />
      <div className={'flex flex-col flex-grow justify-center'}>
        <UserGroupList
          keycloakBaseUrl={keycloakBaseUrl}
          tenant={tenant}
          isTenantAdmin={canDeleteOrCreateGroup}
          scopes={scopes}
        />
      </div>
    </div>
  );
};

export default UserGroupsSettingsPage;
