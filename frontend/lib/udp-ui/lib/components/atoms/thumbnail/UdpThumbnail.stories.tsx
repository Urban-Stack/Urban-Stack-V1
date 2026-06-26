import type { Meta, StoryObj } from '@storybook/react';
import UdpThumbnail from './UdpThumbnail';
import { IcDashboardFallback } from '@/lib/components/icons';
import { KB_LOGO_SRC } from '../../../__test__/images';

const meta = {
  title: 'Atoms/UdpThumbnail',
  component: UdpThumbnail,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: KB_LOGO_SRC,
    isLoading: false,
    className: 'w-96 h-64 rounded-xl',
    classImg: 'size-full p-8',
  },
};

export const NoThumbnail: Story = {
  args: {
    ...Default.args,
    src: undefined,
    isLoading: false,
    altImage: IcDashboardFallback,
    classAlt: 'bg-gray-100 fill-white',
  },
};

export const Loading: Story = {
  args: {
    ...NoThumbnail.args,
    isLoading: true,
  },
};
