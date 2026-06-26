'use client';

import Link from 'next/link';
import {
  mkCommunityHref,
  mkCommunityLatestTopicHref,
} from '@/app/_lib/discourse/util';
import { useDiscourse } from '@/app/_lib/discourse/discourse';
import { range, take } from 'lodash';
import { Topic } from '@/app/_lib/discourse/types';
import {
  UdpPostPreviewCard,
  UdpPostPreviewCardSkeleton,
} from 'udp-ui/components';

const POST_PREVIEW_CARD_COUNT = 3;

const AppCommunityPostGroup = ({
  discourseBaseUrl,
}: {
  discourseBaseUrl: string;
}) => (
  <div className='flex flex-col gap-3'>
    <div className='flex gap-2 items-center justify-between'>
      <h2 className='text-2xl font-bold truncate'>Neueste Forenbeiträge</h2>
      <Link
        href={mkCommunityHref('/latest')}
        className='p-1 text-gray-500 hover:underline
        focus:rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary-300'
      >
        Alle anzeigen
      </Link>
    </div>
    <UdpPostPreviewCardList discourseBaseUrl={discourseBaseUrl} />
  </div>
);

const UdpPostPreviewCardList: React.FC<{ discourseBaseUrl: string }> = ({
  discourseBaseUrl,
}) => {
  const { useLatestTopics } = useDiscourse(discourseBaseUrl);
  const { latestTopics, isLoading } = useLatestTopics();

  return (
    <div className='flex flex-col gap-4 whitespace-normal'>
      {isLoading
        ? range(0, POST_PREVIEW_CARD_COUNT).map((idx) => (
            <UdpPostPreviewCardSkeleton key={idx} />
          ))
        : take(latestTopics, POST_PREVIEW_CARD_COUNT).map((topic) => (
            <InternalPostPreviewCard topic={topic} key={topic.id} />
          ))}
    </div>
  );
};

const InternalPostPreviewCard: React.FC<{ topic: Topic }> = ({ topic }) => (
  <UdpPostPreviewCard
    date={topic.last_posted_at}
    href={mkCommunityLatestTopicHref(topic)}
  >
    {topic.unicode_title ?? topic.title}
  </UdpPostPreviewCard>
);

export default AppCommunityPostGroup;
