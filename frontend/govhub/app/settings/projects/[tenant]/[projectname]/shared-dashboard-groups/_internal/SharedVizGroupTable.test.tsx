import { act, screen, waitFor, within } from '@testing-library/react';
import SharedVizGroupTable, {
  InternalDeleteBadge,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/_internal/SharedVizGroupTable';
import { GroupTableTestIds } from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { FuncMock } from '@/app/_test/utils';
import { deleteProjectPermission } from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/actions';
import { UdpToast } from 'udp-ui/components';
import { createRender } from 'udp-ui/test-utils';
import userEvent from '@testing-library/user-event';

const USER = userEvent.setup();

const TENANT_NAME = 'test-tenant';
const PROJECT_NAME = 'test-project';
const GROUP_INDEX = 1;
const GROUPS: VizGroup[] = [
  {
    name: 'viz-group-1',
    tenant: 'test-tenant-1',
    _tag: 'VizGroup',
  },
  {
    name: 'viz-group-2',
    tenant: 'test-tenant-1',
    _tag: 'VizGroup',
  },
  {
    name: 'viz-group-3',
    tenant: 'test-tenant-2',
    _tag: 'VizGroup',
  },
];

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/actions',
  () => ({
    addProjectPermission: jest.fn(),
    deleteProjectPermission: jest.fn(),
  }),
);
const deleteProjectPermissionMock =
  deleteProjectPermission as unknown as FuncMock<
    typeof deleteProjectPermission
  >;

jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  queryAllVizGroups: jest.fn(),
}));

const UdpToastMock = UdpToast as unknown as jest.Mock;
jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

beforeEach(() => {
  deleteProjectPermissionMock.mockReset();
  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
  successToastMock.mockReset();
  errorToastMock.mockReset();
});

const renderTable = createRender(SharedVizGroupTable, {
  tenant: TENANT_NAME,
  project: PROJECT_NAME,
  groups: GROUPS,
});

describe('pseudo snapshot', () => {
  it('renders table as expected', async () => {
    renderTable({ groups: GROUPS });

    const table = screen.getByTestId(GroupTableTestIds.self);
    expect(table).toBeInTheDocument();
    expect(within(table).getByText('Name')).toBeInTheDocument();
    expect(within(table).getByText('Mandant')).toBeInTheDocument();

    const rows = screen.getAllByTestId(GroupTableTestIds.row);
    expect(rows).toHaveLength(3);

    rows.forEach((row, idx) => {
      expect(row).toHaveTextContent(GROUPS[idx].tenant);
      expect(row).toHaveTextContent(GROUPS[idx].name);
    });
  });
});

describe('content', () => {
  it('table row contains delete badge', () => {
    renderTable();
    const rows = screen.getAllByTestId(GroupTableTestIds.row);
    const testRow = within(rows[GROUP_INDEX]);

    expect(testRow.getByTestId(SettingsTestIds.deleteBadge)).toBeVisible();
  });
});

describe('delete badge', () => {
  const renderDeleteBadge = createRender(InternalDeleteBadge, {
    tenant: TENANT_NAME,
    project: PROJECT_NAME,
    group: GROUPS[GROUP_INDEX],
  });

  const openDeleteModal = async () => {
    await USER.click(screen.getByTestId(SettingsTestIds.deleteBadge));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
  };

  describe('structure', () => {
    it('delete badge has correct tooltip', () => {
      renderDeleteBadge();

      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Berechtigung entfernen',
      );
    });

    it('delete confirm modal contains correct texts', async () => {
      renderDeleteBadge();
      await openDeleteModal();

      const testGroup = GROUPS[GROUP_INDEX];
      const modal = within(screen.getByRole('dialog'));
      expect(modal.getByRole('heading')).toHaveTextContent(
        'Berechtigung entfernen',
      );
      expect(modal.getByRole('paragraph')).toHaveTextContent(
        `Berechtigung für "${testGroup.name} (${testGroup.tenant})" entfernen?`,
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

    it('delete badge allows deleting project permission for specific dashboard group', async () => {
      const successState = { data: {} };
      deleteProjectPermissionMock.mockResolvedValueOnce(successState);
      renderDeleteBadge({
        tenant: TENANT_NAME,
        project: PROJECT_NAME,
        group: GROUPS[GROUP_INDEX],
      });

      await openDeleteModal();
      await confirmDeletion();

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(deleteProjectPermissionMock).toHaveBeenCalledWith(
        TENANT_NAME,
        PROJECT_NAME,
        GROUPS[GROUP_INDEX],
      );
      expect(UdpToastMock).toHaveBeenCalledWith(
        'Berechtigung erfolgreich entfernt',
        'success',
      );
      expect(successToastMock).toHaveBeenCalledTimes(1);
      expect(errorToastMock).not.toHaveBeenCalled();
    });

    it('modal shows error messages if deletion fails', async () => {
      const testErrors = ['error #1', 'error #2'];
      deleteProjectPermissionMock.mockResolvedValueOnce({
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
      deleteProjectPermissionMock.mockRejectedValueOnce(
        new Error('Failed to delete'),
      );
      renderDeleteBadge();

      await openDeleteModal();
      await confirmDeletion();

      expect(screen.getByRole('dialog')).toBeVisible();
      expect(UdpToastMock).toHaveBeenCalledWith(
        'Berechtigung konnte nicht entfernt werden',
        'error',
      );
      expect(successToastMock).not.toHaveBeenCalled();
      expect(errorToastMock).toHaveBeenCalledTimes(1);
    });
  });
});
