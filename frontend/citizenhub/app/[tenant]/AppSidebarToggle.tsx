'use client';

import { UdpIconButton, IcBars, IcBarsFromLeft } from 'udp-ui/components';
import { useSidebarStore } from '@/app/_store/sidebarStore';

const AppSidebarToggleTestIds = {
  self: 'app-sidebar-toggle',
};

const AppSidebarToggle = () => {
  const { toggle, isOpen } = useSidebarStore();

  return (
    <UdpIconButton
      icon={isOpen ? IcBarsFromLeft : IcBars}
      label='Seitenmenü öffnen'
      color='light'
      classIcon='h-8 w-8'
      onClick={toggle}
      data-testid={AppSidebarToggleTestIds.self}
    />
  );
};

export default AppSidebarToggle;
