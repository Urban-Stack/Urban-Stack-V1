import type { Meta, StoryObj } from '@storybook/react';
import UdpColorPicker from '@/lib/components/molecules/color-picker/UdpColorPicker.tsx';

const meta = {
  title: 'Molecules/Form/UdpColorPicker',
  component: UdpColorPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    hex: 'A1C3F4',
  },
};
