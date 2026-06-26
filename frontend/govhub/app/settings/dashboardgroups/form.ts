import { z } from 'zod';
import { CreateVizGroup } from '@/app/_lib/resource-api/graphql/vizGroups';

export const FORM_NAMES = {
  vizGroupName: 'new-viz-group-name',
};

export const CreateVizGroupForm = z.object({
  name: z
    .string()
    .min(3, 'Dashboardgruppen-Name muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Dashboardgruppen-Name darf maximal 64 Zeichen beinhalten')
    .regex(
      /^[a-z0-9-]+$/,
      'Dashboardgruppen-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
    ),
});
export type CreateVizGroupForm = z.infer<typeof CreateVizGroupForm>;

export type CreateVizGroupState = {
  data?: {
    name: string;
    tenant: string;
  };
  errors?: {
    general?: string[];
    name?: string[];
  };
};

export const mkState: (result: CreateVizGroup) => CreateVizGroupState = (
  result,
) =>
  (result.errors && result.errors.length > 0) ||
  !result.data?.tenant.createVizGroup
    ? {
        errors: {
          general: result.errors
            ? result.errors.map((e) => e.message)
            : ['Ein unbekannter Fehler ist aufgetreten.'],
        },
      }
    : {
        data: {
          name: result.data.tenant.createVizGroup.vizGroup,
          tenant: result.data.tenant.createVizGroup.tenant,
        },
      };
