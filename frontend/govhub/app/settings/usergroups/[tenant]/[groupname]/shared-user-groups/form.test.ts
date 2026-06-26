import {
  AddPermissionForm,
  mkState,
  UpdatePermissionForm,
} from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/form';
import { ZodError } from 'zod';
import { GroupPermission } from '@/app/_lib/resource-api/graphql/usergroups';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const VALID_GROUP = { name: 'group1', tenant: 'tenant1' };
const VALID_PERMISSION = 'admin';

describe('AddPermissionForm', () => {
  it('throws ZodError if group name is missing', () => {
    expect(() =>
      AddPermissionForm.parse({
        permission: VALID_PERMISSION,
      }),
    ).toThrow(ZodError);
  });

  it('throws ZodError if permission is invalid', () => {
    expect(() =>
      AddPermissionForm.parse({
        group: VALID_GROUP,
        permission: 'invalid',
      }),
    ).toThrow(ZodError);
  });

  it('parses valid input successfully', () => {
    const validInput = {
      group: VALID_GROUP,
      permission: VALID_PERMISSION,
    };

    const parsed = AddPermissionForm.parse(validInput);

    expect(parsed).toEqual(validInput);
  });
});

describe('UpdatePermissionForm', () => {
  it('throws ZodError if permission is invalid', () => {
    expect(() =>
      UpdatePermissionForm.parse({
        permission: 'invalid',
      }),
    ).toThrow(ZodError);
  });

  it('parses valid input successfully', () => {
    const parsed = UpdatePermissionForm.parse({
      permission: VALID_PERMISSION,
    });

    expect(parsed).toEqual({
      permission: VALID_PERMISSION,
    });
  });
});

describe('mkState', () => {
  it('returns error if result has errors', () => {
    const result: GroupPermission = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('returns general error if no specific errors provided', () => {
    const result: GroupPermission = { data: undefined };

    const state = mkState(result);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('returns data if result has no errors', () => {
    const result = { data: {} };

    const state = mkState(result as GroupPermission);

    expect(state).toEqual({ data: {} });
  });
});
