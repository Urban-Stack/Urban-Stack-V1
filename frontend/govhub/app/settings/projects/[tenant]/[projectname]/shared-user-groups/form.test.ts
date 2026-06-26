import {
  AddPermissionForm,
  mkState,
  UpdatePermissionForm,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/form';
import { ZodError } from 'zod';
import { GroupPermission } from '@/app/_lib/resource-api/graphql/project';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('AddPermissionForm', () => {
  it('throws ZodError if group name is missing', () => {
    expect(() =>
      AddPermissionForm.parse({
        permission: 'admin',
      }),
    ).toThrow(ZodError);
  });

  it('throws ZodError if permission is invalid', () => {
    expect(() =>
      AddPermissionForm.parse({
        group: { name: 'group1', tenant: 'tenant1' },
        permission: 'write',
      }),
    ).toThrow(ZodError);
  });

  it('successfully parses valid input', () => {
    const validInput = {
      group: { name: 'group1', tenant: 'tenant1' },
      permission: 'admin',
    };

    const parsed = AddPermissionForm.parse(validInput);

    expect(parsed).toEqual(validInput);
  });
});

describe('UpdatePermissionForm', () => {
  it('throws ZodError if permission is invalid', () => {
    expect(() =>
      UpdatePermissionForm.parse({
        permission: 'write',
      }),
    ).toThrow(ZodError);
  });

  it('successfully parses valid input', () => {
    const parsed = UpdatePermissionForm.parse({
      permission: 'admin',
    });
    expect(parsed).toEqual({
      permission: 'admin',
    });
  });
});

describe('mkState', () => {
  it('should return an error if the result has errors', () => {
    const result: GroupPermission = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return a generic error if no specific errors are provided', () => {
    const result: GroupPermission = { data: undefined };

    const state = mkState(result);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return data if the result has no errors', () => {
    const result = { data: {} };

    const state = mkState(result as GroupPermission);

    expect(state).toEqual({ data: {} });
  });
});
