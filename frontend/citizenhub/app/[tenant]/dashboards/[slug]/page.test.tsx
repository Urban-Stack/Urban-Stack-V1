import { render } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import DashboardPage from '@/app/[tenant]/dashboards/[slug]/page';
import { UdpEmbeddedDashboard } from 'udp-ui/components';

const slug = 'tenant_vizgroup_name';
const tenant = 'tenant';
const SUPERSET_URI = 'https://superset.data-hub.local';

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  IcAngleLeft: jest.fn(() => <svg data-testid='ic-angle-left' />),
  UdpEmbeddedDashboard: jest.fn(() => <div>Mocked UdpEmbeddedDashboard</div>),
}));

beforeAll(() => {
  getPublicEnvMock.mockReturnValue(SUPERSET_URI);
});

beforeEach(() => {
  getPublicEnvMock.mockClear();
});

describe('snapshot', () => {
  it('renders page as expected', async () => {
    const { container } = render(
      await DashboardPage({
        params: Promise.resolve({ tenant, slug }),
      }),
    );

    expect(container).toMatchSnapshot();
  });
});

describe('back navigation', () => {
  it('contains link for back navigating to the dashboards overview', async () => {
    const component = render(
      await DashboardPage({ params: Promise.resolve({ tenant, slug }) }),
    );

    expect(
      component.queryByRole('link', { name: 'Zurück zur Übersicht' }),
    ).toHaveAttribute('href', `/${tenant}/dashboards`);
  });
});

describe('props', () => {
  it('calls sub component with correct Superset URI and dashboard slug', async () => {
    getPublicEnvMock.mockImplementationOnce((name) =>
      name === 'SUPERSET_URI' ? SUPERSET_URI : '',
    );

    render(await DashboardPage({ params: Promise.resolve({ tenant, slug }) }));

    expect(UdpEmbeddedDashboard).toHaveBeenCalledWith(
      {
        supersetBaseUrl: SUPERSET_URI,
        slug: slug,
        className: 'h-full',
      },
      undefined,
    );
  });
});
