/**
 * Typed mock for functions.
 * @example
 * const mockGetItem: FuncMock<typeof myFunction> = jest.fn();
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FetchError } from '@/app/_lib/client/fetcher';

export type FuncMock<F extends (...args: any) => any> = jest.Mock<
  ReturnType<F>,
  Parameters<F>
>;

export const TEST_SESSION = {
  user: {
    id: '123',
    name: 'testuser',
    email: 'testuser@example.com',
  },
  accessToken: 'eyJImAnAccessToken',
  idToken: 'eyJImAnIdToken',
  refreshToken: 'eyJImAnRefresh',
  expires: '2024-08-21T16:02:08.918Z',
} as const;

export const mkFetchError: (
  status: number,
  statusText: string,
) => FetchError = (status, statusText) =>
  new FetchError({
    url: 'https://example.com',
    status,
    statusText,
    text: () => Promise.resolve('error text'),
  });
