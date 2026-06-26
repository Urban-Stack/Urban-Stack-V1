import { render, within } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import {
  AllSubscriptions,
  queryAllSubscriptions,
} from '@/app/_lib/resource-api/graphql/subscriptions';
import { SensorSubscription } from '@/app/_lib/resource-api/project/subscriptions';
import { DeepPick } from 'ts-essentials';
import SubscriptionList from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/SubscriptionList';
import { SubscriptionTestIds } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { SubscriptionState } from '@/app/__generated__/types';

const queryAllSubscriptionsMock: FuncMock<typeof queryAllSubscriptions> =
  queryAllSubscriptions as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/graphql/subscriptions', () => ({
  queryAllSubscriptions: jest.fn(),
}));

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/subscriptions/actions',
  () => ({
    deleteSubscription: jest.fn(),
  }),
);

const TENANT = 'tenant1';
const PROJECT = 'project1';

const SUBSCRIPTIONS: DeepPick<
  SensorSubscription,
  {
    name: never;
    config: { uri: never; format: never };
    connection: { state: never };
  }
>[] = [
  {
    name: 'sub1',
    config: { uri: 'uri1', format: 'zenner' },
    connection: { state: SubscriptionState.Connected },
  },
  {
    name: 'sub1',
    config: { uri: 'uri2', format: 'direct' },
    connection: { state: SubscriptionState.Error },
  },
  {
    name: 'sub3',
    config: { uri: 'uri3', format: 'lorawan' },
    connection: { state: SubscriptionState.Connecting },
  },
];

const mockSubscriptions = (
  sensorSubscriptions: SensorSubscription[],
  error?: CombinedGraphQLErrors,
) => {
  queryAllSubscriptionsMock.mockResolvedValueOnce({
    data: { project: { sensorSubscriptions } },
    error,
  } as unknown as AllSubscriptions);
};

beforeEach(() => {
  queryAllSubscriptionsMock.mockReset();
});

describe('snapshot', () => {
  it('renders list overview as expected', async () => {
    mockSubscriptions(SUBSCRIPTIONS as SensorSubscription[]);

    const { container } = render(
      await SubscriptionList({ tenant: TENANT, project: PROJECT }),
    );

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('subscription overview contains all received subscriptions', async () => {
    mockSubscriptions(SUBSCRIPTIONS as SensorSubscription[]);

    const component = render(
      await SubscriptionList({ tenant: TENANT, project: PROJECT }),
    );

    const table = component.getByTestId(SubscriptionTestIds.table);
    const tableRows = within(table).queryAllByTestId(
      SubscriptionTestIds.tableItem,
    );
    const fallback = component.queryByTestId(SettingsTestIds.fallback);

    expect(table).toBeVisible();
    expect(tableRows).toHaveLength(SUBSCRIPTIONS.length);
    expect(fallback).not.toBeInTheDocument();
  });

  it('shows "no subscriptions" fallback', async () => {
    mockSubscriptions([]);

    const component = render(
      await SubscriptionList({ tenant: TENANT, project: PROJECT }),
    );

    const table = component.queryByTestId(SubscriptionTestIds.table);
    const fallback = component.queryByTestId(SettingsTestIds.fallback);

    expect(table).not.toBeInTheDocument();
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent('Noch keine Subscriptions vorhanden');
    expect(fallback).toHaveTextContent(
      'Sie können hier eine neue Subscription erstellen.',
    );
  });

  it('shows "unknown error" fallback', async () => {
    mockSubscriptions(
      [],
      new CombinedGraphQLErrors({ errors: [{ message: '' }] }),
    );

    const component = render(
      await SubscriptionList({ tenant: TENANT, project: PROJECT }),
    );

    const table = component.queryByTestId(SubscriptionTestIds.table);
    const fallback = component.queryByTestId(SettingsTestIds.fallback);

    expect(table).not.toBeInTheDocument();
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(
      'Subscriptions konnten nicht geladen werden',
    );
    expect(fallback).toHaveTextContent(
      'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    );
  });
});
