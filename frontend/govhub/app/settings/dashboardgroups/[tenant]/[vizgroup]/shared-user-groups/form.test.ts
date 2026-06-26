import {
  AddPermissionForm,
  mkState,
  UpdatePermissionForm,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/form';
import { ZodError } from 'zod';
import { UserGroupPermissionResult } from '@/app/_lib/resource-api/graphql/vizGroups';
import { PermissionName } from '@/app/_lib/resource-api/util/shared-groups';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const TENANT = 'test-tenant';
const USER_GROUP_NAME = 'test-user-group';
const PERMISSION: PermissionName = 'admin';

describe('AddPermissionForm', () => {
  it('throws ZodError if user group name is missing', () => {
    const inputWithoutUserGroup = {
      permission: PERMISSION,
    };

    expect(() => AddPermissionForm.parse(inputWithoutUserGroup)).toThrow(
      ZodError,
    );
  });

  it('throws ZodError if permission is invalid', () => {
    const inputWithInvalidPermission = {
      userGroup: { name: USER_GROUP_NAME, tenant: TENANT },
      permission: 'invalid-test-permission',
    };

    expect(() => AddPermissionForm.parse(inputWithInvalidPermission)).toThrow(
      ZodError,
    );
  });

  it('parses valid input successfully', () => {
    const validInput = {
      userGroup: { name: USER_GROUP_NAME, tenant: TENANT },
      permission: PERMISSION,
    };

    const parsed = AddPermissionForm.parse(validInput);

    expect(parsed).toEqual(validInput);
  });
});

describe('UpdatePermissionForm', () => {
  it('throws ZodError if permission is invalid', () => {
    const inputWithInvalidPermission = {
      permission: 'invalid-test-permission',
    };

    expect(() =>
      UpdatePermissionForm.parse(inputWithInvalidPermission),
    ).toThrow(ZodError);
  });

  it('parses valid input successfully', () => {
    const validInput = { permission: PERMISSION };

    const parsed = UpdatePermissionForm.parse(validInput);

    expect(parsed).toEqual({ permission: PERMISSION });
  });
});

describe('mkState', () => {
  it('returns errors if the result has errors', () => {
    const ERRORS = ['error1', 'error2'];
    const resultWithErrors: UserGroupPermissionResult = {
      error: mkCombinedGraphQLError(...ERRORS),
      data: undefined,
    };

    const state = mkState(resultWithErrors);

    expect(state).toEqual({ errors: { general: ERRORS } });
  });

  it('returns generic error if no specific errors provided', () => {
    const resultWithoutErrors: UserGroupPermissionResult = { data: undefined };

    const state = mkState(resultWithoutErrors);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('returns data if the result has no errors', () => {
    const result: UserGroupPermissionResult = {
      data: {
        tenant: {
          vizGroup: {
            read: 'read',
            admin: 'admin',
          },
        },
      },
    };

    const state = mkState(result);

    expect(state).toEqual({ data: {} });
  });
});
