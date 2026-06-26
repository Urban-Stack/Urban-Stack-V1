import type { Meta, StoryObj } from '@storybook/react';
import { ToastContainer } from 'react-toastify';
import UdpToast, {
  UdpToastType,
} from '@/lib/components/atoms/toast/UdpToast.ts';
import React from 'react';

interface UdpToastWrapperProps {
  message: string;
  type: UdpToastType;
}

const UdpToaster = ({ message, type }: UdpToastWrapperProps) => {
  return (
    <div className={'border w-[512px] h-64'}>
      <span
        className={
          'size-full flex justify-center items-center text-center text-gray-500 leading-8 select-none'
        }
        onClick={() => UdpToast(message, type)()}
      >
        Click here for a new toast.
      </span>
      <ToastContainer position={'bottom-right'} />
    </div>
  );
};

const meta = {
  title: 'Atoms/UdpToast',
  component: UdpToaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'radio', options: UdpToastType },
  },
} satisfies Meta<typeof UdpToaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Enjoy your toast! 😋 🍞',
    type: 'success',
  },
};
