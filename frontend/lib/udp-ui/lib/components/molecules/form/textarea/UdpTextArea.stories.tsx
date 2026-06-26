import type { Meta, StoryObj } from '@storybook/react';
import UdpTextArea from '@/lib/components/molecules/form/textarea/UdpTextArea';
import { fn } from '@storybook/test';

const meta = {
  title: 'Molecules/Form/UdpTextArea',
  component: UdpTextArea,
  tags: ['autodocs'],
} satisfies Meta<typeof UdpTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Empty',
    defaultValue: undefined,
    value: undefined,
    onChange: fn(),
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
