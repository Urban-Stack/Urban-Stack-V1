import type { Meta, StoryObj } from '@storybook/react';
import UdpTileButton from './UdpTileButton';
import { CreateDashboardIcon } from '@/lib/components/icons';

const meta = {
  title: 'Atoms/UdpTileButton',
  component: UdpTileButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpTileButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: CreateDashboardIcon,
    label: 'Button Text',
  },
};

export const WithLink: Story = {
  args: {
    icon: CreateDashboardIcon,
    label: 'Click me to leave this page',
    href: 'https://www.google.com',
  },
};
