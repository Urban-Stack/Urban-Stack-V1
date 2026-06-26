import type { Meta, StoryObj } from '@storybook/react';
import UdpDashboardCard from './UdpDashboardCard';
import { range } from 'lodash';
import { DASHBOARD_THUMBNAIL_BAUMRADAR_SRC } from '@/lib/__test__/images.ts';

const meta = {
  title: 'Molecules/UdpDashboardCard',
  component: UdpDashboardCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpDashboardCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: 'dashboards/123',
    src: DASHBOARD_THUMBNAIL_BAUMRADAR_SRC,
    title: 'Test Dashboard',
    subtitle: 'Sccon',
    info: 'Zuletzt bearbeitet: 01.04.2025',
    fallbackTitle: 'Unbenanntes Dashboard',
    publicStatus: 'published',
    publicStatusTooltips: {
      published: 'Veröffentlicht',
      intern: 'Intern',
    },
    className: 'w-96',
  },
};

export const Untitled: Story = {
  args: {
    ...Default.args,
    title: undefined,
    publicStatus: 'intern',
  },
};

export const InternWithoutSubtitleAndInfo: Story = {
  args: {
    ...Default.args,
    subtitle: undefined,
    info: undefined,
  },
};

export const WithoutStatusAndFavorite: Story = {
  args: {
    ...Default.args,
    hideFavorite: true,
    publicStatus: undefined,
  },
};

export const Labels: Story = {
  args: {
    ...Default.args,
    tags: ['Tag #1', 'Tag #2', 'Tag #3'],
  },
};

export const Overflow: Story = {
  args: {
    ...Default.args,
    title: 'Overflowing title of this Superset Dashboard',
    tags: range(1, 8).map((i) => `Tag #${i}`),
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    src: undefined,
    isLoading: true,
  },
};
