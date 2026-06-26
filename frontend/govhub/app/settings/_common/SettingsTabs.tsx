'use client';

import React from 'react';
import { UdpScrollWrapper, UdpTabs } from 'udp-ui/components';
import { decomposeRecord } from '@/app/settings/_common/util';
import { usePathname } from 'next/navigation';
import { SettingsTabsTestIds as TestIds } from '@/app/settings/_common/testIds';
import { Breakpoint } from 'udp-ui/tailwind';
import Link from 'next/link';

/**
 * Tabs component connected with the current pathname.
 * <p>
 * This component automatically activates the tab
 * that corresponds to the current pathname or any subpath of it.
 *
 * @param tabsData record of the labels and hrefs for the individual tabs
 * @constructor
 */
const SettingsTabs = ({ tabsData }: { tabsData: Record<string, string> }) => {
  const pathname = usePathname();
  const { data, keys: labels, values: hrefs } = decomposeRecord(tabsData);

  const activeIndex = hrefs.findIndex((href) => pathname.startsWith(href));
  return (
    activeIndex !== -1 && (
      <ResponsiveWrapper>
        <UdpTabs
          tabsData={data}
          activeLabel={labels[activeIndex]}
          as={Link}
          breakpoint={Breakpoint.md}
        />
      </ResponsiveWrapper>
    )
  );
};

export default SettingsTabs;

const ResponsiveWrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    <div className='block md:hidden z-20' data-testid={TestIds.dropdown}>
      {children}
    </div>
    <div className='hidden md:block' data-testid={TestIds.tabBar}>
      <UdpScrollWrapper gradClassName='from-primary-50 w-32'>
        {children}
      </UdpScrollWrapper>
    </div>
  </>
);
