import {
  Dashboard,
  DashboardResponseRaw,
  DashboardTag,
  FavoriteStatusType,
  TagRaw,
} from '@/app/_lib/superset/types';
import { tryUndefined } from 'udp-ui/fp';
import { z } from 'zod';
import { find, identity } from 'lodash';
import { STATUS_OPTIONS } from '@/app/dashboards/Filter';
import { VizGroup } from '../resource-api/viz-groups/vizGroups';

/**
 * Filters the given dashboards by the given search text.
 * <p>
 * At this, the given dashboards will be filtered by a case-insensitive comparison
 * of the given search text and the title of the dashboard.
 *
 * @param dashboards dashboards to filter
 * @param filter filter to apply to the given dashboards
 * @return those dashboards that match the given search text
 */
export const filterDashboards: (
  dashboards: Dashboard[],
  filter: {
    searchText?: string;
    favorites?: boolean;
    status?: string[];
    vizGroups?: VizGroup[];
  },
) => Dashboard[] = (
  dashboards,
  { searchText, favorites, status, vizGroups },
): Dashboard[] => {
  const bySearchText = searchText
    ? (() => {
        const searchTextLowerCase = searchText.toLowerCase();
        return (d: Dashboard) =>
          d.dashboard_title?.toLowerCase().includes(searchTextLowerCase);
      })()
    : identity;

  const byFavorites = favorites ? (d: Dashboard) => d.favorite : identity;

  const byStatus =
    status && !STATUS_OPTIONS.every((o) => status.includes(o))
      ? (() => {
          const published = status.includes('published');
          return (d: Dashboard) => d.published == published;
        })()
      : identity;

  const byVizGroups = vizGroups
    ? (d: Dashboard) =>
        find(
          vizGroups,
          (vg) => vg.name === d.vizGroup && vg.tenant === d.tenant,
        )
    : identity;

  return dashboards
    .filter(byFavorites)
    .filter(byStatus)
    .filter(byVizGroups)
    .filter(bySearchText);
};

export const mkDashboardHref: (
  dashboardOrSlug: Dashboard | string,
  editMode?: boolean,
) => string = (dOrSlug, editMode = false) => {
  const slug = typeof dOrSlug === 'string' ? dOrSlug : dOrSlug.slug;
  return `/dashboards/${slug}${editMode ? '?edit=true' : ''}`;
};

/**
 * Populates the given `dashboards` with the given `favStatuses`.
 * <p>
 * Each of the given dashboards will have its favorite status
 * from the given list of statuses (or `undefined` if not given).
 *
 * @param dashboards  dashboards to populate with the given `favStatuses`
 * @param favStatuses favorite statuses for the given dashboards
 * @return the given dashboards populated with the given `favStatuses`
 */
export const populateDashboards: (
  dashboards: Dashboard[],
  favStatuses?: FavoriteStatusType[],
) => Dashboard[] = (
  dashboards: Dashboard[],
  favStatuses: FavoriteStatusType[] = [],
) => {
  const favStatusMap = createDashboardIdToFavStatusMap(favStatuses);
  return dashboards.map((dashboard) => ({
    ...dashboard,
    favorite: favStatusMap.get(dashboard.id),
  }));
};

const createDashboardIdToFavStatusMap = (statuses: FavoriteStatusType[] = []) =>
  new Map<number, boolean>(statuses.map((status) => [status.id, status.value]));

/**
 * Returns the sanitized representations of the given dashboards.
 * <p>
 * Each sanitized representation to be returned will have
 * - an `undefined` favorite status
 * - only those tags from its corresponding dashboard added manually (so-called *explicit tags*) and having a name assigned
 * - the tenant and viz-group extracted from the dashboard slug
 * - the remaining properties taken from its corresponding dashboard
 *
 * @param dashboards dashboards the sanitized representations of which to return
 * @return the sanitized representations of the given dashboards
 */
export const sanitizeDashboards = (
  dashboards: DashboardResponseRaw[],
): Dashboard[] =>
  dashboards.map((dashboard) => {
    const { vizGroup, tenant } = unsafeSlugDetails(dashboard.slug);
    return {
      changed_on_utc: dashboard.changed_on_utc,
      created_by: dashboard.created_by,
      dashboard_title: dashboard.dashboard_title,
      favorite: undefined,
      id: dashboard.id,
      slug: dashboard.slug,
      tags: dashboard.tags.filter(isSupportedTag) as DashboardTag[],
      thumbnail_url: dashboard.thumbnail_url,
      vizGroup,
      tenant,
      published: dashboard.published,
    };
  });

const isSupportedTag = (tag: TagRaw): boolean => !!tag.name && tag.type === 1; // type 1 = explicit tag added manually

/**
 * Returns the date representation of the given date in the context of Superset Dashboards.
 *
 * @param date date the corresponding string representation of which to return
 * @return the string representation of the given date for use for Dashboards
 */
export const toDateString = (date: Date): string => dateFormatter.format(date);

const dateFormatter = new Intl.DateTimeFormat('de', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * Returns the username for the given name components.
 * <p>
 * Any `undefined` name components will be ignored.
 *
 * @param firstName first name of the user
 * @param lastName  last name of the user
 * @return the username for the given name components
 */
export const toUsername = (
  firstName: string | undefined,
  lastName: string | undefined,
): string => [firstName, lastName].filter((nameComp) => !!nameComp).join(' ');

export type DashboardId = {
  tenant: string;
  vizGroup: string;
  name: string;
};

export const slugDetails: (slug: string) => DashboardId | undefined = (slug) =>
  tryUndefined(unsafeSlugDetails.bind(null, slug));

export const unsafeSlugDetails: (slug: string) => DashboardId = (
  slug: string,
) =>
  z
    .string()
    .regex(/^[-a-z0-9]+_[-a-z0-9]+_[-a-z0-9]+$/)
    .transform((s) => {
      const [tenant, vizGroup, name] = s.split('_');
      return { tenant, vizGroup, name };
    })
    .parse(slug);
