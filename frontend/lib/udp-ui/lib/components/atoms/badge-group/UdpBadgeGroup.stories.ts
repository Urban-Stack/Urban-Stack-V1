import type { Meta, StoryObj } from '@storybook/react';
import UdpBadgeGroup from './UdpBadgeGroup';

const meta = {
  title: 'Atoms/UdpBadgeGroup',
  component: UdpBadgeGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpBadgeGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    labels: ['Badge #1', 'Badge #2', 'Badge #3'],
  },
};

export const Overflow: Story = {
  args: {
    ...Default.args,
    className: 'w-64 border border-dashed truncate',
  },
};

export const CustomBadges: Story = {
  args: {
    ...Default.args,
    classBadge: 'h-8 rounded-full bg-primary-700 text-white',
  },
};

export const Scrollable: Story = {
  args: {
    labels: [
      'Office',
      'Fachverfahren',
      'Datenanalyse',
      'Bürgerservices',
      'Geoinformation',
      'Intelligent Automation',
      'Apps & Tools',
    ],
    scrollable: true,
    className: 'w-64',
  },
};
