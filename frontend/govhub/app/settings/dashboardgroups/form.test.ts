import { ZodError } from 'zod';
import { CreateVizGroup } from '@/app/_lib/resource-api/graphql/vizGroups';
import { CreateVizGroupForm, mkState } from './form';

describe('CreateVizGroupForm', () => {
  it('throws ZodError if the name is too short', () => {
    const name = 'ab';

    expect(() => CreateVizGroupForm.parse({ name })).toThrow(ZodError);
  });

  it('throws ZodError if the name is too long', () => {
    const name =
      'this-group-name-is-way-too-long-because-it-exceeds-64-chars-crduujisacfctqitlrbymn';

    expect(() => CreateVizGroupForm.parse({ name })).toThrow(ZodError);
  });

  it('throws ZodError if the name has uppercase letters', () => {
    const name = 'MyVizGroup';
    expect(() => CreateVizGroupForm.parse({ name })).toThrow(ZodError);
  });

  it('throws ZodError if the name has invalid characters', () => {
    const name = 'my_vizgroup';
    expect(() => CreateVizGroupForm.parse({ name })).toThrow(ZodError);
  });

  it.each([
    'viz', // minimal length
    'some-valid-viz-group',
    'group123',
    'dashboard-group-64-char-aaaa-bbbb-cccc-dddd-eeee-ffff-gggg', // exactly 64 chars if needed
  ])('parses valid name: "%s"', (name) => {
    const parsed = CreateVizGroupForm.parse({ name });
    expect(parsed).toEqual({ name });
  });
});

describe('mkState', () => {
  it('returns errors if the result has errors', () => {
    const result: CreateVizGroup = {
      errors: [{ message: 'error1' }, { message: 'error2' }],
    };

    const state = mkState(result);

    expect(state).toEqual({
      errors: { general: ['error1', 'error2'] },
    });
  });

  it('returns a generic error if the API did not provide data', () => {
    const result: CreateVizGroup = {
      data: undefined,
    };

    const state = mkState(result);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('returns the new vizGroup data if everything succeeded', () => {
    const result: CreateVizGroup = {
      data: {
        tenant: {
          createVizGroup: {
            vizGroup: 'my-viz-group',
            tenant: 'tenant1',
          },
        },
      },
    };

    const state = mkState(result);

    expect(state).toEqual({
      data: {
        name: 'my-viz-group',
        tenant: 'tenant1',
      },
    });
  });
});
