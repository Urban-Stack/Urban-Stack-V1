import { mkMetadata } from '@/app/meta';
import SharedUserGroupTable from './_internal/SharedUserGroupTable';
import UserGroupShareButton from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/UserGroupShareButton';
import { queryAllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
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
import { queryVizGroupGroupPermissions } from '@/app/_lib/resource-api/graphql/vizGroups';

export const generateMetadata = mkMetadata({
  pageName: 'Freigabe Benutzergruppen',
});

const SharedUserGroupsPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; vizgroup: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const vizGroup = _params.vizgroup;

  const permissionsResult = await queryVizGroupGroupPermissions(
    tenant,
    vizGroup,
  );
  const allUserGroups = await queryAllUserGroups();

  const userGroups = toUserGroups(allUserGroups);
  const sharedUserGroups = toSharedGroups(permissionsResult);

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-end mb-6'>
        <UserGroupShareButton
          tenant={tenant}
          vizGroup={vizGroup}
          userGroups={filterNotAlreadyShared(userGroups, sharedUserGroups)}
        />
      </div>
      <SharedGroupList
        tenant={tenant}
        vizGroup={vizGroup}
        sharedUserGroups={sharedUserGroups}
        hasQueryError={!!allUserGroups.error || !!permissionsResult.error}
        hasUnknownPermission={hasUnknownPermissions(permissionsResult)}
      />
    </div>
  );
};

export default SharedUserGroupsPage;

interface BodyProps {
  tenant: string;
  vizGroup: string;
  sharedUserGroups: SharedGroup[];
  hasQueryError: boolean;
  hasUnknownPermission: boolean;
}

const SharedGroupList = ({
  tenant,
  vizGroup,
  sharedUserGroups,
  hasQueryError,
  hasUnknownPermission,
}: BodyProps) => {
  const fallbacks: FallbackContext[] = [
    {
      predicate: () => hasQueryError,
      title: 'Freigegebene Benutzergruppen konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => sharedUserGroups.length < 1 && hasUnknownPermission,
      title: 'Es gibt unbekannte, freigegebene Benutzergruppen',
      description:
        'Bitte kontaktieren Sie einen Administrator mit Zugriff auf die Resource API.',
    },
    {
      predicate: () => sharedUserGroups.length < 1 && !hasUnknownPermission,
      title: 'Noch keine freigegebenen Benutzergruppen vorhanden',
      description:
        'Sie können die Dashboardgruppe hier für eine Benutzergruppe freigeben.',
    },
  ];
  return (
    <div className={'flex flex-col flex-grow justify-center'}>
      <SettingsFallbackWrapper fallbacks={fallbacks}>
        <div className='size-full'>
          <SharedUserGroupTable
            tenant={tenant}
            vizGroup={vizGroup}
            userGroups={sharedUserGroups}
          />
        </div>
      </SettingsFallbackWrapper>
    </div>
  );
};
