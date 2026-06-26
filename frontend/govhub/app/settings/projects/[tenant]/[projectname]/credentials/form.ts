import { z } from 'zod';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import {
  CreateCredential,
  DeleteCredential,
  RotateCredential,
} from '@/app/_lib/resource-api/graphql/credentials';
import { ActionState } from '@/app/_lib/form/actionstate';

export const FORM_NAMES = {
  credentialName: 'new-credential-name',
};

export const CreateCredentialForm = z.object({
  name: z
    .string()
    .min(3, 'Credential-Name muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Credential-Name darf maximal 64 Zeichen beinhalten')
    .regex(
      /^[a-z0-9-]+$/,
      'Credential-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
    ),
});
export type CreateCredentialForm = z.infer<typeof CreateCredentialForm>;

export type CreateCredentialState = {
  data?: {
    username: string;
    password: string;
  };
  errors?: {
    general?: string[];
    name?: string[];
  };
};

export type RotateCredentialState = Pick<CreateCredentialState, 'data'> & {
  errors?: {
    general?: string[];
  };
};

export type DeleteCredentialState = ActionState & {
  errors?: {
    general?: string[];
  };
};

export const mkCreateState: (
  result: CreateCredential,
) => CreateCredentialState = (result) =>
  result.error || !result.data?.tenant.project.createSensorCredential
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : {
        data: {
          username: result.data.tenant.project.createSensorCredential.username,
          password: result.data.tenant.project.createSensorCredential.password,
        },
      };

export const mkRotateState: (
  result: RotateCredential,
) => RotateCredentialState = (result) =>
  result.error || !result.data?.tenant.project.rotateSensorCredential
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : {
        data: {
          username: result.data.tenant.project.rotateSensorCredential.username,
          password: result.data.tenant.project.rotateSensorCredential.password,
        },
      };

export const mkDeleteState: (
  result: DeleteCredential,
) => DeleteCredentialState = (result) =>
  result.error || !result.data?.tenant.project.deleteSensorCredential
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };
