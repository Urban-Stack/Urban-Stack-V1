import {
  QueriedPublicAttributes,
  queryPublicAttributes,
} from '@/app/_lib/resource-api/graphql/publicAttributes';
import { z } from 'zod';

export type PublicAttributes = Readonly<{
  legalNoticeUrl?: string;
  privacyUrl?: string;
  contactUrl?: string;
  newsUrl?: string;
  tenantDisplayName?: string;
  tenantImage?: string;
  citizenHubImage?: string;
  tenantCoords?: string;
  tenantLogo?: string;
  colorPrimary?: string;
}>;

const camelCase = (attr: PublicAttributesRaw): PublicAttributes => ({
  legalNoticeUrl: attr['legal-notice-url'],
  privacyUrl: attr['privacy-url'],
  contactUrl: attr['contact-url'],
  newsUrl: attr['news-url'],
  tenantDisplayName: attr['tenant-name'],
  tenantImage: attr['tenant-image'],
  citizenHubImage: attr['citizen-hub-image'],
  tenantCoords: attr['tenant-coords'],
  tenantLogo: attr['tenant-logo'],
  colorPrimary: attr['uch-color-primary'],
});

const PublicAttributesRawSchema = z.object({
  'legal-notice-url': z.string().url('URL nicht valide').optional(),
  'privacy-url': z.string().url('URL nicht valide').optional(),
  'contact-url': z.string().url('URL nicht valide').optional(),
  'news-url': z.string().url('URL nicht valide').optional(),
  'tenant-name': z.string().optional(),
  'tenant-image': z.string().optional(),
  'citizen-hub-image': z.string().optional(),
  'tenant-coords': z
    .string()
    .regex(
      /^\d{1,2}(\.\d+)?:\d{1,3}(\.\d+)?:\d+$/,
      'Invalides Koordinatenformat',
    )
    .optional(),
  'tenant-logo': z.string().optional(),
  'uch-color-primary': z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/, 'Farbwert nicht valide')
    .optional(),
});
export type PublicAttributesRaw = z.infer<typeof PublicAttributesRawSchema>;

const PublicAttributesSchema = PublicAttributesRawSchema.transform(camelCase);

export const publicAttributes = async (tenant: string) =>
  queryPublicAttributes(tenant)
    .then(toObject)
    .then(PublicAttributesSchema.parse.bind(null));

const toObject = (result: QueriedPublicAttributes) =>
  Object.fromEntries(
    result.data?.publicAttributes?.map((attr) => [attr.key, attr.value]) ?? [],
  );
