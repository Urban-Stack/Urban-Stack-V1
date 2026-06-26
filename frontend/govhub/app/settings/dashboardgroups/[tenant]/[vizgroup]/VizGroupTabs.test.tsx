import { render } from '@testing-library/react';
import { useParams } from 'next/navigation';
import VizGroupTabs from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/VizGroupTabs';
import { FuncMock } from '@/app/_test/utils';
import SettingsTabs from '@/app/settings/_common/SettingsTabs';

const TENANT = 'test-tenant';
const VIZ_GROUP = 'test-viz-group';

jest.mock('@/app/settings/_common/SettingsTabs', () => jest.fn());

const useParamsMock: FuncMock<typeof useParams> =
  useParams as unknown as jest.Mock;
jest.mock('next/navigation', () => ({ useParams: jest.fn() }));

describe('content', () => {
  it('contains expected tabs with correct links', () => {
    useParamsMock.mockReturnValue({
      tenant: TENANT,
      vizgroup: VIZ_GROUP,
    });
    const expectedTabs = {
      'Freigabe Benutzergruppen': `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/shared-user-groups`,
      GeoJSON: `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/geojson`,
      Dashboards: `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/dashboards`,
      'Danger Zone': `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/danger-zone`,
    };

    render(VizGroupTabs());

    expect(SettingsTabs).toHaveBeenCalledWith(
      { tabsData: expectedTabs },
      undefined,
    );
  });
});
