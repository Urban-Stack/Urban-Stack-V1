import {
  AddPermissionForm,
  mkState,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/form';
import { ZodError } from 'zod';
import { GroupVizPermission } from '@/app/_lib/resource-api/graphql/project';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('AddPermissionForm', () => {
  it('throws ZodError if group name is missing', () => {
    expect(() => AddPermissionForm.parse({})).toThrow(ZodError);
  });

  it('throws ZodError if group structure is incorrect', () => {
    expect(() =>
      AddPermissionForm.parse({ group: { tenant: 'tenant1' } }),
    ).toThrow(ZodError);
  });

  it('successfully parses valid input', () => {
    const validInput = {
      group: { name: 'group1', tenant: 'tenant1' },
    };

    const parsed = AddPermissionForm.parse(validInput);

    expect(parsed).toEqual(validInput);
  });
});

describe('mkState', () => {
  it('should return an error if the result has errors', () => {
    const result = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return a generic error if no specific errors are provided', () => {
    const result = { data: undefined };

    const state = mkState(result);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return data if the result has no errors', () => {
    const result = { data: {} };

    const state = mkState(result as GroupVizPermission);

    expect(state).toEqual({ data: {} });
  });
});
