import { render } from '@testing-library/react';
import AppDashboardsOverview from '@/app/dashboards/_internal/AppDashboardsOverview';
import { ViewType } from '@/app/dashboards/_internal/common';
import AppDashboardsListOverview from '@/app/dashboards/_internal/AppDashboardsListOverview';
import AppDashboardsCardOverview from '@/app/dashboards/_internal/AppDashboardsCardOverview';
import { generateSanitizedDashboardsMock } from '@/app/_test/superset.util';

const SUPERSET_URL = 'http://superset.data-hub.local';

jest.mock('@/app/dashboards/_internal/AppDashboardsListOverview', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/app/dashboards/_internal/AppDashboardsCardOverview', () => ({
  __esModule: true,
  default: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('content', () => {
  it.each([
    { view: 'card', Comp: AppDashboardsCardOverview },
    { view: 'list', Comp: AppDashboardsListOverview },
  ])('calls ContentComponent with correct props', ({ view, Comp }) => {
    const dashboards = generateSanitizedDashboardsMock();
    const onFavoriteChange = jest.fn();

    render(
      <AppDashboardsOverview
        supersetUri={SUPERSET_URL}
        dashboards={dashboards}
        onFavoriteChange={onFavoriteChange}
        viewType={ViewType[view as keyof typeof ViewType]}
      />,
    );

    expect(Comp).toHaveBeenCalledWith(
      {
        supersetUri: SUPERSET_URL,
        dashboards,
        onFavoriteChange,
      },
      undefined,
    );
  });
});
