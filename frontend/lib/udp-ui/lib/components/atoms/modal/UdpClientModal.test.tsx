import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React, { RefObject } from 'react';
import { UdpClientModal, UdpTextInput } from '@/lib/components';
import userEvent from '@testing-library/user-event';
import { createRender } from '@/lib/test-utils';

const USER = userEvent.setup();

const TEST_TITLE = 'Test title';
const TRIGGER_ID = 'test-trigger-id';

const TriggerButton = ({
  onClick,
}: {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => (
  <button data-testid={TRIGGER_ID} onClick={onClick}>
    test trigger
  </button>
);

const renderComp = createRender(UdpClientModal, {
  title: TEST_TITLE,
  content: () => <div>test content</div>,
  children: <TriggerButton />,
});

const clickTriggerButton = async () => {
  await USER.click(screen.getByTestId(TRIGGER_ID));
};

describe('snapshot', () => {
  it('matches snapshot when closed', () => {
    const component = renderComp();
    expect(component.queryByRole('dialog')).not.toBeInTheDocument();

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = renderComp({ className: 'pt-8' });

    expect(component).toMatchSnapshot();
  });
});

describe('content', () => {
  it('modal has given title', async () => {
    renderComp({ title: TEST_TITLE });
    await clickTriggerButton();

    const modal = screen.getByRole('dialog');
    expect(within(modal).getByRole('heading')).toHaveTextContent(TEST_TITLE);
  });

  it('modal has given content', async () => {
    const childTestId = 'child-test-id';
    renderComp({
      content: () => <div data-testid={childTestId} />,
    });
    await clickTriggerButton();

    const modal = screen.getByRole('dialog');
    expect(modal).toContainElement(screen.getByTestId(childTestId));
  });
});

describe('visibility', () => {
  it('initially modal is not rendered', () => {
    renderComp();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId(TRIGGER_ID)).toBeVisible();
  });

  it('modal is visible after click on child component', async () => {
    renderComp();
    await clickTriggerButton();

    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('click on close button closes modal', async () => {
    renderComp();
    await clickTriggerButton();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await USER.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('focus', () => {
  it('focuses subcomponent referenced by "initialFocusRef"', async () => {
    const { getByTestId } = renderComp({
      content: ({ initialFocusRef }) => (
        <>
          <UdpTextInput data-testid={'test-input-1'} />
          <UdpTextInput
            data-testid={'test-input-2'}
            ref={initialFocusRef as RefObject<HTMLInputElement>}
          />
          <UdpTextInput data-testid={'test-input-3'} />
        </>
      ),
    });
    await clickTriggerButton();
    await waitFor(() => {
      expect(getByTestId(TRIGGER_ID)).not.toHaveFocus();
    });

    expect(getByTestId('test-input-1')).not.toHaveFocus();
    expect(getByTestId('test-input-2')).toHaveFocus();
    expect(getByTestId('test-input-3')).not.toHaveFocus();
  });
});

describe('cancellation', () => {
  it('modal is closed automatically when content component invokes "onCancel" callback function', async () => {
    renderComp({
      content: ({ closeModal }) => <button onClick={closeModal}>Cancel</button>,
    });
    await clickTriggerButton();
    expect(screen.queryByRole('dialog')).toBeVisible();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await USER.click(cancelButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('callback function "onClose" is invoked when closing the modal through its close button', async () => {
    const onCloseMock = vi.fn();
    renderComp({ onClose: onCloseMock });
    await clickTriggerButton();
    expect(screen.getByRole('dialog')).toBeVisible();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await USER.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledOnce();
  });

  it('callback function "onClose" is invoked when closing the modal via the content', async () => {
    const onCloseMock = vi.fn();
    renderComp({
      onClose: onCloseMock,
      content: ({ closeModal }) => <button onClick={closeModal}>Cancel</button>,
    });
    await clickTriggerButton();
    expect(screen.getByRole('dialog')).toBeVisible();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await USER.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalledOnce();
  });
});

describe('trigger', () => {
  it('original "onClick" function of trigger button is invoked before modal opens', async () => {
    const enum Step {
      OriginalOnClick,
      ModalOpened,
    }
    const callSequence: Step[] = [];
    const originalOnClick = () => callSequence.push(Step.OriginalOnClick);
    const ModalContent = () => {
      callSequence.push(Step.ModalOpened);
      return <div>test content</div>;
    };
    renderComp({
      children: <TriggerButton onClick={originalOnClick} />,
      content: ModalContent,
    });
    expect(callSequence).toHaveLength(0);

    await clickTriggerButton();
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(callSequence).toEqual([Step.OriginalOnClick, Step.ModalOpened]);
  });
});
