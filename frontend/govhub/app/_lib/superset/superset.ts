import { fetcher, fetcherRaw } from '@/app/_lib/client/fetcher';
import {
  DashboardsResponse,
  GetFavoriteStatusesResponse,
  SetFavoriteStatusResponse,
  SetFavoriteStatusResponseType,
} from '@/app/_lib/superset/types';
import { useNextSWR } from '@/app/_lib/client/useNextSWR';

const _getDashboards = (supersetUri: string) => () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, isLoading } = useNextSWR(
    `${supersetUri}/api/v1/dashboard/?q={"page_size":-1}`,
    async (url) => fetcher(DashboardsResponse)(url, { credentials: 'include' }),
  );

  return {
    dashboards: data,
    isError: !!error,
    isLoading,
  };
};

const _getThumbnailSrc =
  (supersetUri: string) =>
  (thumbnailUrl: string, retryCount = 5, retryDelayMs = 5000) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error, isLoading } = useNextSWR(
      `${supersetUri}${thumbnailUrl}`,
      async (url) =>
        fetcherRaw(url, {
          credentials: 'include',
        })
          .then((res) => {
            if (res.status !== 200)
              throw new Error('Thumbnail not retrievable');
            else return res.blob();
          })
          .then((blob) => URL.createObjectURL(blob)),
      {
        errorRetryInterval: retryDelayMs,
        errorRetryCount: retryCount,
      },
    );

    return {
      src: data,
      isError: !!error,
      isLoading,
    };
  };

const _useFavoriteStatuses = (supersetUri: string) => (ids: number[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, isLoading, mutate } = useNextSWR(
    `${supersetUri}/api/v1/dashboard/favorite_status/?q=!(${ids.join(',')})`,
    async (url) =>
      fetcher(GetFavoriteStatusesResponse)(url, { credentials: 'include' }),
  );

  const invalidateStatuses = async <T>(result: T) => {
    await mutate();
    return result;
  };

  // /api/v1/security/csrf_token/ does not work in this context
  // see https://github.com/apache/superset/blob/f045a73e2de7ff7a014bdf623765bf7f85fe2159/superset-frontend/src/setup/setupClient.ts#L26
  const csrfToken: () => Promise<string | undefined> = () =>
    fetch(supersetUri, { credentials: 'include' })
      .then((res) => res.text())
      .then((txt) => new DOMParser().parseFromString(txt, 'text/html'))
      .then((doc) => doc.querySelector('#csrf_token'))
      .then((input) => (input as HTMLInputElement | null)?.value);

  /**
   * Sets the favorite status of a specific dashboard.
   *
   * @param id    ID of the dashboard the favorite status of which to set to the given `value`
   * @param value `true` in order to mark the dashboard as being favored, or
   *              `false` in order to mark the dashboard as not being favored
   */
  const setFavStatus: (
    id: number,
    value: boolean,
  ) => Promise<SetFavoriteStatusResponseType> = async (id, value) =>
    fetcher(SetFavoriteStatusResponse)(
      `${supersetUri}/api/v1/dashboard/${id}/favorites/`,
      {
        credentials: 'include',
        method: value ? 'POST' : 'DELETE',
        headers: { 'X-CSRFToken': (await csrfToken()) ?? '' },
      },
    ).then(invalidateStatuses); // revalidate the data of this hook (as change has been made)

  return {
    favStatuses: data,
    setFavStatus,
    isError: !!error,
    isLoading,
    /* c8 ignore next 1 */
    revalidate: () => mutate(),
  };
};

export const useSuperset = (baseUrl: string) => ({
  /**
   * Retrieves all dashboards for the given `tenant`.
   */
  getDashboards: _getDashboards(baseUrl),
  /**
   * Retrieves the source of the thumbnail of the given dashboard.
   * <p>
   * Superset responds with `202 Accepted` if the thumbnail does not exist on cache,
   * which automatically triggers its computation asynchronously.
   * If though a request is performed while the thumbnail is already cached, the response is `200 OK`.
   * <p>
   * In order to encapsulate this flow, this function provides the possibility to perform several retries by default.
   *
   * @param thumbnailUrl URL of the thumbnail to retrieve
   * @param retryCount   maximum number of retries for retrieving the thumbnail (optional; 5 by default)
   * @param retryDelay   time (in milliseconds) between two retries (optional; 5000 by default)
   */
  getThumbnailSrc: _getThumbnailSrc(baseUrl),
  /**
   * Hook for managing the favorite statuses of dashboards.
   * <p>
   * This hook is initialized by retrieving the dashboards of the given `ìds`.
   *
   * @param ids IDs of the dashboards of which the favorite status is to be retrieved
   */
  useFavoriteStatuses: _useFavoriteStatuses(baseUrl),
});
