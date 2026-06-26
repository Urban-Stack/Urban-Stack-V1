import { act, screen, waitFor, within } from '@testing-library/react';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { ActionState } from '@/app/_lib/form/actionstate';
import React, { RefObject } from 'react';
import PermissionBadge, {
  _internal,
} from '@/app/settings/_common/PermissionBadge';
import userEvent from '@testing-library/user-event';
import { createRender } from 'udp-ui/test-utils';
import { UdpButtonTestIds } from 'udp-ui/components';

const { FormContent } = _internal;

const PermissionName = ['admin', 'read'] as const;
type PermissionName = (typeof PermissionName)[number];

const USER = userEvent.setup();

const TEST_TOOLTIP = 'Test tooltip';
const TEST_TITLE = 'Test title';
const TEST_DESCRIPTION = 'Test description';
const TEST_OPTION_DATA: Record<string, PermissionName> = {
  Betrachter: 'read',
  Mitarbeiter: 'admin',
};
const OPTION_INDEX = 1;
const TEST_LABEL = Object.keys(TEST_OPTION_DATA)[OPTION_INDEX];

const renderComp = createRender(PermissionBadge, {
  tooltipText: TEST_TOOLTIP,
  title: TEST_TITLE,
  description: TEST_DESCRIPTION,
  radioButtonGroupName: 'test-group-name',
  labelToPermission: TEST_OPTION_DATA,
  labelChecked: TEST_LABEL,
  errorsFromState: () => [],
  permErrorsFromState: () => [],
  onSubmit: async (s) => s,
});

const renderFormContent = createRender(FormContent, {
  description: TEST_DESCRIPTION,
  radioButtonGroupName: 'test-group-name',
  labelToPermission: TEST_OPTION_DATA,
  labelChecked: TEST_LABEL,
  submitText: 'submit',
  cancelText: 'cancel',
  isLoading: false,
  initialFocusRef:
    React.createRef<HTMLElement>() as RefObject<HTMLInputElement>,
  closeModal: () => {},
});

const openModal = async () => {
  await USER.click(screen.getByTestId(SettingsTestIds.permBadge));
  await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
};

const submitUpdate = async () => {
  const submitButton = screen
    .getByRole('dialog')
    .querySelector('button[type=submit]') as HTMLElement;
  await USER.click(submitButton);
};

describe('structure', () => {
  it('badge has correct tooltip and label text', () => {
    const { getByRole } = renderComp({
      tooltipText: TEST_TOOLTIP,
      labelChecked: TEST_LABEL,
    });

    expect(getByRole('tooltip')).toHaveTextContent(TEST_TOOLTIP);
    expect(getByRole('button')).toHaveTextContent(TEST_LABEL);
  });

  it('modal contains correct texts and buttons', async () => {
    renderComp({
      title: TEST_TITLE,
      description: TEST_DESCRIPTION,
      labelToPermission: TEST_OPTION_DATA,
      submitText: 'submit',
      cancelText: 'cancel',
    });
    await openModal();

    const modal = within(screen.getByRole('dialog'));
    expect(modal.getByRole('heading')).toHaveTextContent(TEST_TITLE);
    expect(modal.getByRole('paragraph')).toHaveTextContent(TEST_DESCRIPTION);
    expect(modal.queryByRole('button', { name: /submit/ })).toBeVisible();
    expect(modal.queryByRole('button', { name: /cancel/ })).toBeVisible();
    const labels = Object.keys(TEST_OPTION_DATA);
    expect(modal.getAllByRole('radio')).toHaveLength(labels.length);
    labels.forEach((label) => expectOption(label).toBeVisible());
  });

  const expectOption = (displayValue: string) =>
    expect(screen.getByRole('radio', { name: displayValue }));
});

describe('toggle', () => {
  it('click on permission badge opens modal', async () => {
    const { queryByRole } = renderComp();
    expect(queryByRole('dialog')).not.toBeInTheDocument();

    await openModal();

    expect(queryByRole('dialog')).toBeVisible();
  });
});

describe('preselection', () => {
  it('option of given label is checked', async () => {
    const valueChecked = Object.keys(TEST_OPTION_DATA)[OPTION_INDEX];

    renderComp({
      labelToPermission: TEST_OPTION_DATA,
      labelChecked: valueChecked,
    });
    await openModal();

    const radioButtons = screen.getAllByRole('radio');
    radioButtons.forEach((radio, index) =>
      index === OPTION_INDEX
        ? expect(radio).toBeChecked()
        : expect(radio).not.toBeChecked(),
    );
  });
});

describe('buttons', () => {
  it('click on cancel button closes modal', async () => {
    const onSubmitMock = jest.fn();
    renderComp({
      onSubmit: onSubmitMock,
      cancelText: 'cancel',
    });
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
    renderComp({
      onSubmit: onSubmitMock,
      submitText: 'submit',
    });
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
    renderComp({
      onSubmit: onSubmitMock,
      submitText: 'submit',
    });
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
      permErrorsFromState: mapErrors,
      onSubmit: async (_) => stateWithoutErrors,
    });

    await openModal();
    await submitUpdate();

    TEST_ERRORS.forEach((error) =>
      expect(screen.getByRole('dialog')).not.toHaveTextContent(error),
    );
  });

  const blockErrors = (_: ActionState) => undefined;
  const ERROR_BLOCKING_TEST_CASES = [
    {
      testCase: 'general errors',
      params: { errorsFromState: blockErrors },
    },
    {
      testCase: 'permission errors',
      params: { permErrorsFromState: blockErrors },
    },
  ];
  it.each(ERROR_BLOCKING_TEST_CASES)(
    'does not show error message if errors not mapped to messages ($testCase)',
    async ({ params }) => {
      const stateWithErrors = { errors: TEST_ERRORS } as ActionState;
      renderComp({ ...params, ...{ onSubmit: async (_) => stateWithErrors } });

      await openModal();
      await submitUpdate();

      TEST_ERRORS.forEach((error) =>
        expect(screen.getByRole('dialog')).not.toHaveTextContent(error),
      );
    },
  );

  const mapErrors = (s: ActionState) => s.errors as string[];
  const ERROR_MAPPING_TEST_CASES = [
    {
      testCase: 'general errors',
      params: { errorsFromState: mapErrors },
    },
    {
      testCase: 'permission errors',
      params: { permErrorsFromState: mapErrors },
    },
  ];
  it.each(ERROR_MAPPING_TEST_CASES)(
    'shows error messages if errors occur ($testCase)',
    async ({ params }) => {
      const stateWithErrors = { errors: TEST_ERRORS } as ActionState;
      renderComp({ ...params, ...{ onSubmit: async (_) => stateWithErrors } });

      await openModal();
      await act(() => submitUpdate());

      TEST_ERRORS.forEach((error) =>
        expect(screen.getByRole('dialog')).toHaveTextContent(error),
      );
    },
  );
});

describe('initial focus', () => {
  it('checked radio button can be referenced', () => {
    const ref = React.createRef<HTMLElement>();

    renderFormContent({
      labelToPermission: TEST_OPTION_DATA,
      labelChecked: Object.keys(TEST_OPTION_DATA)[OPTION_INDEX],
      initialFocusRef: ref as RefObject<HTMLInputElement>,
    });

    expect(ref.current).toEqual(screen.getAllByRole('radio')[OPTION_INDEX]);
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
