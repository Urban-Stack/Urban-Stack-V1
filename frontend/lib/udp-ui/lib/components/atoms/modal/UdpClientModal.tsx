'use client';

import React, { RefObject, useRef, useState } from 'react';
import {
  createTheme,
  Modal,
  ModalBody,
  ModalHeader,
  ModalProps,
  ModalTheme,
} from 'flowbite-react';

const CENTER_VERTICALLY = '[&>*]:content-center';

const mkTheme = () =>
  createTheme({
    header: {
      close: {
        base: 'hover:bg-gray-50 active:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-primary-200',
      },
    },
  } as ModalTheme);

export type UdpClientModalContentProps = {
  initialFocusRef: React.RefObject<HTMLElement>;
  closeModal: () => void;
};

type UdpClientModalProps = Pick<ModalProps, 'onClose' | 'position' | 'size'> & {
  title: string;
  content: React.FC<UdpClientModalContentProps>;
  className?: string;
  children: React.ReactElement<{
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }>;
};

/**
 * Modal.
 * <p>
 * Note: This component is supposed to be <b>client-only</b>.
 * Using it directly inside a server component will result in a post-build runtime error.
 * <p>
 * ## Focus
 * By default, the close button of this modal is focused initially.
 * However, a ref object is passed to the `initialFocusRef` property
 * of the given `content` component representing the initial focus owner of this modal.
 * By assigning this reference to the `ref` property of any subcomponent,
 * the `content` component can declare the initial focus owner itself.
 * <p>
 * ## Visibility
 * This modal comes with an internal state for being open or closed.
 * It is opened automatically by triggering the `onClick` event function of its `children` component
 * and closed by clicking on the modal's close button.
 * In addition, for closing this modal programmatically, its `content` component
 * is passed a corresponding function through its `closeModal` property.
 *
 * @param className class name for this modal
 * @param title     title for this modal
 * @param content   content component for this modal
 * @param onClose   callback function invoked on closing this modal
 * @param size      size for this modal
 * @param children  child component for this modal (needs to provide an `onClick` property)
 * @param restProps additional properties for this modal
 * @constructor
 */
const UdpClientModal = ({
  className,
  title,
  content: Content,
  onClose,
  size = 'md',
  children,
  ...restProps
}: UdpClientModalProps) => {
  const [open, setOpen] = useState(false);
  const customTheme = mkTheme();
  const initialFocusRef = useRef<HTMLElement>(null);
  const closing = () => {
    setOpen(false);
    onClose?.();
  };
  return (
    <div className={className}>
      {React.cloneElement(children, {
        onClick: (event) => {
          children.props.onClick?.(event);
          setOpen(true);
        },
      })}
      <Modal
        dismissible
        show={open}
        onClose={closing}
        theme={customTheme}
        initialFocus={initialFocusRef}
        className={CENTER_VERTICALLY}
        size={size}
        {...restProps}
      >
        <ModalHeader className='items-center'>{title}</ModalHeader>
        <ModalBody>
          <Content
            initialFocusRef={initialFocusRef as RefObject<HTMLElement>}
            closeModal={closing}
          />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default UdpClientModal;
