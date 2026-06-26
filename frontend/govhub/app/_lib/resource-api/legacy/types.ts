import { z } from 'zod';

export const TenantMeta = z
  .object({
    'tenant-image': z.string(),
    'tenant-name': z.string(),
    'tenant-coords': z.string(),
    'tenant-logo': z.string(),
    'govhub-color': z.string(),
    'citizen-hub-color': z.string(),
  })
  .partial();
export type TenantMeta = z.infer<typeof TenantMeta>;

export const KeycloakTenants = z.array(z.string());
export type KeycloakTenants = z.infer<typeof KeycloakTenants>;

export const CreateDashboardResponse = z.object({
  slug: z.string(),
  dashboardName: z.string(),
});
export type CreateDashboardResponse = z.infer<typeof CreateDashboardResponse>;
