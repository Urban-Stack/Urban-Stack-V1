import { mkCreateState } from './form';
import { CreateDataset } from '@/app/_lib/resource-api/graphql/datasets';
import { ClickHouseFormat } from '@/app/__generated__/graphql';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('mkCreateState', () => {
  const validData = {
    tenant: {
      project: {
        createDataset: {
          dataset: 'filecsv-12345678',
          config: { path: 'file.csv', format: ClickHouseFormat.Csv },
        },
      },
    },
  };

  it('returns success state when result has data and no errors', () => {
    const result: CreateDataset = {
      data: validData,
      error: undefined,
    };

    const state = mkCreateState(result);

    expect(state).toEqual({ data: {} });
  });

  it('returns error state when result has errors', () => {
    const result: CreateDataset = {
      data: undefined,
      error: mkCombinedGraphQLError('Validation failed', 'Database error'),
    };

    const state = mkCreateState(result);

    expect(state).toEqual({
      errors: { general: ['Validation failed', 'Database error'] },
    });
  });

  it('returns error state when result has no data', () => {
    const result: CreateDataset = {
      data: undefined,
      error: undefined,
    };

    const state = mkCreateState(result);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('returns error state when result has errors and data', () => {
    const result: CreateDataset = {
      data: validData,
      error: mkCombinedGraphQLError('Warning message'),
    };

    const state = mkCreateState(result);

    expect(state).toEqual({ errors: { general: ['Warning message'] } });
  });

  it('returns success state when result has data and no error', () => {
    const result: CreateDataset = {
      data: validData,
    };

    const state = mkCreateState(result);

    expect(state).toEqual({ data: {} });
  });

  it('returns error state when result has no data', () => {
    const result: CreateDataset = {
      data: undefined,
      error: undefined,
    };

    const state = mkCreateState(result);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });
});
