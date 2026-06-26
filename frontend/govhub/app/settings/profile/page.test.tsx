import { render, RenderResult } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import ProfileSettingsPage from '@/app/settings/profile/page';

const TEST_DISCOURSE_URL = 'https://discourse.test.com';
const TEST_KEYCLOAK_URL = 'https://keycloak.test.com';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

beforeEach(() => {
  getPublicEnvMock.mockReset();
});

describe('content', () => {
  it('page contains correct title', async () => {
    const component = render(<ProfileSettingsPage />);

    expect(
      component.queryByRole('heading', { name: 'Profileinstellungen' }),
    ).toBeVisible();
  });

  const queryLinkByHref = (component: RenderResult, href: string) =>
    component
      .getAllByRole('link')
      .find((link) => link.getAttribute('href') === href);

  it('page contains link for account settings', async () => {
    getPublicEnvMock.mockImplementation((name) =>
      name === 'KEYCLOAK_URI' ? TEST_KEYCLOAK_URL : '',
    );

    const component = render(<ProfileSettingsPage />);

    const accountSettingsHref = `${TEST_KEYCLOAK_URL}/realms/udh/account`;
    const accountSettings = queryLinkByHref(component, accountSettingsHref);
    expect(accountSettings).toHaveAttribute('target', '_blank');
    expect(accountSettings).toHaveTextContent('Kontoeinstellungen');
    expect(accountSettings).toHaveTextContent(
      'Hier können Sie Änderungen an Ihrem Konto vornehmen.',
    );
  });

  it('page contains link for avatar settings', async () => {
    getPublicEnvMock.mockImplementation((name) =>
      name === 'DISCOURSE_URI' ? TEST_DISCOURSE_URL : '',
    );

    const component = render(<ProfileSettingsPage />);

    const avatarSettingsHref = `${TEST_DISCOURSE_URL}/my/preferences/account`;
    const avatarSettings = queryLinkByHref(component, avatarSettingsHref);
    expect(avatarSettings).toHaveAttribute('target', '_blank');
    expect(avatarSettings).toHaveTextContent('Profilbild');
    expect(avatarSettings).toHaveTextContent(
      'Hier können Sie Ihr Profilbild ändern.',
    );
  });
});
