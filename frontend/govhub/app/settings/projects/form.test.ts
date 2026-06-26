import { ZodError } from 'zod';
import { CreateProjectForm, mkState } from '@/app/settings/projects/form';
import { CreateProject } from '@/app/_lib/resource-api/graphql/project';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('CreateProjectForm', () => {
  it('throws ZodError on project name too short', () => {
    const name = 'xs';

    expect(() =>
      CreateProjectForm.parse({ name } as CreateProjectForm),
    ).toThrow(ZodError);
  });

  it('throws ZodError on project name too long', () => {
    const name =
      'tooLong_crduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfik';

    expect(() =>
      CreateProjectForm.parse({ name } as CreateProjectForm),
    ).toThrow(ZodError);
  });

  it('throws ZodError if project name contains uppercase letters', () => {
    const name = 'Project';

    expect(() =>
      CreateProjectForm.parse({ name } as CreateProjectForm),
    ).toThrow(ZodError);
  });

  it.each([
    'min',
    'max-enhicrduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfi',
  ])(`successfully parses project for valid length`, (name) => {
    const parsed = CreateProjectForm.parse({ name } as CreateProjectForm);

    expect(parsed).toEqual({ name });
  });
});

describe('mkState', () => {
  it('should return an error if the result has errors', () => {
    const result: CreateProject = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return an error if the result has no data', () => {
    const result: CreateProject = { data: undefined };

    const state = mkState(result);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the project data', () => {
    const result = {
      data: {
        tenant: {
          createProject: {
            project: 'project',
            tenant: 'tenant',
          },
        },
      },
    };

    const state = mkState(result);

    expect(state).toEqual({
      data: {
        name: 'project',
        tenant: 'tenant',
      },
    });
  });
});
