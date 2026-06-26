import { render } from '@testing-library/react';
import CommunityPage from '@/app/community/page';
import { FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import AppDiscourseIframe from '@/app/_component/discourse/AppDiscourseIframe';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

jest.mock('@/app/_component/discourse/AppDiscourseIframe');
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

beforeEach(() => {
  getPublicEnvMock.mockReset();
});

const discourseBaseUrl = 'https://discourse.example.com';

it('calls AppDiscourseIframe with correct discourse URL', async () => {
  getPublicEnvMock.mockImplementationOnce((name) =>
    name === 'DISCOURSE_URI' ? discourseBaseUrl : '',
  );

  render(<CommunityPage />);

  expect(AppDiscourseIframe).toHaveBeenCalledWith(
    { discourseBaseUrl },
    undefined,
  );
});
