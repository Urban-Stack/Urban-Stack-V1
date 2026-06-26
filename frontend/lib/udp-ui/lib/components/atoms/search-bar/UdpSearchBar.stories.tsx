import type { Meta, StoryObj } from '@storybook/react';
import UdpSearchBar from './UdpSearchBar';
import { createTheme } from 'flowbite-react';

const meta = {
  title: 'Atoms/UdpSearchBar',
  component: UdpSearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {},
} satisfies Meta<typeof UdpSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Bitte den Suchtext eingeben',
    className: '',
  },
};

const customTheme = createTheme({
  textInput: {
    field: {
      icon: {
        svg: 'text-white',
      },
      input: {
        colors: {
          gray: 'text-white bg-primary-600 placeholder:text-primary-100 focus:outline-hidden focus:ring-2 focus:ring-primary-300',
        },
      },
    },
  },
});

export const CustomTheme: Story = {
  args: {
    ...Default.args,
    theme: customTheme.textInput,
  },
};
