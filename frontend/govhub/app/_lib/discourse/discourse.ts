import 'client-only';
import { fetcher } from '@/app/_lib/client/fetcher';
import {
  CurrentUserResponse,
  DiscourseUser,
  LatestTopicsResponse,
} from '@/app/_lib/discourse/types';
import { useNextSWR } from '@/app/_lib/client/useNextSWR';
import { useDiscourseStore } from '@/app/_store/discourseStore';

const _useCurrentUser = (baseUrl: string) => () => {
  const isLoggedIn = useDiscourseStore((s) => s.isLoggedIn);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, isLoading, mutate } = useNextSWR(
    isLoggedIn ? `${baseUrl}/session/current.json` : null,
    async (url) =>
      fetcher(CurrentUserResponse)(url, { credentials: 'include' }).then(
        (data) => data.current_user,
      ),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    currentUser: data,
    isError: !!error,
    isLoading: isLoggedIn ? isLoading : true,
    /* c8 ignore next 1 */
    revalidate: () => mutate(),
  };
};

const _useLatestTopics = (baseUrl: string) => () => {
  const isLoggedIn = useDiscourseStore((s) => s.isLoggedIn);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, isLoading, mutate } = useNextSWR(
    // this only has a chance of success if we're logged in
    // this also fixes a race condition with oauth because it sets cookies
    // which breaks an in-progress oauth2 flow
    isLoggedIn ? `${baseUrl}/latest.json` : null,
    async (url) =>
      fetcher(LatestTopicsResponse)(url, { credentials: 'include' }).then(
        (data) => data.topic_list.topics,
      ),
  );

  return {
    latestTopics: data,
    isError: !!error,
    isLoading: isLoggedIn ? isLoading : true,
    /* c8 ignore next 1 */
    revalidate: () => mutate(),
  };
};

export const useDiscourse = (baseUrl: string) => ({
  useCurrentUser: _useCurrentUser(baseUrl),
  useLatestTopics: _useLatestTopics(baseUrl),
});

const withSize = (size: number) => (avatarUrl: string) =>
  avatarUrl.replace('{size}', size.toString());

export const userImageUrl: (
  baseUrl: string,
) => (user: DiscourseUser, size?: number) => string =
  (baseUrl) =>
  (user, size = 128) =>
    `${baseUrl}${withSize(size)(user.avatar_template)}`;
