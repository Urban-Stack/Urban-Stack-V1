import { mkMetadata } from '@/app/meta';
import { NEW_STRING } from './form';
import EditForm from '@/app/citytools/shared-app/[tenant]/[name]/EditForm';
import { getSharedApp } from '@/app/citytools/shared-app/[tenant]/[name]/actions';

export const generateMetadata = mkMetadata({
  pageName: ({ name }) =>
    name === NEW_STRING ? 'Neue Shared-App' : 'Shared-App Bearbeiten',
});

const EditSharedAppPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; name: string }>;
}) => {
  const { tenant, name } = await params;
  const sharedApp = name === NEW_STRING ? {} : await getSharedApp(tenant, name);
  return (
    <div className='size-full rounded-xl overflow-hidden bg-white p-6'>
      <EditForm tenant={tenant} name={name} state={sharedApp} />
    </div>
  );
};

export default EditSharedAppPage;
