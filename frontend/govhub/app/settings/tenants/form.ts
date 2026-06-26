import { z } from 'zod';
import { UpdateTenantSettings } from '@/app/_lib/resource-api/graphql/attributes';

export const FORM_NAMES = {
  tenantName: 'tenant-name',
  legalNoticeUrl: 'legal-notice-url',
  privacyUrl: 'privacy-url',
  contactUrl: 'contact-url',
  tenantLogoUrl: 'tenant-logo',
  tenantImageUrl: 'tenant-image',
  citizenHubImageUrl: 'citizen-hub-image',
  tenantCoords: 'tenant-coords',
  colorPrimary: 'color-primary',
  uchColorPrimary: 'uch-color-primary',
  newsUrl: 'news-url',
};

export type TenantSettingsState = {
  data?: {
    tenantDisplayName?: string;
    legalNoticeUrl?: string;
    privacyUrl?: string;
    contactUrl?: string;
    tenantLogoUrl?: string;
    tenantImageUrl?: string;
    citizenHubImageUrl?: string;
    tenantCoords?: string;
    colorPrimary?: string;
    uchColorPrimary?: string;
    newsUrl?: string;
  };
  errors?: {
    general?: string[];
    tenantDisplayName?: string[];
    legalNoticeUrl?: string[];
    privacyUrl?: string[];
    contactUrl?: string[];
    tenantLogoUrl?: string[];
    tenantImageUrl?: string[];
    citizenHubImageUrl?: string[];
    tenantCoords?: string[];
    colorPrimary?: string[];
    uchColorPrimary?: string[];
    newsUrl?: string[];
  };
};

const ZOOM_FACTOR = '13';
export const UpdateTenantSettingsForm = z.object({
  tenantDisplayName: z
    .string()
    .min(3, 'Tenant-Name muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Tenant-Name darf maximal 64 Zeichen beinhalten'),
  legalNoticeUrl: z.string().url('URL nicht valide'),
  privacyUrl: z.string().url('URL nicht valide'),
  contactUrl: z.string().url('URL nicht valide'),
  tenantLogoUrl: z.string().url('URL nicht valide').optional(),
  tenantImageUrl: z.string().url('URL nicht valide').optional(),
  citizenHubImageUrl: z.string().url('URL nicht valide').optional(),
  tenantCoords: z
    .string()
    .regex(/^\d{1,2}(\.\d+)?:\d{1,3}(\.\d+)?$/, 'Invalides Koordinatenformat')
    .transform((arg) => arg + ':' + ZOOM_FACTOR)
    .optional(),
  colorPrimary: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/, 'Farbwert nicht valide')
    .optional(),
  uchColorPrimary: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/, 'Farbwert nicht valide')
    .optional(),
  newsUrl: z.string().url('URL nicht valide').optional(),
});

export type UpdateTenantSettingsForm = z.infer<typeof UpdateTenantSettingsForm>;

export const mkState: (result: UpdateTenantSettings) => TenantSettingsState = (
  result,
) => {
  if ((result.errors && result.errors.length > 0) || !result.data) {
    return {
      errors: {
        general: result.errors
          ? result.errors.map((e) => e.message)
          : ['Ein unbekannter Fehler ist aufgetreten.'],
      },
    };
  }

  const attributes = Object.fromEntries(
    result.data.tenant.patchAttributes.map((attr) => [attr.key, attr.value]),
  );

  return {
    data: {
      tenantDisplayName: attributes['tenant-name'],
      legalNoticeUrl: attributes['legal-notice-url'],
      privacyUrl: attributes['privacy-url'],
      contactUrl: attributes['contact-url'],
      tenantLogoUrl: attributes['tenant-logo'],
      tenantImageUrl: attributes['tenant-image'],
      citizenHubImageUrl: attributes['citizen-hub-image'],
      tenantCoords: attributes['tenant-coords'],
      colorPrimary: attributes['color-primary'],
      uchColorPrimary: attributes['uch-color-primary'],
      newsUrl: attributes['news-url'],
    },
  };
};
