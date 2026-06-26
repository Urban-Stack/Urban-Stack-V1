import type { Meta, StoryObj } from '@storybook/react';
import UdpButton, { UdpButtonColor, UdpButtonProps } from './UdpButton';
import { fn } from '@storybook/test';
import { IcGlobe, IcHome } from '@/lib/components/icons/';
import { renderLabeledComps } from '@/.storybook/util';
import { IcSearch } from '@/lib/components';

const meta = {
  title: 'Atoms/UdpButton',
  component: UdpButton,
  parameters: {
    layout: 'centered',
  },
  render: renderLabeledComps<typeof UdpButton>([
    {
      Component: ({ children, ...props }) => (
        <UdpButton {...props}>{children}</UdpButton>
      ),
      label: 'button element',
    },
    {
      Component: ({ children, ...props }) => (
        <UdpButton
          {...props}
          href={'https://storybook.js.org/'}
          target={'_blank'}
        >
          {children}
        </UdpButton>
      ),
      label: 'Link element',
    },
  ]),
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'radio', options: UdpButtonColor },
    icon: {
      options: ['Globe', 'Home', 'none'],
      mapping: {
        Globe: IcGlobe,
        Home: IcHome,
        none: null,
      },
    },
  },
  args: {
    color: 'primary',
    onClick: fn() as unknown as UdpButtonProps['onClick'],
  },
} satisfies Meta<typeof UdpButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryButton: Story = {
  args: {
    color: 'primary',
    children: 'Primary Button',
  },
};

export const SecondaryButton: Story = {
  args: {
    color: 'secondary',
    children: 'Secondary Button',
  },
};

export const TertiaryButton: Story = {
  args: {
    color: 'tertiary',
    children: 'Tertiary Button',
  },
};

export const SuccessButton: Story = {
  args: {
    color: 'success',
    children: 'Success Button',
  },
};

export const WarningButton: Story = {
  args: {
    color: 'warning',
    children: 'Warning Button',
  },
};

export const DangerButton: Story = {
  args: {
    color: 'danger',
    children: 'Danger Button',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    color: 'primary',
    children: '"links" do not load',
    loading: true,
  },
};

export const Icon: Story = {
  args: {
    icon: IcHome,
    children: 'Homepage',
  },
};

export const IconOnly: Story = {
  args: {
    icon: IcSearch,
  },
};
