import { act, screen, within } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { stateShareUserGroup } from '@/app/settings/usergroups/actions';
import UserGroupShareButton, {
  _internal,
} from '@/app/settings/usergroups/[tenant]/[groupname]/public/UserGroupShareButton';
import { PublicUserGroupTestIds } from '@/app/settings/usergroups/[tenant]/[groupname]/public/testIds';
import { capitalize } from 'udp-ui/string';
import { createRender } from 'udp-ui/test-utils';
import React, { RefObject } from 'react';
import { UdpButtonTestIds } from 'udp-ui/components';
import userEvent from '@testing-library/user-event';

const USER = userEvent.setup();

const { FormContent } = _internal;

const TEST_GROUP = {
  name: 'test-group-1',
  tenant: 'test-tenant-1',
} as UserGroup;

const stateShareUserGroupMock = stateShareUserGroup as unknown as FuncMock<
  typeof stateShareUserGroup
>;
jest.mock('@/app/settings/usergroups/actions', () => ({
  stateShareUserGroup: jest.fn(),
}));

beforeEach(() => {
  stateShareUserGroupMock.mockReset();
});

const renderShareButton = createRender(UserGroupShareButton, {
  group: TEST_GROUP,
});

const renderFormContent = createRender(FormContent, {
  group: TEST_GROUP,
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

  it('modal form matches snapshot when error', () => {
    const { container } = renderFormContent({
      errors: { general: ['error'] },
    });

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('has correct layout', () => {
    const formContent = renderFormContent();

    expect(formContent.container).toHaveTextContent(
      `Benutzergruppe "${capitalize(TEST_GROUP.name)}" teilen?`,
    );

    const submitBtn = formContent.getByRole('button', { name: /Teilen/ });
    expect(submitBtn).toBeInTheDocument();
    const cancelBtn = formContent.getByRole('button', { name: /Abbrechen/ });
    expect(cancelBtn).toBeInTheDocument();
    expect(formContent.getAllByRole('button')).toHaveLength(2);
  });
});

describe('buttons', () => {
  const clickButtonByText = async (text: string) => {
    const button = screen.getByRole('button', { name: new RegExp(text) });
    await USER.click(button);
  };

  const confirmShare = async () => {
    const submitButton = screen
      .getByRole('dialog')
      .querySelector('button[type=submit]') as HTMLElement;
    await act(() => USER.click(submitButton));
  };

  it('click on submit button shares user group', async () => {
    stateShareUserGroupMock.mockResolvedValue({ data: {} });

    const component = renderShareButton();

    const shareButton = component.getByRole('button');
    await USER.click(shareButton);
    const modal = component.queryByRole('dialog');
    expect(modal).toBeVisible();

    await act(() => confirmShare());
    expect(modal).not.toBeInTheDocument();

    expect(stateShareUserGroupMock).toHaveBeenCalledWith(
      TEST_GROUP,
      {},
      expect.any(FormData),
    );
  });

  it('click on cancel button does not share use group', async () => {
    const component = renderShareButton();

    const shareButton = component.getByRole('button');
    await USER.click(shareButton);
    const modal = component.queryByRole('dialog');
    expect(modal).toBeVisible();

    await clickButtonByText('Abbrechen');
    expect(modal).not.toBeInTheDocument();

    expect(stateShareUserGroupMock).not.toHaveBeenCalled();
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
    'displays general error messages for $testCase',
    ({ errors }) => {
      const { getByTestId } = renderFormContent({
        errors: { general: errors },
      });

      expectErrorMessages(
        getByTestId(PublicUserGroupTestIds.errorContainer),
        errors,
      );
    },
  );
});

describe('initial focus', () => {
  it('submit button gets reference for initial focus component', () => {
    const ref = React.createRef<HTMLElement>() as RefObject<HTMLElement>;

    renderFormContent({ initialFocusRef: ref });

    const submitButton = screen.getByRole('button', { name: /Teilen/ });
    expect(ref.current).toEqual(submitButton);
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
