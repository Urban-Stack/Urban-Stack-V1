import type { Meta, StoryObj } from '@storybook/react';
import UdpFallback from './UdpFallback';
import {
  NoSearchResultIcon,
  IcPlus,
  NoDashboardsIcon,
  type UdpIcon,
} from '@/lib/components/icons';
import { UdpButton } from '@/lib/components/atoms/button';
import { ReactElement } from 'react';

const customIconFunc: () => ReactElement<void, UdpIcon> = () => (
  <div className={'animate-bounce'}>
    <NoSearchResultIcon className={'rotate-45'} />
  </div>
);

const meta = {
  title: 'Molecules/UdpFallback',
  component: UdpFallback,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      options: ['NoDashboards', 'NoSearchResult', 'custom'],
      mapping: {
        NoDashboards: NoDashboardsIcon,
        NoSearchResult: NoSearchResultIcon,
        custom: customIconFunc,
      },
    },
  },
  args: {},
} satisfies Meta<typeof UdpFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: NoSearchResultIcon,
    title: 'Keine Suchergebnisse gefunden.',
    description:
      'Versuchen Sie einen anderen Suchbegriff oder erstellen Sie eine neue Entität.',
  },
};

export const MultilineDescription: Story = {
  args: {
    ...Default.args,
    description:
      'Versuchen Sie einen anderen Suchbegriff oder\nerstellen Sie eine neue Entität.',
  },
};

export const CustomIcon: Story = {
  args: {
    ...Default.args,
    icon: customIconFunc,
  },
};

export const Children: Story = {
  args: {
    ...Default.args,
    children: [
      UdpButton({
        color: 'tertiary',
        icon: IcPlus,
        children: 'Erstellen einer neuen Entität',
      }),
    ],
  },
};
