import { _internal } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/CreateForm';
import { render } from '@testing-library/react';
import { redirect, useRouter } from 'next/navigation';
import { createSubscription } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/actions';
import { FuncMock } from '@/app/_test/utils';
import { SubscriptionState } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/form';
import { UdpToast } from 'udp-ui/components';

const { FormContent } = _internal;

const redirectMock = redirect as unknown as jest.Mock;
const useRouterMock = useRouter as unknown as jest.Mock;
const UdpToastMock = UdpToast as unknown as jest.Mock;
const createSubscriptionMock = createSubscription as unknown as FuncMock<
  typeof createSubscription
>;
const routerPushMock = jest.fn();
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));
jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/actions',
  () => ({
    createSubscription: jest.fn(),
  }),
);

beforeAll(() => {
  useRouterMock.mockReturnValue({ push: routerPushMock });
});

beforeEach(() => {
  redirectMock.mockReset();
  routerPushMock.mockReset();
  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
  successToastMock.mockReset();
  errorToastMock.mockReset();
  createSubscriptionMock.mockReset();
});

const TEST_TENANT = 'tenant1';
const TEST_PROJECT = 'project1';
const TEST_SUB_NAME = 'subscription1';
const TEST_SUB = {};

describe('snapshot', () => {
  it('matches snapshot', async () => {
    const { container } = render(
      <FormContent
        tenant={TEST_TENANT}
        project={TEST_PROJECT}
        subscriptionName={TEST_SUB_NAME}
        subscription={TEST_SUB}
        state={{}}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});

describe('errors', () => {
  const errors: ({ testCase: string } & Required<
    Pick<SubscriptionState, 'errors'>
  >)[] = [
    { testCase: 'single error', errors: { format: ['format error 1'] } },
    {
      testCase: 'multiple errors',
      errors: {
        name: ['name error 1', 'name error 2'],
        topic: ['topic error 1'],
      },
    },
  ];
  it.each(errors)(
    'displays error messages regarding the project name for $testCase',
    ({ errors }) => {
      const component = render(
        <FormContent
          tenant={TEST_TENANT}
          project={TEST_PROJECT}
          subscriptionName={TEST_SUB_NAME}
          subscription={TEST_SUB}
          state={{ errors }}
        />,
      );

      Object.entries(errors).forEach(([_, error]) => {
        error.forEach((msg) => {
          expect(component.getByText(msg)).toBeVisible();
        });
      });
    },
  );

  it('displays general error message as toast', () => {
    const errors = { general: ['general error'] };
    render(
      <FormContent
        tenant={TEST_TENANT}
        project={TEST_PROJECT}
        subscriptionName={TEST_SUB_NAME}
        subscription={TEST_SUB}
        state={{ errors }}
      />,
    );

    expect(UdpToastMock).toHaveBeenCalledWith(
      'Subscription konnte nicht erstellt werden.\ngeneral error',
      'error',
    );
    expect(errorToastMock).toHaveBeenCalledTimes(1);
    expect(successToastMock).not.toHaveBeenCalled();
  });
});

describe('success', () => {
  it('displays new success message as toast', () => {
    const state = {
      data: {
        name: TEST_SUB_NAME,
        config: {},
      },
    };
    render(
      <FormContent
        tenant={TEST_TENANT}
        project={TEST_PROJECT}
        subscriptionName={'new'}
        subscription={TEST_SUB}
        state={state as SubscriptionState}
      />,
    );

    expect(UdpToastMock).toHaveBeenCalledWith(
      'Subscription erfolgreich erstellt',
      'success',
    );
    expect(successToastMock).toHaveBeenCalledTimes(1);
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('displays edit success message as toast', () => {
    const state = {
      data: {
        name: TEST_SUB_NAME,
        config: {},
      },
    };
    render(
      <FormContent
        tenant={TEST_TENANT}
        project={TEST_PROJECT}
        subscriptionName={TEST_SUB_NAME}
        subscription={TEST_SUB}
        state={state as SubscriptionState}
      />,
    );

    expect(UdpToastMock).toHaveBeenCalledWith(
      'Subscription erfolgreich gespeichert',
      'success',
    );
    expect(successToastMock).toHaveBeenCalledTimes(1);
    expect(errorToastMock).not.toHaveBeenCalled();
  });
});

describe('isInitial', () => {
  it('does not display toast on initial page load', () => {
    const state = {
      data: {
        name: TEST_SUB_NAME,
        config: {},
      },
      isInitial: true,
    };
    render(
      <FormContent
        tenant={TEST_TENANT}
        project={TEST_PROJECT}
        subscriptionName={'new'}
        subscription={TEST_SUB}
        state={state as SubscriptionState}
      />,
    );

    expect(UdpToastMock).not.toHaveBeenCalled();
  });
});
