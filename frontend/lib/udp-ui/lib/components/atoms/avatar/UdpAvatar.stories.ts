import type { Meta, StoryObj } from '@storybook/react';
import UdpAvatar from './UdpAvatar';
import { AVATAR_SRC } from '@/lib/__test__/images.ts';

const meta = {
  title: 'Atoms/UdpAvatar',
  component: UdpAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {
  args: {
    img: AVATAR_SRC,
    status: 'online',
    alt: 'I am an Avatar',
  },
};

export const NoImage: Story = {};
