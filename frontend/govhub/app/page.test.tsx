import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import { setEnvVars } from 'udp-ui/test-utils';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

const authMock = auth as unknown as jest.Mock<Promise<Session | null>>;

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe.skip('Page', () => {
  beforeAll(() => {
    setEnvVars({
      AUTH_KEYCLOAK_ISSUER: 'http://localhost:8080/auth/realms/ugh',
      AUTH_KEYCLOAK_ID: 'government-hub',
      AUTH_URL: 'http://localhost:8080',
    });
  });

  beforeEach(() => {
    authMock.mockReset();
  });

  it('renders page as expected', async () => {
    authMock.mockImplementation(() =>
      Promise.resolve({
        user: {
          id: '123-456',
          name: 'testuser',
          email: 'testuser@example.com',
        },
        accessToken: 'eyJImAnAccessToken',
        idToken: 'eyJImAnIdToken',
        refreshToken: 'eyJImAnRefresh',
        styles: {
          'primary-color-900': '215.5 100% 34.5%',
          'primary-color-800': '215.5 76.1% 41%',
          'primary-color-700': '215.3 58% 47.6%',
          'primary-color-600': '215.6 52.8% 54.3%',
          'primary-color-500': '215.7 53% 60.8%',
          'primary-color-400': '215.5 53% 67.5%',
          'primary-color-300': '215.1 52.2% 73.7%',
          'primary-color-200': '215.8 52% 80.4%',
          'primary-color-100': '216 52.2% 86.9%',
          'primary-color-50': '233 27% 94%',
          'logo-path': '/Logo.svg',
        },
        expires: '2024-08-21T16:02:08.918Z',
      }),
    );
    const Page = (await import('@/app/page')).default;

    const { container } = render(await Page());
    expect(container).toMatchSnapshot();
  });
});
