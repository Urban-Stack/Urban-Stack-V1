import { render } from '@testing-library/react';
import { SensorSubscription } from '@/app/_lib/resource-api/project/subscriptions';
import EditBadge from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/EditBadge';

const TENANT = 'test-tenant';
const PROJECT = 'test-project';
const SUBSCRIPTION = {
  name: 'sub1',
  config: {
    username: 'user1',
    uri: 'mqtt://localhost:1883',
    topic: 'my/topic/1',
    format: 'direct',
  },
  _tag: 'SensorSubscription',
} as SensorSubscription;

describe('EditBadge', () => {
  it('matches the snapshot', async () => {
    const component = render(
      <EditBadge
        tenant={TENANT}
        project={PROJECT}
        subscription={SUBSCRIPTION}
      />,
    );

    expect(component).toMatchSnapshot();
  });

  it('creates correct link to edit page', async () => {
    const component = render(
      <EditBadge
        tenant={TENANT}
        project={PROJECT}
        subscription={SUBSCRIPTION}
      />,
    );

    const link = component.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      `/settings/projects/${TENANT}/${PROJECT}/subscriptions/${SUBSCRIPTION.name}`,
    );
  });
});
