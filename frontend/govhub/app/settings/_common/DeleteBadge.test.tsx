import { act, screen, waitFor, within } from '@testing-library/react';
import DeleteBadge, { _internal } from '@/app/settings/_common/DeleteBadge';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { ActionState } from '@/app/_lib/form/actionstate';
import React, { RefObject } from 'react';
import { createRender } from 'udp-ui/test-utils';
import userEvent from '@testing-library/user-event';
import { UdpButtonTestIds } from 'udp-ui/components';

const { FormContent } = _internal;

const USER = userEvent.setup();

const TEST_TOOLTIP = 'Test tooltip';
const TEST_TITLE = 'Test title';
const TEST_DESCRIPTION = 'Test description';
const TEST_CONTENT_ID = 'test-content';

const renderComp = createRender(DeleteBadge, {
  tooltipText: TEST_TOOLTIP,
  title: TEST_TITLE,
  description: TEST_DESCRIPTION,
  errorsFromState: () => [],
  onSubmit: async (s) => s,
});

const renderFormContent = createRender(FormContent, {
  description: TEST_DESCRIPTION,
  submitText: 'submit',
  isLoading: false,
  cancelText: 'cancel',
  initialFocusRef:
    React.createRef<HTMLElement>() as RefObject<HTMLInputElement>,
  closeModal: () => {},
});

const openModal = async () => {
  await USER.click(screen.getByTestId(SettingsTestIds.deleteBadge));
  await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
};

const submitDelete = async () => {
  const submitButton = screen
    .getByRole('dialog')
    .querySelector('button[type=submit]') as HTMLElement;
  await USER.click(submitButton);
};

describe('structure', () => {
  it('badge contains correct tooltip and children', () => {
    renderComp({
      tooltipText: TEST_TOOLTIP,
      children: <div data-testid={TEST_CONTENT_ID}>Test content</div>,
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent(TEST_TOOLTIP);
    expect(screen.getByTestId(TEST_CONTENT_ID)).toBeInTheDocument();
  });

  it('modal contains correct texts and buttons', async () => {
    renderComp({
      title: TEST_TITLE,
      description: TEST_DESCRIPTION,
      submitText: 'submit',
      cancelText: 'cancel',
    });
    await openModal();

    const modal = within(screen.getByRole('dialog'));
    expect(modal.getByRole('heading')).toHaveTextContent(TEST_TITLE);
    expect(modal.getByRole('paragraph')).toHaveTextContent(TEST_DESCRIPTION);
    expect(modal.getByRole('button', { name: /submit/ })).toBeVisible();
    expect(modal.getByRole('button', { name: /cancel/ })).toBeVisible();
  });
});

describe('toggle', () => {
  it('click on delete badge opens modal', async () => {
    renderComp({
      title: TEST_TITLE,
      description: TEST_DESCRIPTION,
    });

    await openModal();

    expect(screen.getByRole('dialog')).toBeVisible();
  });
});

describe('buttons', () => {
  it('click on cancel button closes modal', async () => {
    const onSubmitMock = jest.fn();
    renderComp({ onSubmit: onSubmitMock, cancelText: 'cancel' });
    await openModal();

    const cancelButton = screen.getByRole('button', { name: /cancel/ });
    await USER.click(cancelButton);

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('click on submit button invokes callback function and closes modal on success', async () => {
    const successState = { data: { success: true } };
    const onSubmitMock = jest.fn().mockResolvedValueOnce(successState);
    renderComp({ onSubmit: onSubmitMock, submitText: 'submit' });
    await openModal();

    const submitButton = screen.getByRole('button', { name: /submit/ });
    await USER.click(submitButton);

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('click on submit button invokes callback function but does not close modal on error', async () => {
    const errorState = { errors: ['test error'] };
    const onSubmitMock = jest.fn().mockResolvedValueOnce(errorState);
    renderComp({ onSubmit: onSubmitMock, submitText: 'submit' });
    await openModal();

    const submitButton = screen.getByRole('button', { name: /submit/ });
    await USER.click(submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeVisible();
  });
});

describe('errors', () => {
  const TEST_ERRORS = ['error #1', 'error #2'] as const;

  it('does not show error messages if no errors occurred', async () => {
    const stateWithoutErrors = {} as ActionState;
    const mapErrors = (state: ActionState) => state.errors as string[];
    renderComp({
      errorsFromState: mapErrors,
      onSubmit: async (_) => stateWithoutErrors,
    });

    await openModal();
    await submitDelete();

    TEST_ERRORS.forEach((error) =>
      expect(screen.getByRole('dialog')).not.toHaveTextContent(error),
    );
  });

  it('does not show error message if errors not mapped to messages', async () => {
    const stateWithErrors = { errors: TEST_ERRORS } as ActionState;
    const blockErrors = (_: ActionState) => undefined;
    renderComp({
      errorsFromState: blockErrors,
      onSubmit: async (_) => stateWithErrors,
    });

    await openModal();
    await submitDelete();

    TEST_ERRORS.forEach((error) =>
      expect(screen.getByRole('dialog')).not.toHaveTextContent(error),
    );
  });

  it('shows error messages if errors occur', async () => {
    const stateWithErrors = { errors: TEST_ERRORS } as ActionState;
    const mapErrors = (state: ActionState) => state.errors as string[];
    renderComp({
      errorsFromState: mapErrors,
      onSubmit: async (_) => stateWithErrors,
    });

    await openModal();
    await act(() => submitDelete());

    TEST_ERRORS.forEach((error) =>
      expect(screen.getByRole('dialog')).toHaveTextContent(error),
    );
  });
});

describe('callbacks', () => {
  const onResolvedMock = jest.fn();
  const onRejectedMock = jest.fn();
  beforeEach(() => {
    onResolvedMock.mockReset();
    onRejectedMock.mockReset();
  });

  it('invokes onResolved callback function if deletion resolved successfully', async () => {
    const successState = { data: {} };
    const onSubmitMock = jest.fn().mockResolvedValueOnce(successState);
    renderComp({
      onSubmit: onSubmitMock,
      onResolved: onResolvedMock,
      onRejected: onRejectedMock,
    });

    await openModal();
    await submitDelete();

    expect(onResolvedMock).toHaveBeenCalled();
    expect(onRejectedMock).not.toHaveBeenCalled();
  });

  it('invokes onRejected callback function if deletion rejected', async () => {
    const error = new Error('Failed to delete');
    const onSubmitMock = jest.fn().mockRejectedValueOnce(error);
    renderComp({
      onSubmit: onSubmitMock,
      onResolved: onResolvedMock,
      onRejected: onRejectedMock,
    });

    await openModal();
    await submitDelete();

    expect(onResolvedMock).not.toHaveBeenCalled();
    expect(onRejectedMock).toHaveBeenCalled();
  });

  it('does not invoke any callback function if deletion resolved with errors', async () => {
    const errorState = { errors: ['Failed to delete'] };
    const onSubmitMock = jest.fn().mockResolvedValueOnce(errorState);
    renderComp({
      onSubmit: onSubmitMock,
      onResolved: onResolvedMock,
      onRejected: onRejectedMock,
    });

    await openModal();
    await submitDelete();

    expect(onResolvedMock).not.toHaveBeenCalled();
    expect(onRejectedMock).not.toHaveBeenCalled();
  });
});

describe('initial focus', () => {
  it('cancel button gets reference for initial focus component', () => {
    const ref = React.createRef<HTMLElement>();

    renderFormContent({
      cancelText: 'cancel',
      initialFocusRef: ref as RefObject<HTMLInputElement>,
    });

    expect(ref.current).toEqual(screen.getByRole('button', { name: /cancel/ }));
  });
});

describe('loading', () => {
  it('submit button contains spinner when form action is pending', () => {
    const { container } = renderFormContent({ isLoading: true });

    const submitButton = container.querySelector(
      'button[type="submit"]',
    ) as HTMLElement;
    const spinner = within(submitButton).getByTestId(UdpButtonTestIds.spinner);
    expect(spinner).toBeVisible();
  });

  it('submit button does not contain spinner when form action is not pending', () => {
    const { container } = renderFormContent({ isLoading: false });

    const submitButton = container.querySelector(
      'button[type="submit"]',
    ) as HTMLElement;
    const spinner = within(submitButton).queryByTestId(
      UdpButtonTestIds.spinner,
    );
    expect(spinner).not.toBeInTheDocument();
  });
});
