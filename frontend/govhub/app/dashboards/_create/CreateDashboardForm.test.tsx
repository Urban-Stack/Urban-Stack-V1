import { screen, within } from '@testing-library/react';
import { _internal } from '@/app/dashboards/_create/CreateDashboardForm';
import { FuncMock } from '@/app/_test/utils';
import { createDashboard } from '@/app/_lib/superset/actions';
import { VIZ_GROUPS } from '../_internal/testUtils';
import userEvent from '@testing-library/user-event';
import { createRender } from 'udp-ui/test-utils';
import React, { RefObject } from 'react';
import { UdpButtonTestIds } from 'udp-ui/components';

const { FormContent } = _internal;

const USER = userEvent.setup();

const createDashboardMock = createDashboard as unknown as FuncMock<
  typeof createDashboard
>;
jest.mock('@/app/_lib/superset/actions', () => ({
  createDashboard: jest.fn(),
}));

const renderFormContent = createRender(FormContent, {
  vizGroups: VIZ_GROUPS,
  isLoading: false,
  initialFocusRef: React.createRef<HTMLElement>() as RefObject<HTMLElement>,
  closeModal: () => {},
});

beforeEach(() => {
  createDashboardMock.mockReset();
});

describe('snapshot', () => {
  it('matches snapshot', async () => {
    const { container } = renderFormContent();

    expect(container).toMatchSnapshot();
  });
});

describe('error messages', () => {
  it.each([
    [['Error, too short']],
    [['Error, to short', 'Offensive Language']],
  ])('correctly shows error messages for name input', (title) => {
    const errors = { title };
    renderFormContent({ errors: errors });

    errors.title.forEach((error) => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });

  it.each([
    [['Error, too short']],
    [['Error, to short', 'Error, does not exist']],
  ])('correctly shows error messages for vizGroup select', (vizGroup) => {
    const errors = { vizGroup };
    renderFormContent({ errors: errors });

    errors.vizGroup.forEach((error) => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });
});

describe('initial focus', () => {
  it('name input field gets reference for initial focus component', () => {
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
