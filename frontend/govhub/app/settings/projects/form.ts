import { z } from 'zod';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import { CreateProject } from '@/app/_lib/resource-api/graphql/project';

export const FORM_NAMES = {
  projectName: 'new-project-title',
};

// TODO validate correct boundaries for project title
export const CreateProjectForm = z.object({
  name: z
    .string()
    .min(3, 'Projekt-Name muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Projekt-Name darf maximal 64 Zeichen beinhalten')
    .regex(
      /^[a-z0-9-]+$/,
      'Projekt-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
    ),
});
export type CreateProjectForm = z.infer<typeof CreateProjectForm>;

export type CreateProjectState = {
  data?: {
    name: string;
    tenant: string;
  };
  errors?: {
    general?: string[];
    name?: string[];
  };
};

export const mkState: (result: CreateProject) => CreateProjectState = (
  result,
) =>
  result.error || !result.data?.tenant.createProject
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : {
        data: {
          name: result.data.tenant.createProject.project,
          tenant: result.data.tenant.createProject.tenant,
        },
      };
