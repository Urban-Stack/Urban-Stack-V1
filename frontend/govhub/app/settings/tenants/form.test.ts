import { ZodError } from 'zod';
import { mkState, UpdateTenantSettingsForm } from '@/app/settings/tenants/form';
import { UpdateTenantSettings } from '@/app/_lib/resource-api/graphql/attributes';

const REQUIRED = {
  tenantDisplayName: 'name',
  legalNoticeUrl: 'https://www.legally-noticed.com',
  privacyUrl: 'https://www.i-am-dsgvo-in-german.com',
  contactUrl: 'https://www.please-dont.com',
};

describe('UpdateTenantSettingsForm', () => {
  it('throws ZodError on tenant name too short', () => {
    const tenantDisplayName = 'xs';

    expect(() =>
      UpdateTenantSettingsForm.parse({
        ...REQUIRED,
        tenantDisplayName,
      } as UpdateTenantSettingsForm),
    ).toThrow(ZodError);
  });

  it('throws ZodError on tenant name too long', () => {
    const tenantDisplayName =
      'tooLong_crduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfik';

    expect(() =>
      UpdateTenantSettingsForm.parse({
        ...REQUIRED,
        tenantDisplayName,
      } as UpdateTenantSettingsForm),
    ).toThrow(ZodError);
  });

  it.each([
    'min',
    'Medium With Space',
    'Can contain emojis. Look at this fella: 🐢',
    'Can contain numbers, like 1337!',
    'max-enhicrduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfi',
  ])(`successfully parses tenant for valid length`, (tenantDisplayName) => {
    const parsed = UpdateTenantSettingsForm.parse({
      ...REQUIRED,
      tenantDisplayName: tenantDisplayName,
    } as UpdateTenantSettingsForm);

    expect(parsed).toEqual({
      ...REQUIRED,
      tenantDisplayName: tenantDisplayName,
    });
  });

  it.each([
    undefined,
    '1:1',
    '1.2:1',
    '1.2:1.2',
    '1:1.2',
    '1.0000:2.0000',
    '51.909062:8.381308',
  ])(`successfully parses coords`, (coordsWithoutZoom) => {
    const zoomFactor = '13';
    const parsed = UpdateTenantSettingsForm.parse({
      ...REQUIRED,
      tenantCoords: coordsWithoutZoom,
    } as UpdateTenantSettingsForm);

    const coordsWithZoom = coordsWithoutZoom
      ? coordsWithoutZoom + ':' + zoomFactor
      : coordsWithoutZoom;
    expect(parsed).toEqual({
      ...REQUIRED,
      tenantCoords: coordsWithZoom,
    });
  });

  it.each(['1', '12345', '1234567', 'GGGGGG', 'ABCDE!', ' FFFFFF '])(
    `should throw ZodError on invalid color-primary`,
    (colorPrimary) => {
      expect(() =>
        UpdateTenantSettingsForm.parse({
          ...REQUIRED,
          colorPrimary,
        } as UpdateTenantSettingsForm),
      ).toThrow(ZodError);
    },
  );

  it.each(['1', '12345', '1234567', 'GGGGGG', 'ABCDE!', ' FFFFFF '])(
    `should throw ZodError on invalid uch-color-primary`,
    (uchColorPrimary) => {
      expect(() =>
        UpdateTenantSettingsForm.parse({
          ...REQUIRED,
          colorPrimary: uchColorPrimary,
        } as UpdateTenantSettingsForm),
      ).toThrow(ZodError);
    },
  );

  it('should return an error if the logo URL is invalid', () => {
    expect(() =>
      UpdateTenantSettingsForm.parse({
        ...REQUIRED,
        tenantLogoUrl: 'I am not a URL',
      } as UpdateTenantSettingsForm),
    ).toThrow(ZodError);
  });

  it('should return an error if the image URL is invalid', () => {
    expect(() =>
      UpdateTenantSettingsForm.parse({
        ...REQUIRED,
        tenantImageUrl: 'I am not a URL',
      } as UpdateTenantSettingsForm),
    ).toThrow(ZodError);
  });

  it('should return an error if the CitHub image URL is invalid', () => {
    expect(() =>
      UpdateTenantSettingsForm.parse({
        ...REQUIRED,
        citizenHubImageUrl: 'I am not a URL',
      } as UpdateTenantSettingsForm),
    ).toThrow(ZodError);
  });

  it('should return an error if the news feed URL is invalid', () => {
    expect(() =>
      UpdateTenantSettingsForm.parse({
        ...REQUIRED,
        newsUrl: 'I am not a URL',
      } as UpdateTenantSettingsForm),
    ).toThrow(ZodError);
  });

  it('throws ZodError on invalid coordinate format', () => {
    const tenantDisplayName = 'Valid Name';
    const tenantCoords = 'This is not two numbers separated by a colon';

    expect(() =>
      UpdateTenantSettingsForm.parse({
        ...REQUIRED,
        tenantDisplayName,
        tenantCoords,
      } as UpdateTenantSettingsForm),
    ).toThrow(ZodError);
  });
});

describe('mkState', () => {
  it('should return an error if the result has errors', () => {
    const result: UpdateTenantSettings = {
      errors: [{ message: 'error1' }, { message: 'error2' }],
    };

    const state = mkState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return an error if the result has no data', () => {
    const result: UpdateTenantSettings = { data: undefined };

    const state = mkState(result);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the tenant settings data', () => {
    const result: UpdateTenantSettings = {
      data: {
        tenant: {
          patchAttributes: [
            {
              key: 'tenant-name',
              value: 'Jordan',
            },
            {
              key: 'tenant-logo',
              value: 'some.domain.somewhere/image.ext',
            },
            {
              key: 'tenant-image',
              value: 'another.domain.elsewhere/image.ext',
            },
            {
              key: 'citizen-hub-image',
              value: 'some.domain.somewhere/image.ext',
            },
            {
              key: 'tenant-coords',
              value: '13:37',
            },
            {
              key: 'color-primary',
              value: 'AAAAAA',
            },
            {
              key: 'uch-color-primary',
              value: 'BBBBBB',
            },
            {
              key: 'news-url',
              value: 'reach.thefinals.com/meatspace',
            },
          ],
        },
      },
    };

    const state = mkState(result);

    expect(state).toEqual({
      data: {
        tenantDisplayName: 'Jordan',
        tenantLogoUrl: 'some.domain.somewhere/image.ext',
        tenantImageUrl: 'another.domain.elsewhere/image.ext',
        citizenHubImageUrl: 'some.domain.somewhere/image.ext',
        tenantCoords: '13:37',
        colorPrimary: 'AAAAAA',
        uchColorPrimary: 'BBBBBB',
        newsUrl: 'reach.thefinals.com/meatspace',
      },
    });
  });
});
