import { act, screen, within } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import UserGroupShareButton, {
  _internal,
  UserGroup,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/UserGroupShareButton';
import { UserGroupShareButtonTestIds as TestIds } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/testIds';
import { addVizGroupPermission } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/actions';
import { createRender } from 'udp-ui/test-utils';
import React, { RefObject } from 'react';
import userEvent from '@testing-library/user-event';
import { UdpButtonTestIds } from 'udp-ui/components';

const { FormContent } = _internal;

const USER = userEvent.setup();

const TEST_TENANT = 'test-tenant';
const TEST_VIZ_GROUP = 'test-viz-group';
const TEST_USER_GROUPS = [
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
] as UserGroup[];

const addVizGroupPermissionMock = addVizGroupPermission as unknown as FuncMock<
  typeof addVizGroupPermission
>;
jest.mock(
  '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/actions',
  () => ({
    addVizGroupPermission: jest.fn(),
  }),
);

beforeEach(() => {
  addVizGroupPermissionMock.mockReset();
});

const renderShareButton = createRender(UserGroupShareButton, {
  tenant: TEST_TENANT,
  vizGroup: TEST_VIZ_GROUP,
  userGroups: TEST_USER_GROUPS,
});

const renderFormContent = createRender(FormContent, {
  vizGroup: TEST_VIZ_GROUP,
  userGroups: TEST_USER_GROUPS,
  isLoading: false,
  initialFocusRef: React.createRef<HTMLElement>() as RefObject<HTMLElement>,
  closeModal: () => {},
});

describe('snapshot', () => {
  it('share button matches snapshot', () => {
    const { container } = renderShareButton();

    expect(container).toMatchSnapshot();
  });

  it('popover form matches snapshot', () => {
    const { container } = renderFormContent();

    expect(container).toMatchSnapshot();
  });

  it('popover form matches snapshot when group name error', () => {
    const { container } = renderFormContent({
      errors: { userGroupName: ['error'] },
    });

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('select component for choosing a user group contains as many items as user groups given', () => {
    renderFormContent({ userGroups: TEST_USER_GROUPS });

    const userGroupSelect = screen.getByRole('combobox');
    expect(userGroupSelect).toHaveLength(TEST_USER_GROUPS.length);
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
  const clickButtonByText = async (text: string) => {
    const button = screen.getByRole('button', { name: new RegExp(text) });
    await act(async () => button.click());
  };

  it('click on submit button shares viz-group', async () => {
    addVizGroupPermissionMock.mockResolvedValue({ data: {} });

    renderShareButton({
      tenant: TEST_TENANT,
      vizGroup: TEST_VIZ_GROUP,
    });

    const shareButton = screen.getByRole('button');
    act(() => shareButton.click());
    const popover = screen.queryByRole('dialog');
    expect(popover).toBeVisible();

    await clickButtonByText('Freigeben');
    expect(popover).not.toBeInTheDocument();

    expect(addVizGroupPermissionMock).toHaveBeenCalledWith(
      TEST_TENANT,
      TEST_VIZ_GROUP,
      {},
      expect.any(FormData),
    );
  });

  it('click on cancel button does not share viz-group', async () => {
    renderShareButton();

    const shareButton = screen.getByRole('button');
    act(() => shareButton.click());
    const popover = screen.queryByRole('dialog');
    expect(popover).toBeVisible();

    await clickButtonByText('Abbrechen');
    expect(popover).not.toBeInTheDocument();

    expect(addVizGroupPermissionMock).not.toHaveBeenCalled();
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
        errors: { userGroupName: errors },
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
