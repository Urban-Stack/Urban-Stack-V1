/* c8 ignore start */
//TODO: include in coverage

import { mkMetadata } from '@/app/meta';
import CredentialList from '@/app/settings/projects/[tenant]/[projectname]/credentials/CredentialList';
import CreateCredentialButton from '@/app/settings/projects/[tenant]/[projectname]/credentials/CreateCredentialButton';

export const generateMetadata = mkMetadata({ pageName: 'Credentials' });

const CredentialsPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; projectname: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const project = _params.projectname;

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-end mb-6'>
        <CreateCredentialButton tenant={tenant} project={project} />
      </div>
      <CredentialList tenant={tenant} project={project} />
    </div>
  );
};

export default CredentialsPage;
