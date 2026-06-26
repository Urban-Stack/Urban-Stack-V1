import { renderHook } from '@testing-library/react';
import { useNextSWR } from '@/app/_lib/client/useNextSWR';
import useSWR from 'swr';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

const useSWRMock = useSWR as unknown as jest.Mock;
const isRedirectErrorMock = isRedirectError as unknown as jest.Mock;

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('next/dist/client/components/redirect-error', () => ({
  isRedirectError: jest.fn(),
}));

beforeEach(() => {
  useSWRMock.mockReset();
  isRedirectErrorMock.mockReset();
});

describe('useNextSWR', () => {
  it('throws error on redirect', async () => {
    useSWRMock.mockReturnValue({ error: new Error('I am a redirect') });
    isRedirectErrorMock.mockReturnValue(true);

    expect(() => renderHook(() => useNextSWR('key'))).toThrow();
  });

  it('does not throw on any other Error', () => {
    useSWRMock.mockReturnValue({
      error: new Error('I am NOT a redirect Error'),
    });
    isRedirectErrorMock.mockReturnValue(false);

    expect(() => renderHook(() => useNextSWR('key'))).not.toThrow();
  });
});
