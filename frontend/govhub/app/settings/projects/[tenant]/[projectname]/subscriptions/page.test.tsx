import { render } from '@testing-library/react';
import SubscriptionPage from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/page';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/subscriptions/SubscriptionList',
  () => jest.fn(() => <div>list of subscriptions</div>),
);

describe('snapshot', () => {
  it('renders page as expected', async () => {
    const { container } = render(
      await SubscriptionPage({
        params: Promise.resolve({ tenant: 'tenant1', projectname: 'project1' }),
      }),
    );
    expect(container).toMatchSnapshot();
  });
});
