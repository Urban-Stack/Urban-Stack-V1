import React from 'react';
import { render } from '@testing-library/react';
import DashboardPage from './page';
import DashboardList from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/dashboards/DashboardList';

const mockDashboardList = DashboardList as jest.Mock;

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock(
  '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/dashboards/DashboardList',
  () => ({
    __esModule: true,
    default: jest.fn(() => <div>Mocked DashboardList</div>),
  }),
);

beforeEach(() => {
  mockDashboardList.mockClear();
});

it('calls DashboardList with the correct props', async () => {
  const paramsPromise = Promise.resolve({
    tenant: 'tenant1',
    vizgroup: 'group1',
  });

  render(await DashboardPage({ params: paramsPromise }));

  expect(DashboardList).toHaveBeenCalledWith(
    { tenant: 'tenant1', vizGroup: 'group1' },
    undefined,
  );
});
