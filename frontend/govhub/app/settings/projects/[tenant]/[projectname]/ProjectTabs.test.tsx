import { render } from '@testing-library/react';
import { useParams } from 'next/navigation';
import ProjectTabs from '@/app/settings/projects/[tenant]/[projectname]/ProjectTabs';
import { FuncMock } from '@/app/_test/utils';
import SettingsTabs from '@/app/settings/_common/SettingsTabs';

const TENANT = 'test-tenant';
const PROJECT = 'test-project';

jest.mock('@/app/settings/_common/SettingsTabs', () => jest.fn());

const useParamsMock: FuncMock<typeof useParams> =
  useParams as unknown as jest.Mock;
jest.mock('next/navigation', () => ({ useParams: jest.fn() }));

describe('content', () => {
  it('contains expected tabs with correct links', () => {
    useParamsMock.mockReturnValue({
      tenant: TENANT,
      projectname: PROJECT,
    });
    const expectedTabs = {
      'Freigabe Benutzergruppen': `/settings/projects/${TENANT}/${PROJECT}/shared-user-groups`,
      'Freigabe Dashboardgruppen': `/settings/projects/${TENANT}/${PROJECT}/shared-dashboard-groups`,
      Credentials: `/settings/projects/${TENANT}/${PROJECT}/credentials`,
      Subscriptions: `/settings/projects/${TENANT}/${PROJECT}/subscriptions`,
      'Sensor-Meta-Daten': `/settings/projects/${TENANT}/${PROJECT}/sensor-metadata`,
      'Danger Zone': `/settings/projects/${TENANT}/${PROJECT}/danger-zone`,
    };

    render(ProjectTabs());

    expect(SettingsTabs).toHaveBeenCalledWith(
      { tabsData: expectedTabs },
      undefined,
    );
  });
});
