import { screen, within } from '@testing-library/react';
import { _internal } from '@/app/settings/projects/[tenant]/[projectname]/credentials/_internal/RotateCredentialsModalContent';
import userEvent from '@testing-library/user-event';
import React, { RefObject } from 'react';
import { createRender } from 'udp-ui/test-utils';
import { UdpButtonTestIds } from 'udp-ui/components';

const { FormContent } = _internal;

const USER = userEvent.setup();

const CREDENTIAL_NAME = 'test-credential-name';

const renderFormContent = createRender(FormContent, {
  credentialName: CREDENTIAL_NAME,
  isLoading: false,
  initialFocusRef: React.createRef<HTMLElement>() as RefObject<HTMLElement>,
  closeModal: () => {},
});

describe('snapshot', () => {
  it('matches snapshot', () => {
    const component = renderFormContent();

    expect(component).toMatchSnapshot();
  });
});

describe('errors', () => {
  const errorTestCases = [
    { testCase: 'single error', errors: ['error message @ test'] },
    { testCase: 'multiple errors', errors: ['multiple', 'errors @ test'] },
  ];

  it.each(errorTestCases)(
    'displays error messages for $testCase',
    ({ errors }) => {
      renderFormContent({ errors: { general: errors } });

      errors.forEach((msg) => {
        expect(screen.getByText(msg)).toBeVisible();
      });
    },
  );
});

describe('initial focus', () => {
  it('submit button gets reference for initial focus component', () => {
    const ref = React.createRef<HTMLElement>() as RefObject<HTMLElement>;

    renderFormContent({ initialFocusRef: ref });

    expect(ref.current).toEqual(
      screen.getByRole('button', { name: 'Rotieren' }),
    );
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
