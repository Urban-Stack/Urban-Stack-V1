import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FuncMock } from '@/app/_test/utils';
import { UdpToast } from 'udp-ui/components';
import { useParams, useRouter } from 'next/navigation';
import {
  deleteUserGroup,
  DeleteUserGroupState,
} from '@/app/settings/usergroups/actions';
import DangerZone from '@/app/settings/usergroups/[tenant]/[groupname]/danger-zone/DangerZone';

const TEST_TENANT_NAME = 'test-tenant';
const TEST_USER_GROUP = 'test-group';

jest.mock('@/app/settings/usergroups/actions', () => ({
  deleteUserGroup: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/usergroups', () => ({
  mutateDeleteUserGroup: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

const UdpToastMock = UdpToast as unknown as jest.Mock;
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

const deleteUserGroupMock: FuncMock<typeof deleteUserGroup> =
  deleteUserGroup as unknown as jest.Mock;

const renderComponent = async () => render(DangerZone());

beforeEach(() => {
  deleteUserGroupMock.mockReset();
  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
  successToastMock.mockReset();
  errorToastMock.mockReset();
  jest.mocked(useParams).mockReturnValue({
    tenant: TEST_TENANT_NAME,
    groupname: TEST_USER_GROUP,
  });
});

describe('pseudo snapshot', () => {
  it('renders page as expected', async () => {
    const component = await renderComponent();

    const deleteBtn = component.getByRole('button', { name: /Löschen/ });
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn).toBeDisabled();

    const heading = component.getByText(
      'Hier können Sie die Benutzergruppe "test-group" des Mandanten "test-tenant" löschen',
    );
    expect(heading).toBeInTheDocument();

    const explainer = component.getByText(
      'Die Benutzergruppe, sowie die Verbindungen zwischen der Gruppe und aller ihrer Mitglieder, werden dauerhaft gelöscht! Diese Aktion kann nicht rückgängig gemacht werden!',
    );
    expect(explainer).toBeInTheDocument();

    const textBox = component.getByRole('textbox', {
      name: 'Geben Sie hier zur Bestätigung den Namen der Benutzergruppe ein, die Sie löschen wollen.',
    });
    expect(textBox).toBeInTheDocument();
  });
});

describe('delete', () => {
  it('can delete user group', async () => {
    const replaceStateMock = jest.fn();

    jest.mocked(useRouter).mockReturnValue({
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      push: jest.fn(),
      prefetch: jest.fn(),
      replace: replaceStateMock,
    });

    const user = userEvent.setup();

    deleteUserGroupMock.mockReturnValueOnce(
      Promise.resolve({
        data: {},
      }),
    );

    const component = await renderComponent();

    const textBox = component.getByRole('textbox', {
      name: 'Geben Sie hier zur Bestätigung den Namen der Benutzergruppe ein, die Sie löschen wollen.',
    });
    const deleteBtn = component.getByRole('button', { name: /Löschen/ });

    await user.type(textBox, TEST_USER_GROUP);
    expect(deleteBtn).not.toBeDisabled();

    await user.click(deleteBtn);

    expect(deleteUserGroupMock).toHaveBeenCalledWith({
      tenant: TEST_TENANT_NAME,
      name: TEST_USER_GROUP,
    });
    expect(replaceStateMock).toHaveBeenCalledWith('/settings/usergroups');
    expect(UdpToastMock).toHaveBeenCalledWith(
      'Benutzergruppe erfolgreich gelöscht',
      'success',
    );
    expect(successToastMock).toHaveBeenCalledTimes(1);
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('does not redirect when error occurs', async () => {
    const replaceStateMock = jest.fn();

    jest.mocked(useRouter).mockReturnValue({
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      push: jest.fn(),
      prefetch: jest.fn(),
      replace: replaceStateMock,
    });
    const user = userEvent.setup();

    deleteUserGroupMock.mockReturnValueOnce(
      Promise.resolve({
        errors: [
          {
            general: 'Test error',
          },
        ],
      } as DeleteUserGroupState),
    );

    const component = await renderComponent();

    const textBox = component.getByRole('textbox', {
      name: 'Geben Sie hier zur Bestätigung den Namen der Benutzergruppe ein, die Sie löschen wollen.',
    });
    const deleteBtn = component.getByRole('button', { name: /Löschen/ });

    await user.type(textBox, TEST_USER_GROUP);
    expect(deleteBtn).not.toBeDisabled();

    await user.click(deleteBtn);

    expect(deleteUserGroupMock).toHaveBeenCalledWith({
      tenant: TEST_TENANT_NAME,
      name: TEST_USER_GROUP,
    });
    expect(replaceStateMock).not.toHaveBeenCalled();
    expect(UdpToastMock).toHaveBeenCalledWith(
      'Benutzergruppe konnte nicht gelöscht werden',
      'error',
    );
    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).toHaveBeenCalledTimes(1);
  });

  it('does not enable button with wrong input', async () => {
    const user = userEvent.setup();

    const component = await renderComponent();

    const textBox = component.getByRole('textbox', {
      name: 'Geben Sie hier zur Bestätigung den Namen der Benutzergruppe ein, die Sie löschen wollen.',
    });
    const deleteBtn = component.getByRole('button', { name: /Löschen/ });

    await user.type(textBox, TEST_USER_GROUP.slice(0, -1));
    expect(deleteBtn).toBeDisabled();
  });
});
