import { screen, waitFor, within } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import UserGroupShareButton, {
  _internal,
  Group,
} from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/UserGroupShareButton';
import { addUserGroupPermission } from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/actions';
import { UserGroupShareTestIds as TestIds } from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/testIds';
import { createRender } from 'udp-ui/test-utils';
import React, { RefObject } from 'react';
import userEvent from '@testing-library/user-event';
import { UdpButtonTestIds } from 'udp-ui/components';

const { FormContent } = _internal;

const USER = userEvent.setup();

const TENANT = 'test-tenant';
const GROUP_NAME = 'test-group-name';
const GROUPS = [
  {
    name: 'test-group-1',
    tenant: 'test-tenant-1',
  },
  {
    name: 'test-group-2',
    tenant: 'test-tenant-1',
  },
  {
    name: 'test-group-3',
    tenant: 'test-tenant-2',
  },
  {
    name: 'test-group-4',
    tenant: 'test-tenant-1',
  },
] as Group[];

const addUserGroupPermissionMock =
  addUserGroupPermission as unknown as FuncMock<typeof addUserGroupPermission>;
jest.mock(
  '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/actions',
  () => ({
    addUserGroupPermission: jest.fn(),
  }),
);

beforeEach(() => {
  addUserGroupPermissionMock.mockReset();
});

const renderShareButton = createRender(UserGroupShareButton, {
  tenant: TENANT,
  groupName: GROUP_NAME,
  groups: GROUPS,
});

const renderFormContent = createRender(FormContent, {
  groupName: GROUP_NAME,
  groups: GROUPS,
  isLoading: false,
  initialFocusRef: React.createRef<HTMLElement>() as RefObject<HTMLElement>,
  closeModal: () => {},
});

describe('snapshot', () => {
  it('share button matches snapshot', () => {
    const { container } = renderShareButton();

    expect(container).toMatchSnapshot();
  });

  it('modal form matches snapshot', () => {
    const { container } = renderFormContent();

    expect(container).toMatchSnapshot();
  });

  it('modal form matches snapshot when group name error', () => {
    const { container } = renderFormContent({
      errors: { groupName: ['error'] },
    });

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('select component for choosing user group contains as many items as user groups given', () => {
    renderFormContent({ groups: GROUPS });

    const userGroupSelect = screen.getByRole('combobox');
    expect(userGroupSelect).toHaveLength(GROUPS.length);
  });

  it('radio button group for permissions contains 2 options with the read permission being initially checked', () => {
    const { getByTestId } = renderFormContent();

    const radioButtonGroup = within(getByTestId(TestIds.permRadioButtonGroup));
    expect(radioButtonGroup.getAllByRole('radio')).toHaveLength(2);
    expectOption(radioButtonGroup, 'read').toHaveAttribute('checked');
    expectOption(radioButtonGroup, 'admin').not.toHaveAttribute('checked');
  });

  const expectOption = (
    radioButtonGroup: ReturnType<typeof within>,
    displayValue: string,
  ) => expect(radioButtonGroup.getByDisplayValue(displayValue));
});

describe('buttons', () => {
  const openShareModal = async () => {
    await USER.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeVisible());
  };

  const clickButtonByText = async (text: string) => {
    const button = screen.getByRole('button', { name: new RegExp(text) });
    await USER.click(button);
  };

  it('click on submit button shares user group', async () => {
    addUserGroupPermissionMock.mockResolvedValue({ data: {} });

    const { queryByRole } = renderShareButton({
      tenant: TENANT,
      groupName: GROUP_NAME,
    });
    await openShareModal();

    await clickButtonByText('Freigeben');
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());

    expect(addUserGroupPermissionMock).toHaveBeenCalledWith(
      TENANT,
      GROUP_NAME,
      {},
      expect.any(FormData),
    );
  });

  it('click on cancel button does not share user group', async () => {
    const { queryByRole } = renderShareButton();
    await openShareModal();

    await clickButtonByText('Abbrechen');
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());

    expect(addUserGroupPermissionMock).not.toHaveBeenCalled();
  });
});

describe('errors', () => {
  const expectErrorMessages = (container: HTMLElement, errors: string[]) => {
    errors.forEach((msg) => {
      expect(within(container).getByText(msg)).toBeVisible();
    });
  };

  const errorTestCases = [
    { testCase: 'single error', errors: ['error message @ test'] },
    { testCase: 'multiple errors', errors: ['multiple', 'errors @ test'] },
  ];

  it.each(errorTestCases)(
    'displays error messages regarding the user group name for $testCase',
    ({ errors }) => {
      const { getByTestId } = renderFormContent({
        errors: { groupName: errors },
      });

      expectErrorMessages(getByTestId(TestIds.userGroupSelect), errors);
    },
  );

  it.each(errorTestCases)(
    'displays error messages regarding permissions for $testCase',
    ({ errors }) => {
      const { getByTestId } = renderFormContent({
        errors: { permission: errors },
      });

      expectErrorMessages(getByTestId(TestIds.permRadioButtonGroup), errors);
    },
  );

  it.each(errorTestCases)(
    'displays general error messages for $testCase',
    ({ errors }) => {
      const { getByTestId } = renderFormContent({
        errors: { general: errors },
      });

      expectErrorMessages(getByTestId(TestIds.errorContainer), errors);
    },
  );
});

describe('initial focus', () => {
  it('group select gets reference for initial focus component', () => {
    const ref = React.createRef<HTMLElement>() as RefObject<HTMLElement>;

    renderFormContent({ initialFocusRef: ref });

    expect(ref.current).toEqual(screen.getByRole('combobox'));
  });
});

describe('closing', () => {
  it('callback function "closeModal" is invoked by cancel button', async () => {
    const closeModalMock = jest.fn();

    renderFormContent({ closeModal: closeModalMock });
    expect(closeModalMock).not.toHaveBeenCalled();

    const cancelButton = screen.getByRole('button', { name: /Abbrechen/ });
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
