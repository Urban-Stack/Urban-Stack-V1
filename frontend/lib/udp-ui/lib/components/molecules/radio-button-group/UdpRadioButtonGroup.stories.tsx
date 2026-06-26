import type { Meta, StoryObj } from '@storybook/react';
import UdpRadioButtonGroup from './UdpRadioButtonGroup.tsx';

const meta = {
  title: 'Molecules/Form/UdpRadioButtonGroup',
  component: UdpRadioButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpRadioButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    groupName: 'group-name',
    optionsData: {
      'Option #1': 'value-1',
      'Option #2': 'value-2',
      'Option #3': 'value-3',
    },
  },
};

export const Preselection: Story = {
  args: {
    ...Default.args,
    labelChecked: 'Option #2',
  },
};

export const Errors: Story = {
  args: {
    ...Default.args,
    errors: ['Something went wrong.', 'Another error has occurred.'],
  },
};

export const CustomStyle: Story = {
  args: {
    ...Default.args,
    className: 'flex-row gap-6',
  },
};
