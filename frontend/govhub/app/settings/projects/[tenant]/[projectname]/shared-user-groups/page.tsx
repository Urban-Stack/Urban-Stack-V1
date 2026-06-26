import { mkMetadata } from '@/app/meta';
import SharedGroupTable from './_internal/SharedGroupTable';
import UserGroupShareButton from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/UserGroupShareButton';
import { queryAllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
import { toUserGroups } from '@/app/_lib/resource-api/usergroups/usergroups';
import { queryProjectGroupPermissions } from '@/app/_lib/resource-api/graphql/project';
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
  params: Promise<{ tenant: string; projectname: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const project = _params.projectname;

  const permissionsResult = await queryProjectGroupPermissions(tenant, project);
  const allGroups = await queryAllUserGroups();

  const groups = toUserGroups(allGroups);
  const sharedGroups = toSharedGroups(permissionsResult);

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-end mb-6'>
        <UserGroupShareButton
          tenant={tenant}
          project={project}
          groups={filterNotAlreadyShared(groups, sharedGroups)}
        />
      </div>
      <SharedGroupList
        tenant={tenant}
        project={project}
        sharedGroups={sharedGroups}
        hasQueryError={!!allGroups.error || !!permissionsResult.error}
        hasUnknownPermission={hasUnknownPermissions(permissionsResult)}
      />
    </div>
  );
};

export default SharedGroupsPage;

interface BodyProps {
  tenant: string;
  project: string;
  sharedGroups: SharedGroup[];
  hasQueryError: boolean;
  hasUnknownPermission: boolean;
}

const SharedGroupList = ({
  tenant,
  project,
  sharedGroups,
  hasQueryError,
  hasUnknownPermission,
}: BodyProps) => {
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
        'Sie können das Projekt hier für eine Benutzergruppe freigeben.',
    },
  ];
  return (
    <div className={'flex flex-col flex-grow justify-center'}>
      <SettingsFallbackWrapper fallbacks={fallbacks}>
        <div className='size-full'>
          <SharedGroupTable
            tenant={tenant}
            project={project}
            groups={sharedGroups}
          />
        </div>
      </SettingsFallbackWrapper>
    </div>
  );
};
