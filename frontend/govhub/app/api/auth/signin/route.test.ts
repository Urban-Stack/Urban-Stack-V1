import { GET } from '@/app/api/auth/signin/route';
import { signIn } from '@/auth';

const signInMock = signIn as unknown as jest.Mock<ReturnType<typeof signIn>>;

jest.mock('@/auth', () => ({
  signIn: jest.fn(),
}));

describe('GET', () => {
  beforeEach(() => {
    signInMock.mockReset();
  });

  it('calls signIn function with keycloak provider', async () => {
    const req = {
      url: `https://govhub.${process.env['TARGET_URL_SUFFIX']}/api/auth/signin`,
    } as unknown as Request;
    await GET(req);
    expect(signInMock).toHaveBeenCalledWith('keycloak', { redirectTo: '/' });
  });
});
