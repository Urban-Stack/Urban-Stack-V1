import { act, screen, waitFor, within } from '@testing-library/react';
import SubscriptionTable, {
  InternalDeleteBadge,
} from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/SubscriptionTable';
import { SubscriptionTestIds } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/testIds';
import { TEST_SUBSCRIPTIONS } from '@/app/_test/graphql/data.util';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { UdpToast } from 'udp-ui/components';
import { FuncMock } from '@/app/_test/utils';
import { deleteSubscription } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/actions';
import { createRender } from 'udp-ui/test-utils';
import userEvent from '@testing-library/user-event';
import { subscriptionStateTranslations } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/util';

const deleteSubscriptionMock = deleteSubscription as unknown as FuncMock<
  typeof deleteSubscription
>;
jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/subscriptions/actions',
  () => ({
    deleteSubscription: jest.fn(),
  }),
);

const UdpToastMock = UdpToast as unknown as jest.Mock;
jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

beforeEach(() => {
  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
  successToastMock.mockReset();
  errorToastMock.mockReset();
});

const USER = userEvent.setup();

const TEST_TENANT = 'test-tenant';
const TEST_PROJECT = 'test-project';
const SUBSCRIPTION_INDEX = 1;
const TIMESTAMP_PLACEHOLDER = '—';

const renderTable = createRender(SubscriptionTable, {
  tenant: TEST_TENANT,
  project: TEST_PROJECT,
  subscriptions: TEST_SUBSCRIPTIONS,
});

describe('snapshot', () => {
  it('renders list overview as expected', async () => {
    const { container } = renderTable({ subscriptions: TEST_SUBSCRIPTIONS });

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('subscription table contains all given entries', async () => {
    renderTable({ subscriptions: TEST_SUBSCRIPTIONS });

    const items = screen.getAllByTestId(SubscriptionTestIds.tableItem);
    expect(items).toHaveLength(TEST_SUBSCRIPTIONS.length);
  });

  it('table row contains delete badge', async () => {
    renderTable({ subscriptions: TEST_SUBSCRIPTIONS });
    const rows = screen.getAllByTestId(SubscriptionTestIds.tableItem);
    const testRow = within(rows[SUBSCRIPTION_INDEX]);

    expect(testRow.getByTestId(SettingsTestIds.deleteBadge)).toBeVisible();
  });
});

describe('status', () => {
  it('shows connection status badge', async () => {
    renderTable({ subscriptions: TEST_SUBSCRIPTIONS });

    for (const sub of TEST_SUBSCRIPTIONS) {
      const row = screen.getByRole('row', {
        name: (n) => n.includes(sub.name),
      });
      const badge = within(row).getByTestId(SubscriptionTestIds.statusBadge);
      expect(badge).toBeVisible();
      expect(badge).toHaveTextContent(
        subscriptionStateTranslations[sub.connection.state],
      );
    }
  });

  it('shows connection error message', async () => {
    const errorSubscription = TEST_SUBSCRIPTIONS[2];
    renderTable({ subscriptions: TEST_SUBSCRIPTIONS });

    const errorRow = screen.getByRole('row', {
      name: (n) => n.includes(errorSubscription.name),
    });

    const badge = within(errorRow).getByTestId(SubscriptionTestIds.statusBadge);
    expect(badge).toHaveTextContent('Invalid URL');
  });
});

describe('last message timestamp', () => {
  it('shows placeholder if no timestamp', async () => {
    const sub = TEST_SUBSCRIPTIONS[SUBSCRIPTION_INDEX];
    renderTable({ subscriptions: TEST_SUBSCRIPTIONS });

    const row = screen.getByRole('row', {
      name: (n) => n.includes(sub.name),
    });

    expect(row).toHaveTextContent(TIMESTAMP_PLACEHOLDER);
  });

  it('shows date and time if timestamp provided', async () => {
    renderTable({ subscriptions: TEST_SUBSCRIPTIONS });

    const row = screen.getByRole('row', {
      name: (n) => n.includes(TEST_SUBSCRIPTIONS[0].name),
    });

    expect(row).toHaveTextContent('30.10.2025, 15:52:12');
  });
});

describe('delete badge', () => {
  const renderDeleteBadge = createRender(InternalDeleteBadge, {
    tenant: TEST_TENANT,
    project: TEST_PROJECT,
    subscription: TEST_SUBSCRIPTIONS[SUBSCRIPTION_INDEX],
  });

  const openDeleteModal = async () => {
    await USER.click(screen.getByTestId(SettingsTestIds.deleteBadge));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
  };

  describe('structure', () => {
    it('delete badge has correct tooltip', () => {
      renderDeleteBadge();

      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Subscription löschen',
      );
    });

    it('delete confirm modal contains correct texts', async () => {
      renderDeleteBadge();
      await openDeleteModal();

      const testSubscription = TEST_SUBSCRIPTIONS[SUBSCRIPTION_INDEX];
      const modal = within(screen.getByRole('dialog'));
      expect(modal.getByRole('heading')).toHaveTextContent(
        'Sensor Subscription löschen',
      );
      expect(modal.getByRole('paragraph')).toHaveTextContent(
        `Sensor Subscription "${testSubscription.name}" löschen?`,
      );
      expect(modal.getByRole('button', { name: /Entfernen/ })).toBeVisible();
      expect(modal.getByRole('button', { name: /Abbrechen/ })).toBeVisible();
    });
  });

  describe('delete', () => {
    const confirmDeletion = async () => {
      const submitButton = screen
        .getByRole('dialog')
        .querySelector('button[type="submit"]') as HTMLElement;
      await USER.click(submitButton);
    };

    it('delete badge allows deleting specific sensor subscription', async () => {
      const successState = { data: {} };
      deleteSubscriptionMock.mockResolvedValueOnce(successState);
      renderDeleteBadge({
        tenant: TEST_TENANT,
        project: TEST_PROJECT,
        subscription: TEST_SUBSCRIPTIONS[SUBSCRIPTION_INDEX],
      });

      await openDeleteModal();
      await confirmDeletion();

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(deleteSubscriptionMock).toHaveBeenCalledWith(
        TEST_TENANT,
        TEST_PROJECT,
        TEST_SUBSCRIPTIONS[SUBSCRIPTION_INDEX].name,
      );
      expect(UdpToastMock).toHaveBeenCalledWith(
        'Subscription erfolgreich gelöscht',
        'success',
      );
      expect(successToastMock).toHaveBeenCalledTimes(1);
      expect(errorToastMock).not.toHaveBeenCalled();
    });

    it('modal shows error messages if deletion fails', async () => {
      const testErrors = ['error #1', 'error #2'];
      deleteSubscriptionMock.mockResolvedValueOnce({
        errors: { general: testErrors },
      });
      renderDeleteBadge();

      await openDeleteModal();
      await act(() => confirmDeletion());

      const modal = screen.getByRole('dialog');
      expect(modal).toBeVisible();
      testErrors.forEach((error) => expect(modal).toHaveTextContent(error));
      expect(successToastMock).not.toHaveBeenCalled();
      expect(errorToastMock).not.toHaveBeenCalled();
    });

    it('shows error toast if deletion rejected', async () => {
      deleteSubscriptionMock.mockRejectedValueOnce(
        new Error('Failed to delete'),
      );
      renderDeleteBadge();

      await openDeleteModal();
      await confirmDeletion();

      expect(screen.getByRole('dialog')).toBeVisible();
      expect(UdpToastMock).toHaveBeenCalledWith(
        'Subscription konnte nicht gelöscht werden',
        'error',
      );
      expect(successToastMock).not.toHaveBeenCalled();
      expect(errorToastMock).toHaveBeenCalledTimes(1);
    });
  });
});
