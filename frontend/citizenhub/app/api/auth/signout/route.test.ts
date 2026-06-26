import { GET } from '@/app/api/auth/signout/route';
import { signOut } from '@/auth';

const signOutMock = signOut as unknown as jest.Mock<ReturnType<typeof signOut>>;

jest.mock('@/auth', () => ({
  signOut: jest.fn(),
  handlers: { POST: jest.fn() },
}));

describe('GET', () => {
  beforeEach(() => {
    signOutMock.mockReset();
  });

  it('calls signOut function & redirects to home page', async () => {
    await GET();
    expect(signOutMock).toHaveBeenCalledWith({ redirectTo: '/' });
  });
});
