import { Meta, StoryFn, StoryObj } from '@storybook/react';
import UdpCityToolCard, {
  StateDataType,
  UdpCityToolCardProps,
} from './UdpCityToolCard';
import { fn } from '@storybook/test';
import React from 'react';

const STATES = [
  {
    type: 'installable',
    typeText: 'Installieren',
    onClick: () => {},
  },
  { type: 'installed', typeText: 'Installiert' },
  {
    type: 'warning',
    typeText: 'Warnung',
    onClick: () => {},
  },
] as StateDataType[];

const STATE_MAP = Object.fromEntries(STATES.map((s) => [s.type, s])) as Record<
  string,
  StateDataType
>;

const CATEGORIES = [
  'Office',
  'Fachverfahren',
  'Datenanalyse',
  'Bürgerservices',
  'Geoinformation',
  'Intelligent Automation',
  'Apps & Tools',
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80';

type StoryArgs = Omit<UdpCityToolCardProps, 'state'> & {
  state: string;
};

const RenderCard: StoryFn<StoryArgs> = (args) => {
  const { state, ...restArgs } = args;
  return <UdpCityToolCard {...restArgs} state={STATE_MAP[state]} />;
};

const meta = {
  title: 'Molecules/UdpCityToolCard',
  component: UdpCityToolCard,
  render: RenderCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: { control: 'radio', options: Object.keys(STATE_MAP) },
  },
  args: {
    state: 'installable',
    editBadge: { action: fn(), tooltipText: 'City Tool bearbeiten' },
    removeBadge: {
      action: fn(),
      tooltipText: 'City Tool entfernen',
    },
    pictureUri:
      'https://img.freepik.com/darmowe-zdjecie/luneta-obserwacyjna-na-tarasie-widokowym-gory-slivnica-z-widokiem-na-doline_181624-25659.jpg',
    fallbackImage: FALLBACK_IMAGE,
    categories: ['Office', 'Apps & Tools'],
    className: 'w-[556px]',
  },
  tags: ['autodocs'],
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Baumradar',
    href: 'https://www.google.com',
    state: 'installed' as StateDataType & string,
    description:
      'Innovative Anwendung zur Überwachung und Verwaltung von städtischen Bäumen. Sie bietet eine präzise Erfassung des Baumzustandes, optimiert die Wartung und sorgt für eine nachhaltige Pflege der urbanen Grünflächen.',
    installation: { count: 11, countToText: (n) => `${n} Installationen` },
    creator: 'public-shared-app',
    creatorTooltip: 'Von einer anderen Stadt erstellt',
  },
};

export const Installable: Story = {
  args: {
    ...Default.args,
    href: undefined,
    state: 'installable' as StateDataType & string,
    installation: undefined,
    removeBadge: undefined,
  },
};

export const NoImage: Story = {
  args: {
    ...Default.args,
    pictureUri: undefined,
  },
};

export const Overflow: Story = {
  args: {
    ...Default.args,
    title: 'Overflowing title of Lorem ipsum City Tool',
    contact: {
      mail: 'frighteningly.long.email.address@do.not.use.it',
      prefixText: 'Ansprechpartner:',
    },
  },
};

export const IsLoading: Story = {
  args: {
    ...Installable.args,
    isLoading: true,
  },
};

export const Contact: Story = {
  args: {
    ...Default.args,
    contact: {
      mail: 'good.luck@yourproblem.yeah',
      prefixText: 'Ansprechpartner:',
    },
  },
};

export const NonEditable: Story = {
  args: {
    ...Default.args,
    editBadge: undefined,
  },
};

export const ReadOnly: Story = {
  args: {
    ...Contact.args,
    state: undefined,
    editBadge: undefined,
    removeBadge: undefined,
  },
};

export const CustomActionContent: Story = {
  args: {
    ...Contact.args,
    removeBadge: undefined,
    actionSlot: <div>custom content</div>,
  },
};

export const Categories: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => (
    <div className='grid grid-cols-3 gap-4 w-[1500px]'>
      <UdpCityToolCard
        {...args}
        categories={[]}
        state={STATE_MAP[args.state]}
        className='w-full'
      />
      <UdpCityToolCard
        {...args}
        state={STATE_MAP[args.state]}
        categories={CATEGORIES.slice(0, 2)}
        className='w-full'
      />
      <UdpCityToolCard
        {...args}
        state={STATE_MAP[args.state]}
        categories={CATEGORIES}
        className='w-full'
      />
    </div>
  ),
};

export const ScrollableCategories: Story = {
  args: {
    ...Default.args,
    categories: CATEGORIES,
  },
};
