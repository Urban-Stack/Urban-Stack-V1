import { FORM_NAMES } from '@/app/settings/projects/form';
import { createProject } from '@/app/settings/projects/actions';
import { FuncMock } from '@/app/_test/utils';
import { revalidatePath } from 'next/cache';
import { mutateCreateProject } from '@/app/_lib/resource-api/graphql/project';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const mutateCreateProjectMock = mutateCreateProject as unknown as FuncMock<
  typeof mutateCreateProject
>;
const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  mutateCreateProject: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(() => {
  mutateCreateProjectMock.mockReset();
  revalidatePathMock.mockReset();
});

describe('createProject', () => {
  const mkFormData: (name: string) => FormData = (name) => {
    const formData: FormData = new FormData();
    formData.append(FORM_NAMES.projectName, name);
    return formData;
  };

  it('returns parsing errors for invalid form data', async () => {
    const formData = mkFormData('aB');

    const state = await createProject({}, formData);

    expect(state.errors).toEqual({
      name: [
        'Projekt-Name muss mindestens 3 Zeichen beinhalten',
        'Projekt-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
      ],
    });
  });

  it('returns general errors if project creation fails', async () => {
    const formData = mkFormData('valid-name');
    mutateCreateProjectMock.mockResolvedValueOnce({
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    });

    const state = await createProject({}, formData);

    expect(state.errors).toEqual({
      general: ['error1', 'error2'],
    });
  });

  describe('successful project creation', () => {
    beforeEach(() => {
      mutateCreateProjectMock.mockResolvedValueOnce({
        data: {
          tenant: {
            createProject: {
              project: 'valid-name',
              tenant: 'tenant1',
            },
          },
        },
      });
    });

    it('invalidates path', async () => {
      const formData = mkFormData('valid-name');

      await createProject({}, formData);

      expect(revalidatePathMock).toHaveBeenCalledWith('/settings/projects');
    });

    it('returns project data', async () => {
      const formData = mkFormData('valid-name');

      const state = await createProject({}, formData);

      expect(state.data).toEqual({
        name: 'valid-name',
        tenant: 'tenant1',
      });
    });
  });
});
