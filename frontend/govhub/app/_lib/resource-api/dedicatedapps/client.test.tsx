import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useContainerInfo } from './client';
import {
  ContainerInfoSuccessResponseBody,
  mkSuccess,
} from '@/app/api/_common/containerinfo';
import { ReactNode } from 'react';
import { mkContainerInfo } from '@/app/_lib/resource-api/common/containerinfo';

const mockedFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockedFetch;
});

beforeEach(() => {
  mockedFetch.mockReset();
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

describe('useContainerInfo', () => {
  const TEST_TENANT = 'guetersloh';
  const TEST_NAME = 'my-dedicated-app';

  it('returns container info with default lines', async () => {
    const mockResponse: ContainerInfoSuccessResponseBody = mkSuccess(
      mkContainerInfo('app1', 'running', true, 'l1\nl2'),
    );
    mockedFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => JSON.parse(JSON.stringify(mockResponse)),
    }));

    const { result } = renderHook(
      () => useContainerInfo(TEST_TENANT, TEST_NAME),
      { wrapper },
    );

    const expectedUrl = `/api/dedicatedapp/containerinfo?tenant=${encodeURIComponent(
      TEST_TENANT,
    )}&name=${encodeURIComponent(TEST_NAME)}&lines=1000`;

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl, {
        cache: 'no-store',
      });
    });
  });

  it('uses provided lines parameter', async () => {
    const mockResponse: ContainerInfoSuccessResponseBody = mkSuccess(
      mkContainerInfo('app2', 'waiting', false, 'log'),
    );
    mockedFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => mockResponse,
    }));

    const LINES = 250;
    renderHook(() => useContainerInfo(TEST_TENANT, TEST_NAME, LINES), {
      wrapper,
    });

    const expectedUrl = `/api/dedicatedapp/containerinfo?tenant=${encodeURIComponent(
      TEST_TENANT,
    )}&name=${encodeURIComponent(TEST_NAME)}&lines=${LINES}`;

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl, {
        cache: 'no-store',
      });
    });
  });

  it('sets error when API returns error body', async () => {
    mockedFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({ error: 'container not found' }),
    }));

    const { result } = renderHook(
      () => useContainerInfo(TEST_TENANT, TEST_NAME),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
