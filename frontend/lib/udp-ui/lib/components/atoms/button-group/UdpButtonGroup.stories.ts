import type { Meta, StoryObj } from '@storybook/react';
import UdpButtonGroup, { UdpButtonGroupDataArray } from './UdpButtonGroup';
import { IcPlus, IcList, IcGrid } from '@/lib/components/icons';

const meta = {
  title: 'Atoms/UdpButtonGroup',
  component: UdpButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    buttonsData: new UdpButtonGroupDataArray(
      {
        icon: IcList,
        label: 'List',
        onSelect: () => {},
      },
      {
        icon: IcPlus,
        label: 'Plus',
        onSelect: () => {},
      },
      {
        icon: IcGrid,
        label: 'Grid',
        onSelect: () => {},
      },
    ),
    indexSelected: 0,
  },
};
