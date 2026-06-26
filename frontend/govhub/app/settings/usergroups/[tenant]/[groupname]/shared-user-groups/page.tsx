import { mkMetadata } from '@/app/meta';
import SharedGroupTable from './_internal/SharedGroupTable';
import UserGroupShareButton from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/UserGroupShareButton';
import {
  queryAllUserGroups,
  queryUserGroupPermissions,
} from '@/app/_lib/resource-api/graphql/usergroups';
import { toUserGroups } from '@/app/_lib/resource-api/usergroups/usergroups';
import {
  filterNotAlreadyShared,
  hasUnknownPermissions,
  SharedGroup,
  toSharedGroups,
} from '@/app/_lib/resource-api/util/shared-groups';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';

export const generateMetadata = mkMetadata({
  pageName: 'Freigabe Benutzergruppen',
});

const SharedGroupsPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; groupname: string }>;
}) => {
  const { tenant, groupname } = await params;

  const permissionsResult = await queryUserGroupPermissions(tenant, groupname);
  const allGroups = await queryAllUserGroups();

  const groups = toUserGroups(allGroups);
  const sharedGroups = toSharedGroups(permissionsResult);
  const sharableGroups = filterNotAlreadyShared(groups, sharedGroups).filter(
    (g) => !(g.tenant === tenant && g.name === groupname),
  );

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-end mb-6'>
        <UserGroupShareButton
          tenant={tenant}
          groupName={groupname}
          groups={sharableGroups}
        />
      </div>
      <SharedGroupList
        tenant={tenant}
        groupName={groupname}
        sharedGroups={sharedGroups}
        hasQueryError={!!allGroups.error || !!permissionsResult.error}
        hasUnknownPermission={hasUnknownPermissions(permissionsResult)}
      />
    </div>
  );
};

export default SharedGroupsPage;

interface SharedGroupListProps {
  tenant: string;
  groupName: string;
  sharedGroups: SharedGroup[];
  hasQueryError: boolean;
  hasUnknownPermission: boolean;
}

const SharedGroupList = ({
  tenant,
  groupName,
  sharedGroups,
  hasQueryError,
  hasUnknownPermission,
}: SharedGroupListProps) => {
  const fallbacks: FallbackContext[] = [
    {
      predicate: () => hasQueryError,
      title: 'Freigegebene Gruppen konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => sharedGroups.length < 1 && hasUnknownPermission,
      title: 'Es gibt unbekannte, freigegebene Gruppen',
      description:
        'Bitte kontaktieren Sie einen Administrator mit Zugriff auf die Resource API.',
    },
    {
      predicate: () => sharedGroups.length < 1 && !hasUnknownPermission,
      title: 'Noch keine freigegebenen Gruppen vorhanden',
      description:
        'Sie können die Benutzergruppe hier für eine andere Benutzergruppe freigeben.',
    },
  ];
  return (
    <div className='flex flex-col flex-grow justify-center'>
      <SettingsFallbackWrapper fallbacks={fallbacks}>
        <div className='size-full'>
          <SharedGroupTable
            tenant={tenant}
            groupName={groupName}
            sharedGroups={sharedGroups}
          />
        </div>
      </SettingsFallbackWrapper>
    </div>
  );
};
