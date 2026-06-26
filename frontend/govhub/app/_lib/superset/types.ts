import { z } from 'zod';

const toDate: (s: string) => Date = (s) => new Date(s);

const UserWithId = z.object({
  first_name: z.string(),
  id: z.number(),
  last_name: z.string(),
});

export type UserWithIdType = z.infer<typeof UserWithId>;

const TagRaw = z.object({
  id: z.number(),
  name: z.string().nullable(),
  type: z.number(),
});

/**
 * Type of a dashboard tag.
 *
 * @param id   ID of the tag
 * @param name name of the tag
 * @param type type of the tag (`1` for explicit tags added manually, or `2-4` for implicit tags generated automatically)
 */
export type TagRaw = z.infer<typeof TagRaw>;

export const DashboardResponseRaw = z.object({
  changed_on_utc: z.string().datetime({ offset: true }).transform(toDate),
  created_by: UserWithId.nullable(),
  dashboard_title: z.string().nullable(),
  id: z.number(),
  published: z.boolean().nullable(),
  slug: z.string(),
  status: z.string(),
  tags: z.array(TagRaw),
  thumbnail_url: z.string(),
  url: z.string(),
});

export type DashboardResponseRaw = z.infer<typeof DashboardResponseRaw>;

export const DashboardsResponse = z.object({
  count: z.number(),
  description_columns: z.unknown(),
  ids: z.array(z.number()),
  label_columns: z.unknown(),
  list_columns: z.array(z.string()),
  list_title: z.string(),
  order_columns: z.array(z.string()),
  result: z.array(DashboardResponseRaw),
});

export type DashboardsResponseType = z.infer<typeof DashboardsResponse>;

const DashboardTag = z.object({
  id: z.number(),
  name: z.string(),
});

export type DashboardTag = z.infer<typeof DashboardTag>;

/**
 * Sanitized representation of a specific dashboard.
 * <p>
 * This schema comprises those information on a specific dashboard
 * that is actually used by the application.
 */
export const Dashboard = DashboardResponseRaw.pick({
  changed_on_utc: true,
  created_by: true,
  dashboard_title: true,
  id: true,
  slug: true,
  thumbnail_url: true,
  published: true,
}).merge(
  z.object({
    favorite: z.boolean().optional(),
    tags: z.array(DashboardTag),
    vizGroup: z.string(),
    tenant: z.string(),
  }),
);

/**
 * Type of the sanitized representation of a specific Dashboard.
 * <p>
 * This type comprises the Dashboard response data provided by Superset
 * enriched with additional properties used by the application.
 */
export type Dashboard = z.infer<typeof Dashboard>;

const FavoriteStatus = z.object({
  id: z.number(),
  value: z.boolean(),
});

export type FavoriteStatusType = z.infer<typeof FavoriteStatus>;

export const GetFavoriteStatusesResponse = z.object({
  result: z.array(FavoriteStatus),
});

export const SetFavoriteStatusResponse = z.object({
  result: z.string(),
});

export type SetFavoriteStatusResponseType = z.infer<
  typeof SetFavoriteStatusResponse
>;

export const FORM_NAMES = {
  dashboardTitle: 'new-dashboard-title',
  vizGroup: 'new-dashboard-vizgroup',
} as const;

export const CreateDashboard = z.object({
  title: z
    .string()
    .min(3, 'Dashboard-Titel muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Dashboard-Titel darf maximal 64 Zeichen beinhalten'),
  vizGroup: z.object({
    name: z.string(),
    tenant: z.string(),
  }),
});
export type CreateDashboard = z.infer<typeof CreateDashboard>;

export type CreateDashboardState = {
  errors?: {
    title?: string[];
    vizGroup?: string[];
  };
};

export const mkTitleError: (msg: string) => CreateDashboardState = (msg) => ({
  errors: { title: [msg] },
});

export type DeleteDashboardState = {
  error?: string;
};
