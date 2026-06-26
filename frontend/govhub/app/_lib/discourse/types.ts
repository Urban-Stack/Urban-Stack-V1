import { z } from 'zod';

export const DiscourseUser = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  avatar_template: z.string(),
});

export type DiscourseUser = z.infer<typeof DiscourseUser>;

export const ChatMessageAuthor = DiscourseUser.extend({
  moderator: z.boolean(),
  admin: z.boolean(),
  staff: z.boolean(),
  new_user: z.boolean(),
  primary_group_name: z.unknown(),
});

export type ChatMessageAuthor = z.infer<typeof ChatMessageAuthor>;

export const Meta = z.object({
  target_message_id: z.unknown(),
  can_load_more_future: z.boolean().nullable(),
  can_load_more_past: z.boolean().nullable(),
});

export const Csrf = z.object({
  csrf: z.string(),
});

export type Csrf = z.infer<typeof Csrf>;

export const CurrentUserResponse = z.object({
  current_user: DiscourseUser,
});

const TransformedDate = z
  .string()
  .datetime({ offset: true })
  .transform((s) => new Date(s));

export const Topic = z.object({
  id: z.number(),
  slug: z.string(),
  highest_post_number: z.number(),
  title: z.string(),
  unicode_title: z.string().optional(),
  created_at: TransformedDate,
  last_posted_at: TransformedDate,
});

export type Topic = z.infer<typeof Topic>;

export const LatestTopicsResponse = z.object({
  topic_list: z.object({ topics: Topic.array() }),
});
