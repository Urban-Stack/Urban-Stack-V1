import type { Meta, StoryObj } from '@storybook/react';
import UdpArticlePreviewCard from './UdpArticlePreviewCard';

const meta = {
  title: 'Molecules/UdpArticlePreviewCard',
  component: UdpArticlePreviewCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpArticlePreviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    imageSrc: 'https://tailwindcss.com/_next/static/media/card.a8310012.jpg',
    title: 'Article Title',
    date: new Date(2024, 8, 11, 10, 0, 0, 0),
    children: 'This is a preview of the news article description.',
    href: 'https://www.google.com',
    className: 'h-72',
  },
};

export const FallbackImage: Story = {
  args: {
    ...Default.args,
    imageSrc: undefined,
    fallbackImage: true,
    className: undefined,
  },
};

export const NoImage: Story = {
  args: {
    ...Default.args,
    imageSrc: undefined,
    fallbackImage: false,
    className: undefined,
  },
};

export const LongText: Story = {
  args: {
    ...Default.args,
    className: 'w-[400px]',
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod' +
      ' tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim' +
      ' veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea' +
      ' commodo consequat. Duis aute irure dolor in reprehenderit in voluptate' +
      ' velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint' +
      ' occaecat cupidatat non proident, sunt in culpa qui officia deserunt' +
      ' mollit anim id est laborum.',
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod' +
      ' tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim' +
      ' veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea' +
      ' commodo consequat. Duis aute irure dolor in reprehenderit in voluptate' +
      ' velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint' +
      ' occaecat cupidatat non proident, sunt in culpa qui officia deserunt' +
      ' mollit anim id est laborum.',
  },
};

export const DateLinebreak: Story = {
  args: {
    ...Default.args,
    className: 'w-[250px]',
  },
};
