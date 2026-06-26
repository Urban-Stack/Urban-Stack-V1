import { useSuperset as _useSuperset } from '@/app/_lib/superset/superset';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { generateDashboardsResponseMock } from '@/app/_test/superset.util';

const TEST_SUPERSET_URI = 'http://superset.data-hub.local';
const TEST_THUMBNAIL_URL = '/api/v1/test/thumbnail';
const TEST_THUMBNAIL_BLOB = new Blob(['test BLOB']);
const TEST_THUMBNAIL_SRC = `blob:${TEST_SUPERSET_URI}/test12345`;

const { getDashboards, getThumbnailSrc, useFavoriteStatuses } =
  _useSuperset(TEST_SUPERSET_URI);

const mockedFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockedFetch;
});

beforeEach(() => {
  mockedFetch.mockReset();
});

/* disable SWR cache to keep tests independent of each other */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

describe('getDashboardsByTenant', () => {
  it('returns dashboards data for the given tenant', async () => {
    const mockResponse = generateDashboardsResponseMock();
    mockedFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => JSON.parse(JSON.stringify(mockResponse)),
    }));

    const { result } = renderHook(() => getDashboards(), {
      wrapper,
    });

    const expectedUrl = `${TEST_SUPERSET_URI}/api/v1/dashboard/?q={\"page_size\":-1}`;
    await waitFor(() => {
      expect(result.current.dashboards).toEqual(mockResponse);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl, {
        credentials: 'include',
      });
    });
  });

  it('throws Error on type mismatch', async () => {
    mockedFetch.mockImplementation(async () => ({
      ok: true,
      json: async () => ({ property: 'mismatch' }),
    }));

    const { result } = renderHook(() => getDashboards(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.dashboards).toBeUndefined();
    });
  });
});

describe('getFavoriteStatuses', () => {
  it('returns favorite statuses', async () => {
    const ids = [2, 3, 5];
    const mockResponse = {
      result: [
        { id: ids[0], value: true },
        { id: ids[1], value: false },
        { id: ids[2], value: true },
      ],
    };
    mockedFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: () => mockResponse,
    }));
    const expectedUrl = `${TEST_SUPERSET_URI}/api/v1/dashboard/favorite_status/?q=!(${ids[0]},${ids[1]},${ids[2]})`;

    const { result } = renderHook(() => useFavoriteStatuses(ids), { wrapper });

    await waitFor(() => {
      expect(result.current.favStatuses).toEqual(mockResponse);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl, {
        credentials: 'include',
      });
    });
  });

  it('throws Error on type mismatch', async () => {
    const ids = [2, 3, 5];
    mockedFetch.mockImplementation(async () => ({
      ok: true,
      json: () => ({ property: 'mismatch' }),
    }));

    const { result } = renderHook(() => useFavoriteStatuses(ids), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.favStatuses).toBeUndefined();
    });
  });
});

describe('setFavoriteStatus', () => {
  beforeEach(() => {
    // mock initial request for retrieving the favorite statuses
    mockedFetch.mockImplementationOnce(() => ({
      ok: true,
      json: () => ({ result: [] }),
    }));
  });

  const TEST_DASHBOARD_ID = 123;
  const TEST_CSRF_TOKEN = 'csrf-token-123';

  const setFavoriteStatusTestCases = [
    {
      testCase: 'setting the favorite status',
      setFavorite: true,
      expectedMethod: 'POST',
    },
    {
      testCase: 'removing the favorite status',
      setFavorite: false,
      expectedMethod: 'DELETE',
    },
  ];

  const csrfFetchImpl = () =>
    Promise.resolve({
      text: () =>
        Promise.resolve(
          `<html lang="en"><body><input id="csrf_token" value="${TEST_CSRF_TOKEN}" /></body></html>`,
        ),
    });

  it.each(setFavoriteStatusTestCases)(
    'sends $expectedMethod request for $testCase',
    async ({ setFavorite, expectedMethod }) => {
      mockedFetch.mockImplementationOnce(csrfFetchImpl);
      mockedFetch.mockImplementationOnce(async () => ({
        ok: true,
        json: () => ({ result: 'OK' }),
      }));
      const expectedUrl = `${TEST_SUPERSET_URI}/api/v1/dashboard/${TEST_DASHBOARD_ID}/favorites/`;
      const { result } = renderHook(() => useFavoriteStatuses([]), { wrapper });

      const response = await result.current.setFavStatus(
        TEST_DASHBOARD_ID,
        setFavorite,
      );

      expect(response).toEqual({ result: 'OK' });
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl, {
        method: expectedMethod,
        credentials: 'include',
        headers: {
          'X-CSRFToken': TEST_CSRF_TOKEN,
        },
      });
    },
  );

  it.each(setFavoriteStatusTestCases)(
    'throws Error on type mismatch when $testCase',
    async ({ setFavorite }) => {
      mockedFetch.mockImplementationOnce(csrfFetchImpl);
      mockedFetch.mockImplementationOnce(async () => ({
        ok: true,
        json: async () => ({ property: 'mismatch' }),
      }));

      const { result } = renderHook(() => useFavoriteStatuses([]), { wrapper });

      await expect(() =>
        result.current.setFavStatus(TEST_DASHBOARD_ID, setFavorite),
      ).rejects.toThrow();
    },
  );
});

describe('getThumbnailSrc', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => TEST_THUMBNAIL_SRC);
  });

  it('returns thumbnail source', async () => {
    mockedFetch.mockImplementationOnce(async () => ({
      status: 200,
      ok: true,
      blob: () => Promise.resolve(TEST_THUMBNAIL_BLOB),
      text: async () => '',
    }));

    const { result } = renderHook(() => getThumbnailSrc(TEST_THUMBNAIL_URL), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.src).toEqual(TEST_THUMBNAIL_SRC);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
        `${TEST_SUPERSET_URI}${TEST_THUMBNAIL_URL}`,
        {
          credentials: 'include',
        },
      );
    });
  });

  it('throws Error when thumbnail is not cached', async () => {
    mockedFetch.mockImplementationOnce(async () => ({
      status: 202,
      ok: true,
      json: () => 'OK Async',
      text: async () => '',
    }));

    const { result } = renderHook(() => getThumbnailSrc(TEST_THUMBNAIL_URL), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.src).toBeUndefined();
    });
  });

  it('throws Error on rejected BLOB', async () => {
    mockedFetch.mockImplementationOnce(async () => ({
      status: 500,
      ok: false,
      blob: () => Promise.reject(TEST_THUMBNAIL_BLOB),
      text: async () => '',
    }));

    const { result } = renderHook(() => getThumbnailSrc(TEST_THUMBNAIL_URL), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.src).toBeUndefined();
    });
  });
});
