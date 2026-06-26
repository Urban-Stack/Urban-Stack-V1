import type { Meta, StoryObj } from '@storybook/react';
import UdpBadge, { UdpBadgeColor } from './UdpBadge';
import IcLinkSlash from '@/lib/components/icons/outline/IcLinkSlash.tsx';
import { fn } from '@storybook/test';
import { IcArrowUpRightFromSquare } from '@/lib/components';

const meta = {
  title: 'Atoms/UdpBadge',
  component: UdpBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'radio', options: UdpBadgeColor },
  },
} satisfies Meta<typeof UdpBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'default',
  },
};

export const Square: Story = {
  args: {
    square: true,
    children: <IcLinkSlash />,
  },
};

export const Rounded: Story = {
  args: {
    rounded: true,
    children: '3',
  },
};

export const AsLink: Story = {
  args: {
    ...Default.args,
    children: "i'm a link",
    href: 'https://tailwindcss.com',
  },
};

export const AsLinkComp: Story = {
  args: {
    ...Default.args,
    children: "i'm a link",
    href: 'https://tailwindcss.com',
    linkAs: 'a',
  },
};

export const SquareAsLink: Story = {
  args: {
    square: true,
    href: 'http://tailwindcss.com',
    target: '_blank',
    children: <IcArrowUpRightFromSquare />,
  },
};

export const AsButton: Story = {
  args: {
    ...Default.args,
    children: "i'm a button",
    onClick: fn(),
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    children: "i'm disabled",
    disabled: true,
  },
};

export const AsButtonDisabled: Story = {
  args: {
    ...Default.args,
    children: "i'm a disabled button",
    disabled: true,
    onClick: fn(),
  },
};
