import type { Meta, StoryObj } from '@storybook/react';
import UdpInfoCard from './UdpInfoCard.tsx';
import { IcChartPie } from '@/lib/components';

const meta = {
  title: 'Molecules/UdpInfoCard',
  component: UdpInfoCard,
  parameters: {
    layout: 'centered',
  },
  args: {},
  tags: ['autodocs'],
} satisfies Meta<typeof UdpInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: IcChartPie,
    title: 'Dashboards\nder Stadt Gütersloh',
    description: 'Hier finden Sie Dashboards\nder Stadt Gütersloh.',
    items: [
      {
        icon: IcChartPie,
        text: 'Stadt Gesundheit',
        href: 'https://www.google.com',
      },
      { icon: IcChartPie, text: 'Umwelt', href: 'https://www.google.com' },
      { icon: IcChartPie, text: 'Verkehr', href: 'https://www.google.com' },
    ],
    linkText: 'Alle Dashboards ansehen',
    linkHref: 'https://www.google.com',
  },
};

export const NoLink: Story = {
  args: {
    ...Default.args,
    linkText: undefined,
    linkHref: undefined,
  },
};

export const LessItemsAndNoLinkButSameHeight: Story = {
  args: {
    ...Default.args,
    items: [
      {
        icon: IcChartPie,
        text: 'Stadt Gesundheit',
        href: 'https://www.google.com',
      },
      { icon: IcChartPie, text: 'Umwelt', href: 'https://www.google.com' },
    ],
    linkText: undefined,
    linkHref: undefined,
  },
};

export const LessItemsWithLinkButSameHeight: Story = {
  args: {
    ...Default.args,
    items: [
      {
        icon: IcChartPie,
        text: 'Stadt Gesundheit',
        href: 'https://www.google.com',
      },
    ],
  },
};

export const CustomClass: Story = {
  args: {
    ...Default.args,
    className: 'border-2 border-cyan-500',
  },
};
