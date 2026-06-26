import AppCommunityPostGroup from '@/app/_homepage/AppCommunityPostGroup';
import { render } from '@testing-library/react';
import { useDiscourse } from '@/app/_lib/discourse/discourse';
import { generateMock } from '@anatine/zod-mock';
import { Topic } from '@/app/_lib/discourse/types';
import { range } from 'lodash';
import { UdpPostPreviewCard } from 'udp-ui/components';

const TEST_DISCOURSE_URL = 'http://discourse.data-hub.local';

jest.mock('udp-ui/components', () => ({
  UdpPostPreviewCard: jest.fn(),
}));

jest.mock('@/app/_lib/discourse/discourse', () => ({
  ...jest.requireActual('@/app/_lib/discourse/discourse'),
  useDiscourse: jest.fn(),
}));
const useDiscourseMock = useDiscourse as unknown as jest.Mock;
const useLatestTopicsMock = jest.fn();

beforeAll(() => {
  useDiscourseMock.mockReturnValue({
    useLatestTopics: useLatestTopicsMock,
  });
});

beforeEach(() => {
  useLatestTopicsMock.mockReset();
});

describe('snapshot', () => {
  it('renders component layout correctly', () => {
    useLatestTopicsMock.mockReturnValue({ latestTopics: [] });

    const { container } = render(
      <AppCommunityPostGroup discourseBaseUrl={TEST_DISCOURSE_URL} />,
    );

    expect(container).toMatchSnapshot();
  });
});

describe('cards', () => {
  it.each([
    [3, 5],
    [3, 3],
    [2, 2],
    [0, 0],
  ])(
    'shows %i preview cards if %i topics exist',
    (expectedCardCount, topicsCount) => {
      const latestTopics = range(0, topicsCount).map(() => generateMock(Topic));
      useLatestTopicsMock.mockReturnValue({ latestTopics });

      render(<AppCommunityPostGroup discourseBaseUrl={TEST_DISCOURSE_URL} />);

      expect(UdpPostPreviewCard).toHaveBeenCalledTimes(expectedCardCount);
    },
  );

  it('invokes preview card with correct date and href from topic', () => {
    const TEST_TOPIC_SLUG = 'test-topic-slug';
    const TEST_TOPIC_ID = 123;
    const TEST_TOPIC_HIGHEST_POST_NUMBER = 5;
    const TEST_LATEST_POSTED_AT = new Date('2024-08-15');
    const testTopic = {
      ...generateMock(Topic),
      id: TEST_TOPIC_ID,
      slug: TEST_TOPIC_SLUG,
      highest_post_number: TEST_TOPIC_HIGHEST_POST_NUMBER,
      last_posted_at: TEST_LATEST_POSTED_AT,
    };
    useLatestTopicsMock.mockReturnValue({ latestTopics: [testTopic] });

    render(<AppCommunityPostGroup discourseBaseUrl={TEST_DISCOURSE_URL} />);

    expect(UdpPostPreviewCard).toHaveBeenCalledWith(
      expect.objectContaining({
        date: TEST_LATEST_POSTED_AT,
        href: `/community?path=%2Ft%2F${TEST_TOPIC_SLUG}%2F${TEST_TOPIC_ID}%2F${TEST_TOPIC_HIGHEST_POST_NUMBER}`,
      }),
      undefined,
    );
  });

  it('invokes preview card with correct text for topic with unicode_title', () => {
    const testTopic = generateMock(Topic);
    useLatestTopicsMock.mockReturnValue({ latestTopics: [testTopic] });

    render(<AppCommunityPostGroup discourseBaseUrl={TEST_DISCOURSE_URL} />);

    expect(UdpPostPreviewCard).toHaveBeenCalledWith(
      expect.objectContaining({ children: testTopic.unicode_title }),
      undefined,
    );
  });

  it('invokes preview card with correct text for topic without unicode_title', () => {
    const testTopic = generateMock(Topic);
    delete testTopic.unicode_title;
    useLatestTopicsMock.mockReturnValue({ latestTopics: [testTopic] });

    render(<AppCommunityPostGroup discourseBaseUrl={TEST_DISCOURSE_URL} />);

    expect(UdpPostPreviewCard).toHaveBeenCalledWith(
      expect.objectContaining({ children: testTopic.title }),
      undefined,
    );
  });
});

describe('link', () => {
  it('renders link correctly', () => {
    useLatestTopicsMock.mockReturnValue({ latestTopics: [] });

    const component = render(
      <AppCommunityPostGroup discourseBaseUrl={TEST_DISCOURSE_URL} />,
    );

    expect(
      component.getByRole('link', { name: 'Alle anzeigen' }),
    ).toHaveAttribute('href', '/community?path=%2Flatest');
  });
});
