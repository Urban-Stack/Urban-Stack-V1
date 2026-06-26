import { auth } from '@/auth';
import { Session } from 'next-auth';
import { requireAuth } from '@/app/_lib/auth/index';

const authMock = auth as unknown as jest.Mock<Promise<Session | null>>;

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

beforeEach(() => {
  authMock.mockReset();
});

describe('requireAuth', () => {
  it('throws if Session is not defined', async () => {
    authMock.mockImplementation(async () => null);

    await expect(requireAuth).rejects.toThrow();
  });

  it('returns Session if defined', async () => {
    const session = { id: 1 };
    authMock.mockImplementation(async () => session as unknown as Session);

    const pSession = requireAuth();

    await expect(pSession).resolves.not.toThrow();
    expect(await pSession).toEqual(session);
  });
});
