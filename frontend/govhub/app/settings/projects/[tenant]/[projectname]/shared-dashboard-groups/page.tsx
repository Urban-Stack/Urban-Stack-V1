import VizGroupShareButton from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/VizGroupShareButton';
import {
  filterNotAlreadyShared,
  fromAllVizGroups,
  toSharedVizGroups,
  VizGroup,
} from '@/app/_lib/resource-api/viz-groups/vizGroups';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';
import { queryProjectVizGroupPermissions } from '@/app/_lib/resource-api/graphql/project';
import { queryAllVizGroups } from '@/app/_lib/resource-api/graphql/vizGroups';
import SharedVizGroupTable from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/_internal/SharedVizGroupTable';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata({
  pageName: 'Freigabe Dashboardgruppen',
});

const ShareVizGroups = async ({
  params,
}: {
  params: Promise<{ tenant: string; projectname: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const project = _params.projectname;

  const permissionsResult = await queryProjectVizGroupPermissions(
    tenant,
    project,
  );
  const allVizGroups = await queryAllVizGroups();

  const vizGroups = fromAllVizGroups(allVizGroups);
  const sharedVizGroups = toSharedVizGroups(permissionsResult);

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-end mb-6'>
        <VizGroupShareButton
          tenant={tenant}
          project={project}
          groups={filterNotAlreadyShared(vizGroups, sharedVizGroups)}
        />
      </div>
      <SharedGroupList
        tenant={tenant}
        project={project}
        sharedGroups={sharedVizGroups}
        hasQueryError={!!permissionsResult.error}
      />
    </div>
  );
};

export default ShareVizGroups;

interface BodyProps {
  tenant: string;
  project: string;
  sharedGroups: VizGroup[];
  hasQueryError: boolean;
}

const SharedGroupList = ({
  tenant,
  project,
  sharedGroups,
  hasQueryError,
}: BodyProps) => {
  const fallbacks: FallbackContext[] = [
    {
      predicate: () => hasQueryError,
      title: 'Freigegebene Gruppen konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => sharedGroups.length < 1,
      title: 'Noch keine freigegebenen Gruppen vorhanden',
      description:
        'Sie können das Projekt hier für eine Dashboardgruppe freigeben.',
    },
  ];
  return (
    <div className={'flex flex-col flex-grow justify-center'}>
      <SettingsFallbackWrapper fallbacks={fallbacks}>
        <div className='size-full'>
          <SharedVizGroupTable
            tenant={tenant}
            project={project}
            groups={sharedGroups}
          />
        </div>
      </SettingsFallbackWrapper>
    </div>
  );
};
