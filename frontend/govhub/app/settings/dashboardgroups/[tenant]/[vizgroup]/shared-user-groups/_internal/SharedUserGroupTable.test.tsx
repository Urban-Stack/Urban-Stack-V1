import { act, screen, waitFor, within } from '@testing-library/react';
import SharedGroupTable, {
  InternalDeleteBadge,
  InternalPermissionBadge,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/_internal/SharedUserGroupTable';
import { UserGroupPermissionTableTestIds as TableTestIds } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import {
  PermissionName,
  SharedGroup,
} from '@/app/_lib/resource-api/util/shared-groups';
import { FuncMock } from '@/app/_test/utils';
import {
  deleteVizGroupPermission,
  updateVizGroupPermission,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/actions';
import { UdpToast } from 'udp-ui/components';
import { createRender } from 'udp-ui/test-utils';
import userEvent from '@testing-library/user-event';

const USER = userEvent.setup();

const TEST_TENANT = 'test-tenant';
const TEST_VIZGROUP = 'test-vizgroup';
const GROUP_INDEX = 1;
const TEST_GROUPS: SharedGroup[] = [
  {
    name: 'test-group-1',
    tenant: 'test-tenant-1',
    permissionName: 'admin',
    unknownPermissions: false,
    _tag: 'SharedGroup',
  },
  {
    name: 'test-group-2',
    tenant: 'test-tenant-1',
    permissionName: 'read',
    unknownPermissions: false,
    _tag: 'SharedGroup',
  },
  {
    name: 'test-group-3',
    tenant: 'test-tenant-2',
    permissionName: 'admin',
    unknownPermissions: true,
    _tag: 'SharedGroup',
  },
];

jest.mock(
  '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/actions',
  () => ({
    deleteVizGroupPermission: jest.fn(),
    updateVizGroupPermission: jest.fn(),
  }),
);
const deleteVizGroupPermissionMock =
  deleteVizGroupPermission as unknown as FuncMock<
    typeof deleteVizGroupPermission
  >;
const updateVizGroupPermissionMock =
  updateVizGroupPermission as unknown as FuncMock<
    typeof updateVizGroupPermission
  >;

const UdpToastMock = UdpToast as unknown as jest.Mock;
jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

beforeEach(() => {
  deleteVizGroupPermissionMock.mockReset();
  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
  successToastMock.mockReset();
  errorToastMock.mockReset();
});

const renderTable = createRender(SharedGroupTable, {
  tenant: TEST_TENANT,
  vizGroup: TEST_VIZGROUP,
  userGroups: TEST_GROUPS,
});

describe('snapshot', () => {
  it('renders shared groups table as expected', async () => {
    const { container } = renderTable();

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('shared groups table contains as many entries as shared user groups given', async () => {
    renderTable({ userGroups: TEST_GROUPS });

    const items = screen.getAllByTestId(TableTestIds.row);
    expect(items).toHaveLength(TEST_GROUPS.length);
  });

  it('table row contains permission badge and delete badge', () => {
    renderTable();
    const rows = screen.getAllByTestId(TableTestIds.row);
    const testRow = within(rows[GROUP_INDEX]);

    expect(testRow.getByTestId(SettingsTestIds.permBadge)).toBeVisible();
    expect(testRow.getByTestId(SettingsTestIds.deleteBadge)).toBeVisible();
  });
});

describe('permission', () => {
  const renderPermissionBadge = createRender(InternalPermissionBadge, {
    tenant: TEST_TENANT,
    vizGroup: TEST_VIZGROUP,
    userGroup: TEST_GROUPS[GROUP_INDEX],
  });

  const openPermissionModal = async () => {
    await USER.click(screen.getByTestId(SettingsTestIds.permBadge));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
  };

  describe('structure', () => {
    const SCOPE_TEST_CASES: [string, PermissionName][] = [
      ['Mitarbeiter', 'admin'],
      ['Betrachter', 'read'],
    ];
    it.each(SCOPE_TEST_CASES)(
      'permission badge has correct tooltip and label text %p for shared user group having permission %p',
      (expectedLabel, permission) => {
        const testGroup: SharedGroup = {
          ...TEST_GROUPS[GROUP_INDEX],
          ...{ permissionName: permission },
        };

        renderTable({ userGroups: [testGroup] });

        const permBadge = screen.getByTestId(SettingsTestIds.permBadge);
        expect(within(permBadge).getByRole('tooltip')).toHaveTextContent(
          'Berechtigung ändern',
        );
        expect(permBadge).toHaveTextContent(expectedLabel);
      },
    );

    it('permission update modal contains correct texts', async () => {
      renderPermissionBadge();
      await openPermissionModal();

      const testGroup = TEST_GROUPS[GROUP_INDEX];
      const modal = within(screen.getByRole('dialog'));
      expect(modal.getByRole('heading')).toHaveTextContent(
        'Berechtigung ändern',
      );
      expect(modal.getByRole('paragraph')).toHaveTextContent(
        `Berechtigung für "${testGroup.name} (${testGroup.tenant})" ändern`,
      );
      expect(modal.getByRole('button', { name: /Speichern/ })).toBeVisible();
      expect(modal.getByRole('button', { name: /Abbrechen/ })).toBeVisible();
    });

    it('shows note for shared user group having any unknown permissions', () => {
      const testGroup: SharedGroup = {
        ...TEST_GROUPS[GROUP_INDEX],
        ...{ unknownPermissions: true },
      };

      renderTable({ userGroups: [testGroup] });

      const permNoteCell = screen.getByTestId(TableTestIds.permissionNote);
      expect(permNoteCell).toBeVisible();
      expect(permNoteCell).toHaveTextContent(
        '(Es existieren zusätzliche, nicht unterstütze Freigaben)',
      );
    });

    it('does not show note if no unknown permissions', () => {
      const testGroup: SharedGroup = {
        ...TEST_GROUPS[GROUP_INDEX],
        ...{ unknownPermissions: false },
      };

      renderTable({ userGroups: [testGroup] });

      const permNoteCell = screen.queryByTestId(TableTestIds.permissionNote);
      expect(permNoteCell).not.toBeInTheDocument();
    });
  });

  describe('update', () => {
    const confirmUpdate = async () => {
      const submitButton = screen
        .getByRole('dialog')
        .querySelector('button[type="submit"]') as HTMLElement;
      await USER.click(submitButton);
    };

    it('permission badge allows updating project permission for specific user group', async () => {
      const successState = { data: {} };
      updateVizGroupPermissionMock.mockResolvedValueOnce(successState);
      renderTable({
        tenant: TEST_TENANT,
        vizGroup: TEST_VIZGROUP,
        userGroups: [TEST_GROUPS[GROUP_INDEX]],
      });

      await openPermissionModal();
      await confirmUpdate();

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(updateVizGroupPermissionMock).toHaveBeenCalledWith(
        TEST_TENANT,
        TEST_VIZGROUP,
        TEST_GROUPS[GROUP_INDEX],
        expect.anything(),
        expect.anything(),
      );
    });

    const TEST_ERRORS = ['error #1', 'error #2'];
    const ERROR_MAPPING_TEST_CASES = [
      {
        testCase: 'general errors',
        errors: { general: TEST_ERRORS },
      },
      {
        testCase: 'permission errors',
        errors: { permission: TEST_ERRORS },
      },
    ];
    it.each(ERROR_MAPPING_TEST_CASES)(
      'permission modal shows error messages if update fails ($testCase)',
      async ({ errors }) => {
        updateVizGroupPermissionMock.mockResolvedValueOnce({ errors });
        renderPermissionBadge();

        await openPermissionModal();
        await act(() => confirmUpdate());

        const modal = screen.getByRole('dialog');
        expect(modal).toBeVisible();
        TEST_ERRORS.forEach((error) => expect(modal).toHaveTextContent(error));
      },
    );
  });
});

describe('delete badge', () => {
  const renderDeleteBadge = createRender(InternalDeleteBadge, {
    tenant: TEST_TENANT,
    vizGroup: TEST_VIZGROUP,
    userGroup: TEST_GROUPS[GROUP_INDEX],
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

      const testGroup = TEST_GROUPS[GROUP_INDEX];
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

    it('delete badge allows deleting project permission for specific user group', async () => {
      const successState = { data: {} };
      deleteVizGroupPermissionMock.mockResolvedValueOnce(successState);
      renderDeleteBadge({
        tenant: TEST_TENANT,
        vizGroup: TEST_VIZGROUP,
        userGroup: TEST_GROUPS[GROUP_INDEX],
      });

      await openDeleteModal();
      await confirmDeletion();

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(deleteVizGroupPermissionMock).toHaveBeenCalledWith(
        TEST_TENANT,
        TEST_VIZGROUP,
        TEST_GROUPS[GROUP_INDEX],
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
      deleteVizGroupPermissionMock.mockResolvedValueOnce({
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
      deleteVizGroupPermissionMock.mockRejectedValueOnce(
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
