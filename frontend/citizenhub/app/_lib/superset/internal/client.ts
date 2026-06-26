import { z } from 'zod';
import { getPublicEnv } from '@/app/_lib/env';
import { DeepRequired } from 'ts-essentials';

const toDate: (s: string) => Date = (s) => new Date(s);
const optional = <T>(t: T) => (t ?? undefined) as Exclude<T, null> | undefined;

const TagRaw = z.object({
  id: z.number(),
  name: z.string().nullable().transform(optional),
  type: z.number(),
});
type TagRaw = z.infer<typeof TagRaw>;

const DashboardRaw = z.object({
  changed_on_utc: z.string().datetime({ offset: true }).transform(toDate),
  dashboard_title: z.string().nullable().transform(optional),
  id: z.number(),
  slug: z.string(),
  status: z.string(),
  tags: z
    .array(TagRaw)
    .transform(
      (ts) => ts.filter((t) => t.name !== null) as DeepRequired<TagRaw>[],
    ),
  thumbnail_url: z.string().nullable().transform(optional),
  url: z.string(),
});
export type DashboardRaw = z.infer<typeof DashboardRaw>;

const DashboardsResponse = z.object({
  count: z.number(),
  ids: z.array(z.number()),
  result: z.array(DashboardRaw),
});
/* c8 ignore stop */

export const fetchDashboards: (tenant: string) => Promise<DashboardRaw[]> = (
  tenant: string,
) => {
  const supersetUri = getPublicEnv('SUPERSET_URI');
  const query = {
    filters: [
      {
        col: 'slug',
        opr: 'sw', // starts with
        value: `${tenant}_`,
      },
    ],
    // don't use pagination, give the whole result at once
    page_size: -1,
  };
  return fetch(
    `${supersetUri}/api/v1/dashboard/?q=${encodeURIComponent(JSON.stringify(query))}`,
  )
    .then((res) => res.json())
    .then((json) => DashboardsResponse.parse(json))
    .then((json) => json.result);
};
