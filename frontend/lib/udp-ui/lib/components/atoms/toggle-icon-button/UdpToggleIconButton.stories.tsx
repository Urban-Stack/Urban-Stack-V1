import type { Meta, StoryObj } from '@storybook/react';
import UdpToggleIconButton from './UdpToggleIconButton';
import { IcStar } from '@/lib/components/icons';

const meta = {
  title: 'Atoms/UdpToggleIconButton',
  component: UdpToggleIconButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'gray',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpToggleIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    outlineIcon: IcStar,
    className: 'bg-white p-1',
  },
};
