import { mkMetadata } from '@/app/meta';
import MetadataCard from './_internal/MetadataCard';

export const generateMetadata = mkMetadata({ pageName: 'Sensor-Meta-Daten' });

const SensorMetadataPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; projectname: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const project = _params.projectname;

  return (
    <div className='size-full'>
      <MetadataCard tenant={tenant} project={project} />
    </div>
  );
};

export default SensorMetadataPage;
