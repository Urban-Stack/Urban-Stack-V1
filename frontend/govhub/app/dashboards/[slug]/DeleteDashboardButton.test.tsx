import { render, screen, waitFor, within } from '@testing-library/react';
import DeleteDashboardButton, {
  _internal,
} from '@/app/dashboards/[slug]/DeleteDashboardButton';
import { DashboardTestIds } from '@/app/dashboards/[slug]/testIds';
import { FuncMock } from '@/app/_test/utils';
import { deleteDashboard } from '@/app/_lib/superset/actions';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { DashboardId } from '@/app/_lib/superset/util';
import userEvent from '@testing-library/user-event';
import React, { RefObject } from 'react';
import { createRender } from 'udp-ui/test-utils';
import { UdpButtonTestIds } from 'udp-ui/components';

const { FormContent } = _internal;

const USER = userEvent.setup();

const DASHBOARD_ID: DashboardId = {
  name: 'test-dashboard',
  tenant: 'test-tenant',
  vizGroup: 'test-vizgroup',
} as const;

const deleteDashboardMock = deleteDashboard as unknown as FuncMock<
  typeof deleteDashboard
>;
jest.mock('@/app/_lib/superset/actions', () => ({
  deleteDashboard: jest.fn(),
}));

const redirectMock = redirect as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const isRedirectErrorMock = isRedirectError as unknown as FuncMock<
  typeof isRedirectError
>;
jest.mock('next/dist/client/components/redirect-error', () => ({
  isRedirectError: jest.fn(),
}));

const toastSuccessMock = toast.success as unknown as FuncMock<
  typeof toast.success
>;
const toastErrorMock = toast.error as unknown as FuncMock<typeof toast.error>;
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderFormContent = createRender(FormContent, {
  isLoading: false,
  initialFocusRef: React.createRef<HTMLElement>() as RefObject<HTMLElement>,
  closeModal: () => {},
});

beforeEach(() => {
  deleteDashboardMock.mockReset();
  redirectMock.mockReset();
  toastSuccessMock.mockReset();
  toastErrorMock.mockReset();
});

describe('snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <DeleteDashboardButton dashboard={DASHBOARD_ID} />,
    );

    expect(container).toMatchSnapshot();
  });
});

describe('visibility', () => {
  it('initially modal is not rendered', () => {
    render(<DeleteDashboardButton dashboard={DASHBOARD_ID} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('click on trigger button opens confirm modal', async () => {
    render(<DeleteDashboardButton dashboard={DASHBOARD_ID} />);

    await USER.click(screen.getByTestId(DashboardTestIds.deleteButton));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
  });
});

describe('click event', () => {
  const { tenant, vizGroup, name } = DASHBOARD_ID;

  const openModal = async () => {
    await USER.click(screen.getByTestId(DashboardTestIds.deleteButton));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
  };

  const confirmDeletion = async () => {
    const confirmButton = screen.getByRole('button', {
      name: /Dashboard löschen/,
    });
    await USER.click(confirmButton);
  };

  it('deletes dashboard by name and shows success toast', async () => {
    deleteDashboardMock.mockResolvedValueOnce({});
    render(<DeleteDashboardButton dashboard={DASHBOARD_ID} />);

    await openModal();
    await confirmDeletion();

    expect(deleteDashboardMock).toHaveBeenCalledWith(name, vizGroup, tenant);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Dashboard erfolgreich gelöscht',
      undefined,
    );
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it('shows success toast on redirect after dashboard deleted', async () => {
    deleteDashboardMock.mockRejectedValue({});
    isRedirectErrorMock.mockReturnValue(true);
    render(<DeleteDashboardButton dashboard={DASHBOARD_ID} />);

    await openModal();
    await confirmDeletion();

    expect(deleteDashboardMock).toHaveBeenCalledWith(name, vizGroup, tenant);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Dashboard erfolgreich gelöscht',
      undefined,
    );
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it('shows error toast on delete error', async () => {
    deleteDashboardMock.mockRejectedValue({});
    isRedirectErrorMock.mockReturnValue(false);
    render(<DeleteDashboardButton dashboard={DASHBOARD_ID} />);

    await openModal();
    await confirmDeletion();

    expect(deleteDashboardMock).toHaveBeenCalledWith(name, vizGroup, tenant);
    expect(toastErrorMock).toHaveBeenCalledWith(
      'Dashboard konnte nicht gelöscht werden',
      undefined,
    );
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });
});

describe('initial focus', () => {
  it('cancel button gets reference for initial focus component', () => {
    const ref = React.createRef<HTMLElement>() as RefObject<HTMLElement>;

    renderFormContent({ initialFocusRef: ref });

    expect(ref.current).toEqual(
      screen.getByRole('button', { name: 'Abbrechen' }),
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
