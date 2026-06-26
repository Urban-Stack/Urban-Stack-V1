import { act, render, within } from '@testing-library/react';
import AppNavbar, { AppNavbarTestIds } from './AppNavbar';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import { logoutUrl } from '@/app/_lib/auth/authConfig';
import {
  FuncMock,
  TEST_SESSION,
  TEST_SESSION_NO_NAME,
} from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import { UdpAvatarTestIds } from 'udp-ui/components';
import { ProfileDropdownIds } from '@/app/[tenant]/testIds';

const authMock = auth as unknown as jest.Mock<Promise<Session | null>>;
const logoutUrlMock = logoutUrl as unknown as jest.Mock<
  ReturnType<typeof logoutUrl>
>;
const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/app/_lib/auth/authConfig', () => ({
  logoutUrl: jest.fn(),
}));

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

const AUTH_KEYCLOAK_ISSUER = 'http://keycloak/realms/citizenhub';
const LOGOUT_URL = 'http://keycloak/logout';

beforeAll(() => {
  logoutUrlMock.mockReturnValue(LOGOUT_URL);
  getPublicEnvMock.mockReturnValue(AUTH_KEYCLOAK_ISSUER);
});

describe('snapshot', () => {
  it('matches snapshot', async () => {
    const component = render(
      await AppNavbar({
        tenant: 'guetersloh',
        logoPath: '/Logo.svg',
        fallbackTitle: 'fallback-title',
      }),
    );

    expect(component).toMatchSnapshot();
  });
});

describe('Logo', () => {
  it('renders logo when logoPath is provided', async () => {
    const { getByAltText } = render(
      await AppNavbar({
        tenant: 'guetersloh',
        logoPath: '/Logo.svg',
        fallbackTitle: 'fallback-title',
      }),
    );

    expect(getByAltText('Logo')).toBeInTheDocument();
  });

  it('renders fallback title when logoPath is not provided', async () => {
    const { getByText } = render(
      await AppNavbar({
        tenant: 'guetersloh',
        fallbackTitle: 'fallback-title',
      }),
    );

    expect(getByText('fallback-title')).toBeInTheDocument();
  });
});

describe('User session', () => {
  beforeEach(() => {
    authMock.mockImplementation(() => Promise.resolve(TEST_SESSION));
  });

  it('shows only signin/register button when no active session.', async () => {
    authMock.mockImplementation(() => Promise.resolve(null));
    const { getByRole, queryByTestId } = render(
      await AppNavbar({
        tenant: 'guetersloh',
        logoPath: '/Logo.svg',
        fallbackTitle: 'fallback-title',
      }),
    );

    expect(
      getByRole('button', { name: 'Anmelden/Registrieren' }),
    ).toBeVisible();
    expect(queryByTestId(UdpAvatarTestIds.self)).not.toBeInTheDocument();
  });

  it('shows user profile when there is an active session and hides user menu by default.', async () => {
    const component = render(
      await AppNavbar({
        tenant: 'guetersloh',
        logoPath: '/Logo.svg',
        fallbackTitle: 'fallback-title',
      }),
    );

    expect(
      component.queryByRole('button', { name: 'Anmelden/Registrieren' }),
    ).not.toBeInTheDocument();

    expect(component.getByTestId(UdpAvatarTestIds.self)).toBeVisible();
    expect(
      within(component.getByTestId(AppNavbarTestIds.self)).queryByTestId(
        AppNavbarTestIds.userMenuDropdown,
      ),
    ).not.toBeInTheDocument();
  });

  it('shows user menu when user clicks on Avatar', async () => {
    const component = render(
      await AppNavbar({
        tenant: 'guetersloh',
        logoPath: '/Logo.svg',
        fallbackTitle: 'fallback-title',
      }),
    );
    const avatar = component.getByTestId(UdpAvatarTestIds.self);

    act(() => {
      avatar.click();
    });
    const userMenuDropdown = within(
      await component.findByTestId(AppNavbarTestIds.userMenuDropdown),
    );
    expect(
      userMenuDropdown.getByTestId(ProfileDropdownIds.username),
    ).toHaveTextContent(TEST_SESSION.user.name);
    expect(userMenuDropdown.getByText(TEST_SESSION.user.email)).toBeVisible();
  });

  it('removes user name when no first/last name were provided', async () => {
    authMock.mockImplementation(() => Promise.resolve(TEST_SESSION_NO_NAME));

    const component = render(
      await AppNavbar({
        tenant: 'guetersloh',
        logoPath: '/Logo.svg',
        fallbackTitle: 'fallback-title',
      }),
    );
    const avatar = component.getByTestId(UdpAvatarTestIds.self);

    act(() => {
      avatar.click();
    });
    const userMenuDropdown = within(
      await component.findByTestId(AppNavbarTestIds.userMenuDropdown),
    );
    expect(
      userMenuDropdown.queryByTestId(ProfileDropdownIds.username),
    ).not.toBeInTheDocument();
    expect(
      userMenuDropdown.getByText(TEST_SESSION_NO_NAME.user.email),
    ).toBeVisible();
  });

  it('shows correct entries in user menu', async () => {
    const component = render(
      await AppNavbar({
        tenant: 'guetersloh',
        logoPath: '/Logo.svg',
        fallbackTitle: 'fallback-title',
      }),
    );
    const avatar = component.getByTestId(UdpAvatarTestIds.self);

    act(() => {
      avatar.click();
    });

    const userMenuDropdown = within(
      await component.findByTestId(AppNavbarTestIds.userMenuDropdown),
    );
    const menuEntries = [
      ['Einstellungen', `${AUTH_KEYCLOAK_ISSUER}/account`],
      ['Abmelden', LOGOUT_URL],
    ];

    menuEntries.forEach(([name, url]) => {
      expect(userMenuDropdown.getByRole('menuitem', { name })).toBeVisible();
      if (url) {
        expect(userMenuDropdown.getByRole('link', { name })).toHaveAttribute(
          'href',
          url,
        );
      }
    });
  });
});
