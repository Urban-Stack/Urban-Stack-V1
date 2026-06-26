import { act, screen, waitFor, within } from '@testing-library/react';
import CredentialTable, {
  InternalDeleteBadge,
} from '@/app/settings/projects/[tenant]/[projectname]/credentials/CredentialTable';
import { CredentialTestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { SensorCredential } from '@/app/_lib/resource-api/project/credentials';
import { FuncMock } from '@/app/_test/utils';
import { deleteCredential } from '@/app/settings/projects/[tenant]/[projectname]/credentials/actions';
import { UdpToast } from 'udp-ui/components';
import { createRender } from 'udp-ui/test-utils';
import userEvent from '@testing-library/user-event';

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/credentials/actions',
  () => ({
    deleteCredential: jest.fn(),
  }),
);
const deleteCredentialMock = deleteCredential as unknown as FuncMock<
  typeof deleteCredential
>;

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/credentials/RotateBadge',
  () => ({
    __esModule: true,
    default: () => <button>Rotate</button>,
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

const TENANT = 'tenant1';
const PROJECT = 'project1';
const CREDENTIAL_INDEX = 1;
const CREDENTIALS: SensorCredential[] = [
  { name: 'cred1', username: 'name1', _tag: 'SensorCredential' },
  { name: 'cred2', username: 'name2', _tag: 'SensorCredential' },
  { name: 'cred3', username: 'name3', _tag: 'SensorCredential' },
];

const renderTable = createRender(CredentialTable, {
  tenant: TENANT,
  project: PROJECT,
  credentials: CREDENTIALS,
});

describe('snapshot', () => {
  it('renders list overview as expected', async () => {
    const { container } = renderTable();

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('credential table contains all given entries', async () => {
    const component = renderTable({ credentials: CREDENTIALS });

    const items = component.getAllByTestId(CredentialTestIds.tableItem);
    expect(items).toHaveLength(CREDENTIALS.length);
  });

  it('table row contains delete badge', () => {
    const component = renderTable();
    const rows = component.getAllByTestId(CredentialTestIds.tableItem);
    const testRow = within(rows[CREDENTIAL_INDEX]);

    expect(testRow.getByTestId(SettingsTestIds.deleteBadge)).toBeVisible();
  });
});

describe('delete badge', () => {
  const renderDeleteBadge = createRender(InternalDeleteBadge, {
    tenant: TENANT,
    project: PROJECT,
    credential: CREDENTIALS[CREDENTIAL_INDEX],
  });

  const openDeleteModal = async () => {
    await USER.click(screen.getByTestId(SettingsTestIds.deleteBadge));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
  };

  describe('structure', () => {
    it('delete badge has correct tooltip', () => {
      renderDeleteBadge();

      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Credentials löschen',
      );
    });

    it('delete confirm modal contains correct texts', async () => {
      renderDeleteBadge();
      await openDeleteModal();

      const testCred = CREDENTIALS[CREDENTIAL_INDEX];
      const modal = within(screen.getByRole('dialog'));
      expect(modal.getByRole('heading')).toHaveTextContent(
        'Sensor Credentials löschen',
      );
      expect(modal.getByRole('paragraph')).toHaveTextContent(
        `Sensor Credentials "${testCred.name}" löschen?`,
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

    it('delete badge allows deleting specific project credentials', async () => {
      const successState = { data: {} };
      deleteCredentialMock.mockResolvedValueOnce(successState);
      renderDeleteBadge({
        tenant: TENANT,
        project: PROJECT,
        credential: CREDENTIALS[CREDENTIAL_INDEX],
      });

      await openDeleteModal();
      await confirmDeletion();

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(deleteCredentialMock).toHaveBeenCalledWith(
        TENANT,
        PROJECT,
        CREDENTIALS[CREDENTIAL_INDEX].name,
      );
      expect(UdpToastMock).toHaveBeenCalledWith(
        'Credentials erfolgreich gelöscht',
        'success',
      );
      expect(successToastMock).toHaveBeenCalledTimes(1);
      expect(errorToastMock).not.toHaveBeenCalled();
    });

    it('modal shows error messages if deletion fails', async () => {
      const testErrors = ['error #1', 'error #2'];
      deleteCredentialMock.mockResolvedValueOnce({
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
      deleteCredentialMock.mockRejectedValueOnce(new Error('Failed to delete'));
      renderDeleteBadge();

      await openDeleteModal();
      await confirmDeletion();

      expect(screen.getByRole('dialog')).toBeVisible();
      expect(UdpToastMock).toHaveBeenCalledWith(
        'Credentials konnten nicht gelöscht werden',
        'error',
      );
      expect(successToastMock).not.toHaveBeenCalled();
      expect(errorToastMock).toHaveBeenCalledTimes(1);
    });
  });
});
