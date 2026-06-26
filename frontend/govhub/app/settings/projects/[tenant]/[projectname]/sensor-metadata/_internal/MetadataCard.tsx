import { UdpCard } from 'udp-ui/components';
import DeleteButton from './DeleteButton';
import { getMetadata } from '@/app/_lib/sensor-metadata/metadata';
import UploadButton from './UploadButton';
import DownloadButton from './DownloadButton';

export const MetadataCard = async ({
  tenant,
  project,
}: {
  tenant: string;
  project: string;
}) => {
  const metadata = await getMetadata(tenant, project);
  const exists = metadata.count > 0;

  const title = exists
    ? 'Sensor-Meta-Daten hochgeladen'
    : 'Noch keine Sensor-Meta-Daten vorhanden';
  const description = exists
    ? 'Eine Datei mit Sensor-Meta-Daten wurde hochgeladen.'
    : 'Laden Sie hier Ihre Sensor-Meta-Daten hoch.';
  const color = exists ? 'primary' : 'warning';

  return (
    <UdpCard title={title} description={description} color={color}>
      <div className='flex gap-3.5'>
        <UploadButton tenant={tenant} project={project} replace={exists} />
        {exists && <DownloadButton tenant={tenant} project={project} />}
        {exists && <DeleteButton tenant={tenant} project={project} />}
      </div>
    </UdpCard>
  );
};

export default MetadataCard;
