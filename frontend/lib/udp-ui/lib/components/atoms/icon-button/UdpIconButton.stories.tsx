import type { Meta, StoryObj } from '@storybook/react';
import { IcCog, IcGlobe, IcHome, UdpIconButton } from '@/lib/components';

const meta = {
  title: 'Atoms/UdpIconButton',
  component: UdpIconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      options: ['Cog', 'Globe', 'Home'],
      mapping: {
        Cog: IcCog,
        Globe: IcGlobe,
        Home: IcHome,
      },
    },
  },
} satisfies Meta<typeof UdpIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const CommonProps = {
  color: 'primary',
  icon: IcCog,
  label: 'Button label',
};

export const Default: Story = {
  args: {
    ...CommonProps,
    color: 'primary',
    className: 'p-1 bg-gray-100',
  },
};

export const Light: Story = {
  args: {
    ...CommonProps,
    color: 'light',
    className: 'p-1 bg-gray-100',
  },
};

export const Tertiary: Story = {
  args: {
    ...CommonProps,
    color: 'tertiary',
    className: 'p-1',
  },
};
