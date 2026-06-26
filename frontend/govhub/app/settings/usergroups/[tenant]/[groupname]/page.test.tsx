import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';
import UserGroupPage from '@/app/settings/usergroups/[tenant]/[groupname]/page';

const GROUP_NAME = 'test-group-name';
const TENANT = 'test-tenant';

const redirectMock = redirect as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

beforeEach(() => {
  redirectMock.mockReset();
});

describe('redirect', () => {
  it('redirects to shared-user-groups subpage of current user group', async () => {
    render(
      await UserGroupPage({
        params: Promise.resolve({
          tenant: TENANT,
          groupname: GROUP_NAME,
        }),
      }),
    );

    expect(redirectMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });
});
