import { FORM_NAMES } from '@/app/settings/tenants/form';
import { updateTenantSettings } from '@/app/settings/tenants/actions';
import { FuncMock } from '@/app/_test/utils';
import { mutateTenantSettings } from '@/app/_lib/resource-api/graphql/attributes';
import { requireTenant } from '@/app/_lib/resource-api/legacy';

const mutateTenantSettingsMock = mutateTenantSettings as unknown as FuncMock<
  typeof mutateTenantSettings
>;
const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;

jest.mock('@/app/_lib/resource-api/graphql/attributes', () => ({
  mutateTenantSettings: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

beforeEach(() => {
  mutateTenantSettingsMock.mockReset();
  requireTenantMock.mockReset();
});

describe('updateTenantSettings', () => {
  const mkFormData: (
    name: string,
    legalNoticeUrl: string,
    privacyUrl: string,
    contactUrl: string,
    tenantLogoUrl?: string,
    tenantImageUrl?: string,
    citizenHubImageUrl?: string,
    tenantCoords?: string,
    colorPrimary?: string,
    uchColorPrimary?: string,
    newsUrl?: string,
  ) => FormData = (
    name,
    legalNoticeUrl,
    privacyUrl,
    contactUrl,
    tenantLogoUrl,
    tenantImageUrl,
    citizenHubImageUrl,
    tenantCoords,
    colorPrimary,
    uchColorPrimary,
    newsUrl,
  ) => {
    const formData: FormData = new FormData();
    formData.append(FORM_NAMES.tenantName, name ?? '');
    formData.append(FORM_NAMES.legalNoticeUrl, legalNoticeUrl ?? '');
    formData.append(FORM_NAMES.privacyUrl, privacyUrl ?? '');
    formData.append(FORM_NAMES.contactUrl, contactUrl ?? '');
    formData.append(FORM_NAMES.tenantLogoUrl, tenantLogoUrl ?? '');
    formData.append(FORM_NAMES.tenantImageUrl, tenantImageUrl ?? '');
    formData.append(FORM_NAMES.citizenHubImageUrl, citizenHubImageUrl ?? '');
    formData.append(FORM_NAMES.tenantCoords, tenantCoords ?? '');
    formData.append(FORM_NAMES.colorPrimary, colorPrimary ?? '');
    formData.append(FORM_NAMES.uchColorPrimary, uchColorPrimary ?? '');
    formData.append(FORM_NAMES.newsUrl, newsUrl ?? '');

    return formData;
  };

  const mkFormDataWithRequired: (
    tenantLogoUrl?: string,
    tenantImageUrl?: string,
    citizenHubImageUrl?: string,
    tenantCoords?: string,
    colorPrimary?: string,
    uchColorPrimary?: string,
    newsUrl?: string,
  ) => FormData = (
    tenantLogoUrl,
    tenantImageUrl,
    citizenHubImageUrl,
    tenantCoords,
    colorPrimary,
    uchColorPrimary,
    newsUrl,
  ) =>
    mkFormData(
      'valid-tenant',
      'https://some.valid.url',
      'https://some.valid.url',
      'https://some.valid.url',
      tenantLogoUrl,
      tenantImageUrl,
      citizenHubImageUrl,
      tenantCoords,
      colorPrimary,
      uchColorPrimary,
      newsUrl,
    );

  it('returns parsing errors for invalid form data', async () => {
    const formData = mkFormData('a', 'no-url', 'no-url', 'no-url');

    const state = await updateTenantSettings({}, formData);

    expect(state.errors).toEqual({
      tenantDisplayName: ['Tenant-Name muss mindestens 3 Zeichen beinhalten'],
      legalNoticeUrl: ['URL nicht valide'],
      privacyUrl: ['URL nicht valide'],
      contactUrl: ['URL nicht valide'],
    });
  });

  it('returns an error for an invalid tenantLogoUrl', async () => {
    const formData = mkFormDataWithRequired('invalid-url');
    const state = await updateTenantSettings({}, formData);

    expect(state.errors).toEqual({
      tenantLogoUrl: ['URL nicht valide'],
    });
  });

  it('returns an error for an invalid tenantImageUrl', async () => {
    const formData = mkFormDataWithRequired(
      'https://some.valid.url',
      'invalid-url',
    );

    const state = await updateTenantSettings({}, formData);

    expect(state.errors).toEqual({
      tenantImageUrl: ['URL nicht valide'],
    });
  });

  it('returns an error for an invalid citizenHubImageUrl', async () => {
    const formData = mkFormDataWithRequired(
      'https://some.valid.url',
      'https://some.valid.url',
      'invalid-url',
    );

    const state = await updateTenantSettings({}, formData);

    expect(state.errors).toEqual({
      citizenHubImageUrl: ['URL nicht valide'],
    });
  });

  it('returns an error for an invalid newsUrl', async () => {
    const formData = mkFormDataWithRequired(
      'https://some.valid.url',
      'https://some.valid.url',
      'https://some.valid.url',
      '42:00',
      'FFFFFF',
      'AAAAAA',
      'invalid-url',
    );

    const state = await updateTenantSettings({}, formData);

    expect(state.errors).toEqual({
      newsUrl: ['URL nicht valide'],
    });
  });

  it('returns an error for an invalid tenantCoords', async () => {
    const formData = mkFormDataWithRequired(
      'https://another.valid.url',
      'https://some.valid.url',
      'https://another.valid.url',
      'no coordinates',
    );

    const state = await updateTenantSettings({}, formData);

    expect(state.errors).toEqual({
      tenantCoords: ['Invalides Koordinatenformat'],
    });
  });

  it('returns an error for an invalid colorPrimary', async () => {
    const formData = mkFormDataWithRequired(
      'https://some.valid.url',
      'https://some.valid.url',
      'https://some.valid.url',
      '42:00',
      'Not A Hex',
    );

    const state = await updateTenantSettings({}, formData);

    expect(state.errors).toEqual({
      colorPrimary: ['Farbwert nicht valide'],
    });
  });

  it('returns an error for an invalid uchColorPrimary', async () => {
    const formData = mkFormDataWithRequired(
      'https://some.valid.url',
      'https://some.valid.url',
      'https://some.valid.url',
      '42:00',
      'FFFFFF',
      'Not A Hex',
    );

    const state = await updateTenantSettings({}, formData);

    expect(state.errors).toEqual({
      uchColorPrimary: ['Farbwert nicht valide'],
    });
  });

  it('returns general errors if tenant settings update fails', async () => {
    const formData = mkFormDataWithRequired();
    requireTenantMock.mockResolvedValueOnce('tenant-id');
    mutateTenantSettingsMock.mockResolvedValueOnce({
      errors: [{ message: 'error1' }, { message: 'error2' }],
    });

    const state = await updateTenantSettings({}, formData);

    expect(state.errors).toEqual({
      general: ['error1', 'error2'],
    });
  });

  describe('successful tenant settings update', () => {
    it('returns updated tenant settings', async () => {
      const formData = mkFormData(
        'Jordan',
        'https://some.domain.somewhere/image.ext',
        'https://another.domain.elsewhere/image.ext',
        'https://some.domain.somewhere/image.ext',
        'https://another.domain.elsewhere/image.ext',
        'https://some.domain.somewhere/image.ext',
        'https://another.domain.elsewhere/image.ext',
        '13:37',
        'FFFFFF',
      );
      requireTenantMock.mockResolvedValueOnce('tenant-id');
      mutateTenantSettingsMock.mockResolvedValueOnce({
        data: {
          tenant: {
            patchAttributes: [
              {
                key: 'tenant-name',
                value: 'Jordan',
              },
              {
                key: 'tenant-logo',
                value: 'https://some.domain.somewhere/image.ext',
              },
              {
                key: 'tenant-image',
                value: 'https://another.domain.elsewhere/image.ext',
              },
              {
                key: 'citizen-hub-image',
                value: 'https://some.domain.somewhere/image.ext',
              },
              {
                key: 'tenant-coords',
                value: '13:37',
              },
              {
                key: 'color-primary',
                value: 'FFFFFF',
              },
            ],
          },
        },
      });

      const state = await updateTenantSettings({}, formData);

      expect(state.data).toEqual({
        tenantDisplayName: 'Jordan',
        tenantLogoUrl: 'https://some.domain.somewhere/image.ext',
        tenantImageUrl: 'https://another.domain.elsewhere/image.ext',
        citizenHubImageUrl: 'https://some.domain.somewhere/image.ext',
        tenantCoords: '13:37',
        colorPrimary: 'FFFFFF',
      });
    });

    it('does not error on empty (optional) data', async () => {
      const formData = mkFormDataWithRequired();
      requireTenantMock.mockResolvedValueOnce('tenant-id');
      mutateTenantSettingsMock.mockResolvedValueOnce({
        data: {
          tenant: {
            patchAttributes: [],
          },
        },
      });

      const state = await updateTenantSettings({}, formData);

      expect(state.data).toEqual({});
    });
  });
});
