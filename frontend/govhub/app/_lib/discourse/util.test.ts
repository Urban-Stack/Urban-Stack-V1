import {
  mkCommunityHref,
  mkCommunityLatestTopicHref,
} from '@/app/_lib/discourse/util';
import { Topic } from '@/app/_lib/discourse/types';
import { generateMock } from '@anatine/zod-mock';

describe('mkCommunityHref', () => {
  it('returns correct href for empty string given', () => {
    const path = '';

    const result = mkCommunityHref(path);

    expect(result).toEqual('/community?path=');
  });

  it('returns correct href for non-empty string given', () => {
    const path = 'testPath';

    const result = mkCommunityHref(path);

    expect(result).toEqual(`/community?path=${path}`);
  });

  it('returns correct href for non-empty string given with basePage', () => {
    const path = 'testPath';
    const basePage = 'testBasePage';

    const result = mkCommunityHref(path, { basePage });

    expect(result).toEqual(`${basePage}?path=${path}`);
  });
});

describe('mkCommunityLatestTopicHref', () => {
  const TEST_TOPIC_SLUG = 'test-topic-slug';
  const TEST_TOPIC_ID = 123;
  const TEST_TOPIC_HIGHEST_POST_NUMBER = 5;

  it('returns correct href for latest topic', () => {
    const topic = {
      ...generateMock(Topic),
      id: TEST_TOPIC_ID,
      slug: TEST_TOPIC_SLUG,
      highest_post_number: TEST_TOPIC_HIGHEST_POST_NUMBER,
    };

    const result = mkCommunityLatestTopicHref(topic);

    const expectedPath = `%2Ft%2F${TEST_TOPIC_SLUG}%2F${TEST_TOPIC_ID}%2F${TEST_TOPIC_HIGHEST_POST_NUMBER}`;
    expect(result).toEqual(`/community?path=${expectedPath}`);
  });
});
