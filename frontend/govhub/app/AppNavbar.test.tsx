import '@testing-library/jest-dom';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import { act, render, within } from '@testing-library/react';
import AppNavbar, { AppNavbarTestIds } from '@/app/AppNavbar';
import { logoutUrl } from '@/app/_lib/auth/authConfig';
import { UdpAvatar, UdpAvatarTestIds } from 'udp-ui/components';
import { FuncMock, TEST_SESSION } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import AppUserAvatar from '@/app/AppUserAvatar';

const authMock = auth as unknown as jest.Mock<Promise<Session | null>>;
const logoutUrlMock = logoutUrl as unknown as jest.Mock<
  ReturnType<typeof logoutUrl>
>;
const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const LOGOUT_URL = 'http://keycloak/logout';

jest.mock('@/app/_lib/auth/authConfig', () => ({
  logoutUrl: jest.fn(),
}));

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

const DISCOURSE_BASE_URL = 'https://discourse.example.com';

jest.mock('@/app/AppUserAvatar', () => jest.fn(() => <UdpAvatar />));

beforeAll(() => {
  authMock.mockImplementation(() => Promise.resolve(TEST_SESSION));
  logoutUrlMock.mockReturnValue(LOGOUT_URL);
  getPublicEnvMock.mockReturnValue(DISCOURSE_BASE_URL);
});

it('passes correct props to AppUserAvatar', async () => {
  render(
    await AppNavbar({
      logoPath: '/Logo.svg',
      fallbackTitle: 'Gütersloh',
    }),
  );

  expect(AppUserAvatar).toHaveBeenCalledWith(
    { discourseBaseUrl: DISCOURSE_BASE_URL },
    undefined,
  );
});

it('hides user menu by default', async () => {
  const component = render(
    await AppNavbar({
      logoPath: '/Logo.svg',
      fallbackTitle: 'Gütersloh',
    }),
  );

  expect(
    within(component.getByTestId(AppNavbarTestIds.self)).queryByTestId(
      AppNavbarTestIds.userMenuDropdown,
    ),
  ).not.toBeInTheDocument();
});

it('shows user menu when user clicks on Avatar', async () => {
  const component = render(
    await AppNavbar({
      logoPath: '/Logo.svg',
      fallbackTitle: 'Gütersloh',
    }),
  );
  const avatar = component.getByTestId(UdpAvatarTestIds.self);

  act(() => {
    avatar.click();
  });

  expect(
    within(await component.findByTestId(AppNavbarTestIds.self)).getByTestId(
      AppNavbarTestIds.userMenuDropdown,
    ),
  ).toBeVisible();
});

it('shows correct user name and email in user menu', async () => {
  const component = render(
    await AppNavbar({
      logoPath: '/Logo.svg',
      fallbackTitle: 'Gütersloh',
    }),
  );
  const avatar = component.getByTestId(UdpAvatarTestIds.self);

  act(() => {
    avatar.click();
  });

  const userMenuDropdown = within(
    await component.findByTestId(AppNavbarTestIds.userMenuDropdown),
  );

  expect(userMenuDropdown.getByText(TEST_SESSION.user.name)).toBeVisible();
  expect(userMenuDropdown.getByText(TEST_SESSION.user.email)).toBeVisible();
});

it('shows correct entries in user menu', async () => {
  const component = render(
    await AppNavbar({
      logoPath: '/Logo.svg',
      fallbackTitle: 'Gütersloh',
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
    ['Einstellungen', '/settings/profile'],
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

describe('Logo', () => {
  it('renders logo image when logoPath is provided', async () => {
    const logoPath = '/Logo.svg';
    const component = render(
      await AppNavbar({
        logoPath,
        fallbackTitle: 'Gütersloh',
      }),
    );

    const logoImage = component.getByRole('img', { name: 'Logo' });
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', logoPath);
  });

  it('renders fallback title when logoPath is not provided', async () => {
    const fallbackTitle = 'custom fallback title';
    const component = render(
      await AppNavbar({
        logoPath: undefined,
        fallbackTitle,
      }),
    );

    const titleElement = component.getByText(fallbackTitle);
    expect(titleElement).toBeInTheDocument();
  });
});
