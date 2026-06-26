import { FuncMock } from '@/app/_test/utils';
import { revalidatePath } from 'next/cache';
import {
  disableUserGroupShared,
  enableUserGroupShared,
  mutateCreateUserGroup,
  mutateDeleteUserGroup,
} from '@/app/_lib/resource-api/graphql/usergroups';
import { FORM_NAMES, mkShareState, mkUnshareState } from './form';
import {
  createUserGroup,
  deleteUserGroup,
  shareUserGroup,
  stateShareUserGroup,
  stateUnshareUserGroup,
  unshareUserGroup,
} from '@/app/settings/usergroups/actions';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const mutateCreateUserGroupMock = mutateCreateUserGroup as unknown as FuncMock<
  typeof mutateCreateUserGroup
>;
const mutateDeleteUserGroupMock = mutateDeleteUserGroup as unknown as FuncMock<
  typeof mutateDeleteUserGroup
>;
const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;
const disableUserGroupSharedMock =
  disableUserGroupShared as unknown as FuncMock<typeof disableUserGroupShared>;
const enableUserGroupSharedMock = enableUserGroupShared as unknown as FuncMock<
  typeof enableUserGroupShared
>;
const mkUnshareStateMock = mkUnshareState as unknown as FuncMock<
  typeof mkUnshareState
>;
const mkShareStateMock = mkShareState as unknown as FuncMock<
  typeof mkShareState
>;

jest.mock('@/app/_lib/resource-api/graphql/usergroups', () => ({
  mutateCreateUserGroup: jest.fn(),
  mutateDeleteUserGroup: jest.fn(),
  disableUserGroupShared: jest.fn(),
  enableUserGroupShared: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('@/app/settings/usergroups/form', () => ({
  ...jest.requireActual('@/app/settings/usergroups/form'),
  mkUnshareState: jest.fn(),
  mkShareState: jest.fn(),
}));

beforeEach(() => {
  mutateCreateUserGroupMock.mockReset();
  mutateDeleteUserGroupMock.mockReset();
  revalidatePathMock.mockReset();
  disableUserGroupSharedMock.mockReset();
  enableUserGroupSharedMock.mockReset();
  mkUnshareStateMock.mockReset();
  mkShareStateMock.mockReset();
});

describe('createUserGroup', () => {
  const mkFormData: (name: string) => FormData = (name) => {
    const formData: FormData = new FormData();
    formData.append(FORM_NAMES.userGroupName, name);
    return formData;
  };

  it('returns parsing errors for invalid form data', async () => {
    const formData = mkFormData('aB');

    const state = await createUserGroup({}, formData);

    expect(state.errors).toEqual({
      name: [
        'Benutzergruppen-Name muss mindestens 3 Zeichen beinhalten',
        'Benutzergruppen-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
      ],
    });
  });

  it('returns general errors if user group creation fails', async () => {
    const formData = mkFormData('valid-name');
    mutateCreateUserGroupMock.mockResolvedValue({
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    });

    const state = await createUserGroup({}, formData);

    expect(state.errors).toEqual({
      general: ['error1', 'error2'],
    });
  });

  describe('successful user group creation', () => {
    beforeEach(() => {
      mutateCreateUserGroupMock.mockResolvedValue({
        data: { tenant: { createGroup: { group: 'valid-name' } } },
      });
    });

    it('invalidates path', async () => {
      const formData = mkFormData('valid-name');

      await createUserGroup({}, formData);

      expect(revalidatePathMock).toHaveBeenCalledWith('/settings/usergroups');
    });

    it('returns user group data', async () => {
      const formData = mkFormData('valid-name');

      const state = await createUserGroup({}, formData);

      expect(state.data).toEqual({
        name: 'valid-name',
      });
    });
  });
});

describe('shareUserGroup', () => {
  describe('stateless', () => {
    it('should call enable share method with correct arguments', async () => {
      const group: UserGroup = {
        name: 'test-group-1',
        tenant: 'test-tenant-1',
        keycloakGroupPath: 'test/keycloak/group/path/1',
        scopes: {
          granted: ['group:admin'],
        },
        isShared: false,
        isMember: false,
        _tag: 'UserGroup',
      };

      await shareUserGroup(group);

      expect(enableUserGroupSharedMock).toHaveBeenCalledWith(group);
    });

    it('revalidates path', async () => {
      await shareUserGroup({} as UserGroup);

      expect(revalidatePathMock).toHaveBeenCalledWith('/settings/usergroups');
    });
  });

  describe('state', () => {
    it('should call state enable share method with correct arguments', async () => {
      mkShareStateMock.mockResolvedValue({} as never);
      const group: UserGroup = {
        name: 'test-group-1',
        tenant: 'test-tenant-1',
        keycloakGroupPath: 'test/keycloak/group/path/1',
        scopes: {
          granted: ['group:admin'],
        },
        isShared: false,
        isMember: false,
        _tag: 'UserGroup',
      };

      await stateShareUserGroup(group);

      expect(enableUserGroupSharedMock).toHaveBeenCalledWith(group);
    });

    it('revalidates path', async () => {
      mkShareStateMock.mockResolvedValue({} as never);

      await stateShareUserGroup({} as UserGroup);

      expect(revalidatePathMock).toHaveBeenCalledWith('/settings/usergroups');
    });
  });
});

describe('unshareUserGroup', () => {
  describe('stateless', () => {
    it('should call disable share method with correct arguments', async () => {
      const group: UserGroup = {
        name: 'test-group-1',
        tenant: 'test-tenant-1',
        keycloakGroupPath: 'test/keycloak/group/path/1',
        scopes: {
          granted: ['group:admin'],
        },
        isShared: false,
        isMember: false,
        _tag: 'UserGroup',
      };

      await unshareUserGroup(group);

      expect(disableUserGroupSharedMock).toHaveBeenCalledWith(group);
    });

    it('revalidates path', async () => {
      await unshareUserGroup({} as UserGroup);

      expect(revalidatePathMock).toHaveBeenCalledWith('/settings/usergroups');
    });
  });

  describe('state', () => {
    it('should call state disable share method with correct arguments', async () => {
      mkUnshareStateMock.mockResolvedValue({} as never);
      const group: UserGroup = {
        name: 'test-group-1',
        tenant: 'test-tenant-1',
        keycloakGroupPath: 'test/keycloak/group/path/1',
        scopes: {
          granted: ['group:admin'],
        },
        isShared: false,
        isMember: false,
        _tag: 'UserGroup',
      };

      await stateUnshareUserGroup(group);

      expect(disableUserGroupSharedMock).toHaveBeenCalledWith(group);
    });

    it('revalidates path', async () => {
      mkUnshareStateMock.mockResolvedValue({} as never);

      await stateUnshareUserGroup({} as UserGroup);

      expect(revalidatePathMock).toHaveBeenCalledWith('/settings/usergroups');
    });
  });
});

describe('deleteUserGroup', () => {
  const USERGROUP: UserGroup = {
    name: 'test-group',
    tenant: 'test-tenant',
    keycloakGroupPath: 'path',
    isShared: false,
    isMember: false,
    _tag: 'UserGroup',
  };

  it('invalidates path and returns data on success', async () => {
    mutateDeleteUserGroupMock.mockResolvedValue({
      data: {
        tenant: {
          deleteGroup: USERGROUP.name,
        },
      },
    });

    const state = await deleteUserGroup(USERGROUP);

    expect(mutateDeleteUserGroupMock).toHaveBeenCalledWith(USERGROUP);

    expect(revalidatePathMock).toHaveBeenCalledWith(`/settings/usergroups`);

    expect(state.data).toEqual({});
  });

  it('returns errors if the deletion fails', async () => {
    mutateDeleteUserGroupMock.mockResolvedValue({
      error: mkCombinedGraphQLError('errorA', 'errorB'),
      data: undefined,
    });

    const state = await deleteUserGroup(USERGROUP);

    expect(mutateDeleteUserGroupMock).toHaveBeenCalledWith(USERGROUP);

    expect(revalidatePathMock).toHaveBeenCalledWith(`/settings/usergroups`);

    expect(state.errors).toEqual({ general: ['errorA', 'errorB'] });
  });
});
