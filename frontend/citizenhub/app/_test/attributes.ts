import {
  PublicAttributes,
  PublicAttributesRaw,
} from '@/app/_lib/resource-api/attributes/publicAttributes';

const LEGAL_URL = 'https://le.gal';
const PRIVACY_URL = 'https://pri.vacy';
const CONTACT_URL = 'https://con.tact';
const NEWS_URL = 'https://ne.ws';
const TENANT_NAME = 'Test Tenant';
const TENANT_IMAGE = 'https://example.com/image.png';
const TENANT_COORDS = '12.34:56.78:90';
const LOGO_PATH = '/assets/logo.png';
const COLOR_PRIMARY = '123456';

export const TEST_PUBLIC_ATTRIBUTES: PublicAttributes = {
  legalNoticeUrl: LEGAL_URL,
  privacyUrl: PRIVACY_URL,
  contactUrl: CONTACT_URL,
  newsUrl: NEWS_URL,
  tenantDisplayName: TENANT_NAME,
  tenantImage: TENANT_IMAGE,
  tenantCoords: TENANT_COORDS,
  tenantLogo: LOGO_PATH,
  colorPrimary: COLOR_PRIMARY,
} as const;

export const TEST_PUBLIC_ATTRIBUTES_RAW: PublicAttributesRaw = {
  'legal-notice-url': LEGAL_URL,
  'privacy-url': PRIVACY_URL,
  'contact-url': CONTACT_URL,
  'news-url': NEWS_URL,
  'tenant-name': TENANT_NAME,
  'tenant-image': TENANT_IMAGE,
  'tenant-coords': TENANT_COORDS,
  'tenant-logo': LOGO_PATH,
  'uch-color-primary': COLOR_PRIMARY,
} as const;

export const TEST_PUBLIC_ATTRIBUTES_QUERIED: { key: string; value: string }[] =
  [
    { key: 'tenant-name', value: TENANT_NAME },
    { key: 'tenant-image', value: TENANT_IMAGE },
    { key: 'tenant-coords', value: TENANT_COORDS },
    { key: 'logo-path', value: LOGO_PATH },
    { key: 'uch-color-primary', value: COLOR_PRIMARY },
  ] as const;
