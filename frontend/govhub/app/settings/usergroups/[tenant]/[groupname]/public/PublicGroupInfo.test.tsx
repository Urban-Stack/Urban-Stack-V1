import { render } from '@testing-library/react';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { PublicGroupInfo } from '@/app/settings/usergroups/[tenant]/[groupname]/public/PublicGroupInfo';
import { FuncMock } from '@/app/_test/utils';
import { unshareUserGroup } from '@/app/settings/usergroups/actions';

const unshareUserGroupMock: FuncMock<typeof unshareUserGroup> =
  unshareUserGroup as unknown as jest.Mock;

jest.mock('@/app/settings/usergroups/actions', () => ({
  unshareUserGroup: jest.fn(),
}));

beforeEach(() => {
  unshareUserGroupMock.mockReset();
});

describe('snapshot', () => {
  it('info box', () => {
    const { container } = render(
      <PublicGroupInfo
        group={
          {
            tenant: '',
            name: '',
          } as UserGroup
        }
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
