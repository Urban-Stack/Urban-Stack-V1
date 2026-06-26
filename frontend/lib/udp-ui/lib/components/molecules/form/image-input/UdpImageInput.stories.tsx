import type { Meta, StoryObj } from '@storybook/react';
import UdpImageInput from '@/lib/components/molecules/form/image-input/UdpImageInput.tsx';

const meta = {
  title: 'Molecules/Form/UdpImageInput',
  component: UdpImageInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpImageInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentImageUrl:
      'https://tailwindcss.com/_next/static/media/card.a8310012.jpg',
    placeholder: 'Enter image URL',
    imageHeading: 'Preview:',
    imageAlt: 'Story image',
    removeButtonText: 'Remove image',
  },
};

export const NonImageUrl: Story = {
  args: {
    ...Default.args,
    currentImageUrl: 'https://tailwindcss.com/_next/static/media/card.a8310012',
  },
};

export const NoUrl: Story = {
  args: {
    ...Default.args,
    currentImageUrl: '',
  },
};

export const CustomBackgroundClass: Story = {
  args: {
    ...Default.args,
    className: 'bg-red-200',
  },
};
