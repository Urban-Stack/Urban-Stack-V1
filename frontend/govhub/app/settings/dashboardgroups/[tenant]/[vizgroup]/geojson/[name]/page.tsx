import { mkMetadata } from '@/app/meta';
import EditForm from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/EditForm';
import {
  NEW_STRING,
  PublishedQueryState,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/form';
import { getPublishedQuery } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/action';
import { getPublicEnv } from '@/app/_lib/env';

export const generateMetadata = mkMetadata({
  pageName: ({ name }) =>
    name === NEW_STRING ? 'Neue Query' : 'Query Bearbeiten',
});

const EditPublishedQueryPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; vizgroup: string; name: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const vizgroup = _params.vizgroup;
  const queryName = _params.name;
  const supersetUri = getPublicEnv('SUPERSET_URI');

  const queryState: PublishedQueryState =
    queryName == NEW_STRING
      ? {}
      : await getPublishedQuery(tenant, vizgroup, queryName);

  return (
    <EditForm
      tenant={tenant}
      vizgroup={vizgroup}
      queryName={queryName}
      initialState={queryState}
      supersetUri={supersetUri}
    />
  );
};

export default EditPublishedQueryPage;
