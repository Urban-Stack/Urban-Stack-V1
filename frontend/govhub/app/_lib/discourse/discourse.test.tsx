import {
  useDiscourse as _useDiscourse,
  userImageUrl,
} from '@/app/_lib/discourse/discourse';
import { renderHook, waitFor } from '@testing-library/react';
import {
  ChatMessageAuthor,
  CurrentUserResponse,
  LatestTopicsResponse,
} from '@/app/_lib/discourse/types';
import { generateMock } from '@anatine/zod-mock';
import { SWRConfig } from 'swr';
import { FuncMock } from '@/app/_test/utils';
import { useDiscourseStore } from '@/app/_store/discourseStore';

const mockUseDiscourseStore = useDiscourseStore as unknown as FuncMock<
  typeof useDiscourseStore
>;

jest.mock('@/app/_store/discourseStore', () => ({
  useDiscourseStore: jest.fn(),
}));

const EXAMPLE_URL = 'https://example.com';

const { useCurrentUser, useLatestTopics } = _useDiscourse(EXAMPLE_URL);

const mockedFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockedFetch;
  mockUseDiscourseStore.mockReturnValue({ isLoggedIn: true });
});

beforeEach(() => {
  mockedFetch.mockReset();
});

/** Disable SWR cache to keep tests independent of each other */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

describe('useCurrentUser', () => {
  it('returns the current user', async () => {
    const userResponse = generateMock(CurrentUserResponse);

    mockedFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => userResponse,
    }));

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentUser).toEqual(userResponse.current_user);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
        `${EXAMPLE_URL}/session/current.json`,
        {
          credentials: 'include',
        },
      );
    });
  });

  it('throws error on type mismatch', async () => {
    mockedFetch.mockImplementation(async () => ({
      json: async () => ({ bla: 'keks' }),
    }));

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.currentUser).toBeUndefined();
    });
  });
});

describe('useLatestTopics', () => {
  it('returns the latest topics', async () => {
    const latestTopicsResponse = generateMock(LatestTopicsResponse);
    mockedFetch.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => JSON.parse(JSON.stringify(latestTopicsResponse)),
    }));

    const { result } = renderHook(() => useLatestTopics(), { wrapper });

    await waitFor(() => {
      expect(result.current.latestTopics).toEqual(
        latestTopicsResponse.topic_list.topics,
      );
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(`${EXAMPLE_URL}/latest.json`, {
        credentials: 'include',
      });
    });
  });

  it('throws error on type mismatch', async () => {
    mockedFetch.mockImplementation(async () => ({
      json: async () => ({ bla: 'keks' }),
    }));

    const { result } = renderHook(() => useLatestTopics(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.latestTopics).toBeUndefined();
    });
  });
});

describe('userImageUrl', () => {
  it('returns the avatar URL for a user', () => {
    const user = generateMock(ChatMessageAuthor);
    user.avatar_template = '/avatar/{size}.png';

    expect(userImageUrl(EXAMPLE_URL)(user, 42)).toBe(
      `${EXAMPLE_URL}/avatar/42.png`,
    );
  });
});
