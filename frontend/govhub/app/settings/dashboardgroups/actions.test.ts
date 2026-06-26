import { createVizGroup } from '@/app/settings/dashboardgroups/actions';
import { FORM_NAMES } from '@/app/settings/dashboardgroups/form';
import { mutateCreateVizGroup } from '@/app/_lib/resource-api/graphql/vizGroups';
import { revalidatePath } from 'next/cache';
import { FuncMock } from '@/app/_test/utils';

const mutateCreateVizGroupMock = mutateCreateVizGroup as unknown as FuncMock<
  typeof mutateCreateVizGroup
>;
const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  mutateCreateVizGroup: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(() => {
  mutateCreateVizGroupMock.mockReset();
  revalidatePathMock.mockReset();
});

describe('createVizGroup', () => {
  const mkFormData = (name: string) => {
    const formData = new FormData();
    formData.append(FORM_NAMES.vizGroupName, name);
    return formData;
  };

  it('returns parsing errors for invalid form data', async () => {
    const formData = mkFormData('aB');

    const state = await createVizGroup({}, formData);

    expect(state.errors).toEqual({
      name: [
        'Dashboardgruppen-Name muss mindestens 3 Zeichen beinhalten',
        'Dashboardgruppen-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
      ],
    });
  });

  it('returns general errors if vizGroup creation fails', async () => {
    const formData = mkFormData('valid-name');
    mutateCreateVizGroupMock.mockResolvedValueOnce({
      errors: [{ message: 'error1' }, { message: 'error2' }],
    });

    const state = await createVizGroup({}, formData);

    expect(state.errors).toEqual({
      general: ['error1', 'error2'],
    });
  });

  describe('successful vizGroup creation', () => {
    beforeEach(() => {
      mutateCreateVizGroupMock.mockResolvedValueOnce({
        data: {
          tenant: {
            createVizGroup: {
              vizGroup: 'valid-name',
              tenant: 'tenant1',
            },
          },
        },
      });
    });

    it('invalidates path', async () => {
      const formData = mkFormData('valid-name');

      await createVizGroup({}, formData);

      expect(revalidatePathMock).toHaveBeenCalledWith(
        '/settings/dashboardgroups',
      );
    });

    it('returns the created vizGroup data', async () => {
      const formData = mkFormData('valid-name');

      const state = await createVizGroup({}, formData);

      expect(state.data).toEqual({
        name: 'valid-name',
        tenant: 'tenant1',
      });
    });
  });
});
