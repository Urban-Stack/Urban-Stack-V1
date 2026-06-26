import {
  DashboardRaw,
  fetchDashboards,
} from '@/app/_lib/superset/internal/client';
import { getPublicEnv } from '@/app/_lib/env';

export type Dashboard = {
  id: number;
  slug: string;
  title?: string;
  thumbnailUrl?: string;
  tags: { id: number; name: string }[];
};

export const getDashboards: (tenant: string) => Promise<Dashboard[]> = (
  tenant,
) => {
  const supersetUri = getPublicEnv('SUPERSET_URI');
  return fetchDashboards(tenant).then((ds) =>
    ds.map(sanitizeDashboard(supersetUri)),
  );
};

const sanitizeDashboard: (
  supersetUri: string,
) => (dashboard: DashboardRaw) => Dashboard = (supersetUri) => (d) => ({
  id: d.id,
  slug: d.slug,
  title: d.dashboard_title,
  thumbnailUrl: d.thumbnail_url && `${supersetUri}${d.thumbnail_url}`,
  tags: d.tags
    .filter((t) => t.type === 1 && !!t.name)
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
});

export const internal = {
  sanitizeDashboard,
};
