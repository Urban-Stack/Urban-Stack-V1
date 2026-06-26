import type { Meta, StoryObj } from '@storybook/react';
import UdpPostPreviewCard from './UdpPostPreviewCard';

const meta = {
  title: 'Molecules/UdpPostPreviewCard/UdpPostPreviewCard',
  component: UdpPostPreviewCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpPostPreviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    date: new Date(2024, 8, 11, 10, 0, 0, 0),
    children: 'This is a preview of the forum submission text.',
    href: 'https://www.google.com',
  },
};

export const Overflow: Story = {
  args: {
    ...Default.args,
    children:
      'This is a preview of the very, very long forum submission text. Lorem ipsum and stuff :)',
    className: 'w-96',
  },
};
