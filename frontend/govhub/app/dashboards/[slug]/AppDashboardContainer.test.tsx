import { render } from '@testing-library/react';
import { UdpEmbeddedDashboard } from 'udp-ui/components';
import AppDashboardContainer from '@/app/dashboards/[slug]/AppDashboardContainer';

jest.mock('udp-ui/components', () => ({
  UdpEmbeddedDashboard: jest.fn(),
}));

const TEST_DASHBOARD_SLUG = 'tenant_vizgroup_name';
const TEST_SUPERSET_URI = 'https://superset.data-hub.local';
const HEADING = 'Neues Dashboard erstellen';

describe('snapshot', () => {
  it('shows correct title if in edit mode', () => {
    const component = render(
      <AppDashboardContainer
        supersetBaseUrl={TEST_SUPERSET_URI}
        slug={TEST_DASHBOARD_SLUG}
        editMode={true}
      />,
    );

    expect(component.container).toMatchSnapshot();
    expect(component.queryByRole('heading', { name: HEADING })).toBeVisible();
  });

  it('hides title if not in edit mode', () => {
    const component = render(
      <AppDashboardContainer
        supersetBaseUrl={TEST_SUPERSET_URI}
        slug={TEST_DASHBOARD_SLUG}
        editMode={false}
      />,
    );

    expect(component.container).toMatchSnapshot();
    expect(
      component.queryByRole('heading', { name: HEADING }),
    ).not.toBeInTheDocument();
  });
});

describe('iframe', () => {
  it('renders iframe for the Superset dashboard of the given dashboard slug', () => {
    render(
      <AppDashboardContainer
        supersetBaseUrl={TEST_SUPERSET_URI}
        slug={TEST_DASHBOARD_SLUG}
      />,
    );

    expect(UdpEmbeddedDashboard).toHaveBeenCalledWith(
      {
        supersetBaseUrl: TEST_SUPERSET_URI,
        slug: TEST_DASHBOARD_SLUG,
        editMode: false,
        className: 'h-full',
      },
      undefined,
    );
  });
});

describe('edit mode', () => {
  it.each([true, false, undefined])(
    'passes correct edit mode to dashboard component',
    (isEditMode) => {
      render(
        <AppDashboardContainer
          supersetBaseUrl={TEST_SUPERSET_URI}
          slug={TEST_DASHBOARD_SLUG}
          editMode={isEditMode}
        />,
      );

      expect(UdpEmbeddedDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ editMode: !!isEditMode }),
        undefined,
      );
    },
  );
});
