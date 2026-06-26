import { _internal } from './EditForm';
import { render } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { UdpToast } from 'udp-ui/components';
import { NEW_STRING, PublishedQueryState } from './form';
import { useSqlQuery } from '@/app/_lib/superset/iframe-communication/useSqlQuery';

const { FormContent } = _internal;

const useRouterMock = useRouter as unknown as jest.Mock;
const UdpToastMock = UdpToast as unknown as jest.Mock;
const routerPushMock = jest.fn();
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock(
  '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/action',
  () => ({
    createPublishedQuery: jest.fn(),
  }),
);
jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));
jest.mock('@/app/_lib/superset/iframe-communication/useSqlQuery', () => ({
  useSqlQuery: jest.fn(),
}));

beforeAll(() => {
  useRouterMock.mockReturnValue({ push: routerPushMock });
});

beforeEach(() => {
  routerPushMock.mockReset();
  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
  successToastMock.mockReset();
  errorToastMock.mockReset();
  (useSqlQuery as jest.Mock).mockReset().mockReturnValue({});
});

const TENANT = 'tenant1';
const VIZGROUP = 'vizgroup1';
const QUERY_NAME = 'query1';
const SUPERSET_URI = 'http://superset.example.com';

describe('errors', () => {
  const errors: ({ testCase: string } & Required<
    Pick<PublishedQueryState, 'errors'>
  >)[] = [
    { testCase: 'single error', errors: { name: ['name error 1'] } },
    {
      testCase: 'multiple errors',
      errors: {
        name: ['name error 1', 'name error 2'],
        sql: ['sql error 1'],
      },
    },
  ];
  it.each(errors)('displays error messages for $testCase', ({ errors }) => {
    const component = render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={false}
        state={{ errors }}
        supersetUri={SUPERSET_URI}
      />,
    );

    Object.values(errors).forEach((errorArr) => {
      errorArr.forEach((msg) => {
        expect(component.getByText(msg)).toBeVisible();
      });
    });
  });

  it('displays general error message as toast', () => {
    const errors = { general: ['general error'] };
    render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={false}
        state={{ errors }}
        supersetUri={SUPERSET_URI}
      />,
    );

    expect(UdpToastMock).toHaveBeenCalledWith(
      'Query konnte nicht gespeichert werden.\ngeneral error',
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
        name: NEW_STRING,
        sql: 'SELECT * FROM geo',
      },
    };
    render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={true}
        state={state as PublishedQueryState}
        supersetUri={SUPERSET_URI}
      />,
    );

    expect(UdpToastMock).toHaveBeenCalledWith(
      'Query erfolgreich erstellt.',
      'success',
    );
    expect(successToastMock).toHaveBeenCalledTimes(1);
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('displays edit success message as toast', () => {
    const state = {
      data: {
        name: QUERY_NAME,
        sql: 'SELECT * FROM geo',
      },
    };
    render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={false}
        state={state as PublishedQueryState}
        supersetUri={SUPERSET_URI}
      />,
    );

    expect(UdpToastMock).toHaveBeenCalledWith(
      'Query erfolgreich gespeichert.',
      'success',
    );
    expect(successToastMock).toHaveBeenCalledTimes(1);
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('redirects to query list on success', () => {
    const state = {
      data: {
        name: QUERY_NAME,
        sql: 'SELECT * FROM geo',
      },
    };
    render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={false}
        state={state as PublishedQueryState}
        supersetUri={SUPERSET_URI}
      />,
    );

    expect(routerPushMock).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}/${VIZGROUP}/geojson`,
    );
  });
});

describe('isInitial', () => {
  it('does not display toast on initial page load', () => {
    const state = {
      data: {
        name: QUERY_NAME,
        sql: 'SELECT * FROM geo',
      },
      isInitial: true,
    };
    render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={true}
        state={state as PublishedQueryState}
        supersetUri={SUPERSET_URI}
      />,
    );

    expect(UdpToastMock).not.toHaveBeenCalled();
  });
});

describe('name input disabled state', () => {
  it('disables name input when editing existing query', () => {
    const { getByLabelText } = render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={false}
        state={{}}
        supersetUri={SUPERSET_URI}
      />,
    );
    const input = getByLabelText('Name der Query');
    expect(input).toBeDisabled();
  });

  it('enables name input if new query', () => {
    const { getByLabelText } = render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={true}
        state={{}}
        supersetUri={SUPERSET_URI}
      />,
    );
    const input = getByLabelText('Name der Query');
    expect(input).not.toBeDisabled();
  });
});

describe('sqlQuery integration', () => {
  const SQL_QUERY = 'SELECT * FROM test_table';

  beforeEach(() => {
    (useSqlQuery as jest.Mock).mockReturnValue({ sqlQuery: SQL_QUERY });
  });

  it('passes sqlQuery from useSqlQuery as value to UdpTextArea', () => {
    const { getByLabelText } = render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={true}
        state={{}}
        supersetUri={SUPERSET_URI}
      />,
    );
    const textarea = getByLabelText('SQL Query') as HTMLTextAreaElement;
    expect(textarea.value).toBe(SQL_QUERY);
  });

  it('renders the Superset SQL Lab iframe with correct src', () => {
    const { getByTitle } = render(
      <FormContent
        tenant={TENANT}
        vizgroup={VIZGROUP}
        isNew={true}
        state={{}}
        supersetUri={SUPERSET_URI}
      />,
    );
    const iframe = getByTitle('Superset SQL Lab') as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toContain(`${SUPERSET_URI}/sqllab`);
  });
});
