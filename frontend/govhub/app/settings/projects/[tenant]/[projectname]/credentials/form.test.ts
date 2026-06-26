import {
  CreateCredentialForm,
  mkCreateState,
  mkDeleteState,
  mkRotateState,
} from '@/app/settings/projects/[tenant]/[projectname]/credentials/form';
import { ZodError } from 'zod';
import {
  CreateCredential,
  DeleteCredential,
  RotateCredential,
} from '@/app/_lib/resource-api/graphql/credentials';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('CreateCredentialForm', () => {
  it('throws ZodError on credential name too short', () => {
    const name = 'xs';

    expect(() =>
      CreateCredentialForm.parse({ name } as CreateCredentialForm),
    ).toThrow(ZodError);
  });

  it('throws ZodError on credential name too long', () => {
    const name =
      'tooLong_crduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfik';

    expect(() =>
      CreateCredentialForm.parse({ name } as CreateCredentialForm),
    ).toThrow(ZodError);
  });

  it('throws ZodError if credential name contains uppercase letters', () => {
    const name = 'Credential';

    expect(() =>
      CreateCredentialForm.parse({ name } as CreateCredentialForm),
    ).toThrow(ZodError);
  });

  it.each([
    'min',
    'max-enhicrduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfi',
  ])(`successfully parses credential for valid length`, (name) => {
    const parsed = CreateCredentialForm.parse({ name } as CreateCredentialForm);

    expect(parsed).toEqual({ name });
  });
});

describe('mkCreateState', () => {
  it('should return an error if the result has errors', () => {
    const result: CreateCredential = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkCreateState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return unknown error when data is undefined', () => {
    const state = mkCreateState({ data: undefined } as CreateCredential);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the project data', () => {
    const result = {
      data: {
        tenant: {
          project: {
            createSensorCredential: {
              username: 'username-1',
              password: '123',
            },
          },
        },
      },
    } as CreateCredential;

    const state = mkCreateState(result);

    expect(state).toEqual({
      data: {
        username: 'username-1',
        password: '123',
      },
    });
  });
});

describe('mkRotateState', () => {
  it('should return an error if the result has errors', () => {
    const result: RotateCredential = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkRotateState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return unknown error when data is undefined', () => {
    const state = mkRotateState({ data: undefined } as RotateCredential);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the sensor credential data', () => {
    const result = {
      data: {
        tenant: {
          project: {
            rotateSensorCredential: {
              username: 'username-1',
              password: '123',
            },
          },
        },
      },
    } as RotateCredential;

    const state = mkRotateState(result);

    expect(state).toEqual({
      data: {
        username: 'username-1',
        password: '123',
      },
    });
  });
});

describe('mkDeleteState', () => {
  it('should return an error if the result has errors', () => {
    const result: DeleteCredential = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkDeleteState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return unknown error when data is undefined', () => {
    const state = mkDeleteState({ data: undefined } as DeleteCredential);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the project data', () => {
    const result = {
      data: {
        tenant: {
          project: {
            deleteSensorCredential: 'credential-name',
          },
        },
      },
    } as DeleteCredential;

    const state = mkDeleteState(result);

    expect(state).toEqual({ data: {} });
  });
});
