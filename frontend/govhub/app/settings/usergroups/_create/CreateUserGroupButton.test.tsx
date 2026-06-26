import { screen, within } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { _internal } from '@/app/settings/usergroups/_create/CreateUserGroupButton';
import { createUserGroup } from '@/app/settings/usergroups/actions';
import React, { RefObject } from 'react';
import userEvent from '@testing-library/user-event';
import { createRender } from 'udp-ui/test-utils';
import { UdpButtonTestIds } from 'udp-ui/components';

const { FormContent } = _internal;

const USER = userEvent.setup();

const createUserGroupMock = createUserGroup as unknown as FuncMock<
  typeof createUserGroup
>;
jest.mock('@/app/settings/usergroups/actions', () => ({
  createUserGroup: jest.fn(),
}));

const renderFormContent = createRender(FormContent, {
  isLoading: false,
  initialFocusRef: React.createRef<HTMLElement>() as RefObject<HTMLElement>,
  closeModal: () => {},
});

beforeEach(() => {
  createUserGroupMock.mockReset();
});

describe('snapshot', () => {
  it('matches snapshot', async () => {
    const { container } = renderFormContent();

    expect(container).toMatchSnapshot();
  });
});

describe('errors', () => {
  const errorTestCases = [
    { testCase: 'single error', errors: ['error message @ test'] },
    { testCase: 'multiple errors', errors: ['multiple', 'errors @ test'] },
  ];
  it.each(errorTestCases)(
    'displays error messages regarding the user group name for $testCase',
    ({ errors }) => {
      renderFormContent({ errors: { name: errors } });

      errors.forEach((msg) => {
        expect(screen.getByText(msg)).toBeVisible();
      });
    },
  );
});

describe('initial focus', () => {
  it('input field gets reference for initial focus component', () => {
    const ref = React.createRef<HTMLElement>() as RefObject<HTMLElement>;

    renderFormContent({ initialFocusRef: ref });

    expect(ref.current).toEqual(screen.getByRole('textbox'));
  });
});

describe('closing', () => {
  it('callback function "closeModal" is invoked by cancel button', async () => {
    const closeModalMock = jest.fn();

    renderFormContent({ closeModal: closeModalMock });
    expect(closeModalMock).not.toHaveBeenCalled();

    const cancelButton = screen.getByRole('button', { name: 'Abbrechen' });
    await USER.click(cancelButton);
    expect(closeModalMock).toHaveBeenCalled();
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
