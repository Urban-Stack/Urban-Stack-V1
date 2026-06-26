import { ZodError } from 'zod';
import {
  CreateUserGroupForm,
  mkDeleteState,
  mkState,
  mkUnshareState,
} from '@/app/settings/usergroups/form';
import {
  CreateUserGroup,
  DeleteUserGroup,
  DisableUserGroupShared,
} from '@/app/_lib/resource-api/graphql/usergroups';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('CreateUserGroupForm', () => {
  it('throws ZodError on group name too short', () => {
    const name = 'xs';

    expect(() =>
      CreateUserGroupForm.parse({ name } as CreateUserGroupForm),
    ).toThrow(ZodError);
  });

  it('throws ZodError on group name too long', () => {
    const name =
      'tooLong_crduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfik';

    expect(() =>
      CreateUserGroupForm.parse({ name } as CreateUserGroupForm),
    ).toThrow(ZodError);
  });

  it('throws ZodError if group name contains uppercase letters', () => {
    const name = 'Group';

    expect(() =>
      CreateUserGroupForm.parse({ name } as CreateUserGroupForm),
    ).toThrow(ZodError);
  });

  it.each([
    'min',
    'max-enhicrduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfi',
  ])(`successfully parses group for valid length`, (name) => {
    const parsed = CreateUserGroupForm.parse({ name } as CreateUserGroupForm);

    expect(parsed).toEqual({ name });
  });
});

describe('mkState', () => {
  it('should return an error if the result has errors', () => {
    const result: CreateUserGroup = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return an error if the result has no data', () => {
    const result: CreateUserGroup = { data: undefined };

    const state = mkState(result);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the project data', () => {
    const result: CreateUserGroup = {
      data: {
        tenant: {
          createGroup: {
            group: 'group-1',
          },
        },
      },
    };

    const state = mkState(result);

    expect(state).toEqual({
      data: {
        name: 'group-1',
      },
    });
  });
});

describe('mkDeleteState', () => {
  it('should return an error if the result has errors', () => {
    const result: DeleteUserGroup = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkDeleteState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return unknown error when data is undefined', () => {
    const state = mkDeleteState({ data: undefined } as DeleteUserGroup);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the empty data', () => {
    const result = {
      data: {
        tenant: {
          deleteGroup: 'group-name',
        },
      },
    } as DeleteUserGroup;

    const state = mkDeleteState(result);

    expect(state).toEqual({ data: {} });
  });
});

describe('mkUnshareState', () => {
  it('should return an error if the result has errors', () => {
    const result: DisableUserGroupShared = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkUnshareState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return unknown error when data is undefined', () => {
    const state = mkUnshareState({ data: undefined } as DisableUserGroupShared);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the empty data', () => {
    const result = {
      data: {
        tenant: {},
      },
    } as DisableUserGroupShared;

    const state = mkUnshareState(result);

    expect(state).toEqual({ data: {} });
  });
});
