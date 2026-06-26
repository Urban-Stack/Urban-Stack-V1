import UdpProgressBar from './UdpProgressBar';
import { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Atoms/UdpProgressBar',
  component: UdpProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    progress: 45,
    className: 'w-96',
  },
};
