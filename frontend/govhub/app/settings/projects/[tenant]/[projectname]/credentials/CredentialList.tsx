import CredentialTable from '@/app/settings/projects/[tenant]/[projectname]/credentials/CredentialTable';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';
import React from 'react';
import { queryAllCredentials } from '@/app/_lib/resource-api/graphql/credentials';
import { toSensorCredential } from '@/app/_lib/resource-api/project/credentials';

const CredentialList = async ({
  tenant,
  project,
}: {
  tenant: string;
  project: string;
}) => {
  const result = await queryAllCredentials(tenant, project);
  const credentials = toSensorCredential(result);

  const fallbacks: FallbackContext[] = [
    {
      predicate: () => !!result.error,
      title: 'Credentials konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => credentials.length < 1,
      title: 'Noch keine Credentials vorhanden',
      description: 'Sie können hier neue Credentials erstellen.',
    },
  ];

  return (
    <SettingsFallbackWrapper fallbacks={fallbacks}>
      <div className='size-full'>
        <CredentialTable
          tenant={tenant}
          project={project}
          credentials={credentials}
        />
      </div>
    </SettingsFallbackWrapper>
  );
};

export default CredentialList;
