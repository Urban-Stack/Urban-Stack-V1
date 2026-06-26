import { Meta, StoryObj } from '@storybook/react';
import UdpClientModal from '@/lib/components/atoms/modal/UdpClientModal.tsx';
import {
  UdpButton,
  UdpClientModalContentProps,
  UdpTextInput,
} from '@/lib/components';
import React, { RefObject } from 'react';

const meta = {
  title: 'Atoms/UdpClientModal',
  component: UdpClientModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UdpClientModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const nonClosingMessage = 'The modal will NOT be closed automatically.';
const autoCloseMessage = `The fallback function 'closeModal' has been invoked.
The modal will now be closed automatically.`;

const Content: React.FC<UdpClientModalContentProps> = ({
  initialFocusRef,
  closeModal,
}) => (
  <div className='flex flex-col gap-4'>
    <span>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
      eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
      voluptua.
    </span>
    <UdpTextInput ref={initialFocusRef as RefObject<HTMLInputElement>} />
    <div className='flex flex-wrap gap-2'>
      <UdpButton onClick={() => alert(nonClosingMessage)}>
        Click without closing
      </UdpButton>
      <UdpButton
        color='tertiary'
        onClick={() => {
          alert(autoCloseMessage);
          closeModal();
        }}
      >
        Click and close
      </UdpButton>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    children: <UdpButton>Click for modal</UdpButton>,
    title: 'Modal Title',
    content: Content,
  },
};
