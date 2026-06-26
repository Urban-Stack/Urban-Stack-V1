import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CredentialTestIds as TestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';
import React, { RefObject } from 'react';
import RevealCredentialsModalContent from '@/app/settings/projects/[tenant]/[projectname]/credentials/_internal/RevealCredentialsModalContent';
import { createRender } from 'udp-ui/test-utils';

const USER = userEvent.setup();

const USERNAME = 'test-user';
const PASSWORD = 'test-password';

const renderModalContent = createRender(RevealCredentialsModalContent, {
  username: USERNAME,
  password: PASSWORD,
  initialFocusRef: React.createRef<HTMLElement>() as RefObject<HTMLElement>,
  closeModal: () => {},
});

describe('snapshot', () => {
  it('matches snapshot', () => {
    const component = renderModalContent();

    expect(component).toMatchSnapshot();
  });
});

describe('credentials', () => {
  it('shows username and password', () => {
    renderModalContent({
      username: USERNAME,
      password: PASSWORD,
    });

    expect(getTextboxByName('Benutzername')).toHaveValue(USERNAME);
    expect(getTextboxByName('Passwort')).toHaveValue(PASSWORD);
  });

  const getTextboxByName = (name: string) =>
    screen.getByRole('textbox', { name });
});

describe('closing', () => {
  it('callback function "closeModal" is invoked by close button', async () => {
    const closeModalMock = jest.fn();

    renderModalContent({ closeModal: closeModalMock });
    expect(closeModalMock).not.toHaveBeenCalled();

    const cancelButton = screen.getByRole('button', { name: /Schließen/ });
    await USER.click(cancelButton);
    expect(closeModalMock).toHaveBeenCalled();
  });
});

describe('clipboard', () => {
  const clickCopyButton = async () => {
    await USER.click(
      screen.getByRole('button', {
        name: /Sensor Credentials kopieren/,
      }),
    );
  };

  it('copies credentials to clipboard', async () => {
    const writeTextMock = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue();
    renderModalContent({
      username: USERNAME,
      password: PASSWORD,
    });

    await clickCopyButton();

    const expectedClipboardText = `Benutzername: ${USERNAME}\nPasswort: ${PASSWORD}`;
    expect(writeTextMock).toHaveBeenCalledWith(expectedClipboardText);
    expect(writeTextMock).toHaveBeenCalledTimes(1);
  });

  it('shows confirm message when copied to clipboard', async () => {
    renderModalContent();

    await clickCopyButton();

    const confirmMessage = screen.getByTestId(TestIds.copyMessage);
    expect(confirmMessage).toHaveClass('opacity-100 visible');
    expect(confirmMessage).toHaveTextContent(
      'Credentials wurden in die Zwischenablage kopiert!',
    );
  });

  it('confirm message is not visible by default', () => {
    renderModalContent();

    const confirmMessage = screen.getByTestId(TestIds.copyMessage);
    expect(confirmMessage).toHaveClass('opacity-0 invisible');
  });

  it('confirm message matches snapshot', async () => {
    const { getByTestId } = renderModalContent();

    await clickCopyButton();

    expect(getByTestId(TestIds.copyMessage)).toMatchSnapshot();
  });
});
