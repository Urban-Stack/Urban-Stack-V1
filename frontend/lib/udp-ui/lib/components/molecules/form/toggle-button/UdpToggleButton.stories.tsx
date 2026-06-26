import { Meta, StoryFn, StoryObj } from '@storybook/react';
import UdpToggleButton, {
  UdpToggleButtonProps,
} from '@/lib/components/molecules/form/toggle-button/UdpToggleButton.tsx';
import { fn } from '@storybook/test';
import { useState } from 'react';

const Template: StoryFn<UdpToggleButtonProps> = ({ checked, ...args }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = () => {
    setIsChecked((current) => !current);
  };
  return (
    <UdpToggleButton {...args} checked={isChecked} onChange={handleChange} />
  );
};

const meta = {
  title: 'Molecules/Form/UdpToggleButton',
  component: UdpToggleButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
    checked: true,
  },
  render: Template,
} satisfies Meta<typeof UdpToggleButton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Checked: Story = {
  args: {
    children: 'Favorites',
  },
};

export const Unchecked: Story = {
  args: {
    children: 'Favorites',
    checked: false,
  },
};
