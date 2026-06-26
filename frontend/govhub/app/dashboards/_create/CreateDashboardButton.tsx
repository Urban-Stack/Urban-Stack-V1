'use client';

import { IcPlus, UdpButton, UdpClientModal } from 'udp-ui/components';
import CreateDashboardForm from '@/app/dashboards/_create/CreateDashboardForm';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';

const CreateDashboardButton = ({
  vizGroups,
  className,
}: {
  vizGroups: VizGroup[];
  className?: string;
}) => (
  <UdpClientModal
    title='Neues Dashboard erstellen'
    content={(modalContentProps) => (
      <CreateDashboardForm vizGroups={vizGroups} {...modalContentProps} />
    )}
    size='xl'
  >
    <UdpButton icon={IcPlus} className={className}>
      Dashboard erstellen
    </UdpButton>
  </UdpClientModal>
);

export default CreateDashboardButton;
