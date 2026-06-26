import {
  Dashboard,
  DashboardResponseRaw,
  DashboardsResponse,
  DashboardsResponseType,
  FavoriteStatusType,
  TagRaw,
  UserWithIdType,
} from '@/app/_lib/superset/types';
import { generateMock } from '@anatine/zod-mock';
import { range } from 'lodash';
import Mock = jest.Mock;

const TENANT = 'tenant';
const VIZ_GROUP = 'viz-group';

type DashboardMockArgs = {
  id?: number;
  dashboard_title?: string | null;
  changed_on_utc?: Date;
  created_by?: UserWithIdType | null;
  slug?: string;
  tags?: TagRaw[];
  thumbnail_url?: string;
  published?: boolean | null;
};

type SanitizedDashboardMockArgs = DashboardMockArgs & {
  favorite?: boolean;
  tenant?: string;
  vizGroup?: string;
  published?: boolean;
};

const commonDashboardMockArgs = (id: number): DashboardMockArgs => ({
  // fix values used for visualizations (needed for steady snapshot tests)
  id: id,
  dashboard_title: `Test Dashboard ${id}`,
  changed_on_utc: new Date(2024, 8, 15),
  created_by: { id, first_name: 'Test', last_name: 'User' } as UserWithIdType,
  slug: `${TENANT}_${VIZ_GROUP}_test-dashboard-${id}`,
  tags: ['Tag #1', 'Tag #2', 'Tag #3'].map(
    (label, index) => ({ id: index, name: label, type: 1 }) as TagRaw,
  ),
  thumbnail_url: '/api/v1/test/thumbnail',
  published: id % 2 == 0,
});

/**
 * Returns a list of mocked dashboard responses.
 * <p>
 * By default, the list to be returned consists of 3 dashboards having some steady values
 * so that this function can also be used for snapshot tests.
 * <p>
 * However, if `args` are given, the list comprises one dashboard for each given argument instance
 * where `args` take precedence over the default values of the individual dashboards.
 *
 * @param args overriding arguments for the individual dashboards to generate (optional)
 * @return a list of mocked dashboard responses
 */
export const generateDashboardsMock = (
  args: DashboardMockArgs[] = range(0, 3).map(commonDashboardMockArgs),
): DashboardResponseRaw[] =>
  range(0, args.length).map((index) => ({
    ...generateMock(DashboardResponseRaw), // auto-generate values
    ...commonDashboardMockArgs(index), // provide reasonable values
    ...args[index],
  }));

/**
 * Returns a list of mocked dashboards.
 * <p>
 * By default, the list to be returned consists of 3 dashboards having some steady values
 * so that this function can also be used for snapshot tests.
 * <p>
 * However, if `args` are given, the list comprises one dashboard for each given argument instance
 * where `args` take precedence over the default values of the individual dashboards.
 *
 * @param args overriding arguments for the individual dashboards to generate (optional)
 * @return a list of mocked dashboards
 */
export const generateSanitizedDashboardsMock = (
  args: SanitizedDashboardMockArgs[] = range(0, 3).map(
    commonSanitizedDashboardMockArgs,
  ),
): Dashboard[] =>
  range(0, args.length).map((index) => ({
    ...generateMock(Dashboard), // auto-generate values
    ...commonSanitizedDashboardMockArgs(index), // provide reasonable values
    ...args[index],
  })) as Dashboard[];

const commonSanitizedDashboardMockArgs = (
  id: number,
): SanitizedDashboardMockArgs => ({
  ...commonDashboardMockArgs(id),
  favorite: id % 2 == 0,
  tenant: TENANT,
  vizGroup: VIZ_GROUP,
  published: id % 2 == 0,
});

/**
 * Returns a mocked `DashboardsResponse` instance.
 * <p>
 * By default, the `result` property of the response to be returned is a list of 3 dashboards
 * having some steady values so that this function can also be used for snapshot tests.
 * <p>
 * However, if `args` are given, the list comprises one dashboard for each given argument instance
 * where `args` take precedence over the default values of the individual dashboards.
 *
 * @param args overriding arguments for the individual dashboards to generate (optional)
 * @return a mocked `DashboardsResponse` instance
 */
export const generateDashboardsResponseMock = (
  args?: DashboardMockArgs[],
): DashboardsResponseType => ({
  ...generateMock(DashboardsResponse),
  result: generateDashboardsMock(args),
});

/**
 * Mocks the hook for managing the favorite statuses of dashboards.
 * <p>
 * The data will comprise one entry for each given dashboard
 * having its ID and favorite status considered.
 *
 * @param useFavoriteStatusesMock mock for the `useFavoriteStatuses` hook
 * @param dashboards              dashboards the favorite statuses of which to mock
 * @param setFavStatusMock        mock for the `setFavStatus` function (optional)
 */
export const mockUseFavoriteStatuses = (
  useFavoriteStatusesMock: Mock,
  dashboards: Dashboard[],
  setFavStatusMock?: Mock,
) => {
  setFavStatusMock?.mockImplementation(() => Promise.resolve('OK'));
  useFavoriteStatusesMock.mockImplementation(() => ({
    favStatuses: {
      result: dashboards.map((dashboard: Dashboard) => ({
        id: dashboard.id,
        value: dashboard.favorite,
      })) as FavoriteStatusType[],
    },
    setFavStatus: setFavStatusMock,
    isError: false,
    isLoading: false,
  }));
};

/**
 * Mocks the hook for retrieving the source of the thumbnail of a specific dashboard.
 *
 * @param src       source of the thumbnail to mock, or
 *                  `undefined` in order to not provide a thumbnail source
 * @param isLoading `true` in order to mock the response for being loading - `false` otherwise
 * @param isError   `true` in order to mock the response for being erroneous - `false` otherwise
 */
export const mockGetThumbnailSrc = (
  src: string,
  isLoading: boolean = false,
  isError: boolean = false,
) => {
  const mock = jest.fn();
  mock.mockReturnValue({ src, isLoading, isError });
  return mock;
};
