import type { Meta, StoryObj } from '@storybook/react';
import UdpTextInput from '@/lib/components/molecules/form/text-input/UdpTextInput.tsx';
import { fn } from '@storybook/test';
import { IcGlobe, IcSearch } from '@/lib/components';

const meta = {
  title: 'Molecules/Form/UdpTextInput',
  component: UdpTextInput,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      options: ['Globe', 'Search', 'none'],
      mapping: {
        Globe: IcGlobe,
        Search: IcSearch,
        none: null,
      },
    },
  },
} satisfies Meta<typeof UdpTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Empty',
    defaultValue: undefined,
    value: undefined,
    onChange: () => {},
  },
};

export const DefaultValue: Story = {
  args: {
    ...Default.args,
    defaultValue: 'Not empty',
  },
};

export const ControlledValue: Story = {
  args: {
    ...Default.args,
    value: "Can't change me",
  },
};

export const OnChangeLogs: Story = {
  args: {
    ...Default.args,
    defaultValue: 'Change me to log to actions tab',
    onChange: fn(),
  },
};

export const Icon: Story = {
  args: {
    ...Default.args,
    icon: IcGlobe,
  },
};

export const CustomWidthClass: Story = {
  args: {
    ...Default.args,
    className: 'w-1/2',
  },
};

export const HelperText: Story = {
  args: {
    ...Default.args,
    errors: ['Error on line 1', 'Error on line 2'],
  },
};
