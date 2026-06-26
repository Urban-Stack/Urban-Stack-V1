import { ActionState } from '@/app/_lib/form/actionstate';
import z from 'zod';
import {
  CreateSharedApp,
  GetSharedApp,
  UpdateSharedApp,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import { CitytoolCategory } from '@/app/__generated__/types';

export const NEW_STRING = 'new';

export const FORM_NAMES = {
  displayName: 'edit-shared-app-displayname',
  description: 'edit-shared-app-description',
  contact: 'edit-shared-app-contact',
  pictureUri: 'edit-shared-app-picture-uri',
  categories: 'edit-shared-app-categories',
  imageDigest: 'edit-shared-app-image-digest',
  imageRepository: 'edit-shared-app-image-repository',
  imageRegistry: 'edit-shared-app-image-registry',
  username: 'edit-shared-app-username',
  password: 'edit-shared-app-password',
} as const;

export const EditSharedAppForm = z.object({
  displayName: z
    .string()
    .min(3, 'Name muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Name darf maximal 64 Zeichen beinhalten'),
  description: z
    .string()
    .max(255, 'Beschreibung darf maximal 255 Zeichen beinhalten'),
  contact: z
    .string()
    .max(255, 'Kontakt darf maximal 255 Zeichen beinhalten')
    .and(
      z
        .string()
        .email('Kontakt muss entweder eine Email oder eine URL sein.')
        .or(
          z
            .string()
            .url('Kontakt muss entweder eine Email oder eine URL sein.'),
        ),
    ),
  pictureUri: z
    .string()
    .url('Die eingegebene URI ist nicht valide.')
    .or(z.literal(''))
    .optional(),
  categories: z
    .array(z.nativeEnum(CitytoolCategory), {
      invalid_type_error:
        'Eine oder mehrere ausgewählte Kategorien sind ungültig.',
    })
    .default([]),
  imageDigest: z
    .string()
    .regex(
      /[a-z0-9]+:[0-9a-fA-F]{32,}/,
      'Image-Digest muss ein valider Hash sein',
    ),
  imageRepository: z
    .string()
    .min(3, 'Image-Repository muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Image-Repository darf maximal 64 Zeichen beinhalten'),
  imageRegistry: z
    .string()
    .min(3, 'Image-Registry muss mindestens 3 Zeichen beinhalten'),
  username: z
    .string()
    .max(64, 'Username darf maximal 64 Zeichen beinhalten')
    .optional(),
  password: z
    .string()
    .max(255, 'Passwort darf maximal 255 Zeichen beinhalten')
    .optional(),
});

export type EditSharedAppForm = z.infer<typeof EditSharedAppForm>;

export type SharedAppState = ActionState & {
  readonly data?: {
    readonly displayName?: string;
    readonly description?: string;
    readonly contact?: string;
    readonly pictureUri?: string;
    readonly categories?: CitytoolCategory[];
    readonly config?: {
      readonly imageDigest?: string;
      readonly imageRepository?: string;
      readonly imageRegistry?: string;
      readonly username?: string;
    };
  };
  readonly errors?: {
    readonly general?: string[];
    readonly displayName?: string[];
    readonly description?: string[];
    readonly contact?: string[];
    readonly pictureUri?: string[];
    readonly categories?: string[];
    readonly imageDigest?: string[];
    readonly imageRepository?: string[];
    readonly imageRegistry?: string[];
    readonly username?: string[];
    readonly password?: string[];
  };
};

export const mkCreateState: (result: CreateSharedApp) => SharedAppState = (
  result,
) =>
  result.error || !result.data?.tenant.createSharedApp
    ? {
        errors: {
          general: result.error
            ? [result.error.message]
            : ['Ein unbekannter Fehler ist aufgetreten.'],
        },
      }
    : {
        data: {
          displayName: result.data.tenant.createSharedApp.config.displayName,
          description: result.data.tenant.createSharedApp.config.description,
          contact: result.data.tenant.createSharedApp.config.adminContact,
          pictureUri:
            result.data.tenant.createSharedApp.config.pictureUri ?? undefined,
          categories: result.data.tenant.createSharedApp.config.categories,
          config: {
            imageDigest: result.data.tenant.createSharedApp.config.imageDigest,
            imageRepository:
              result.data.tenant.createSharedApp.config.imageRepository,
            imageRegistry:
              result.data.tenant.createSharedApp.config.imageRegistry,
            username:
              result.data.tenant.createSharedApp.config.registryUsername ??
              undefined,
          },
        },
      };

export const mkUpdateState: (result: UpdateSharedApp) => SharedAppState = (
  result,
) =>
  result.error || !result.data?.tenant.sharedApp.update
    ? {
        errors: {
          general: result.error
            ? [result.error.message]
            : ['Ein unbekannter Fehler ist aufgetreten.'],
        },
      }
    : {
        data: {
          displayName: result.data.tenant.sharedApp.update.config.displayName,
          description: result.data.tenant.sharedApp.update.config.description,
          contact: result.data.tenant.sharedApp.update.config.adminContact,
          pictureUri:
            result.data.tenant.sharedApp.update.config.pictureUri ?? undefined,
          categories: result.data.tenant.sharedApp.update.config.categories,
          config: {
            imageDigest: result.data.tenant.sharedApp.update.config.imageDigest,
            imageRepository:
              result.data.tenant.sharedApp.update.config.imageRepository,
            imageRegistry:
              result.data.tenant.sharedApp.update.config.imageRegistry,
            username:
              result.data.tenant.sharedApp.update.config.registryUsername ??
              undefined,
          },
        },
      };

export const mkGetState: (result: GetSharedApp) => SharedAppState = (result) =>
  result.error || !result.data?.sharedApp
    ? {
        errors: {
          general: result.error
            ? [result.error.message]
            : ['Ein unbekannter Fehler ist aufgetreten.'],
        },
      }
    : {
        data: {
          displayName: result.data.sharedApp.config.displayName,
          description: result.data.sharedApp.config.description,
          contact: result.data.sharedApp.config.adminContact,
          pictureUri: result.data.sharedApp.config.pictureUri ?? undefined,
          categories: result.data.sharedApp.config.categories,
          config: {
            imageDigest: result.data.sharedApp.config.imageDigest,
            imageRepository: result.data.sharedApp.config.imageRepository,
            imageRegistry: result.data.sharedApp.config.imageRegistry,
            username:
              result.data.sharedApp.config.registryUsername ?? undefined,
          },
        },
      };
