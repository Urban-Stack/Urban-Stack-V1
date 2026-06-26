'use client';

import { IcDownload, UdpButton } from 'udp-ui/components';
import { createTheme, Tooltip } from 'flowbite-react';
import { MetadataCardTestIds } from '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/testIds';
import { mkDownloadUrl } from '@/app/_lib/sensor-metadata/common';

const DownloadButton = ({
  tenant,
  project,
}: {
  tenant: string;
  project: string;
}) => (
  <Tooltip
    content='Meta-Daten herunterladen'
    placement='bottom'
    className='grow'
    theme={createTheme({ base: 'max-w-96', target: 'flex' })}
  >
    <UdpButton
      color='tertiary'
      href={mkDownloadUrl(tenant, project)}
      icon={IcDownload}
      data-testid={MetadataCardTestIds.downloadButton}
    />
  </Tooltip>
);

export default DownloadButton;
