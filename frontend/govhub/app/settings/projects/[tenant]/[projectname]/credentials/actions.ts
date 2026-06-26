'use server';

import 'server-only';
import {
  CreateCredentialForm,
  CreateCredentialState,
  DeleteCredentialState,
  FORM_NAMES,
  mkCreateState,
  mkDeleteState,
  mkRotateState,
  RotateCredentialState,
} from '@/app/settings/projects/[tenant]/[projectname]/credentials/form';
import { revalidatePath } from 'next/cache';
import {
  mutateCreateSensorCredential,
  mutateDeleteSensorCredential,
  mutateRotateSensorCredential,
} from '@/app/_lib/resource-api/graphql/credentials';

export const createCredential: (
  tenant: string,
  project: string,
  _prevState: CreateCredentialState,
  formData: FormData,
) => Promise<CreateCredentialState> = async (
  tenant,
  project,
  _prevState,
  formData,
) => {
  const parsed = CreateCredentialForm.safeParse({
    name: formData.get(FORM_NAMES.credentialName),
  });

  const result = parsed.success
    ? mkCreateState(
        await mutateCreateSensorCredential(tenant, project, parsed.data.name),
      )
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidatePath(`/settings/projects/${tenant}/${project}/credentials`);

  return result;
};

export const rotateCredential: (
  tenant: string,
  project: string,
  credentialName: string,
) => Promise<RotateCredentialState> = async (tenant, project, credentialName) =>
  mkRotateState(
    await mutateRotateSensorCredential(tenant, project, credentialName),
  );

export const deleteCredential: (
  tenant: string,
  project: string,
  credentialName: string,
) => Promise<DeleteCredentialState> = async (
  tenant,
  project,
  credentialName,
) => {
  const result = mkDeleteState(
    await mutateDeleteSensorCredential(tenant, project, credentialName),
  );
  revalidatePath(`/settings/projects/${tenant}/${project}/credentials`);
  return result;
};
