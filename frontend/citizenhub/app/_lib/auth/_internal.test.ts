import { logoutUrl } from '@/app/_lib/auth/_internal';

describe('logoutUrl', () => {
  test('returns correct Url', () => {
    const baseUrl = 'http://localhost:8080';
    const clientId = 'ugh-fe';
    const redirectUrl = 'http://localhost:8080/api/auth/signout';

    expect(logoutUrl(baseUrl, clientId, redirectUrl)).toBe(
      'http://localhost:8080/protocol/openid-connect/logout?post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fauth%2Fsignout&client_id=ugh-fe',
    );
  });
});
