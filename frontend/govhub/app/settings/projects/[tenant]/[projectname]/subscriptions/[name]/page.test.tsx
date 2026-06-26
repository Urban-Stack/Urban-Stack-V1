// page.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import EditSubscriptionPage from './page';
import CreateForm from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/CreateForm';
import { FuncMock } from '@/app/_test/utils';
import { getSingleSubscription } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/actions';
import { SensorSubscriptionFormat } from '@/app/_lib/resource-api/project/subscriptions';

const getSingleSubscriptionMock = getSingleSubscription as unknown as FuncMock<
  typeof getSingleSubscription
>;

const CreateFormMock = CreateForm as unknown as FuncMock<typeof CreateForm>;

jest.mock('@/app/meta', () => ({ mkMetadata: jest.fn() }));

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/CreateForm',
  () => ({
    __esModule: true,
    default: jest.fn(() => <div>Mocked CreateForm</div>),
  }),
);
jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/actions',
  () => ({
    getSingleSubscription: jest.fn(),
  }),
);

describe('EditSubscriptionPage', () => {
  beforeEach(() => {
    getSingleSubscriptionMock.mockReset();
    CreateFormMock.mockReset();
  });

  it('calls CreateForm with the correct new props', async () => {
    const paramsPromise = Promise.resolve({
      tenant: 'tenant1',
      projectname: 'proj1',
      name: 'new',
    });
    const element = await EditSubscriptionPage({ params: paramsPromise });

    render(element);

    expect(CreateForm).toHaveBeenCalledWith(
      {
        tenant: 'tenant1',
        project: 'proj1',
        subscriptionName: 'new',
        subscription: {},
      },
      undefined,
    );
  });

  it('calls CreateForm with the correct edit props', async () => {
    const subscription = {
      data: {
        config: {
          uri: 'http://example.com',
          format: 'zenner' as SensorSubscriptionFormat,
          topic: 'topic1',
          username: 'user1',
          password: 'password1',
        },
      },
    };
    getSingleSubscriptionMock.mockResolvedValue(subscription);
    const paramsPromise = Promise.resolve({
      tenant: 'tenant1',
      projectname: 'proj1',
      name: 'sub1',
    });
    const element = await EditSubscriptionPage({ params: paramsPromise });

    render(element);

    expect(CreateForm).toHaveBeenCalledWith(
      {
        tenant: 'tenant1',
        project: 'proj1',
        subscriptionName: 'sub1',
        subscription: subscription,
      },
      undefined,
    );
  });
});
