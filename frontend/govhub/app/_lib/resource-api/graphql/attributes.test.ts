import {
  fetchThemeAttributes,
  internal,
  mutateTenantSettings,
  queryTenantSettings,
} from '@/app/_lib/resource-api/graphql/attributes';
import { mutate, query } from '@/app/_lib/resource-api/client';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;

beforeEach(() => {
  mockQuery.mockReset();
  mockMutate.mockReset();
});

describe('fetchThemeAttributes', () => {
  it('should call client with correct query', async () => {
    await fetchThemeAttributes('tenant-1');

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.THEME_ATTRIBUTES,
      variables: {
        tenant: 'tenant-1',
      },
    });
  });
});

describe('queryTenantSettings', () => {
  it('should call client with correct query', async () => {
    await queryTenantSettings('tenant-1');

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.TENANT_SETTINGS,
      variables: {
        tenant: 'tenant-1',
      },
    });
  });
});

describe('mutateTenantSettings', () => {
  it('should call client with correct mutation', async () => {
    await mutateTenantSettings(
      'tenant-1',
      'newName',
      'legalNoticeUrl',
      'privacyUrl',
      'contactUrl',
      'newLogoUrl',
      'newImageUrl',
      'newCitHubImageUrl',
      'coordinates',
      'colorPrimary',
      'uchColorPrimary',
      'newsUrl',
    );

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.MUTATE_TENANT_SETTINGS,
      variables: {
        tenant: 'tenant-1',
        legalNoticeUrl: 'legalNoticeUrl',
        privacyUrl: 'privacyUrl',
        contactUrl: 'contactUrl',
        tenantDisplayName: 'newName',
        tenantLogoUrl: 'newLogoUrl',
        tenantImageUrl: 'newImageUrl',
        citizenHubImageUrl: 'newCitHubImageUrl',
        tenantCoords: 'coordinates',
        colorPrimary: 'colorPrimary',
        uchColorPrimary: 'uchColorPrimary',
        newsUrl: 'newsUrl',
      },
    });
  });
});
