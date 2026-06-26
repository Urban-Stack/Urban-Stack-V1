'use server';

import {
  CreateUserGroupForm,
  CreateUserGroupState,
  FORM_NAMES,
  mkDeleteState,
  mkShareState,
  mkState,
  mkUnshareState,
} from '@/app/settings/usergroups/form';
import { revalidatePath } from 'next/cache';
import {
  disableUserGroupShared,
  enableUserGroupShared,
  mutateCreateUserGroup,
  mutateDeleteUserGroup,
} from '@/app/_lib/resource-api/graphql/usergroups';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { ApolloClient } from '@apollo/client';
import { ActionState } from '@/app/_lib/form/actionstate';

export type DeleteUserGroupState = ActionState & {
  errors?: {
    general?: string[];
  };
};

export type ShareUserGroupState = ActionState & {
  errors?: {
    general?: string[];
  };
};

export type UnshareUserGroupState = ActionState & {
  errors?: {
    general?: string[];
  };
};

export const createUserGroup: (
  _prevState: CreateUserGroupState,
  formData: FormData,
) => Promise<CreateUserGroupState> = async (_prevState, formData) => {
  const parsed = CreateUserGroupForm.safeParse({
    name: formData.get(FORM_NAMES.userGroupName),
  });

  const result = parsed.success
    ? mkState(await mutateCreateUserGroup(parsed.data.name))
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidatePath('/settings/usergroups');

  return result;
};

export const shareUserGroup: (
  group: UserGroup,
) => Promise<ApolloClient.MutateResult> = async (group) => {
  const result = await enableUserGroupShared(group);
  revalidatePath('/settings/usergroups');
  return result;
};

export const stateShareUserGroup: (
  group: UserGroup,
) => Promise<ShareUserGroupState> = async (group) => {
  const result = mkShareState(await enableUserGroupShared(group));
  revalidatePath('/settings/usergroups');
  return result;
};

export const unshareUserGroup: (
  group: UserGroup,
) => Promise<ApolloClient.MutateResult> = async (group) => {
  const result = disableUserGroupShared(group);
  revalidatePath('/settings/usergroups');
  return result;
};

export const stateUnshareUserGroup: (
  group: UserGroup,
) => Promise<UnshareUserGroupState> = async (group) => {
  const result = mkUnshareState(await disableUserGroupShared(group));
  revalidatePath('/settings/usergroups');
  return result;
};

export const deleteUserGroup: (
  group: UserGroup,
) => Promise<DeleteUserGroupState> = async (group) => {
  const result = mkDeleteState(await mutateDeleteUserGroup(group));
  revalidatePath('/settings/usergroups');
  return result;
};
