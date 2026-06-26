import { Meta, StoryFn, StoryObj } from '@storybook/react';
import UdpTabs, {
  UdpTabBarProps,
} from '@/lib/components/molecules/tabs/UdpTabs.tsx';
import React, { useEffect, useState } from 'react';
import { range } from 'lodash';
import { Breakpoint, BreakpointType } from '@/lib/tailwind/classes';

type StoryArgs = Omit<UdpTabBarProps, 'breakpoint'> & {
  breakpoint: string;
};

const SimulateNavigationWithoutRedirect: StoryFn<StoryArgs> = (args) => {
  const [activeLabel, setActiveLabel] = useState<string>(args.activeLabel);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target?.getAttribute('href')) return;
      e.preventDefault();

      const labels = Object.keys(args.tabsData);
      const hrefs = Object.values(args.tabsData);

      const targetHref = target.getAttribute('href');
      const tabIndex = hrefs.findIndex((href) => href === targetHref);
      if (tabIndex !== -1) {
        setActiveLabel(labels[tabIndex]);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [args.tabsData]);

  const { breakpoint, ...restArgs } = args;
  return (
    <div className='h-72 p-1'>
      <UdpTabs
        {...restArgs}
        activeLabel={activeLabel}
        breakpoint={Breakpoint[breakpoint as BreakpointType]}
      />
    </div>
  );
};

const meta = {
  title: 'Molecules/UdpTabs',
  component: UdpTabs,
  render: SimulateNavigationWithoutRedirect,
  parameters: {
    layout: 'left',
  },
  tags: ['autodocs'],
  argTypes: {
    breakpoint: {
      control: 'radio',
      options: Object.keys(Breakpoint),
    },
  },
  args: {
    breakpoint: 'md',
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const mkTabsData = (labels: string[]) => {
  return Object.fromEntries(
    labels.map((label, idx) => [label, 'subpage/' + idx]),
  );
};

export const Default: Story = {
  args: {
    tabsData: mkTabsData(range(5).map((idx) => 'Tab' + (idx + 1))),
    activeLabel: 'Tab2',
  },
};

/**
 * The reason for this story lies in the fact
 * that the outer tabs of Flowbite's `ListGroup` have special styles
 * that need to be overwritten appropriately.
 */
export const LastActive: Story = {
  args: {
    ...Default.args,
    activeLabel: 'Tab5',
  },
};
