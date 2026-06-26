import { screen, waitFor, within } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import UserGroupShareButton, {
  _internal,
  Group,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/UserGroupShareButton';
import { addProjectPermission } from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/actions';
import { UserGroupShareTestIds as TestIds } from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/testIds';
import { createRender } from 'udp-ui/test-utils';
import React, { RefObject } from 'react';
import userEvent from '@testing-library/user-event';
import { UdpButtonTestIds, UdpToast } from 'udp-ui/components';

const { FormContent } = _internal;

const USER = userEvent.setup();

const TEST_TENANT = 'test-tenant';
const TEST_PROJECT = 'test-project';
const TEST_GROUPS = [
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

const addProjectPermissionMock = addProjectPermission as unknown as FuncMock<
  typeof addProjectPermission
>;
jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/actions',
  () => ({
    addProjectPermission: jest.fn(),
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
  addProjectPermissionMock.mockReset();

  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
  successToastMock.mockReset();
  errorToastMock.mockReset();
});

const renderShareButton = createRender(UserGroupShareButton, {
  tenant: TEST_TENANT,
  project: TEST_PROJECT,
  groups: TEST_GROUPS,
});

const renderFormContent = createRender(FormContent, {
  project: TEST_PROJECT,
  groups: TEST_GROUPS,
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
  it('select component for choosing a user group contains as many items as user groups given', () => {
    const formContent = renderFormContent({ groups: TEST_GROUPS });

    const userGroupSelect = formContent.getByRole('combobox');
    expect(userGroupSelect).toHaveLength(TEST_GROUPS.length);
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
    await USER.click(button);
  };

  it('click on submit button shares project', async () => {
    addProjectPermissionMock.mockResolvedValue({ data: {} });

    const component = renderShareButton({
      tenant: TEST_TENANT,
      project: TEST_PROJECT,
    });

    const shareButton = component.getByRole('button');
    await USER.click(shareButton);
    const modal = component.queryByRole('dialog');
    expect(modal).toBeVisible();

    await clickButtonByText('Freigeben');
    expect(modal).not.toBeInTheDocument();

    expect(addProjectPermissionMock).toHaveBeenCalledWith(
      TEST_TENANT,
      TEST_PROJECT,
      {},
      expect.any(FormData),
    );
    expect(UdpToastMock).toHaveBeenCalledWith(
      'Berechtigung erfolgreich erteilt',
      'success',
    );
    expect(successToastMock).toHaveBeenCalledTimes(1);
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('click on cancel button does not share project', async () => {
    const component = renderShareButton();

    const shareButton = component.getByRole('button');
    await USER.click(shareButton);
    const modal = component.queryByRole('dialog');
    expect(modal).toBeVisible();

    await clickButtonByText('Abbrechen');
    expect(modal).not.toBeInTheDocument();

    expect(addProjectPermissionMock).not.toHaveBeenCalled();
    expect(UdpToastMock).not.toHaveBeenCalled();
    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('shows error toast on error response', async () => {
    addProjectPermissionMock.mockResolvedValue({ errors: {} });

    renderShareButton({
      tenant: TEST_TENANT,
      project: TEST_PROJECT,
    });

    const shareButton = screen.getByRole('button');
    await USER.click(shareButton);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
    await clickButtonByText('Freigeben');

    expect(UdpToastMock).toHaveBeenCalledWith(
      'Berechtigung konnte nicht erteilt werden',
      'error',
    );
    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).toHaveBeenCalledTimes(1);
  });

  it('shows error toast if share rejected', async () => {
    addProjectPermissionMock.mockRejectedValueOnce(new Error('error'));

    renderShareButton({
      tenant: TEST_TENANT,
      project: TEST_PROJECT,
    });

    const shareButton = screen.getByRole('button');
    await USER.click(shareButton);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
    await clickButtonByText('Freigeben');

    expect(UdpToastMock).toHaveBeenCalledWith(
      'Berechtigung konnte nicht erteilt werden',
      'error',
    );
    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).toHaveBeenCalledTimes(1);
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
