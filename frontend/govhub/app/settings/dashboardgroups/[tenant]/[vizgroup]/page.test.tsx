import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';
import VizGroupPage from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/page';

const VIZ_GROUP_NAME = 'test-project';
const TENANT_NAME = 'test-tenant';

const redirectMock = redirect as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

beforeEach(() => {
  redirectMock.mockReset();
});

describe('redirect', () => {
  it('redirects to the shared-user-groups subpage of the current project page', async () => {
    render(
      await VizGroupPage({
        params: Promise.resolve({
          tenant: TENANT_NAME,
          vizgroup: VIZ_GROUP_NAME,
        }),
      }),
    );

    expect(redirectMock).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT_NAME}/${VIZ_GROUP_NAME}/shared-user-groups`,
    );
  });
});
