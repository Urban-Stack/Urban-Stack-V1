import { Topic } from '@/app/_lib/discourse/types';

type Options = {
  basePage?: string;
  mobile?: boolean;
};

const defaultOptions: Options = {
  basePage: '/community',
  mobile: false,
};

export const mkCommunityHref = (
  path: string = '/',
  options: Options = defaultOptions,
) => {
  const _options = { ...defaultOptions, ...options };
  return `${_options.basePage}?${new URLSearchParams([['path', path]])}`;
};

export const mkCommunityLatestTopicHref = (topic: Topic) =>
  mkCommunityHref(`/t/${topic.slug}/${topic.id}/${topic.highest_post_number}`);
