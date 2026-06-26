import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import UdpCard, { UdpCardColor } from './UdpCard';
import { IcFileCircleXMark, IcGlobe, IcHome } from '@/lib/components/icons';

const meta = {
  title: 'Atoms/UdpCard',
  component: UdpCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'radio', options: UdpCardColor },
    icon: {
      options: ['Globe', 'Home', 'none'],
      mapping: {
        Globe: IcGlobe,
        Home: IcHome,
        none: null,
      },
    },
  },
} satisfies Meta<typeof UdpCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const bodyContent = (
  <p className='text-sm'>
    Use cards to group related information and provide clear visual hierarchy
    for your content.
  </p>
);

export const Default: Story = {
  args: {
    title: 'Card title',
    description: 'Short summary that provides a bit more detail.',
    icon: IcGlobe,
    children: bodyContent,
  },
};

export const Success: Story = {
  args: {
    ...Default.args,
    title: 'All systems operational',
    description: 'Everything looks good. Keep up the great work.',
    color: 'success',
  },
};

export const Warning: Story = {
  args: {
    ...Default.args,
    title: 'Heads up',
    description: 'Some checks require your attention to stay on track.',
    color: 'warning',
  },
};

export const Danger: Story = {
  args: {
    ...Default.args,
    title: 'Action required',
    description: 'Critical issues detected. Resolve them as soon as possible.',
    color: 'danger',
    icon: IcFileCircleXMark,
  },
};

export const WithoutHeader: Story = {
  args: {
    children: (
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold'>Custom layout</h3>
        <p className='text-sm text-neutral-600'>
          The card header is optional. Use the children prop to supply fully
          custom content when you need more control.
        </p>
      </div>
    ),
  },
};
