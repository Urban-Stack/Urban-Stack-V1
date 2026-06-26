import type { Meta, StoryObj } from '@storybook/react';
import UdpSpinner from './UdpSpinner';

const meta = {
  title: 'Atoms/UdpSpinner',
  component: UdpSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
