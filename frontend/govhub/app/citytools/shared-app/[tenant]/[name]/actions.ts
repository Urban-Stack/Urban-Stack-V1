'use server';

import {
  EditSharedAppForm,
  FORM_NAMES,
  mkCreateState,
  mkGetState,
  mkUpdateState,
  SharedAppState,
} from '@/app/citytools/shared-app/[tenant]/[name]/form';
import {
  mutateCreateSharedApp,
  mutateUpdateSharedApp,
  queryGetSharedApp,
  SharedAppConfig,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import { revalidatePath } from 'next/cache';
import { newName } from '@/app/_lib/resource-api/util/name';
import { sanitizeCategories, sanitizeValue } from '@/app/_lib/form/sanitize';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { notFound } from 'next/navigation';

export const getSharedApp: (
  tenant: string,
  name: string,
) => Promise<SharedAppState> = async (tenant, name) => {
  const sharedApp = await queryGetSharedApp(tenant, name);
  if (!sharedApp.data?.sharedApp) return notFound();
  return mkGetState(sharedApp);
};

export const createSharedApp: (
  tenant: string,
  _prevState: SharedAppState,
  formData: FormData,
) => Promise<SharedAppState> = async (tenant, _prevState, formData) => {
  const parsed = parseForm(formData);

  if (!parsed.success) {
    return {
      data: preserveData(formData),
      errors: parsed.error.flatten().fieldErrors,
    } as SharedAppState;
  }

  const name = newName(parsed.data.displayName);
  const config = getConfig(parsed.data);

  const state: SharedAppState = await mutateCreateSharedApp(
    tenant,
    name,
    config,
  )
    .then(mkCreateState)
    .catch(handleError(formData));

  revalidatePath('/citytools');
  return state;
};

export const updateSharedApp: (
  tenant: string,
  name: string,
  _prevState: SharedAppState,
  formData: FormData,
) => Promise<SharedAppState> = async (tenant, name, _prevState, formData) => {
  const parsed = parseForm(formData);

  if (!parsed.success) {
    return {
      data: preserveData(formData),
      errors: parsed.error.flatten().fieldErrors,
    } as SharedAppState;
  }

  const config = getConfig(parsed.data);

  const state = await mutateUpdateSharedApp(tenant, name, config)
    .then(mkUpdateState)
    .catch(handleError(formData));

  revalidatePath('/citytools');
  return state;
};

const parseForm = (formData: FormData) =>
  EditSharedAppForm.safeParse({
    displayName: formData.get(FORM_NAMES.displayName),
    description: formData.get(FORM_NAMES.description),
    contact: formData.get(FORM_NAMES.contact),
    pictureUri: formData.get(FORM_NAMES.pictureUri),
    categories: formData.getAll(FORM_NAMES.categories),
    imageDigest: formData.get(FORM_NAMES.imageDigest),
    imageRepository: formData.get(FORM_NAMES.imageRepository),
    imageRegistry: formData.get(FORM_NAMES.imageRegistry),
    username: sanitizeValue(formData.get(FORM_NAMES.username)),
    password: sanitizeValue(formData.get(FORM_NAMES.password)),
  });

const preserveData: (formData: FormData) => SharedAppState['data'] = (
  formData,
) => ({
  displayName: sanitizeValue(formData.get(FORM_NAMES.displayName)) ?? '',
  description: sanitizeValue(formData.get(FORM_NAMES.description)) ?? '',
  contact: sanitizeValue(formData.get(FORM_NAMES.contact)) ?? '',
  pictureUri: sanitizeValue(formData.get(FORM_NAMES.pictureUri)) ?? '',
  categories: sanitizeCategories(formData.getAll(FORM_NAMES.categories)),
  config: {
    imageDigest: sanitizeValue(formData.get(FORM_NAMES.imageDigest)) ?? '',
    imageRepository:
      sanitizeValue(formData.get(FORM_NAMES.imageRepository)) ?? '',
    imageRegistry: sanitizeValue(formData.get(FORM_NAMES.imageRegistry)) ?? '',
    username: sanitizeValue(formData.get(FORM_NAMES.username)) ?? '',
  },
});

const getConfig: (parsed: EditSharedAppForm) => SharedAppConfig = (parsed) => ({
  displayName: parsed.displayName,
  description: parsed.description,
  adminContact: parsed.contact,
  pictureUri: parsed.pictureUri,
  categories: parsed.categories,
  image: {
    digest: parsed.imageDigest,
    repository: parsed.imageRepository,
    registry: parsed.imageRegistry,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
  },
});

const handleError =
  (formData: FormData) =>
  (e: Error): SharedAppState => {
    if (!CombinedGraphQLErrors.is(e)) return unknownErrors(formData);
    if (e.message.includes('conflict')) return conflict(formData);
    if (e.message.includes('bad request')) return badRequest(formData);
    else return unknownErrors(formData);
  };

const conflict = (formData: FormData): SharedAppState => ({
  data: preserveData(formData),
  errors: {
    general: [
      'Ein Shared App mit einem ähnlichen Namen existiert bereits. Bitte wähle einen anderen Namen.',
    ],
  },
});

const badRequest = (formData: FormData): SharedAppState => ({
  data: preserveData(formData),
  errors: {
    general: ['Die Anfrage ist ungültig. Bitte überprüfen Sie Ihre Eingaben.'],
  },
});

const unknownErrors = (formData: FormData): SharedAppState => ({
  data: preserveData(formData),
  errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
});
