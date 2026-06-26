import { z } from 'zod';
import {
  QueriedPublicAttributes,
  queryPublicAttributes,
} from '@/app/_lib/resource-api/graphql/publicAttributes';
import { publicAttributes } from './publicAttributes';
import {
  TEST_PUBLIC_ATTRIBUTES,
  TEST_PUBLIC_ATTRIBUTES_RAW,
} from '@/app/_test/attributes';

jest.mock('@/app/_lib/resource-api/graphql/publicAttributes', () => ({
  queryPublicAttributes: jest.fn(),
}));
const queryPublicAttributesMock = queryPublicAttributes as jest.Mock;

const TENANT = 'test-tenant';

const mockGraphQLResponse = (data: Record<string, string>) => {
  queryPublicAttributesMock.mockResolvedValueOnce({
    data: {
      publicAttributes: Object.entries(data).map(([key, value]) => ({
        key,
        value,
      })),
    },
  } as QueriedPublicAttributes);
};

beforeEach(() => {
  queryPublicAttributesMock.mockReset();
});

describe('publicAttributes', () => {
  it('parses valid public attributes', async () => {
    mockGraphQLResponse(TEST_PUBLIC_ATTRIBUTES_RAW);

    const attributes = await publicAttributes(TENANT);

    expect(attributes).toEqual(TEST_PUBLIC_ATTRIBUTES);
  });

  it('handles missing optional attributes', async () => {
    const PARTIAL_ATTRIBUTES = {
      // Required
      'legal-notice-url': 'https://le.gal',
      'privacy-url': 'https://pri.vacy',
      'contact-url': 'https://con.tact',
      // Optional
      'tenant-name': 'Partial Tenant',
      'uch-color-primary': 'abcdef',
    };
    mockGraphQLResponse(PARTIAL_ATTRIBUTES);

    const attributes = await publicAttributes(TENANT);

    expect(attributes).toEqual({
      legalNoticeUrl: 'https://le.gal',
      privacyUrl: 'https://pri.vacy',
      contactUrl: 'https://con.tact',

      tenantDisplayName: 'Partial Tenant',
      colorPrimary: 'abcdef',
    });
  });

  it('throws a validation error for invalid coordinates', async () => {
    mockGraphQLResponse({
      ...TEST_PUBLIC_ATTRIBUTES_RAW,
      'tenant-coords': 'invalid-coords',
    });

    await expect(publicAttributes(TENANT)).rejects.toThrow(z.ZodError);
  });

  it('throws a validation error for an invalid color format', async () => {
    mockGraphQLResponse({
      ...TEST_PUBLIC_ATTRIBUTES_RAW,
      'uch-color-primary': 'xyz123',
    });

    await expect(publicAttributes(TENANT)).rejects.toThrow(z.ZodError);
  });

  it('returns an empty object if no public attributes are available', async () => {
    mockGraphQLResponse({});

    const attributes = await publicAttributes(TENANT);

    expect(attributes).toEqual({});
  });

  it('throws an error if the query fails', async () => {
    queryPublicAttributesMock.mockRejectedValueOnce(new Error('GraphQL Error'));

    await expect(publicAttributes(TENANT)).rejects.toThrow('GraphQL Error');
  });
});
