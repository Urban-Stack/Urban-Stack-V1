import {
  createPublishedQuery,
  getPublishedQuery,
  updatePublishedQuery,
} from './action';
import {
  mutateCreatePublishedQuery,
  querySinglePublishedQuery,
  SinglePublishedQuery,
} from '@/app/_lib/resource-api/graphql/vizGroups';
import { revalidatePath } from 'next/cache';
import { FORM_NAMES } from './form';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
import { FuncMock } from '@/app/_test/utils';
import { deletePublishedQuery } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/action';

jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  mutateCreatePublishedQuery: jest.fn(),
  querySinglePublishedQuery: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock(
  '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/action',
  () => ({
    deletePublishedQuery: jest.fn(),
  }),
);

const mockMutateCreatePublishedQuery = mutateCreatePublishedQuery as FuncMock<
  typeof mutateCreatePublishedQuery
>;
const mockQuerySinglePublishedQuery = querySinglePublishedQuery as FuncMock<
  typeof querySinglePublishedQuery
>;
const mockDeletePublishedQuery = deletePublishedQuery as FuncMock<
  typeof deletePublishedQuery
>;
const mockRevalidatePath = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

const TENANT = 'tenant1';
const VIZGROUP = 'vizgroup1';

const PUBLISHED_QUERY = {
  name: 'geojson-layer',
  sql: 'SELECT * FROM geo',
} as const;

type FormKey = keyof typeof FORM_NAMES;

const mkFormData = (fields: Partial<Record<FormKey, string>> = {}) => {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      form.append(FORM_NAMES[key as FormKey], value);
    }
  });
  return form;
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('createPublishedQuery', () => {
  it('returns validation errors if the form is invalid', async () => {
    const formData = mkFormData({ name: '', sql: '' });

    const state = await createPublishedQuery(TENANT, VIZGROUP, {}, formData);

    expect(state.errors).toBeDefined();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockMutateCreatePublishedQuery).not.toHaveBeenCalled();
  });

  it('returns graphQL errors (mutateCreatePublishedQuery)', async () => {
    const formData = mkFormData(PUBLISHED_QUERY);
    mockMutateCreatePublishedQuery.mockResolvedValueOnce({
      error: mkCombinedGraphQLError('errX', 'errY'),
      data: undefined,
    });

    const state = await createPublishedQuery(TENANT, VIZGROUP, {}, formData);

    expect(state.errors).toEqual({ general: ['errX', 'errY'] });
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}/${VIZGROUP}/geojson`,
    );
  });

  it('handles successful published query creation', async () => {
    mockMutateCreatePublishedQuery.mockResolvedValueOnce({
      data: {
        tenant: {
          vizGroup: {
            createPublishedQuery: {
              publishedQuery: PUBLISHED_QUERY.name,
              config: {
                sql: PUBLISHED_QUERY.sql,
              },
            },
          },
        },
      },
    });
    const formData = mkFormData(PUBLISHED_QUERY);

    const result = await createPublishedQuery(TENANT, VIZGROUP, {}, formData);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}/${VIZGROUP}/geojson`,
    );
    expect(result?.errors).toBeUndefined();
    expect(result?.data).toEqual({
      name: PUBLISHED_QUERY.name,
      sql: PUBLISHED_QUERY.sql,
    });
    expect(mockMutateCreatePublishedQuery).toHaveBeenCalledWith(
      TENANT,
      VIZGROUP,
      PUBLISHED_QUERY.name,
      PUBLISHED_QUERY.sql,
    );
  });
});

describe('updatePublishedQuery', () => {
  const { name, sql } = PUBLISHED_QUERY;

  it('returns validation errors if the form is invalid', async () => {
    const formData = mkFormData({ sql: '' });

    const prevState = { data: { name, sql } };
    const state = await updatePublishedQuery(
      TENANT,
      VIZGROUP,
      name,
      prevState,
      formData,
    );

    expect(state.errors).toBeDefined();
    expect(mockDeletePublishedQuery).not.toHaveBeenCalled();
    expect(mockMutateCreatePublishedQuery).not.toHaveBeenCalled();
  });

  it('returns errors if deletion fails', async () => {
    const formData = mkFormData({ sql });
    mockDeletePublishedQuery.mockResolvedValueOnce({
      errors: { general: ['delete error'] },
    });

    const prevState = { data: { name, sql } };
    const state = await updatePublishedQuery(
      TENANT,
      VIZGROUP,
      name,
      prevState,
      formData,
    );

    expect(state.errors).toEqual({ general: ['delete error'] });
    expect(mockDeletePublishedQuery).toHaveBeenCalledWith(
      TENANT,
      VIZGROUP,
      name,
    );
    expect(mockMutateCreatePublishedQuery).not.toHaveBeenCalled();
  });

  it('deletes query and then creates query again on success', async () => {
    const oldSql = 'SELECT * FROM updated_geo';
    const formData = mkFormData({ sql });
    mockDeletePublishedQuery.mockResolvedValueOnce({});
    mockMutateCreatePublishedQuery.mockResolvedValueOnce({
      data: {
        tenant: {
          vizGroup: {
            createPublishedQuery: {
              publishedQuery: name,
              config: { sql },
            },
          },
        },
      },
    });

    const state = await updatePublishedQuery(
      TENANT,
      VIZGROUP,
      name,
      { data: { name, sql: oldSql } },
      formData,
    );

    expect(mockDeletePublishedQuery).toHaveBeenCalledWith(
      TENANT,
      VIZGROUP,
      name,
    );
    expect(mockMutateCreatePublishedQuery).toHaveBeenCalledWith(
      TENANT,
      VIZGROUP,
      name,
      sql,
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}/${VIZGROUP}/geojson`,
    );
    expect(state.errors).toBeUndefined();
    expect(state.data).toEqual({ name: name, sql });
  });
});

describe('getPublishedQuery', () => {
  const QUERY_NAME = 'geojson-layer';

  it('calls querySinglePublishedQuery and mkStateSingle with the result', async () => {
    mockQuerySinglePublishedQuery.mockResolvedValueOnce({
      data: {
        publishedQuery: {
          publishedQuery: QUERY_NAME,
          config: {
            sql: 'SELECT * FROM geo',
          },
        },
      },
    } as SinglePublishedQuery);

    const state = await getPublishedQuery(TENANT, VIZGROUP, QUERY_NAME);

    expect(state).toEqual({
      data: {
        name: QUERY_NAME,
        sql: 'SELECT * FROM geo',
      },
    });
  });
});
