import React, { RefObject } from 'react';
import { render, screen, within } from '@testing-library/react';
import CreateVizGroupButton, { _internal } from './CreateVizGroupButton';
import userEvent from '@testing-library/user-event';
import { createRender } from 'udp-ui/test-utils';
import { UdpClientModal } from 'udp-ui/components';
import { UdpButtonTestIds } from 'udp-ui/components';

const { FormContent } = _internal;

const USER = userEvent.setup();

const UdpClientModalMock = UdpClientModal as unknown as jest.Mock;
jest.mock('udp-ui/components', () => {
  const actual = jest.requireActual('udp-ui/components');
  return {
    ...actual,
    UdpClientModal: jest.fn((props) => actual.UdpClientModal(props)),
  };
});

jest.mock('@/app/settings/dashboardgroups/actions', () => ({
  createVizGroup: jest.fn(),
}));

const renderFormContent = createRender(FormContent, {
  isLoading: false,
  initialFocusRef: React.createRef<HTMLElement>() as RefObject<HTMLElement>,
  closeModal: () => {},
});

describe('trigger button', () => {
  it('trigger button has correct text', () => {
    const { container } = render(<CreateVizGroupButton />);

    expect(container).toHaveTextContent('Neue Dashboardgruppe');
  });

  it('click on trigger button opens form modal', async () => {
    const component = render(<CreateVizGroupButton />);

    await USER.click(component.getByRole('button'));

    const formModal = screen.getByRole('dialog');
    expect(formModal).toBeVisible();
    expect(UdpClientModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Neue Dashboardgruppe',
        size: 'lg',
      }),
      undefined,
    );
  });
});

describe('form', () => {
  describe('snapshot', () => {
    it('matches snapshot', () => {
      const { container } = renderFormContent();

      expect(container).toMatchSnapshot();
    });
  });

  describe('errors', () => {
    const errorTestCases = [
      { testCase: 'single error', errors: ['some error message'] },
      { testCase: 'multiple errors', errors: ['error 1', 'error 2'] },
    ];

    it.each(errorTestCases)(
      'displays error messages regarding the viz group name for $testCase',
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
