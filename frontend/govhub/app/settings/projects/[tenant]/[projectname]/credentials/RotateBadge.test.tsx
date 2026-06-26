import { act, screen, waitFor, within } from '@testing-library/react';
import { rotateCredential } from '@/app/settings/projects/[tenant]/[projectname]/credentials/actions';
import RotateBadge from '@/app/settings/projects/[tenant]/[projectname]/credentials/RotateBadge';
import { FuncMock } from '@/app/_test/utils';
import { SensorCredential } from '@/app/_lib/resource-api/project/credentials';
import userEvent from '@testing-library/user-event';
import { CredentialTestIds as TestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';
import { UdpClientModal } from 'udp-ui/components';
import { createRender } from 'udp-ui/test-utils';

const USER = userEvent.setup();

const TENANT = 'test-tenant';
const PROJECT = 'test-project';
const CREDENTIAL = {
  name: 'test-credential',
  username: 'test-username',
} as SensorCredential;
const USERNAME = 'user123';
const PASSWORD = 'pass123';

const UdpClientModalMock = UdpClientModal as unknown as jest.Mock;
jest.mock('udp-ui/components', () => {
  const actual = jest.requireActual('udp-ui/components');
  return {
    ...actual,
    UdpClientModal: jest.fn((props) => actual.UdpClientModal(props)),
  };
});

const rotateCredentialMock = rotateCredential as unknown as FuncMock<
  typeof rotateCredential
>;
jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/credentials/actions',
  () => ({
    rotateCredential: jest.fn(),
  }),
);

const refreshMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  rotateCredentialMock.mockReset();
  jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
    refresh: refreshMock.mockReset(),
  });
});

const renderComp = createRender(RotateBadge, {
  tenant: TENANT,
  project: PROJECT,
  credential: CREDENTIAL,
});

const clickTriggerButton = async () => {
  await USER.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
};

const closeRevealModal = async () => {
  const revealModal = screen.getByTestId(TestIds.revealModal);
  const closeButton = within(revealModal).getByRole('button', {
    name: 'Schließen',
  });
  await USER.click(closeButton);
};

const submitRotate = async () => {
  const submitButton = screen
    .getByRole('dialog')
    .querySelector('button[type=submit]') as HTMLElement;
  await USER.click(submitButton);
};

const submitAndWait = async () => {
  await submitRotate();
  await waitFor(() =>
    expect(screen.getByTestId(TestIds.revealModal)).toBeVisible(),
  );
};

describe('snapshot', () => {
  it('trigger button matches snapshot', () => {
    const component = renderComp();

    expect(component).toMatchSnapshot();
  });
});

describe('visibility', () => {
  it('click on trigger button opens confirm modal', async () => {
    renderComp();

    await clickTriggerButton();

    const rotateModal = screen.getByTestId(TestIds.rotateModal);
    expect(rotateModal).toBeVisible();
    expect(UdpClientModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sensor Credentials rotieren',
        size: 'md',
      }),
      undefined,
    );
  });

  it('click on submit button shows modal with new credentials', async () => {
    const state = { data: { username: USERNAME, password: PASSWORD } };
    rotateCredentialMock.mockResolvedValueOnce(state);
    renderComp();

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
    rotateCredentialMock.mockResolvedValueOnce(state);
    renderComp();
    await clickTriggerButton();
    await submitAndWait();
    await closeRevealModal();

    await clickTriggerButton();

    expect(screen.queryByTestId(TestIds.revealModal)).not.toBeInTheDocument();
    expect(screen.getByTestId(TestIds.rotateModal)).toBeVisible();
  });
});

describe('errors', () => {
  it('modal shows error messages if rotation fails', async () => {
    const errors = ['error #1', 'error #2'];
    rotateCredentialMock.mockResolvedValue({ errors: { general: errors } });
    renderComp();
    await clickTriggerButton();

    await act(() => submitRotate());

    const rotateModal = screen.getByTestId(TestIds.rotateModal);
    errors.forEach((err) => expect(rotateModal).toHaveTextContent(err));
  });
});

describe('closing', () => {
  beforeEach(() => {
    const state = { data: { username: USERNAME, password: PASSWORD } };
    rotateCredentialMock.mockResolvedValueOnce(state);
  });

  it('cancel button of rotate modal closes dialog', async () => {
    renderComp();
    await clickTriggerButton();

    const rotateModal = screen.getByTestId(TestIds.rotateModal);
    const cancelButton = within(rotateModal).getByRole('button', {
      name: 'Abbrechen',
    });
    await USER.click(cancelButton);

    expect(screen.queryByTestId(TestIds.rotateModal)).not.toBeInTheDocument();
  });

  it('close button of reveal modal closes dialog', async () => {
    renderComp();
    await clickTriggerButton();
    await submitAndWait();

    const revealModal = screen.getByTestId(TestIds.revealModal);
    const closeButton = within(revealModal).getByRole('button', {
      name: 'Schließen',
    });
    await USER.click(closeButton);

    expect(screen.queryByTestId(TestIds.revealModal)).not.toBeInTheDocument();
  });

  it('revalidates when closing the reveal modal through its close button', async () => {
    renderComp();
    await clickTriggerButton();
    await submitAndWait();
    expect(refreshMock).not.toHaveBeenCalled();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await USER.click(closeButton);

    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('revalidates when closing the reveal modal through its content', async () => {
    renderComp();
    await clickTriggerButton();
    await submitAndWait();
    expect(refreshMock).not.toHaveBeenCalled();

    const closeButton = screen.getByRole('button', { name: 'Schließen' });
    await USER.click(closeButton);

    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
