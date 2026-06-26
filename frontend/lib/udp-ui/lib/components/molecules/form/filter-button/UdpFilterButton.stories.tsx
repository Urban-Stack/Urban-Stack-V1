import React, { useState } from 'react';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import UdpFilterButton, {
  UdpFilterButtonProps,
  UdpFilterOption,
} from './UdpFilterButton';
import { fn } from '@storybook/test';

const initialOptions: UdpFilterOption[] = [
  { id: 'opt1', label: 'Option 1', checked: false },
  { id: 'opt2', label: 'Option 2', checked: false },
  { id: 'opt3', label: 'Option 3', checked: false },
];

const Template: StoryFn<UdpFilterButtonProps> = (args) => {
  const [options, setOptions] = useState<UdpFilterOption[]>(args.options);

  const handleChange = (options: UdpFilterOption[]) => {
    setOptions(options);
    args.onChange?.(options);
  };

  return (
    <div className='h-96'>
      <UdpFilterButton {...args} options={options} onChange={handleChange} />
    </div>
  );
};

const meta = {
  title: 'Molecules/Form/UdpFilterButton',
  component: UdpFilterButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onChange: fn(),
  },
  render: Template,
} satisfies Meta<typeof UdpFilterButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Filter',
    options: initialOptions,
  },
};

export const ScrollForManyOptions: Story = {
  args: {
    label: 'Scroll you will!',
    options: Array.from({ length: 50 }, (_, i) => ({
      id: `option${i + 1}`,
      label: `Option ${i + 1}`,
      checked: false,
    })),
  },
};
