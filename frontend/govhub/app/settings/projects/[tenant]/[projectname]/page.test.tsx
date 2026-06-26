import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';
import ProjectPage from '@/app/settings/projects/[tenant]/[projectname]/page';

const TEST_PROJECT_NAME = 'test-project';
const TEST_TENANT_NAME = 'test-tenant';

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
      await ProjectPage({
        params: Promise.resolve({
          tenant: TEST_TENANT_NAME,
          projectname: TEST_PROJECT_NAME,
        }),
      }),
    );

    expect(redirectMock).toHaveBeenCalledWith(
      `/settings/projects/${TEST_TENANT_NAME}/${TEST_PROJECT_NAME}/shared-user-groups`,
    );
  });
});
