import type { Meta, StoryObj } from '@storybook/react';
import UdpPostPreviewCardSkeleton from './UdpPostPreviewCardSkeleton';

const meta = {
  title: 'Molecules/UdpPostPreviewCard/UdpPostPreviewCardSkeleton',
  component: UdpPostPreviewCardSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpPostPreviewCardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'w-96',
  },
};
