import { act, render, screen, waitFor, within } from '@testing-library/react';
import { createCredential } from '@/app/settings/projects/[tenant]/[projectname]/credentials/actions';
import { FuncMock } from '@/app/_test/utils';
import userEvent from '@testing-library/user-event';
import React from 'react';
import CreateCredentialButton from '@/app/settings/projects/[tenant]/[projectname]/credentials/CreateCredentialButton';
import { CredentialTestIds as TestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';
import { UdpClientModal } from 'udp-ui/components';

const USER = userEvent.setup();

const TENANT = 'test-tenant';
const PROJECT = 'test-project';
const USERNAME = 'test-user';
const PASSWORD = 'test-password';

const UdpClientModalMock = UdpClientModal as unknown as jest.Mock;
jest.mock('udp-ui/components', () => {
  const actual = jest.requireActual('udp-ui/components');
  return {
    ...actual,
    UdpButton: jest.fn(({ children, ...restProps }) => (
      <button {...restProps}>{children}</button>
    )),
    UdpClientModal: jest.fn((props) => actual.UdpClientModal(props)),
  };
});

const createCredentialMock = createCredential as unknown as FuncMock<
  typeof createCredential
>;
jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/credentials/actions',
  () => ({
    createCredential: jest.fn(),
  }),
);

beforeEach(() => {
  createCredentialMock.mockReset();
});

const clickTriggerButton = async () => {
  await USER.click(
    screen.getByRole('button', {
      name: 'Neue Credentials',
    }),
  );
};

const clickSubmitButton = async () => {
  await USER.click(
    screen.getByRole('button', {
      name: 'Credentials erstellen',
    }),
  );
};

const closeRevealModal = async () => {
  const revealModal = screen.getByTestId(TestIds.revealModal);
  const closeButton = within(revealModal).getByRole('button', {
    name: 'Schließen',
  });
  await USER.click(closeButton);
};

const submitCreate = async () => {
  const input = screen.getByRole('textbox');
  await USER.type(input, 'test-creds');
  await clickSubmitButton();
};

const submitAndWait = async () => {
  await submitCreate();
  await waitFor(() =>
    expect(screen.getByTestId(TestIds.revealModal)).toBeVisible(),
  );
};

describe('snapshot', () => {
  it('trigger button matches snapshot', () => {
    const component = render(
      <CreateCredentialButton tenant={TENANT} project={PROJECT} />,
    );

    expect(component).toMatchSnapshot();
  });
});

describe('visibility', () => {
  it('click on trigger button opens create modal', async () => {
    render(<CreateCredentialButton tenant={TENANT} project={PROJECT} />);

    await clickTriggerButton();

    const createModal = screen.getByTestId(TestIds.createModal);
    expect(createModal).toBeVisible();
    expect(UdpClientModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Neue Credentials erstellen',
        size: 'lg',
      }),
      undefined,
    );
  });

  it('click on submit button shows modal with created credentials', async () => {
    const state = { data: { username: USERNAME, password: PASSWORD } };
    createCredentialMock.mockResolvedValueOnce(state);
    render(<CreateCredentialButton tenant={TENANT} project={PROJECT} />);

    await clickTriggerButton();
    await submitAndWait();

    const modal = screen.getByTestId(TestIds.revealModal);
    expect(modal).toBeVisible();
    expect(UdpClientModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ihre neuen Sensor Credentials',
        size: '2xl',
      }),
      undefined,
    );
    expect(getTextboxByName(modal, 'Benutzername')).toHaveValue(USERNAME);
    expect(getTextboxByName(modal, 'Passwort')).toHaveValue(PASSWORD);
  });

  const getTextboxByName = (modal: HTMLElement, name: string) =>
    within(modal).getByRole('textbox', { name });

  it('click on trigger button resets previous state', async () => {
    const state = { data: { username: USERNAME, password: PASSWORD } };
    createCredentialMock.mockResolvedValueOnce(state);
    render(<CreateCredentialButton tenant={TENANT} project={PROJECT} />);
    await clickTriggerButton();
    await submitAndWait();
    await closeRevealModal();

    await clickTriggerButton();

    expect(screen.queryByTestId(TestIds.revealModal)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TestIds.createModal)).toBeVisible();
  });
});

describe('errors', () => {
  it('modal shows error messages regarding the credential name', async () => {
    const errors = ['error #1', 'error #2'];
    createCredentialMock.mockResolvedValue({ errors: { name: errors } });
    render(<CreateCredentialButton tenant={TENANT} project={PROJECT} />);
    await clickTriggerButton();

    await act(() => submitCreate());

    const createModal = screen.getByTestId(TestIds.createModal);
    errors.forEach((err) => expect(createModal).toHaveTextContent(err));
  });
});

describe('closing', () => {
  it('cancel button of create modal closes dialog', async () => {
    render(<CreateCredentialButton tenant={TENANT} project={PROJECT} />);
    await clickTriggerButton();

    const createModal = screen.getByTestId(TestIds.createModal);
    const cancelButton = within(createModal).getByRole('button', {
      name: /Abbrechen/,
    });
    await USER.click(cancelButton);

    expect(screen.queryByTestId(TestIds.createModal)).not.toBeInTheDocument();
  });

  it('close button of reveal modal closes dialog', async () => {
    const state = { data: { username: USERNAME, password: PASSWORD } };
    createCredentialMock.mockResolvedValueOnce(state);
    render(<CreateCredentialButton tenant={TENANT} project={PROJECT} />);
    await clickTriggerButton();
    await submitAndWait();

    const revealModal = screen.getByTestId(TestIds.revealModal);
    const closeButton = within(revealModal).getByRole('button', {
      name: /Schließen/,
    });
    await USER.click(closeButton);

    expect(screen.queryByTestId(TestIds.revealModal)).not.toBeInTheDocument();
  });
});
